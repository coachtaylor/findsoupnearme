-- Migration: Add image columns to restaurants table
-- This migration adds columns for storing restaurant and soup image URLs

-- Add exterior image URL column for restaurant photos
ALTER TABLE public.restaurants 
ADD COLUMN exterior_image_url TEXT;

-- Add soup image URLs column (array of URLs for multiple soup images)
ALTER TABLE public.restaurants 
ADD COLUMN soup_image_urls TEXT[];

-- Add Google Place ID column for tracking restaurants from Google Maps
ALTER TABLE public.restaurants 
ADD COLUMN google_place_id TEXT UNIQUE;

-- Add index for Google Place ID for faster lookups
CREATE INDEX restaurants_google_place_id_idx ON public.restaurants(google_place_id);

-- Add index for exterior image URL for faster queries on restaurants with/without images
CREATE INDEX restaurants_exterior_image_url_idx ON public.restaurants(exterior_image_url);

-- Add comment to document the new columns
COMMENT ON COLUMN public.restaurants.exterior_image_url IS 'URL to the restaurant exterior image (from Google Street View or uploaded)';
COMMENT ON COLUMN public.restaurants.soup_image_urls IS 'Array of URLs to soup images for this restaurant';
COMMENT ON COLUMN public.restaurants.google_place_id IS 'Google Places API Place ID for tracking and avoiding duplicates'; 