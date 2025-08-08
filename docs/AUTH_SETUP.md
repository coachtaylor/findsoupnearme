# Supabase Auth Setup for FindSoupNearMe

This document provides a complete guide to the authentication system implemented for the FindSoupNearMe project.

## 📋 Overview

The authentication system is built using Supabase Auth with the following features:
- Email/password authentication
- OAuth providers (Google, GitHub, etc.)
- Session management and persistence
- User profile management
- Role-based access control
- Protected routes
- TypeScript support

## 🏗️ Architecture

### File Structure
```
src/
├── lib/
│   ├── supabase.js          # Supabase client configuration
│   └── auth.js              # Authentication helper functions
├── contexts/
│   └── AuthContext.js       # React context for auth state
├── components/
│   └── auth/
│       └── ProtectedRoute.js # Route protection component
├── pages/
│   └── auth/
│       ├── login.js         # Login page
│       └── callback.js      # OAuth callback handler
├── types/
│   └── auth.ts              # TypeScript type definitions
└── supabase/
    └── migrations/
        └── 003_create_profiles_table.sql # Database migration
```

## 🚀 Setup Instructions

### 1. Environment Variables

Add the following environment variables to your `.env.local` file:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_key
```

### 2. Database Migration

Run the database migration to create the profiles table:

```bash
# If using Supabase CLI
supabase db push

# Or manually run the migration in Supabase dashboard
```

### 3. Supabase Configuration

In your Supabase dashboard:

1. **Enable Authentication Providers**:
   - Go to Authentication > Providers
   - Enable Email provider
   - Configure OAuth providers (Google, GitHub, etc.)

2. **Set up OAuth Redirect URLs**:
   - Add `http://localhost:3000/auth/callback` for development
   - Add `https://yourdomain.com/auth/callback` for production

3. **Configure Email Templates** (optional):
   - Go to Authentication > Email Templates
   - Customize confirmation and reset password emails

## 🔧 Usage

### 1. Using the Auth Context

Wrap your app with the AuthProvider:

```jsx
// pages/_app.js
import { AuthProvider } from '../contexts/AuthContext';

function MyApp({ Component, pageProps }) {
  return (
    <AuthProvider>
      <Component {...pageProps} />
    </AuthProvider>
  );
}
```

### 2. Using Authentication in Components

```jsx
import { useAuth } from '../contexts/AuthContext';

function MyComponent() {
  const { 
    user, 
    loading, 
    signIn, 
    signOut, 
    isAuthenticated 
  } = useAuth();

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {user ? (
        <div>
          <p>Welcome, {user.email}!</p>
          <button onClick={signOut}>Sign Out</button>
        </div>
      ) : (
        <button onClick={() => signIn({ email, password })}>
          Sign In
        </button>
      )}
    </div>
  );
}
```

### 3. Protected Routes

```jsx
import ProtectedRoute from '../components/auth/ProtectedRoute';

function DashboardPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <div>Admin Dashboard</div>
    </ProtectedRoute>
  );
}
```

### 4. OAuth Authentication

```jsx
import { useAuth } from '../contexts/AuthContext';

function OAuthButtons() {
  const { signInWithOAuth } = useAuth();

  const handleGoogleSignIn = () => {
    signInWithOAuth('google');
  };

  const handleGitHubSignIn = () => {
    signInWithOAuth('github');
  };

  return (
    <div>
      <button onClick={handleGoogleSignIn}>Sign in with Google</button>
      <button onClick={handleGitHubSignIn}>Sign in with GitHub</button>
    </div>
  );
}
```

## 🔐 Authentication Functions

### Core Functions

```javascript
// Sign up
const { user, session, error } = await signUp({
  email: 'user@example.com',
  password: 'password123',
  userData: { name: 'John Doe' }
});

// Sign in
const { user, session, error } = await signIn({
  email: 'user@example.com',
  password: 'password123'
});

// Sign out
const { error } = await signOut();

// OAuth sign in
const { data, error } = await signInWithOAuth('google');

// Reset password
const { data, error } = await resetPassword('user@example.com');

// Update password
const { user, error } = await updatePassword('newpassword123');

// Update profile
const { user, error } = await updateProfile({
  name: 'Jane Doe',
  bio: 'Soup enthusiast'
});
```

### User Profile Management

```javascript
// Get user profile
const { profile, error } = await userProfile.getUserProfile(userId);

// Update user profile
const { profile, error } = await userProfile.updateUserProfile({
  userId,
  updates: { name: 'New Name' }
});
```

### Role-Based Access Control

```javascript
// Check if user is authenticated
const isAuth = await isAuthenticated();

// Check if user has specific role
const isAdmin = await hasRole('admin');
const isOwner = await hasRole('restaurant_owner');

// Check specific roles
const isAdmin = await isAdmin();
const isRestaurantOwner = await isRestaurantOwner();
```

## 🛡️ Security Features

### 1. Row Level Security (RLS)

The profiles table has RLS policies that ensure:
- Users can only view and update their own profile
- Admins can view and update all profiles
- Unauthenticated users cannot access any profiles

### 2. Session Management

- Automatic session refresh
- Secure session storage
- Session persistence across browser sessions
- Automatic cleanup on sign out

### 3. Error Handling

- User-friendly error messages
- Comprehensive error logging
- Graceful fallbacks for network issues

## 📱 OAuth Provider Setup

### Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `https://your-project.supabase.co/auth/v1/callback`
6. Copy Client ID and Client Secret to Supabase dashboard

### GitHub OAuth

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Create a new OAuth App
3. Set Authorization callback URL:
   - `https://your-project.supabase.co/auth/v1/callback`
4. Copy Client ID and Client Secret to Supabase dashboard

## 🔄 Session Persistence

The authentication system automatically handles:
- Session persistence across page reloads
- Automatic token refresh
- Session cleanup on sign out
- Cross-tab session synchronization

## 🧪 Testing

### Test Authentication Flow

1. **Sign Up Test**:
   ```javascript
   const result = await signUp({
     email: 'test@example.com',
     password: 'testpass123'
   });
   console.log('Sign up result:', result);
   ```

2. **Sign In Test**:
   ```javascript
   const result = await signIn({
     email: 'test@example.com',
     password: 'testpass123'
   });
   console.log('Sign in result:', result);
   ```

3. **Protected Route Test**:
   ```javascript
   // This should redirect to login if not authenticated
   <ProtectedRoute requiredRole="admin">
     <AdminPanel />
   </ProtectedRoute>
   ```

## 🚨 Troubleshooting

### Common Issues

1. **"Invalid login credentials"**:
   - Check if user exists
   - Verify password is correct
   - Ensure email is confirmed

2. **OAuth redirect errors**:
   - Verify redirect URLs in Supabase dashboard
   - Check OAuth provider configuration
   - Ensure callback page exists

3. **Session not persisting**:
   - Check browser localStorage
   - Verify Supabase client configuration
   - Check for JavaScript errors

4. **RLS policy errors**:
   - Verify user is authenticated
   - Check RLS policies in Supabase dashboard
   - Ensure proper role assignment

### Debug Mode

Enable debug logging by adding to your environment:

```bash
NEXT_PUBLIC_SUPABASE_DEBUG=true
```

## 📚 Additional Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Next.js Authentication](https://nextjs.org/docs/authentication)
- [React Context API](https://reactjs.org/docs/context.html)

## 🤝 Contributing

When adding new authentication features:

1. Update TypeScript types in `src/types/auth.ts`
2. Add helper functions to `src/lib/auth.js`
3. Update the AuthContext if needed
4. Add appropriate tests
5. Update this documentation

---

*Last updated: January 2025* 