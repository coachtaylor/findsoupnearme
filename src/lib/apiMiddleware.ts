// src/lib/apiMiddleware.ts
/**
 * API Route Middleware for Authorization
 * 
 * Provides middleware functions to protect API routes and check permissions.
 * Use these in your Next.js API routes to enforce RBAC.
 * 
 * Example usage:
 * 
 * export default async function handler(req, res) {
 *   // Require authentication
 *   const user = await requireAuthMiddleware(req, res);
 *   if (!user) return; // Response already sent
 *   
 *   // Your protected logic here
 * }
 */

import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import { NextApiRequest, NextApiResponse } from 'next';
import { 
  AuthUser,
  isAdmin,
  requireAdmin,
  canEditRestaurant,
  AuthorizationError,
  UnauthorizedError,
  ForbiddenError 
} from './authz';

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Gets authenticated user from request
 * Returns null if not authenticated
 */
export async function getAuthUser(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<AuthUser | null> {
  try {
    const supabase = createServerSupabaseClient({ req, res });
    
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();
    
    if (error || !session) {
      return null;
    }
    
    // Parse user with custom claims
    const user = session.user as AuthUser;
    
    // Try to get role from JWT claims
    if (session.user.app_metadata?.role_global) {
      user.role_global = session.user.app_metadata.role_global;
    } else if (session.user.user_metadata?.role_global) {
      user.role_global = session.user.user_metadata.role_global;
    }
    
    // Try to get orgs from JWT claims
    if (session.user.app_metadata?.orgs) {
      user.orgs = session.user.app_metadata.orgs;
    } else if (session.user.user_metadata?.orgs) {
      user.orgs = session.user.user_metadata.orgs;
    }
    
    return user;
  } catch (error) {
    console.error('Error getting auth user:', error);
    return null;
  }
}

/**
 * Sends error response with appropriate status code
 */
function sendErrorResponse(
  res: NextApiResponse,
  error: Error | AuthorizationError
) {
  if (error instanceof AuthorizationError) {
    return res.status(error.statusCode).json({
      error: error.message,
      statusCode: error.statusCode,
    });
  }
  
  // Generic error
  return res.status(500).json({
    error: 'Internal server error',
    statusCode: 500,
  });
}

// ============================================================================
// MIDDLEWARE FUNCTIONS
// ============================================================================

/**
 * Middleware: Require authentication
 * Returns user if authenticated, sends 401 if not
 * 
 * Usage:
 * const user = await requireAuthMiddleware(req, res);
 * if (!user) return; // 401 already sent
 */
export async function requireAuthMiddleware(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<AuthUser | null> {
  const user = await getAuthUser(req, res);
  
  if (!user) {
    res.status(401).json({
      error: 'Authentication required',
      statusCode: 401,
    });
    return null;
  }
  
  return user;
}

/**
 * Middleware: Require admin role
 * Returns user if admin, sends 403 if not
 * 
 * Usage:
 * const user = await requireAdminMiddleware(req, res);
 * if (!user) return; // 403 already sent
 */
export async function requireAdminMiddleware(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<AuthUser | null> {
  const user = await requireAuthMiddleware(req, res);
  if (!user) return null;
  
  try {
    requireAdmin(user);
    return user;
  } catch (error) {
    sendErrorResponse(res, error as AuthorizationError);
    return null;
  }
}

/**
 * Middleware: Require ability to edit a restaurant
 * Returns user if authorized, sends 403 if not
 * 
 * Usage:
 * const user = await requireCanEditRestaurantMiddleware(req, res, restaurant);
 * if (!user) return; // 403 already sent
 */
export async function requireCanEditRestaurantMiddleware(
  req: NextApiRequest,
  res: NextApiResponse,
  restaurant: {
    id: string;
    owner_org_id?: string;
    owner_id?: string;
    verified_at?: string | null;
  }
): Promise<AuthUser | null> {
  const user = await requireAuthMiddleware(req, res);
  if (!user) return null;
  
  if (!canEditRestaurant(user, restaurant)) {
    res.status(403).json({
      error: restaurant.verified_at
        ? 'You do not have permission to edit this restaurant'
        : 'This restaurant must be verified before you can edit it',
      statusCode: 403,
    });
    return null;
  }
  
  return user;
}

/**
 * Middleware: Check allowed HTTP methods
 * Sends 405 if method not allowed
 * 
 * Usage:
 * if (!checkMethodMiddleware(req, res, ['GET', 'POST'])) return;
 */
export function checkMethodMiddleware(
  req: NextApiRequest,
  res: NextApiResponse,
  allowedMethods: string[]
): boolean {
  if (!req.method || !allowedMethods.includes(req.method)) {
    res.status(405).json({
      error: `Method ${req.method} not allowed`,
      statusCode: 405,
      allowedMethods,
    });
    return false;
  }
  
  return true;
}

/**
 * Middleware: Wrap async handler with error catching
 * Catches errors and sends appropriate responses
 * 
 * Usage:
 * export default withErrorHandler(async (req, res) => {
 *   // Your handler logic
 * });
 */
export function withErrorHandler(
  handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>
) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      await handler(req, res);
    } catch (error) {
      console.error('API route error:', error);
      sendErrorResponse(res, error as Error);
    }
  };
}

