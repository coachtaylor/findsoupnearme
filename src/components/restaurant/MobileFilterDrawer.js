// src/components/restaurant/MobileFilterDrawer.js
import { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

/**
 * Mobile-friendly filter drawer component for restaurant listings
 * 
 * @param {Object} props Component props
 * @param {boolean} props.isOpen Whether the drawer is open
 * @param {Function} props.onClose Function to call when the drawer is closed
 * @param {Array} props.soupTypes Array of soup type options
 * @param {string} props.selectedSoupType Currently selected soup type
 * @param {Function} props.onSoupTypeChange Function to call when soup type changes
 * @param {Array} props.ratingOptions Array of rating options
 * @param {number} props.selectedRating Currently selected rating
 * @param {Function} props.onRatingChange Function to call when rating changes
 */
export default function MobileFilterDrawer({
  isOpen,
  onClose,
  soupTypes = [],
  selectedSoupType,
  onSoupTypeChange,
  ratingOptions = [],
  selectedRating,
  onRatingChange
}) {
  // Prevent body scrolling when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);
  
  // Handle close on escape key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    if (isOpen) {
      window.addEventListener('keydown', handleEsc);
    }
    
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, onClose]);
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black bg-opacity-50">
      <div className="bg-white w-4/5 max-w-md flex flex-col h-full overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-soup-brown-900">Filter Restaurants</h2>
          <button 
            onClick={onClose}
            className="p-1 rounded-full text-soup-brown-600 hover:bg-soup-brown-100"
            aria-label="Close filters"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        
        {/* Filters */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Soup Type Filter */}
          <div>
            <h3 className="font-medium text-soup-brown-800 mb-3">Soup Type</h3>
            <div className="space-y-2">
              <button
                className={`w-full px-3 py-2 rounded-md text-left ${
                  selectedSoupType === null
                    ? 'bg-soup-red-600 text-white'
                    : 'bg-white border border-soup-brown-200 text-soup-brown-700'
                }`}
                onClick={() => onSoupTypeChange(null)}
              >
                All Types
              </button>
              
              {soupTypes.map((type) => (
                <button
                  key={type}
                  className={`w-full px-3 py-2 rounded-md text-left ${
                    selectedSoupType === type
                      ? 'bg-soup-red-600 text-white'
                      : 'bg-white border border-soup-brown-200 text-soup-brown-700'
                  }`}
                  onClick={() => onSoupTypeChange(type)}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
          
          {/* Rating Filter */}
          <div>
            <h3 className="font-medium text-soup-brown-800 mb-3">Minimum Rating</h3>
            <div className="space-y-2">
              <button
                className={`w-full px-3 py-2 rounded-md text-left ${
                  selectedRating === null
                    ? 'bg-soup-red-600 text-white'
                    : 'bg-white border border-soup-brown-200 text-soup-brown-700'
                }`}
                onClick={() => onRatingChange(null)}
              >
                Any Rating
              </button>
              
              {ratingOptions.map((option) => (
                <button
                  key={option.value}
                  className={`w-full px-3 py-2 rounded-md text-left ${
                    selectedRating === option.value
                      ? 'bg-soup-red-600 text-white'
                      : 'bg-white border border-soup-brown-200 text-soup-brown-700'
                  }`}
                  onClick={() => onRatingChange(option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full bg-soup-red-600 hover:bg-soup-red-700 text-white font-medium py-2 rounded-md transition-colors"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
}