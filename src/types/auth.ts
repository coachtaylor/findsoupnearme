// src/types/auth.ts

// User types
export interface User {
  id: string;
  email: string;
  email_confirmed_at?: string;
  phone?: string;
  phone_confirmed_at?: string;
  created_at: string;
  updated_at: string;
  user_metadata?: UserMetadata;
  app_metadata?: AppMetadata;
  aud: string;
  role: string;
}

export interface UserMetadata {
  name?: string;
  avatar_url?: string;
  role?: 'user' | 'admin' | 'restaurant_owner';
  preferences?: UserPreferences;
  [key: string]: any;
}

export interface AppMetadata {
  provider?: string;
  providers?: string[];
  [key: string]: any;
}

export interface UserPreferences {
  email_notifications?: boolean;
  push_notifications?: boolean;
  favorite_soup_types?: string[];
  dietary_restrictions?: string[];
  [key: string]: any;
}

// Session types
export interface Session {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  expires_at?: number;
  token_type: string;
  user: User;
}

// Auth response types
export interface AuthResponse {
  user: User | null;
  session: Session | null;
  error: AuthError | null;
}

export interface AuthError {
  message: string;
  status?: number;
  name?: string;
}

// Profile types
export interface UserProfile {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
  bio?: string;
  location?: string;
  website?: string;
  phone?: string;
  date_of_birth?: string;
  preferences?: UserPreferences;
  created_at: string;
  updated_at: string;
}

// Auth state types
export interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: AuthError | null;
}

// Form types
export interface SignUpFormData {
  email: string;
  password: string;
  confirmPassword: string;
  name?: string;
  acceptTerms: boolean;
}

export interface SignInFormData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface ResetPasswordFormData {
  email: string;
}

export interface UpdatePasswordFormData {
  password: string;
  confirmPassword: string;
}

export interface UpdateProfileFormData {
  name?: string;
  avatar_url?: string;
  bio?: string;
  location?: string;
  website?: string;
  phone?: string;
  preferences?: UserPreferences;
}

// OAuth types
export type OAuthProvider = 'google' | 'github' | 'facebook' | 'twitter' | 'discord';

export interface OAuthOptions {
  redirectTo?: string;
  scopes?: string;
  [key: string]: any;
}

// Role types
export type UserRole = 'user' | 'admin' | 'restaurant_owner';

export interface RolePermissions {
  can_review: boolean;
  can_claim_restaurant: boolean;
  can_manage_restaurants: boolean;
  can_moderate: boolean;
  can_access_analytics: boolean;
}

// Auth context types
export interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: AuthError | null;
  signUp: (data: SignUpFormData) => Promise<AuthResponse>;
  signIn: (data: SignInFormData) => Promise<AuthResponse>;
  signInWithOAuth: (provider: OAuthProvider, options?: OAuthOptions) => Promise<AuthResponse>;
  signOut: () => Promise<{ error: AuthError | null }>;
  resetPassword: (email: string) => Promise<{ data: any; error: AuthError | null }>;
  updatePassword: (password: string) => Promise<{ user: User | null; error: AuthError | null }>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ user: User | null; error: AuthError | null }>;
  refreshSession: () => Promise<{ session: Session | null; error: AuthError | null }>;
  isAuthenticated: () => Promise<boolean>;
  hasRole: (role: UserRole) => Promise<boolean>;
  isAdmin: () => Promise<boolean>;
  isRestaurantOwner: () => Promise<boolean>;
}

// Protected route types
export interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
  fallback?: React.ReactNode;
  redirectTo?: string;
}

// Auth hook types
export interface UseAuthOptions {
  redirectTo?: string;
  onSuccess?: (user: User, session: Session) => void;
  onError?: (error: AuthError) => void;
}

// Database types for profiles table
export interface ProfileRow {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
  bio?: string;
  location?: string;
  website?: string;
  phone?: string;
  date_of_birth?: string;
  preferences?: UserPreferences;
  created_at: string;
  updated_at: string;
}

// API response types
export interface ApiResponse<T = any> {
  data: T | null;
  error: AuthError | null;
  success: boolean;
}

// Validation types
export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

// Event types
export interface AuthStateChangeEvent {
  event: 'SIGNED_IN' | 'SIGNED_OUT' | 'TOKEN_REFRESHED' | 'USER_UPDATED' | 'USER_DELETED';
  session: Session | null;
  user: User | null;
}

// Utility types
export type AuthCallback = (event: AuthStateChangeEvent) => void;

export type AuthUnsubscribe = () => void;

// Constants
export const AUTH_EVENTS = {
  SIGNED_IN: 'SIGNED_IN',
  SIGNED_OUT: 'SIGNED_OUT',
  TOKEN_REFRESHED: 'TOKEN_REFRESHED',
  USER_UPDATED: 'USER_UPDATED',
  USER_DELETED: 'USER_DELETED',
} as const;

export const USER_ROLES = {
  USER: 'user',
  ADMIN: 'admin',
  RESTAURANT_OWNER: 'restaurant_owner',
} as const;

export const OAUTH_PROVIDERS = {
  GOOGLE: 'google',
  GITHUB: 'github',
  FACEBOOK: 'facebook',
  TWITTER: 'twitter',
  DISCORD: 'discord',
} as const; 