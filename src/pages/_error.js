// src/pages/_error.js
import { useEffect } from 'react';

function Error({ statusCode }) {
  useEffect(() => {
    // Log the error for debugging
    console.error('Error page rendered with status code:', statusCode);
  }, [statusCode]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
        <div className="text-6xl mb-4">🍲</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          {statusCode
            ? `A ${statusCode} error occurred on server`
            : 'An error occurred on client'}
        </h1>
        <p className="text-gray-600 mb-6">
          {statusCode === 404
            ? 'The page you are looking for does not exist.'
            : 'Something went wrong. Please try again later.'}
        </p>
        <button
          onClick={() => window.location.href = '/'}
          className="bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
        >
          Go Home
        </button>
      </div>
    </div>
  );
}

Error.getInitialProps = ({ res, err }) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

export default Error; 