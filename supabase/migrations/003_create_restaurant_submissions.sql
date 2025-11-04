-- Migration: Create restaurant_submissions table
-- This table stores restaurant suggestions from customers and restaurant owners

CREATE TABLE IF NOT EXISTS public.restaurant_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_name TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip_code TEXT,
  phone TEXT,
  website TEXT,
  contact_name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  contact_phone TEXT,
  is_restaurant_owner BOOLEAN DEFAULT FALSE,
  submission_notes TEXT,
  photo_urls TEXT[],
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'approved', 'rejected', 'added')),
  reviewed_by UUID REFERENCES public.users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX restaurant_submissions_status_idx ON public.restaurant_submissions(status);
CREATE INDEX restaurant_submissions_city_state_idx ON public.restaurant_submissions(city, state);
CREATE INDEX restaurant_submissions_created_at_idx ON public.restaurant_submissions(created_at DESC);

-- Add updated_at trigger
CREATE TRIGGER update_restaurant_submissions_updated_at 
  BEFORE UPDATE ON public.restaurant_submissions 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Add comment
COMMENT ON TABLE public.restaurant_submissions IS 'Stores restaurant suggestions submitted by customers and restaurant owners';
COMMENT ON COLUMN public.restaurant_submissions.is_restaurant_owner IS 'If true, the submitter is the restaurant owner and should be marked as verified when added';
COMMENT ON COLUMN public.restaurant_submissions.photo_urls IS 'Array of photo URLs uploaded with the submission';

