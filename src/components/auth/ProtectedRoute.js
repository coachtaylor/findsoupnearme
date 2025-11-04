// src/components/auth/ProtectedRoute.js
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../contexts/AuthContext';

const ProtectedRoute = ({ 
  children, 
  requiredRole = null, 
  fallback = null, 
  redirectTo = '/auth/login',
  showLoading = true 
}) => {
  const { user, loading, hasRole, isAuthenticated } = useAuth();
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      setCheckingAuth(true);
      
      try {
        // Check if user is authenticated
        const authenticated = await isAuthenticated();
        
        if (!authenticated) {
          // User is not authenticated, redirect to login
          router.push(redirectTo);
          return;
        }

        // If no specific role is required, user is authorized
        if (!requiredRole) {
          setAuthorized(true);
          return;
        }

        // Check if user has the required role
        const hasRequiredRole = await hasRole(requiredRole);
        
        if (!hasRequiredRole) {
          // User doesn&apos;t have required role, redirect to unauthorized page
          router.push('/auth/unauthorized');
          return;
        }

        setAuthorized(true);
      } catch (error) {
        console.error('Auth check error:', error);
        router.push(redirectTo);
      } finally {
        setCheckingAuth(false);
      }
    };

    if (!loading) {
      checkAuth();
    }
  }, [user, loading, requiredRole, router, redirectTo, isAuthenticated, hasRole]);

  // Show loading state
  if (loading || checkingAuth) {
    if (showLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      );
    }
    return null;
  }

  // Show fallback if provided and not authorized
  if (!authorized && fallback) {
    return fallback;
  }

  // Show children if authorized
  if (authorized) {
    return children;
  }

  // Return null while redirecting
  return null;
};

export default ProtectedRoute; 