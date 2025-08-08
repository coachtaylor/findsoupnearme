// src/lib/auth.js
import { supabase } from './supabase';

// Authentication helper functions
export const auth = {
  // Sign up with email and password
  async signUp({ email, password, userData = {} }) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData, // Additional user metadata
        },
      });

      if (error) {
        throw error;
      }

      return { user: data.user, session: data.session, error: null };
    } catch (error) {
      console.error('Sign up error:', error);
      return { user: null, session: null, error };
    }
  },

  // Sign in with email and password
  async signIn({ email, password }) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      return { user: data.user, session: data.session, error: null };
    } catch (error) {
      console.error('Sign in error:', error);
      return { user: null, session: null, error };
    }
  },

  // Sign in with OAuth provider (Google, GitHub, etc.)
  async signInWithOAuth({ provider, options = {} }) {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          ...options,
        },
      });

      if (error) {
        throw error;
      }

      return { data, error: null };
    } catch (error) {
      console.error('OAuth sign in error:', error);
      return { data: null, error };
    }
  },

  // Sign out
  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw error;
      }

      return { error: null };
    } catch (error) {
      console.error('Sign out error:', error);
      return { error };
    }
  },

  // Get current session
  async getSession() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        throw error;
      }

      return { session, error: null };
    } catch (error) {
      console.error('Get session error:', error);
      return { session: null, error };
    }
  },

  // Get current user
  async getUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error) {
        throw error;
      }

      return { user, error: null };
    } catch (error) {
      console.error('Get user error:', error);
      return { user: null, error };
    }
  },

  // Reset password
  async resetPassword({ email }) {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) {
        throw error;
      }

      return { data, error: null };
    } catch (error) {
      console.error('Reset password error:', error);
      return { data: null, error };
    }
  },

  // Update password
  async updatePassword({ password }) {
    try {
      const { data, error } = await supabase.auth.updateUser({
        password,
      });

      if (error) {
        throw error;
      }

      return { user: data.user, error: null };
    } catch (error) {
      console.error('Update password error:', error);
      return { user: null, error };
    }
  },

  // Update user profile
  async updateProfile({ updates }) {
    try {
      const { data, error } = await supabase.auth.updateUser({
        data: updates,
      });

      if (error) {
        throw error;
      }

      return { user: data.user, error: null };
    } catch (error) {
      console.error('Update profile error:', error);
      return { user: null, error };
    }
  },

  // Listen to auth state changes
  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange(callback);
  },

  // Refresh session
  async refreshSession() {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error) {
        throw error;
      }

      return { session: data.session, error: null };
    } catch (error) {
      console.error('Refresh session error:', error);
      return { session: null, error };
    }
  },
};

// Session management utilities
export const sessionManager = {
  // Get session from localStorage (for SSR compatibility)
  getSessionFromStorage() {
    if (typeof window === 'undefined') return null;
    
    try {
      const session = localStorage.getItem('supabase.auth.token');
      return session ? JSON.parse(session) : null;
    } catch (error) {
      console.error('Error getting session from storage:', error);
      return null;
    }
  },

  // Set session in localStorage
  setSessionInStorage(session) {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem('supabase.auth.token', JSON.stringify(session));
    } catch (error) {
      console.error('Error setting session in storage:', error);
    }
  },

  // Clear session from localStorage
  clearSessionFromStorage() {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.removeItem('supabase.auth.token');
    } catch (error) {
      console.error('Error clearing session from storage:', error);
    }
  },
};

// User profile management
export const userProfile = {
  // Get user profile from profiles table
  async getUserProfile(userId) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        throw error;
      }

      return { profile: data, error: null };
    } catch (error) {
      console.error('Get user profile error:', error);
      return { profile: null, error };
    }
  },

  // Create or update user profile
  async upsertUserProfile({ userId, profileData }) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          ...profileData,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return { profile: data, error: null };
    } catch (error) {
      console.error('Upsert user profile error:', error);
      return { profile: null, error };
    }
  },

  // Update user profile
  async updateUserProfile({ userId, updates }) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return { profile: data, error: null };
    } catch (error) {
      console.error('Update user profile error:', error);
      return { profile: null, error };
    }
  },
};

// Auth state management
export const authState = {
  // Check if user is authenticated
  async isAuthenticated() {
    const { session } = await auth.getSession();
    return !!session;
  },

  // Check if user has specific role
  async hasRole(role) {
    const { user } = await auth.getUser();
    return user?.user_metadata?.role === role;
  },

  // Check if user is admin
  async isAdmin() {
    return authState.hasRole('admin');
  },

  // Check if user is restaurant owner
  async isRestaurantOwner() {
    return authState.hasRole('restaurant_owner');
  },
};

// Error handling utilities
export const authErrors = {
  // Get user-friendly error message
  getErrorMessage(error) {
    if (!error) return 'An unknown error occurred';

    const errorMessages = {
      'Invalid login credentials': 'Invalid email or password',
      'Email not confirmed': 'Please check your email and click the confirmation link',
      'User already registered': 'An account with this email already exists',
      'Password should be at least 6 characters': 'Password must be at least 6 characters long',
      'Unable to validate email address': 'Please enter a valid email address',
      'Signup is disabled': 'New account registration is currently disabled',
      'Too many requests': 'Too many attempts. Please try again later',
    };

    return errorMessages[error.message] || error.message;
  },

  // Check if error is auth-related
  isAuthError(error) {
    return error?.message?.includes('auth') || 
           error?.message?.includes('login') || 
           error?.message?.includes('password') ||
           error?.message?.includes('email');
  },
};

export default auth; 