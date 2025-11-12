import { createClient } from '@supabase/supabase-js';
import { checkMethodMiddleware, requireAdminMiddleware, withErrorHandler } from '../../../../lib/apiMiddleware';

const hasAdminClient = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);

const supabaseAdmin = hasAdminClient
  ? createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    })
  : null;

export default withErrorHandler(async (req, res) => {
  if (!checkMethodMiddleware(req, res, ['GET'])) return;

  const admin = await requireAdminMiddleware(req, res);
  if (!admin) return;

  if (!hasAdminClient) {
    res.status(500).json({ error: 'Server not configured for admin submissions' });
    return;
  }

  const { status } = req.query;

  const query = supabaseAdmin
    .from('restaurant_submissions')
    .select('*')
    .order('created_at', { ascending: false });

  if (status && typeof status === 'string' && status !== 'all') {
    query.eq('status', status);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Failed to load admin submissions:', error);
    res.status(500).json({ error: 'Unable to fetch submissions' });
    return;
  }

  res.status(200).json({ submissions: data || [] });
});
