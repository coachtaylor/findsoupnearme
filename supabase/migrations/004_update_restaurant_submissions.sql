-- Migration: Update restaurant_submissions workflow (safe if table missing)

DO $$
BEGIN
  IF to_regclass('public.restaurant_submissions') IS NULL THEN
    RAISE NOTICE 'Skipping restaurant_submissions migration because the table does not exist.';
    RETURN;
  END IF;

  ALTER TABLE public.restaurant_submissions
    ADD COLUMN IF NOT EXISTS submitted_by UUID REFERENCES public.users(id);

  ALTER TABLE public.restaurant_submissions
    ADD COLUMN IF NOT EXISTS review_notes TEXT;

  CREATE INDEX IF NOT EXISTS restaurant_submissions_submitted_by_idx
    ON public.restaurant_submissions(submitted_by);

  ALTER TABLE public.restaurant_submissions
    ENABLE ROW LEVEL SECURITY;

  DROP POLICY IF EXISTS "Owners can insert submissions" ON public.restaurant_submissions;
  DROP POLICY IF EXISTS "Owners can select submissions" ON public.restaurant_submissions;
  DROP POLICY IF EXISTS "Admins can manage submissions" ON public.restaurant_submissions;

  CREATE POLICY "Submitter can insert own submission"
    ON public.restaurant_submissions
    FOR INSERT
    WITH CHECK (auth.uid() = submitted_by);

  CREATE POLICY "Submitter can view own submission"
    ON public.restaurant_submissions
    FOR SELECT
    USING (submitted_by IS NOT NULL AND auth.uid() = submitted_by);

  CREATE POLICY "Submitter can update own submission"
    ON public.restaurant_submissions
    FOR UPDATE
    USING (submitted_by IS NOT NULL AND auth.uid() = submitted_by)
    WITH CHECK (submitted_by IS NOT NULL AND auth.uid() = submitted_by);

  CREATE POLICY "Admins can manage submissions"
    ON public.restaurant_submissions
    FOR ALL
    USING (
      coalesce(current_setting('request.jwt.claims', true)::json->>'role_global', 'user') = 'admin'
    )
    WITH CHECK (
      coalesce(current_setting('request.jwt.claims', true)::json->>'role_global', 'user') = 'admin'
    );
END;
$$;
