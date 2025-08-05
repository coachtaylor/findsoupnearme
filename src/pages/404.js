// src/pages/404.js
import Link from 'next/link';
import Head from 'next/head';

export default function NotFoundPage() {
  return (
    <>
      <Head>
        <title>Page Not Found | FindSoupNearMe</title>
        <meta name="description" content="The page you are looking for does not exist." />
      </Head>
      
      <div className="min-h-[80vh] flex items-center justify-center bg-neutral-50 px-4">
        <div className="text-center max-w-lg mx-auto">
          <div className="relative mb-6">
            <div className="text-9xl font-bold text-primary-500 opacity-10 absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/4">
              404
            </div>
            <h1 className="text-8xl font-bold text-primary-500 relative z-10 mb-4">
              404
            </h1>
          </div>
          
          <h2 className="text-3xl font-bold text-neutral-900 mb-6">
            Page Not Found
          </h2>
          
          <p className="text-neutral-700 mb-10 max-w-md mx-auto text-lg">
            Sorry, we couldn't find the page you're looking for. The soup you're searching for might have been moved or doesn't exist.
          </p>
          
          <div className="flex flex-col space-y-4 items-center">
            <Link 
              href="/"
              className="inline-flex items-center justify-center px-6 py-3.5 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-xl transition-colors shadow-soft hover:shadow-md w-full sm:w-auto"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-5 w-5 mr-2" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M3 12l2-2m0 0l7-7 7 7m-7-7v14" 
                />
              </svg>
              Return to Homepage
            </Link>
            
            <Link
              href="/restaurants"
              className="inline-flex items-center text-primary-600 hover:text-primary-700 font-medium"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-5 w-5 mr-2" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M17 8l4 4m0 0l-4 4m4-4H3" 
                />
              </svg>
              Browse All Restaurants
            </Link>
          </div>
          
          {/* Optional Bowl Illustration */}
          <div className="mt-12 max-w-xs mx-auto opacity-60">
            <svg viewBox="0 0 300 100" xmlns="http://www.w3.org/2000/svg" fill="none" className="text-primary-500">
              <path d="M50,80 C90,95 210,95 250,80 L260,90 C260,90 280,90 280,70 C280,50 260,50 260,50 L40,50 C40,50 20,50 20,70 C20,90 40,90 40,90 L50,80" stroke="currentColor" strokeWidth="3"/>
              <path d="M60,45 C60,35 70,20 85,20 C95,20 105,25 105,35" stroke="currentColor" strokeWidth="2"/>
              <path d="M120,45 C120,30 130,15 150,15 C170,15 180,30 180,45" stroke="currentColor" strokeWidth="2"/>
              <path d="M195,45 C195,35 205,20 220,20 C230,20 240,25 240,35" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </div>
        </div>
      </div>
    </>
  );
}