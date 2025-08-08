// src/contexts/AuthContext.js
import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, sessionManager, userProfile, authState, authErrors } from '../lib/auth';

// Create the auth context
const AuthContext = createContext();

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userProfileData, setUserProfileData] = useState(null);

  // Initialize auth state
  useEffect(() => {
    initializeAuth();
    
    // Set up auth state change listener
    const { data: { subscription } } = auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session);
      
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        setSession(session);
        setUser(session?.user || null);
        setError(null);
        
        // Load user profile if user exists
        if (session?.user) {
          await loadUserProfile(session.user.id);
        }
      } else if (event === 'SIGNED_OUT') {
        setSession(null);
        setUser(null);
        setUserProfileData(null);
        setError(null);
        sessionManager.clearSessionFromStorage();
      }
      
      setLoading(false);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // Initialize authentication state
  const initializeAuth = async () => {
    try {
      setLoading(true);
      
      // Get current session
      const { session: currentSession, error: sessionError } = await auth.getSession();
      
      if (sessionError) {
        console.error('Session error:', sessionError);
        setError(sessionError);
      } else if (currentSession) {
        setSession(currentSession);
        setUser(currentSession.user);
        
        // Load user profile
        await loadUserProfile(currentSession.user.id);
      }
    } catch (err) {
      console.error('Auth initialization error:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  // Load user profile from database
  const loadUserProfile = async (userId) => {
    try {
      const { profile, error: profileError } = await userProfile.getUserProfile(userId);
      
      if (profileError) {
        console.error('Profile loading error:', profileError);
        // Don't set this as a critical error since profile is optional
      } else {
        setUserProfileData(profile);
      }
    } catch (err) {
      console.error('Profile loading error:', err);
    }
  };

  // Sign up function
  const signUp = async ({ email, password, userData = {} }) => {
    try {
      setLoading(true);
      setError(null);
      
      const { user: newUser, session: newSession, error: signUpError } = await auth.signUp({
        email,
        password,
        userData,
      });

      if (signUpError) {
        setError(signUpError);
        return { user: null, session: null, error: signUpError };
      }

      // Create user profile in database
      if (newUser) {
        const { profile, error: profileError } = await userProfile.upsertUserProfile({
          userId: newUser.id,
          profileData: {
            email: newUser.email,
            name: userData.name || '',
            ...userData,
          },
        });

        if (profileError) {
          console.error('Profile creation error:', profileError);
        } else {
          setUserProfileData(profile);
        }
      }

      setUser(newUser);
      setSession(newSession);
      
      return { user: newUser, session: newSession, error: null };
    } catch (err) {
      const authError = authErrors.getErrorMessage(err);
      setError(authError);
      return { user: null, session: null, error: authError };
    } finally {
      setLoading(false);
    }
  };

  // Sign in function
  const signIn = async ({ email, password }) => {
    try {
      setLoading(true);
      setError(null);
      
      const { user: signedInUser, session: signedInSession, error: signInError } = await auth.signIn({
        email,
        password,
      });

      if (signInError) {
        setError(signInError);
        return { user: null, session: null, error: signInError };
      }

      setUser(signedInUser);
      setSession(signedInSession);
      
      // Load user profile
      if (signedInUser) {
        await loadUserProfile(signedInUser.id);
      }
      
      return { user: signedInUser, session: signedInSession, error: null };
    } catch (err) {
      const authError = authErrors.getErrorMessage(err);
      setError(authError);
      return { user: null, session: null, error: authError };
    } finally {
      setLoading(false);
    }
  };

  // OAuth sign in function
  const signInWithOAuth = async (provider, options = {}) => {
    try {
      setError(null);
      
      const { data, error: oauthError } = await auth.signInWithOAuth({
        provider,
        options,
      });

      if (oauthError) {
        setError(oauthError);
        return { data: null, error: oauthError };
      }

      return { data, error: null };
    } catch (err) {
      const authError = authErrors.getErrorMessage(err);
      setError(authError);
      return { data: null, error: authError };
    }
  };

  // Sign out function
  const signOut = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { error: signOutError } = await auth.signOut();
      
      if (signOutError) {
        setError(signOutError);
        return { error: signOutError };
      }

      setUser(null);
      setSession(null);
      setUserProfileData(null);
      sessionManager.clearSessionFromStorage();
      
      return { error: null };
    } catch (err) {
      const authError = authErrors.getErrorMessage(err);
      setError(authError);
      return { error: authError };
    } finally {
      setLoading(false);
    }
  };

  // Reset password function
  const resetPassword = async (email) => {
    try {
      setError(null);
      
      const { data, error: resetError } = await auth.resetPassword({ email });
      
      if (resetError) {
        setError(resetError);
        return { data: null, error: resetError };
      }

      return { data, error: null };
    } catch (err) {
      const authError = authErrors.getErrorMessage(err);
      setError(authError);
      return { data: null, error: authError };
    }
  };

  // Update password function
  const updatePassword = async (password) => {
    try {
      setLoading(true);
      setError(null);
      
      const { user: updatedUser, error: updateError } = await auth.updatePassword({ password });
      
      if (updateError) {
        setError(updateError);
        return { user: null, error: updateError };
      }

      setUser(updatedUser);
      
      return { user: updatedUser, error: null };
    } catch (err) {
      const authError = authErrors.getErrorMessage(err);
      setError(authError);
      return { user: null, error: authError };
    } finally {
      setLoading(false);
    }
  };

  // Update profile function
  const updateProfile = async (updates) => {
    try {
      setLoading(true);
      setError(null);
      
      const { user: updatedUser, error: updateError } = await auth.updateProfile({ updates });
      
      if (updateError) {
        setError(updateError);
        return { user: null, error: updateError };
      }

      // Update user profile in database
      if (updatedUser) {
        const { profile, error: profileError } = await userProfile.updateUserProfile({
          userId: updatedUser.id,
          updates,
        });

        if (profileError) {
          console.error('Profile update error:', profileError);
        } else {
          setUserProfileData(profile);
        }
      }

      setUser(updatedUser);
      
      return { user: updatedUser, error: null };
    } catch (err) {
      const authError = authErrors.getErrorMessage(err);
      setError(authError);
      return { user: null, error: authError };
    } finally {
      setLoading(false);
    }
  };

  // Refresh session function
  const refreshSession = async () => {
    try {
      setError(null);
      
      const { session: refreshedSession, error: refreshError } = await auth.refreshSession();
      
      if (refreshError) {
        setError(refreshError);
        return { session: null, error: refreshError };
      }

      setSession(refreshedSession);
      
      return { session: refreshedSession, error: null };
    } catch (err) {
      const authError = authErrors.getErrorMessage(err);
      setError(authError);
      return { session: null, error: authError };
    }
  };

  // Check if user is authenticated
  const isAuthenticated = async () => {
    return await authState.isAuthenticated();
  };

  // Check if user has specific role
  const hasRole = async (role) => {
    return await authState.hasRole(role);
  };

  // Check if user is admin
  const isAdmin = async () => {
    return await authState.isAdmin();
  };

  // Check if user is restaurant owner
  const isRestaurantOwner = async () => {
    return await authState.isRestaurantOwner();
  };

  // Clear error
  const clearError = () => {
    setError(null);
  };

  // Context value
  const value = {
    user,
    session,
    userProfile: userProfileData,
    loading,
    error,
    signUp,
    signIn,
    signInWithOAuth,
    signOut,
    resetPassword,
    updatePassword,
    updateProfile,
    refreshSession,
    isAuthenticated,
    hasRole,
    isAdmin,
    isRestaurantOwner,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext; 