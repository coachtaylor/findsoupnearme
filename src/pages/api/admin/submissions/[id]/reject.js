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
  const { reason } = req.body || {};

  if (!id || Array.isArray(id)) {
    res.status(400).json({ error: 'Submission id is required' });
    return;
  }

  const { data: submission, error: fetchError } = await supabaseAdmin
    .from('restaurant_submissions')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (fetchError) {
    console.error('Failed to load submission for rejection:', fetchError);
    res.status(500).json({ error: 'Unable to load submission' });
    return;
  }

  if (!submission) {
    res.status(404).json({ error: 'Submission not found' });
    return;
  }

  const { error: updateError } = await supabaseAdmin
    .from('restaurant_submissions')
    .update({
      status: 'rejected',
      review_notes: typeof reason === 'string' && reason.trim().length > 0 ? reason.trim() : null,
      reviewed_by: admin.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (updateError) {
    console.error('Failed to reject submission:', updateError);
    res.status(500).json({ error: 'Failed to reject submission' });
    return;
  }

  res.status(200).json({ success: true });
});
