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
      
      {/* Bottom Sheet */}
      <div className="absolute left-0 right-0 bottom-0 max-h-[80%] bg-white/90 backdrop-blur-lg border-t border-white/60 shadow-2xl rounded-t-2xl animate-slide-in-up">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/60">
            <h2 className="text-lg font-semibold text-neutral-900">Filter Restaurants</h2>
            <button onClick={onClose} className="p-3 rounded-xl text-neutral-600 hover:bg-white/60 min-h-[44px] min-w-[44px]">
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
          
          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {/* Soup Type Filter */}
            <div>
              <h3 className="font-medium text-neutral-800 mb-3">Soup Type</h3>
              <div className="grid grid-cols-2 gap-2">
                <button 
                  className={`px-4 py-3 rounded-full text-sm font-medium border transition-all min-h-[44px] ${
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
                    className={`px-4 py-3 rounded-full text-sm font-medium border transition-all min-h-[44px] ${
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
                  className={`px-4 py-3 rounded-full text-sm font-medium border transition-all min-h-[44px] ${
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
                    className={`px-4 py-3 rounded-full text-sm font-medium border transition-all min-h-[44px] ${
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
                  className={`px-4 py-3 rounded-full text-sm font-medium border transition-all min-h-[44px] ${
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
                    className={`px-4 py-3 rounded-full text-sm font-medium border transition-all min-h-[44px] ${
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
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-medium py-3 rounded-xl shadow-sm transition-colors min-h-[44px]"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}