// src/components/restaurant/MobileFilterDrawer.js
import { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

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
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose}></div>
      
      {/* Drawer */}
      <div className="absolute right-0 top-0 h-full w-80 bg-white/85 backdrop-blur-lg border-l border-white/60 shadow-2xl rounded-l-2xl">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/60">
            <h2 className="text-lg font-semibold text-neutral-900">Filter Restaurants</h2>
            <button onClick={onClose} className="p-2 rounded-xl text-neutral-600 hover:bg-white/60">
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
          
          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {/* Soup Type Filter */}
            <div>
              <h3 className="font-medium text-neutral-800 mb-3">Soup Type</h3>
              <div className="grid grid-cols-2 gap-2">
                <button 
                  className={`px-3 py-2 rounded-full text-sm font-medium border transition-all ${
                    selectedSoupTypes.length === 0 
                      ? 'bg-orange-500 text-white border-orange-500 shadow-sm' 
                      : 'bg-white/80 backdrop-blur-sm border-neutral-200 text-neutral-700 hover:bg-orange-50'
                  }`}
                  onClick={() => onSoupTypeChange([])}
                >
                  All Types
                </button>
                
                {soupTypes.map((type) => (
                  <button
                    key={type}
                    className={`px-3 py-2 rounded-full text-sm font-medium border transition-all ${
                      selectedSoupTypes.includes(type)
                        ? 'bg-orange-500 text-white border-orange-500 shadow-sm'
                        : 'bg-white/80 backdrop-blur-sm border-neutral-200 text-neutral-700 hover:bg-orange-50'
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
              <div className="grid grid-cols-3 gap-2">
                <button 
                  className={`px-3 py-2 rounded-full text-sm font-medium border transition-all ${
                    selectedRatings.length === 0 
                      ? 'bg-orange-500 text-white border-orange-500 shadow-sm' 
                      : 'bg-white/80 backdrop-blur-sm border-neutral-200 text-neutral-700 hover:bg-orange-50'
                  }`}
                  onClick={() => onRatingChange([])}
                >
                  Any
                </button>
                
                {ratingOptions.map((option) => (
                  <button
                    key={option.value}
                    className={`px-3 py-2 rounded-full text-sm font-medium border transition-all ${
                      selectedRatings.includes(option.value)
                        ? 'bg-orange-500 text-white border-orange-500 shadow-sm'
                        : 'bg-white/80 backdrop-blur-sm border-neutral-200 text-neutral-700 hover:bg-orange-50'
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
              <div className="grid grid-cols-4 gap-2">
                <button 
                  className={`px-3 py-2 rounded-full text-sm font-medium border transition-all ${
                    selectedPriceRanges.length === 0 
                      ? 'bg-orange-500 text-white border-orange-500 shadow-sm' 
                      : 'bg-white/80 backdrop-blur-sm border-neutral-200 text-neutral-700 hover:bg-orange-50'
                  }`}
                  onClick={() => onPriceRangeChange([])}
                >
                  Any
                </button>
                
                {priceRangeOptions.map((option) => (
                  <button
                    key={option.value}
                    className={`px-3 py-2 rounded-full text-sm font-medium border transition-all ${
                      selectedPriceRanges.includes(option.value)
                        ? 'bg-orange-500 text-white border-orange-500 shadow-sm'
                        : 'bg-white/80 backdrop-blur-sm border-neutral-200 text-neutral-700 hover:bg-orange-50'
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
          <div className="p-4 border-t border-white/60 bg-white/70 backdrop-blur-md">
            <button 
              onClick={onClose} 
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-medium py-3 rounded-xl shadow-sm transition-colors"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}