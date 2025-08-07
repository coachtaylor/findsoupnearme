import React from 'react';
import Link from 'next/link';

/**
 * Error state component for displaying API errors
 */
export default function ErrorState({ 
  message = 'Something went wrong.', 
  error = null,
  retry = null, 
  homeLink = true 
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="bg-red-50 p-4 rounded-full mb-6">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-10 w-10 text-red-500" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
          />
        </svg>
      </div>
      
      <h3 className="text-xl font-bold text-neutral-900 mb-2">
        {message}
      </h3>
      
      {error && (
        <p className="text-neutral-600 mb-6 max-w-md">
          {typeof error === 'string' ? error : 'An unexpected error occurred.'}
        </p>
      )}
      
      <div className="flex flex-col sm:flex-row gap-4">
        {retry && (
          <button 
            onClick={retry} 
            className="px-5 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg shadow-sm transition-colors"
          >
            Try Again
          </button>
        )}
        
        {homeLink && (
          <Link href="/" className="px-5 py-2 bg-white border border-neutral-200 hover:bg-neutral-50 text-neutral-700 rounded-lg shadow-sm transition-colors">
            Return Home
          </Link>
        )}
      </div>
    </div>
  );
}