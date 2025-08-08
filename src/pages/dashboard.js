import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import Head from 'next/head';

export default function Dashboard() {
  const { user, userProfile, loading, signOut } = useAuth();
  const router = useRouter();

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [loading, user, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <>
      <Head>
        <title>User Dashboard - FindSoupNearMe</title>
      </Head>
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">My Dashboard</h1>
          
          <div className="bg-white shadow-lg rounded-xl p-6 mb-6 border border-gray-100">
            <h2 className="text-xl font-semibold mb-4">Welcome, {userProfile?.name || user.email}</h2>
            <p className="text-gray-600 mb-4">Your account details and preferences</p>
            
            <div className="flex justify-end">
              <button 
                onClick={signOut}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
          
          {/* Dashboard sections to be added in future sprints */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-100">
              <h3 className="text-lg font-semibold mb-3">My Favorite Soups</h3>
              <p className="text-gray-500 text-sm">Coming soon in the next update!</p>
            </div>
            
            <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-100">
              <h3 className="text-lg font-semibold mb-3">My Reviews</h3>
              <p className="text-gray-500 text-sm">Coming soon in the next update!</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

