import { createClient } from '@supabase/supabase-js';
import { checkMethodMiddleware, requireAuthMiddleware, withErrorHandler } from '../../../../lib/apiMiddleware';

const hasAdminClient = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);

const supabaseAdmin = hasAdminClient
  ? createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    })
  : null;

export default withErrorHandler(async (req, res) => {
  if (!checkMethodMiddleware(req, res, ['POST'])) return;

  const user = await requireAuthMiddleware(req, res);
  if (!user) return;

  if (!hasAdminClient) {
    res.status(500).json({ error: 'Server not configured for submissions' });
    return;
  }

  const { id } = req.query;
  if (!id || Array.isArray(id)) {
    res.status(400).json({ error: 'Submission id is required' });
    return;
  }

  const { reason } = req.body || {};

  const { data: submission, error } = await supabaseAdmin
    .from('restaurant_submissions')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    console.error('Failed to load submission for delete request:', error);
    res.status(500).json({ error: 'Unable to load submission' });
    return;
  }

  if (!submission || submission.submitted_by !== user.id) {
    res.status(404).json({ error: 'Submission not found' });
    return;
  }

  if (submission.status !== 'approved') {
    res.status(400).json({ error: 'You can only request removal for approved submissions' });
    return;
  }

  const { data: updated, error: updateError } = await supabaseAdmin
    .from('restaurant_submissions')
    .update({
      delete_requested: true,
      delete_request_reason: typeof reason === 'string' ? reason.trim() : null,
    })
    .eq('id', id)
    .select()
    .maybeSingle();

  if (updateError) {
    console.error('Failed to mark submission for deletion:', updateError);
    res.status(500).json({ error: 'Failed to request deletion' });
    return;
  }

  res.status(200).json({ success: true, submission: updated });
});
