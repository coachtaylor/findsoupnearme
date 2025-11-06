// src/pages/auth/login.js
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../contexts/AuthContext';
import Head from 'next/head';
import Link from 'next/link';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState('');
  
  const { signIn, signInWithOAuth, error: authError, clearError, user, loading, orgs, isAdmin } = useAuth();
  const router = useRouter();

  const userHasOwnerAccess = useCallback((targetUser, targetOrgs, adminFlag) => {
    if (!targetUser) return false;
    if (adminFlag) return true;
    if (targetUser.user_metadata?.user_type === 'owner') return true;
    const memberships = Array.isArray(targetOrgs) && targetOrgs.length > 0
      ? targetOrgs
      : targetUser.user_metadata?.orgs || [];
    return memberships.some((membership) => {
      if (!membership) return false;
      const roles = Array.isArray(membership.roles)
        ? membership.roles
        : membership.role
          ? [membership.role]
          : [];
      return roles.includes('owner');
    });
  }, []);

  const ownerDashboardRedirect = useMemo(() => {
    if (!user) return '/dashboard';
    if (isAdmin) return '/admin/claims';
    return userHasOwnerAccess(user, orgs, false) ? '/owner/dashboard' : '/dashboard';
  }, [user, orgs, isAdmin, userHasOwnerAccess]);

  // Redirect if already authenticated
  const redirectToParam = router.query?.redirectTo;

  useEffect(() => {
    if (user && !loading) {
      router.push(typeof redirectToParam === 'string' ? redirectToParam : ownerDashboardRedirect);
    }
  }, [user, loading, router, ownerDashboardRedirect, redirectToParam]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    // Clear errors when user starts typing
    if (formError) setFormError('');
    if (authError) clearError();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setFormError('');

    try {
      const { user: signedInUser, error } = await signIn({
        email: formData.email,
        password: formData.password,
      });

      if (error) {
        setFormError(error.message || 'Login failed');
      } else if (signedInUser) {
        // Redirect to dashboard or intended page
        const adminFlag =
          signedInUser?.role_global === 'admin' ||
          signedInUser?.user_metadata?.role_global === 'admin';
        const destination =
          typeof redirectToParam === 'string'
            ? redirectToParam
            : adminFlag
              ? '/admin/claims'
              : userHasOwnerAccess(signedInUser, signedInUser?.orgs, false)
                ? '/owner/dashboard'
                : '/dashboard';
        router.push(destination);
      }
    } catch (err) {
      setFormError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthSignIn = async (provider) => {
    try {
      const { error } = await signInWithOAuth(provider, {
        redirectTo: `${window.location.origin}/auth/callback?redirectTo=${router.query.redirectTo || '/'}`,
      });

      if (error) {
        setFormError(error.message || 'OAuth sign-in failed');
      }
    } catch (err) {
      setFormError('An unexpected error occurred');
    }
  };

  const navigateToRegister = useCallback(() => {
    router.push('/auth/register');
  }, [router]);

  return (
    <>
      <Head>
        <title>Login - FindSoupNearMe</title>
        <meta name="description" content="Sign in to your FindSoupNearMe account" />
      </Head>
      
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-orange-200 rounded-full opacity-20 blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-300 rounded-full opacity-20 blur-3xl"></div>
        </div>

        <div className="relative max-w-md w-full space-y-8">
          {/* Header */}
          <div className="text-center">
            <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-orange-600 shadow-lg">
              <span className="text-3xl">🍜</span>
            </div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Sign in to your account
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Or{' '}
              <button
                onClick={navigateToRegister}
                className="font-medium text-orange-600 hover:text-orange-500 transition-colors"
              >
                create a new account
              </button>
            </p>
            <p className="mt-3 text-center text-sm text-gray-500">
              Sign in to discover restaurants, favorite soups, and add reviews
            </p>
          </div>

          {/* Login Form Card */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="px-8 py-10">
              {/* Error Messages */}
              {(formError || authError) && (
                <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                  {formError || authError}
                </div>
              )}

              {/* Login Form */}
              <form className="space-y-6" onSubmit={handleSubmit}>
                {/* Email Field */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                    placeholder="you@example.com"
                  />
                </div>

                {/* Password Field */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                    placeholder="••••••••"
                  />
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="rememberMe"
                      name="rememberMe"
                      type="checkbox"
                      checked={formData.rememberMe}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded cursor-pointer"
                    />
                    <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-700 cursor-pointer">
                      Remember me
                    </label>
                  </div>

                  <div className="text-sm">
                    <Link href="/auth/forgot-password" className="font-medium text-orange-600 hover:text-orange-500 transition-colors">
                      Forgot password?
                    </Link>
                  </div>
                </div>

                {/* Submit Button */}
                <div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
                  >
                    {isLoading ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Signing in...
                      </span>
                    ) : (
                      'Sign in'
                    )}
                  </button>
                </div>
              </form>

              {/* Divider */}
              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">Or continue with</span>
                  </div>
                </div>
              </div>

              {/* OAuth Buttons */}
              <div className="mt-6 grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleOAuthSignIn('google')}
                  className="w-full inline-flex justify-center items-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-all"
                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Google
                </button>

                <button
                  onClick={() => handleOAuthSignIn('github')}
                  className="w-full inline-flex justify-center items-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-all"
                >
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd" />
                  </svg>
                  GitHub
                </button>
              </div>
            </div>
          </div>

          {/* Footer Links */}
          <div className="text-center text-sm text-gray-600">
            <p>
              By signing in, you agree to our{' '}
              <Link href="/terms" className="text-orange-600 hover:text-orange-500 font-medium">
                Terms of Service
              </Link>
              {' '}and{' '}
              <Link href="/privacy" className="text-orange-600 hover:text-orange-500 font-medium">
                Privacy Policy
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginPage;
