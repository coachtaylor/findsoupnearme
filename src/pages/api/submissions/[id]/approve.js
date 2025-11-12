// src/pages/api/submissions/[id]/approve.js
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import { requireAdminMiddleware } from '../../../../lib/apiMiddleware';
import slugify from 'slugify';
import { randomUUID } from 'crypto';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const admin = await requireAdminMiddleware(req, res);
  if (!admin) return;

  const { id } = req.query;

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

    const baseSlug = slugify(
      `${submission.restaurant_name || 'restaurant'} ${submission.city || ''} ${submission.state || ''}`,
      { lower: true, strict: true, trim: true }
    );
    const uniqueSlug = `${baseSlug}-${randomUUID().slice(0, 6)}`;

    const restaurantPayload = {
      name: submission.restaurant_name,
      address: submission.address,
      city: submission.city,
      state: submission.state,
      zip_code: submission.zip_code,
      phone: submission.phone,
      website: submission.website,
      slug: uniqueSlug,
      status: 'draft',
      is_active: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (submission.is_restaurant_owner && submission.submitted_by) {
      restaurantPayload.owner_id = submission.submitted_by;
      restaurantPayload.verified_at = new Date().toISOString();
    }

    const { data: restaurant, error: restaurantError } = await supabase
      .from('restaurants')
      .insert(restaurantPayload)
      .select()
      .single();

    if (restaurantError) {
      console.error('Failed to create restaurant from submission:', restaurantError);
      return res.status(500).json({ error: 'Failed to create restaurant from submission' });
    }

    const { error: updateError } = await supabase
      .from('restaurant_submissions')
      .update({
        status: 'approved',
        reviewed_by: admin.id,
        reviewed_at: new Date().toISOString(),
        review_notes: submission.review_notes || null,
      })
      .eq('id', id);

    if (updateError) {
      console.error('Failed to update submission status:', updateError);
      return res.status(500).json({ error: 'Failed to finalize submission' });
    }

    return res.status(200).json({ success: true, restaurant });
  } catch (error) {
    console.error('Error approving submission:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
