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
 * @param {Array} props.priceRangeOptions Array of price range options
 * @param {string} props.selectedPriceRange Currently selected price range
 * @param {Function} props.onPriceRangeChange Function to call when price range changes
 */
export default function MobileFilterDrawer({ 
  isOpen, 
  onClose, 
  soupTypes = [], 
  selectedSoupTypes = [], 
  onSoupTypeChange,
  ratingOptions = [], 
  selectedRatings = [], 
  onRatingChange,
  priceRangeOptions = [], 
  selectedPriceRanges = [], 
  onPriceRangeChange 
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
      
      {/* Drawer */}
      <div className="absolute right-0 top-0 h-full w-80 bg-white shadow-xl">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-neutral-200">
            <h2 className="text-lg font-semibold text-neutral-900">Filter Restaurants</h2>
            <button onClick={onClose} className="p-1 rounded-full text-neutral-600 hover:bg-neutral-100">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {/* Soup Type Filter */}
            <div>
              <h3 className="font-medium text-neutral-800 mb-3">Soup Type</h3>
              <div className="space-y-2">
                <button 
                  className={`w-full px-3 py-2 rounded-md text-left ${
                    selectedSoupTypes.length === 0 
                      ? 'bg-primary-500 text-white' 
                      : 'bg-white border border-primary-200 text-neutral-700'
                  }`}
                  onClick={() => onSoupTypeChange([])}
                >
                  All Types
                </button>
                
                {soupTypes.map((type) => (
                  <button
                    key={type}
                    className={`w-full px-3 py-2 rounded-md text-left ${
                      selectedSoupTypes.includes(type)
                        ? 'bg-primary-500 text-white'
                        : 'bg-white border border-primary-200 text-neutral-700'
                    }`}
                    onClick={() => {
                      if (selectedSoupTypes.includes(type)) {
                        onSoupTypeChange(selectedSoupTypes.filter(t => t !== type));
                      } else {
                        onSoupTypeChange([...selectedSoupTypes, type]);
                      }
                    }}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Rating Filter */}
            <div>
              <h3 className="font-medium text-neutral-800 mb-3">Minimum Rating</h3>
              <div className="space-y-2">
                <button 
                  className={`w-full px-3 py-2 rounded-md text-left ${
                    selectedRatings.length === 0 
                      ? 'bg-primary-500 text-white' 
                      : 'bg-white border border-primary-200 text-neutral-700'
                  }`}
                  onClick={() => onRatingChange([])}
                >
                  Any Rating
                </button>
                
                {ratingOptions.map((option) => (
                  <button
                    key={option.value}
                    className={`w-full px-3 py-2 rounded-md text-left ${
                      selectedRatings.includes(option.value)
                        ? 'bg-primary-500 text-white'
                        : 'bg-white border border-primary-200 text-neutral-700'
                    }`}
                    onClick={() => {
                      if (selectedRatings.includes(option.value)) {
                        onRatingChange(selectedRatings.filter(r => r !== option.value));
                      } else {
                        onRatingChange([...selectedRatings, option.value]);
                      }
                    }}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range Filter */}
            <div>
              <h3 className="font-medium text-neutral-800 mb-3">Price Range</h3>
              <div className="space-y-2">
                <button 
                  className={`w-full px-3 py-2 rounded-md text-left ${
                    selectedPriceRanges.length === 0 
                      ? 'bg-primary-500 text-white' 
                      : 'bg-white border border-primary-200 text-neutral-700'
                  }`}
                  onClick={() => onPriceRangeChange([])}
                >
                  Any Price
                </button>
                
                {priceRangeOptions.map((option) => (
                  <button
                    key={option.value}
                    className={`w-full px-3 py-2 rounded-md text-left ${
                      selectedPriceRanges.includes(option.value)
                        ? 'bg-primary-500 text-white'
                        : 'bg-white border border-primary-200 text-neutral-700'
                    }`}
                    onClick={() => {
                      if (selectedPriceRanges.includes(option.value)) {
                        onPriceRangeChange(selectedPriceRanges.filter(p => p !== option.value));
                      } else {
                        onPriceRangeChange([...selectedPriceRanges, option.value]);
                      }
                    }}
                    title={option.description}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          {/* Footer */}
          <div className="p-4 border-t border-neutral-200">
            <button 
              onClick={onClose} 
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 rounded-md transition-colors"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}