ALTER TABLE public.restaurant_submissions
  ADD COLUMN IF NOT EXISTS cuisine TEXT,
  ADD COLUMN IF NOT EXISTS cuisine_other TEXT,
  ADD COLUMN IF NOT EXISTS soup_tags TEXT[],
  ADD COLUMN IF NOT EXISTS soup_tags_other TEXT,
  ADD COLUMN IF NOT EXISTS delete_requested BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS delete_request_reason TEXT,
  ADD COLUMN IF NOT EXISTS created_restaurant_id UUID REFERENCES public.restaurants(id);

ALTER TABLE public.restaurant_submissions
  DROP CONSTRAINT IF EXISTS restaurant_submissions_status_check;

ALTER TABLE public.restaurant_submissions
  ADD CONSTRAINT restaurant_submissions_status_check
  CHECK (status IN ('pending', 'reviewed', 'approved', 'rejected', 'added', 'removed'));
