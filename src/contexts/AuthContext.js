// src/contexts/AuthContext.js
/**
 * Enhanced Auth Context with JWT Custom Claims
 * 
 * Provides authentication state and role-based access control information
 * to all components in the application.
 * 
 * IMPORTANT: This parses JWT custom claims to expose user roles and org memberships.
 */

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useRouter } from 'next/router';

// ============================================================================
// TYPE DEFINITIONS & CONTEXT SETUP
// ============================================================================

const AuthContext = createContext({
  user: null,
  session: null,
  loading: true,
  error: null,
  // Auth methods
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
  signInWithOAuth: async () => {},
  resetPassword: async () => {},
  updatePassword: async () => {},
  // User info with roles
  userProfile: null,
  roleGlobal: 'user',
  isAdmin: false,
  orgs: [],
  // Utility methods
  refreshSession: async () => {},
  clearError: () => {},
});

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Parses JWT custom claims from session
 * Returns user with role_global and orgs populated
 */
function parseUserWithClaims(session) {
  if (!session || !session.user) return null;
  
  const user = { ...session.user };
  
  // Try to get custom claims from JWT
  try {
    // JWT custom claims are in session.user.app_metadata or session.user.user_metadata
    const claims = session.user.app_metadata || {};
    
    // Add role_global from claims
    if (claims.role_global) {
      user.role_global = claims.role_global;
    } else if (user.user_metadata?.role_global) {
      user.role_global = user.user_metadata.role_global;
    } else {
      user.role_global = 'user'; // Default role
    }
    
    // Add orgs from claims
    if (claims.orgs) {
      user.orgs = claims.orgs;
    } else if (user.user_metadata?.orgs) {
      user.orgs = user.user_metadata.orgs;
    } else {
      user.orgs = [];
    }
  } catch (error) {
    console.error('Error parsing JWT claims:', error);
    user.role_global = 'user';
    user.orgs = [];
  }
  
  return user;
}

/**
 * Loads user profile from database
 */
async function loadUserProfile(userId) {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error loading user profile:', error);
    return null;
  }
}