/**
 * Middleware: Combine multiple middleware checks
 * Runs each middleware in sequence
 * 
 * Usage:
 * export default combineMiddleware(
 *   requireAuthMiddleware,
 *   requireAdminMiddleware
 * )(async (req, res, user) => {
 *   // user is guaranteed to be admin here
 * });
 */
export function combineMiddleware(
  ...middlewares: Array<
    (req: NextApiRequest, res: NextApiResponse) => Promise<AuthUser | null | boolean>
  >
) {
  return (
    handler: (req: NextApiRequest, res: NextApiResponse, user: AuthUser) => Promise<void>
  ) => {
    return async (req: NextApiRequest, res: NextApiResponse) => {
      let user: AuthUser | null = null;
      
      // Run each middleware
      for (const middleware of middlewares) {
        const result = await middleware(req, res);
        
        // If middleware returned false or null, it already sent a response
        if (result === false || result === null) {
          return;
        }
        
        // If middleware returned a user, save it
        if (typeof result === 'object') {
          user = result;
        }
      }
      
      // Call the actual handler with the user
      await handler(req, res, user!);
    };
  };
}

// ============================================================================
// CORS MIDDLEWARE
// ============================================================================

/**
 * Middleware: Add CORS headers
 * 
 * Usage:
 * corsMiddleware(req, res, {
 *   origin: 'https://yourdomain.com',
 *   methods: ['GET', 'POST']
 * });
 */
export function corsMiddleware(
  req: NextApiRequest,
  res: NextApiResponse,
  options: {
    origin?: string;
    methods?: string[];
    credentials?: boolean;
  } = {}
) {
  const {
    origin = '*',
    methods = ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials = true,
  } = options;
  
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', methods.join(', '));
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (credentials) {
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }
  
  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return true;
  }
  
  return false;
}

// ============================================================================
// RATE LIMITING MIDDLEWARE (Simple in-memory)
// ============================================================================

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

/**
 * Middleware: Simple rate limiting
 * 
 * Usage:
 * if (!rateLimitMiddleware(req, res, { max: 10, windowMs: 60000 })) return;
 */
export function rateLimitMiddleware(
  req: NextApiRequest,
  res: NextApiResponse,
  options: {
    max?: number;
    windowMs?: number;
    keyGenerator?: (req: NextApiRequest) => string;
  } = {}
): boolean {
  const {
    max = 100,
    windowMs = 60000, // 1 minute
    keyGenerator = (req) => {
      // Use IP address as key
      const forwarded = req.headers['x-forwarded-for'];
      const ip = forwarded ? (forwarded as string).split(',')[0] : req.socket.remoteAddress;
      return ip || 'unknown';
    },
  } = options;
  
  const key = keyGenerator(req);
  const now = Date.now();
  
  const record = rateLimitMap.get(key);
  
  if (!record || now > record.resetAt) {
    // Create new record
    rateLimitMap.set(key, {
      count: 1,
      resetAt: now + windowMs,
    });
    return true;
  }
  
  if (record.count >= max) {
    res.status(429).json({
      error: 'Too many requests',
      statusCode: 429,
      retryAfter: Math.ceil((record.resetAt - now) / 1000),
    });
    return false;
  }
  
  record.count++;
  return true;
}

// ============================================================================
// EXAMPLE USAGE
// ============================================================================

/*
// Example 1: Protected API route (auth required)
export default async function handler(req, res) {
  const user = await requireAuthMiddleware(req, res);
  if (!user) return;
  
  // User is authenticated, do something
  res.json({ message: 'Hello, ' + user.email });
}

// Example 2: Admin-only API route
export default async function handler(req, res) {
  const user = await requireAdminMiddleware(req, res);
  if (!user) return;
  
  // User is admin, do admin stuff
  res.json({ message: 'Admin access granted' });
}

// Example 3: Restaurant edit endpoint
export default async function handler(req, res) {
  if (!checkMethodMiddleware(req, res, ['PUT'])) return;
  
  const { id } = req.query;
  
  // Get restaurant from database
  const restaurant = await getRestaurant(id);
  
  const user = await requireCanEditRestaurantMiddleware(req, res, restaurant);
  if (!user) return;
  
  // User can edit, update restaurant
  res.json({ message: 'Restaurant updated' });
}

// Example 4: With error handling
export default withErrorHandler(async (req, res) => {
  const user = await requireAuthMiddleware(req, res);
  if (!user) return;
  
  // This will be caught by withErrorHandler if it throws
  throw new Error('Something went wrong');
});

// Example 5: Combined middleware
export default combineMiddleware(
  requireAuthMiddleware,
  requireAdminMiddleware
)(async (req, res, user) => {
  // user is guaranteed to be admin here
  res.json({ message: 'Admin user', user });
});
*/

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  getAuthUser,
  requireAuthMiddleware,
  requireAdminMiddleware,
  requireCanEditRestaurantMiddleware,
  checkMethodMiddleware,
  withErrorHandler,
  combineMiddleware,
  corsMiddleware,
  rateLimitMiddleware,
};