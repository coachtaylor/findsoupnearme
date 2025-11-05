// src/lib/authz.ts
/**
 * Authorization Helper Functions
 * 
 * Server-side authorization utilities for checking user permissions.
 * These functions should be used in API routes and server components.
 * 
 * IMPORTANT: These run on the server and check against RLS policies.
 * The database is the source of truth for permissions.
 */

import { User } from '@supabase/supabase-js';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export type RoleGlobal = 'admin' | 'user';

export type RoleInOrg = 'owner' | 'worker';

export interface OrgMembership {
  org_id: string;
  roles: RoleInOrg[];
}

export interface AuthUser extends User {
  role_global?: RoleGlobal;
  orgs?: OrgMembership[];
}

export interface Restaurant {
  id: string;
  owner_org_id?: string;
  owner_id?: string;
  verified_at?: string | null;
  status?: 'draft' | 'live' | 'suspended';
}

// ============================================================================
// ERROR CLASSES
// ============================================================================

export class AuthorizationError extends Error {
  statusCode: number;
  
  constructor(message: string, statusCode: number = 403) {
    super(message);
    this.name = 'AuthorizationError';
    this.statusCode = statusCode;
  }
}

export class UnauthorizedError extends AuthorizationError {
  constructor(message: string = 'Authentication required') {
    super(message, 401);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends AuthorizationError {
  constructor(message: string = 'You do not have permission to perform this action') {
    super(message, 403);
    this.name = 'ForbiddenError';
  }
}

// ============================================================================
// AUTHENTICATION CHECKS
// ============================================================================

/**
 * Requires that a user is authenticated
 * Throws UnauthorizedError if not authenticated
 */
export function requireAuth(user: User | null | undefined): asserts user is User {
  if (!user) {
    throw new UnauthorizedError('You must be logged in to perform this action');
  }
}

/**
 * Checks if user is authenticated
 */
export function isAuthenticated(user: User | null | undefined): user is User {
  return !!user && !!user.id;
}

// ============================================================================
// ROLE CHECKS
// ============================================================================

/**
 * Checks if user has admin role
 */
export function isAdmin(user: AuthUser | null | undefined): boolean {
  if (!user) return false;
  
  // Check JWT custom claims
  const roleFromJWT = user.role_global;
  if (roleFromJWT === 'admin') return true;
  
  // Check user metadata
  const roleFromMeta = user.user_metadata?.role_global;
  if (roleFromMeta === 'admin') return true;
  
  return false;
}

/**
 * Requires that user is an admin
 * Throws ForbiddenError if not admin
 */
export function requireAdmin(user: AuthUser | null | undefined): asserts user is AuthUser {
  requireAuth(user);
  
  if (!isAdmin(user)) {
    throw new ForbiddenError('Administrator access required');
  }
}

/**
 * Checks if user has a specific global role
 */
export function hasRole(user: AuthUser | null | undefined, role: RoleGlobal): boolean {
  if (!user) return false;
  
  const userRole = user.role_global || user.user_metadata?.role_global;
  return userRole === role;
}

// ============================================================================
// ORGANIZATION MEMBERSHIP CHECKS
// ============================================================================

/**
 * Gets all organization IDs the user belongs to
 */
export function getUserOrgIds(user: AuthUser | null | undefined): string[] {
  if (!user) return [];
  
  // Check JWT custom claims
  const orgsFromJWT = user.orgs || [];
  if (orgsFromJWT.length > 0) {
    return orgsFromJWT.map(org => org.org_id);
  }
  
  // Check user metadata
  const orgsFromMeta = user.user_metadata?.orgs || [];
  return orgsFromMeta.map((org: OrgMembership) => org.org_id);
}

/**
 * Checks if user is a member of a specific organization
 */
export function isOrgMember(user: AuthUser | null | undefined, orgId: string): boolean {
  const userOrgIds = getUserOrgIds(user);
  return userOrgIds.includes(orgId);
}

/**
 * Checks if user is an owner of a specific organization
 */
export function isOrgOwner(user: AuthUser | null | undefined, orgId: string): boolean {
  if (!user) return false;
  
  const orgs = user.orgs || user.user_metadata?.orgs || [];
  const org = orgs.find((o: OrgMembership) => o.org_id === orgId);
  
  return org ? org.roles.includes('owner') : false;
}

/**
 * Checks if user is a worker (not owner) of a specific organization
 */
export function isOrgWorker(user: AuthUser | null | undefined, orgId: string): boolean {
  if (!user) return false;
  
  const orgs = user.orgs || user.user_metadata?.orgs || [];
  const org = orgs.find((o: OrgMembership) => o.org_id === orgId);
  
  return org ? org.roles.includes('worker') && !org.roles.includes('owner') : false;
}

/**
 * Gets user's role in a specific organization
 */
export function getUserRoleInOrg(
  user: AuthUser | null | undefined, 
  orgId: string
): RoleInOrg | null {
  if (!user) return null;
  
  const orgs = user.orgs || user.user_metadata?.orgs || [];
  const org = orgs.find((o: OrgMembership) => o.org_id === orgId);
  
  if (!org || org.roles.length === 0) return null;
  
  // Prefer 'owner' over 'worker' if user has both
  return org.roles.includes('owner') ? 'owner' : org.roles[0];
}

// ============================================================================
// RESTAURANT-SPECIFIC CHECKS
// ============================================================================

/**
 * Checks if user can view a restaurant
 * Public can view live restaurants
 * Owners can view their own restaurants (any status)
 * Admins can view all restaurants
 */
export function canViewRestaurant(
  user: AuthUser | null | undefined,
  restaurant: Restaurant
): boolean {
  // Public can view live restaurants
  if (restaurant.status === 'live') return true;
  
  // Not authenticated
  if (!user) return false;
  
  // Admins can view all
  if (isAdmin(user)) return true;
  
  // Check if user is the restaurant owner (legacy owner_id field)
  if (restaurant.owner_id && restaurant.owner_id === user.id) return true;
  
  // Check if user is a member of the owning organization
  if (restaurant.owner_org_id) {
    return isOrgMember(user, restaurant.owner_org_id);
  }
  
  return false;
}

/**
 * Checks if user can edit a restaurant
 * Must be verified AND user must be owner/org member
 * Admins can edit any restaurant
 */
export function canEditRestaurant(
  user: AuthUser | null | undefined,
  restaurant: Restaurant
): boolean {
  if (!user) return false;
  
  // Admins can edit any restaurant
  if (isAdmin(user)) return true;
  
  // Restaurant must be verified for non-admins
  if (!restaurant.verified_at) return false;
  
  // Check if user is the restaurant owner (legacy owner_id field)
  if (restaurant.owner_id && restaurant.owner_id === user.id) return true;
  
  // Check if user is a member of the owning organization
  if (restaurant.owner_org_id) {
    return isOrgMember(user, restaurant.owner_org_id);
  }
  
  return false;
}

/**
 * Requires that user can edit a restaurant
 * Throws ForbiddenError if not allowed
 */
export function requireCanEditRestaurant(
  user: AuthUser | null | undefined,
  restaurant: Restaurant
): asserts user is AuthUser {
  requireAuth(user);
  
  if (!canEditRestaurant(user, restaurant)) {
    if (!restaurant.verified_at && !isAdmin(user)) {
      throw new ForbiddenError(
        'This restaurant must be verified before you can edit it. Verification usually takes less than 48 hours.'
      );
    }
    throw new ForbiddenError('You do not have permission to edit this restaurant');
  }
}

/**
 * Checks if user can delete a restaurant
 * Only admins can delete restaurants
 */
export function canDeleteRestaurant(
  user: AuthUser | null | undefined,
  restaurant: Restaurant
): boolean {
  if (!user) return false;
  return isAdmin(user);
}

/**
 * Checks if user can claim a restaurant
 * Any authenticated user can claim an unclaimed restaurant
 */
export function canClaimRestaurant(
  user: AuthUser | null | undefined,
  restaurant: Restaurant
): boolean {
  if (!user) return false;
  
  // Can't claim if already has an owner
  if (restaurant.owner_id || restaurant.owner_org_id) return false;
  
  return true;
}

// ============================================================================
// CLAIM-SPECIFIC CHECKS
// ============================================================================

export interface Claim {
  id: string;
  user_id: string;
  restaurant_id: string;
  status: 'pending' | 'approved' | 'denied';
}

/**
 * Checks if user can view a claim
 * Users can view their own claims
 * Admins can view all claims
 */
export function canViewClaim(
  user: AuthUser | null | undefined,
  claim: Claim
): boolean {
  if (!user) return false;
  
  if (isAdmin(user)) return true;
  
  return claim.user_id === user.id;
}

/**
 * Checks if user can approve/deny claims
 * Only admins can approve/deny claims
 */
export function canReviewClaim(user: AuthUser | null | undefined): boolean {
  return isAdmin(user);
}

/**
 * Requires that user can review claims
 * Throws ForbiddenError if not allowed
 */
export function requireCanReviewClaim(
  user: AuthUser | null | undefined
): asserts user is AuthUser {
  requireAuth(user);
  
  if (!canReviewClaim(user)) {
    throw new ForbiddenError('Only administrators can review claims');
  }
}

// ============================================================================
// REVIEW & MODERATION CHECKS
// ============================================================================

export interface Review {
  id: string;
  user_id: string | null;
  restaurant_id: string;
}

/**
 * Checks if user can edit a review
 * Users can edit their own reviews
 * Admins can edit any review
 */
export function canEditReview(
  user: AuthUser | null | undefined,
  review: Review
): boolean {
  if (!user) return false;
  
  if (isAdmin(user)) return true;
  
  return review.user_id === user.id;
}

/**
 * Checks if user can delete a review
 * Users can delete their own reviews
 * Admins can delete any review
 */
export function canDeleteReview(
  user: AuthUser | null | undefined,
  review: Review
): boolean {
  return canEditReview(user, review);
}

/**
 * Checks if user can moderate content (reviews, photos, etc.)
 * Only admins can moderate
 */
export function canModerateContent(user: AuthUser | null | undefined): boolean {
  return isAdmin(user);
}

// ============================================================================
// SUGGESTION CHECKS
// ============================================================================

export interface Suggestion {
  id: string;
  user_id: string | null;
  status: 'pending' | 'approved' | 'merged' | 'rejected';
}

/**
 * Checks if user can view a suggestion
 * Anonymous submissions: only admins can view
 * Authenticated submissions: user can view their own, admins can view all
 */
export function canViewSuggestion(
  user: AuthUser | null | undefined,
  suggestion: Suggestion
): boolean {
  if (isAdmin(user)) return true;
  
  if (!user) return false;
  
  if (!suggestion.user_id) return false; // Anonymous suggestion
  
  return suggestion.user_id === user.id;
}

/**
 * Checks if user can review suggestions (approve/merge/reject)
 * Only admins can review suggestions
 */
export function canReviewSuggestion(user: AuthUser | null | undefined): boolean {
  return isAdmin(user);
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Creates a safe user object for client-side use
 * Strips sensitive information
 */
export function getSafeUser(user: AuthUser | null | undefined) {
  if (!user) return null;
  
  return {
    id: user.id,
    email: user.email,
    role_global: user.role_global || user.user_metadata?.role_global || 'user',
    orgs: user.orgs || user.user_metadata?.orgs || [],
    created_at: user.created_at,
  };
}

/**
 * Checks if user has any elevated permissions
 * (admin, owner, or worker)
 */
export function hasElevatedPermissions(user: AuthUser | null | undefined): boolean {
  if (!user) return false;
  
  if (isAdmin(user)) return true;
  
  const orgIds = getUserOrgIds(user);
  return orgIds.length > 0;
}

// ============================================================================
// EXPORTS
// ============================================================================

export const authz = {
  // Authentication
  requireAuth,
  isAuthenticated,
  
  // Roles
  isAdmin,
  requireAdmin,
  hasRole,
  
  // Organizations
  getUserOrgIds,
  isOrgMember,
  isOrgOwner,
  isOrgWorker,
  getUserRoleInOrg,
  
  // Restaurants
  canViewRestaurant,
  canEditRestaurant,
  requireCanEditRestaurant,
  canDeleteRestaurant,
  canClaimRestaurant,
  
  // Claims
  canViewClaim,
  canReviewClaim,
  requireCanReviewClaim,
  
  // Reviews
  canEditReview,
  canDeleteReview,
  canModerateContent,
  
  // Suggestions
  canViewSuggestion,
  canReviewSuggestion,
  
  // Utilities
  getSafeUser,
  hasElevatedPermissions,
};

export default authz;