// ============================================================================
// AUTH PROVIDER COMPONENT
// ============================================================================

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const router = useRouter();
  
  // Derived state
  const roleGlobal = user?.role_global || 'user';
  const isAdmin = roleGlobal === 'admin';
  const orgs = user?.orgs || [];
  
  // ============================================================================
  // INITIALIZE AUTH STATE
  // ============================================================================
  
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
    if (session) {
      const userWithClaims = parseUserWithClaims(session);
      setSession(session);
      setUser(userWithClaims);
      
      // Load additional user profile data
      if (userWithClaims) {
        loadUserProfile(userWithClaims.id).then((profile) => {
          setUserProfile(profile);
          
          if (profile?.role_global) {
            setUser((prev) => {
              if (!prev) return prev;
              if (prev.role_global === profile.role_global) return prev;
              return { ...prev, role_global: profile.role_global };
            });
          }
        });
      }
    }
    setLoading(false);
  });
  
    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
    if (session) {
      const userWithClaims = parseUserWithClaims(session);
      setSession(session);
      setUser(userWithClaims);
      
      // Load additional user profile data
      if (userWithClaims) {
        loadUserProfile(userWithClaims.id).then((profile) => {
          setUserProfile(profile);
          
          if (profile?.role_global) {
            setUser((prev) => {
              if (!prev) return prev;
              if (prev.role_global === profile.role_global) return prev;
              return { ...prev, role_global: profile.role_global };
            });
          }
        });
      }
    } else {
      setSession(null);
      setUser(null);
      setUserProfile(null);
    }
    setLoading(false);
  });
  
    return () => subscription.unsubscribe();
  }, []);
  
  // ============================================================================
  // AUTH METHODS
  // ============================================================================
  
  const signUp = useCallback(async ({ email, password, userData = {} }) => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            ...userData,
            role_global: 'user', // Default role for new users
          },
        },
      });
      
      if (error) throw error;
      
      return { user: data.user, session: data.session, error: null };
    } catch (err) {
      console.error('Sign up error:', err);
      setError(err);
      return { user: null, session: null, error: err };
    } finally {
      setLoading(false);
    }
  }, []);
  
  const signIn = useCallback(async ({ email, password }) => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      // Parse user with claims
      const userWithClaims = parseUserWithClaims(data.session);
      setUser(userWithClaims);
      setSession(data.session);
      
      // Load profile
      if (userWithClaims) {
        const profile = await loadUserProfile(userWithClaims.id);
        setUserProfile(profile);
        
        if (profile?.role_global && userWithClaims.role_global !== profile.role_global) {
          setUser((prev) => (prev ? { ...prev, role_global: profile.role_global } : prev));
        }
      }
      
      return { user: userWithClaims, session: data.session, error: null };
    } catch (err) {
      console.error('Sign in error:', err);
      setError(err);
      return { user: null, session: null, error: err };
    } finally {
      setLoading(false);
    }
  }, []);
  
  const signInWithOAuth = useCallback(async (provider, options = {}) => {
    try {
      setError(null);
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          ...options,
        },
      });
      
      if (error) throw error;
      
      return { data, error: null };
    } catch (err) {
      console.error('OAuth sign in error:', err);
      setError(err);
      return { data: null, error: err };
    }
  }, []);
  
  const signOut = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { error } = await supabase.auth.signOut();
      
      if (error) throw error;
      
      setUser(null);
      setSession(null);
      setUserProfile(null);
      
      // Redirect to home
      router.push('/');
      
      return { error: null };
    } catch (err) {
      console.error('Sign out error:', err);
      setError(err);
      return { error: err };
    } finally {
      setLoading(false);
    }
  }, [router]);
  
  const resetPassword = useCallback(async (email) => {
    try {
      setError(null);
      
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });
      
      if (error) throw error;
      
      return { data, error: null };
    } catch (err) {
      console.error('Reset password error:', err);
      setError(err);
      return { data: null, error: err };
    }
  }, []);
  
  const updatePassword = useCallback(async (newPassword) => {
    try {
      setError(null);
      
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      
      if (error) throw error;
      
      return { user: data.user, error: null };
    } catch (err) {
      console.error('Update password error:', err);
      setError(err);
      return { user: null, error: err };
    }
  }, []);
  
  const refreshSession = useCallback(async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error) throw error;
      
      if (data.session) {
        const userWithClaims = parseUserWithClaims(data.session);
        setSession(data.session);
        setUser(userWithClaims);
        
        if (userWithClaims) {
          const profile = await loadUserProfile(userWithClaims.id);
          setUserProfile(profile);
          
          if (profile?.role_global && userWithClaims.role_global !== profile.role_global) {
            setUser((prev) => (prev ? { ...prev, role_global: profile.role_global } : prev));
          }
        }
      }
      
      return { session: data.session, error: null };
    } catch (err) {
      console.error('Refresh session error:', err);
      setError(err);
      return { session: null, error: err };
    } finally {
      setLoading(false);
    }
  }, []);
  
  const clearError = useCallback(() => {
    setError(null);
  }, []);
  
  // ============================================================================
  // CONTEXT VALUE
  // ============================================================================
  
  const value = {
    user,
    session,
    loading,
    error,
    // Auth methods
    signIn,
    signUp,
    signOut,
    signInWithOAuth,
    resetPassword,
    updatePassword,
    // User info with roles
    userProfile,
    roleGlobal,
    isAdmin,
    orgs,
    // Utility methods
    refreshSession,
    clearError,
  };
  
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ============================================================================
// HOOK TO USE AUTH CONTEXT
// ============================================================================

export function useAuth() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}

// ============================================================================
// HELPER HOOKS
// ============================================================================

/**
 * Hook to require authentication
 * Redirects to login if not authenticated
 */
export function useRequireAuth(redirectTo = '/auth/login') {
  const { user, loading } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    if (!loading && !user) {
      router.push(`${redirectTo}?redirectTo=${router.asPath}`);
    }
  }, [user, loading, router, redirectTo]);
  
  return { user, loading };
}

/**
 * Hook to require admin role
 * Redirects to home if not admin
 */
export function useRequireAdmin(redirectTo = '/') {
  const { user, loading, isAdmin } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      router.push(redirectTo);
    }
  }, [user, loading, isAdmin, router, redirectTo]);
  
  return { user, loading, isAdmin };
}

/**
 * Hook to check if user is member of a specific org
 */
export function useIsOrgMember(orgId) {
  const { orgs } = useAuth();
  
  if (!orgId) return false;
  
  return orgs.some(org => org.org_id === orgId);
}

/**
 * Hook to check if user is owner of a specific org
 */
export function useIsOrgOwner(orgId) {
  const { orgs } = useAuth();
  
  if (!orgId) return false;
  
  const org = orgs.find(o => o.org_id === orgId);
  return org ? org.roles.includes('owner') : false;
}

export default AuthContext;
