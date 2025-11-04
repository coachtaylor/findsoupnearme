// src/contexts/AuthContext.js
// FIXED VERSION - Replace your current AuthContext with this

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Wrap initializeAuth in useCallback to make it stable
  const initializeAuth = useCallback(async () => {
    try {
      setLoading(true);
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Error getting session:', sessionError);
        setError(sessionError.message);
        setUser(null);
        return;
      }

      if (session?.user) {
        // Fetch user profile
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        if (profileError && profileError.code !== 'PGRST116') {
          // PGRST116 = not found, which is ok for new users
          console.error('Error fetching profile:', profileError);
        }

        setUser({
          ...session.user,
          profile: profile || null
        });
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error('Auth initialization error:', err);
      setError(err.message);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []); // Empty deps - supabase client is stable

  // Initialize auth on mount
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]); // Now includes the stable callback

  // Listen for auth changes
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event);
        
        if (session?.user) {
          // Fetch profile on auth change
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          setUser({
            ...session.user,
            profile: profile || null
          });
        } else {
          setUser(null);
        }
        
        setLoading(false);
      }
    );

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []); // This is correct - only set up listener once

  // Sign in with email/password
  const signIn = useCallback(async ({ email, password }) => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw signInError;

      return { data, error: null };
    } catch (err) {
      console.error('Sign in error:', err);
      setError(err.message);
      return { data: null, error: err };
    } finally {
      setLoading(false);
    }
  }, []);

  // Sign up with email/password
  const signUp = useCallback(async ({ email, password, metadata = {} }) => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
        },
      });

      if (signUpError) throw signUpError;

      return { data, error: null };
    } catch (err) {
      console.error('Sign up error:', err);
      setError(err.message);
      return { data: null, error: err };
    } finally {
      setLoading(false);
    }
  }, []);

  // Sign in with OAuth provider
  const signInWithOAuth = useCallback(async (provider) => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error: oauthError } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (oauthError) throw oauthError;

      return { data, error: null };
    } catch (err) {
      console.error('OAuth sign in error:', err);
      setError(err.message);
      return { data: null, error: err };
    } finally {
      setLoading(false);
    }
  }, []);

  // Sign out
  const signOut = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { error: signOutError } = await supabase.auth.signOut();

      if (signOutError) throw signOutError;

      setUser(null);
      return { error: null };
    } catch (err) {
      console.error('Sign out error:', err);
      setError(err.message);
      return { error: err };
    } finally {
      setLoading(false);
    }
  }, []);

  // Reset password
  const resetPassword = useCallback(async (email) => {
    try {
      setLoading(true);
      setError(null);
      
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (resetError) throw resetError;

      return { error: null };
    } catch (err) {
      console.error('Reset password error:', err);
      setError(err.message);
      return { error: err };
    } finally {
      setLoading(false);
    }
  }, []);

  // Update user profile
  const updateProfile = useCallback(async (updates) => {
    try {
      setLoading(true);
      setError(null);
      
      if (!user) {
        throw new Error('No user logged in');
      }

      const { data, error: updateError } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

      if (updateError) throw updateError;

      setUser({
        ...user,
        profile: data,
      });

      return { data, error: null };
    } catch (err) {
      console.error('Update profile error:', err);
      setError(err.message);
      return { data: null, error: err };
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value = {
    user,
    loading,
    error,
    signIn,
    signUp,
    signInWithOAuth,
    signOut,
    resetPassword,
    updateProfile,
    clearError,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;