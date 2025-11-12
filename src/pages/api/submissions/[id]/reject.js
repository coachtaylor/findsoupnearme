// src/pages/api/submissions/[id]/reject.js
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import { requireAdminMiddleware } from '../../../../lib/apiMiddleware';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const admin = await requireAdminMiddleware(req, res);
  if (!admin) return;

  const { id } = req.query;
  const { reason } = req.body || {};

  try {
    const supabase = createServerSupabaseClient({ req, res });

      const { data: submission, error: submissionError } = await supabase
        .from('restaurant_submissions')
        .select('*')
        .eq('id', id)
        .single();

      if (submissionError || !submission) {
        return res.status(404).json({ error: 'Submission not found' });
      }

      if (submission.status !== 'pending') {
        return res.status(400).json({ error: 'Submission has already been reviewed' });
      }

      const { error: updateError } = await supabase
        .from('restaurant_submissions')
        .update({
          status: 'rejected',
          reviewed_by: admin.id,
          reviewed_at: new Date().toISOString(),
          review_notes: reason || null,
        })
        .eq('id', id);

      if (updateError) {
        console.error('Failed to update submission status:', updateError);
        return res.status(500).json({ error: 'Failed to update submission' });
      }

      return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error rejecting submission:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
