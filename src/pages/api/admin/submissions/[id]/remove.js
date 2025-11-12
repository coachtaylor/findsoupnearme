import { createClient } from '@supabase/supabase-js';
import { checkMethodMiddleware, requireAdminMiddleware, withErrorHandler } from '../../../../../lib/apiMiddleware';

const hasAdminClient = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);

const supabaseAdmin = hasAdminClient
  ? createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    })
  : null;

export default withErrorHandler(async (req, res) => {
  if (!checkMethodMiddleware(req, res, ['POST'])) return;

  const admin = await requireAdminMiddleware(req, res);
  if (!admin) return;

  if (!hasAdminClient) {
    res.status(500).json({ error: 'Server not configured for admin submissions' });
    return;
  }

  const { id } = req.query;
  if (!id || Array.isArray(id)) {
    res.status(400).json({ error: 'Submission id is required' });
    return;
  }

  const { data: submission, error } = await supabaseAdmin
    .from('restaurant_submissions')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    console.error('Failed to load submission for removal:', error);
    res.status(500).json({ error: 'Unable to load submission' });
    return;
  }

  if (!submission) {
    res.status(404).json({ error: 'Submission not found' });
    return;
  }

  if (!submission.delete_requested) {
    res.status(400).json({ error: 'Submission has not requested deletion' });
    return;
  }

  if (submission.created_restaurant_id) {
    const { error: restaurantError } = await supabaseAdmin
      .from('restaurants')
      .update({
        is_active: false,
        status: 'removed',
        updated_at: new Date().toISOString(),
      })
      .eq('id', submission.created_restaurant_id);

    if (restaurantError) {
      console.error('Failed to deactivate restaurant:', restaurantError);
      res.status(500).json({ error: 'Failed to deactivate restaurant' });
      return;
    }
  }

  const { data: updated, error: updateError } = await supabaseAdmin
    .from('restaurant_submissions')
    .update({
      status: 'removed',
      delete_requested: false,
      delete_request_reason: null,
    })
    .eq('id', id)
    .select()
    .maybeSingle();

  if (updateError) {
    console.error('Failed to mark submission removed:', updateError);
    res.status(500).json({ error: 'Failed to update submission' });
    return;
  }

  res.status(200).json({ success: true, submission: updated });
});
