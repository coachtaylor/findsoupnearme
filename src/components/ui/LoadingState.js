import React from 'react';

/**
 * Loading indicator component with configurable appearance
 */
export default function LoadingState({ message = 'Loading...', size = 'medium', fullScreen = false }) {
  // Determine spinner size classes
  const sizeClasses = {
    small: 'h-8 w-8 border-2',
    medium: 'h-12 w-12 border-4',
    large: 'h-16 w-16 border-4'
  };
  
  // Determine text size classes
  const textSizeClasses = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-lg'
  };
  
  // Container classes
  const containerClasses = fullScreen 
    ? 'fixed inset-0 flex items-center justify-center bg-white bg-opacity-90 z-50' 
    : 'flex flex-col items-center justify-center py-8';
  
  return (
    <div className={containerClasses} role="status" aria-live="polite">
      <div 
        className={`${sizeClasses[size]} rounded-full border-primary-500 border-r-transparent animate-spin`}
        aria-hidden="true"
      />
      {message && (
        <p className={`mt-4 ${textSizeClasses[size]} text-neutral-600`}>
          {message}
        </p>
      )}
    </div>
  );
}