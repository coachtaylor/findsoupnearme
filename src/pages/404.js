// src/pages/404.js
import Link from 'next/link';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-soup-orange-50 px-4">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-soup-red-600">404</h1>
        <h2 className="text-3xl font-bold text-soup-brown-900 mt-4 mb-6">
          Page Not Found
        </h2>
        <p className="text-soup-brown-700 mb-8 max-w-md mx-auto">
          Sorry, we couldn't find the page you're looking for. The soup you're searching for might have been moved or doesn't exist.
        </p>
        <div className="space-y-4">
          <Link 
            href="/"
            className="inline-block bg-soup-red-600 hover:bg-soup-red-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            Return to Homepage
          </Link>
          <div className="mt-4">
            <Link
              href="/restaurants"
              className="text-soup-red-600 hover:text-soup-red-700 underline"
            >
              Browse All Restaurants
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// Remove this if it's causing issues
// NotFoundPage.getInitialProps = async () => {
//   return {
//     title: "Page Not Found | FindSoupNearMe",
//     description: "The page you are looking for does not exist."
//   };
// };