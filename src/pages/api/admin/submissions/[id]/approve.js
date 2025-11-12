import { createClient } from '@supabase/supabase-js';
import { checkMethodMiddleware, requireAdminMiddleware, withErrorHandler } from '../../../../../lib/apiMiddleware';
import slugify from 'slugify';
import { randomUUID } from 'crypto';

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

  const { data: submission, error: fetchError } = await supabaseAdmin
    .from('restaurant_submissions')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (fetchError) {
    console.error('Failed to load submission for approval:', fetchError);
    res.status(500).json({ error: 'Unable to load submission' });
    return;
  }

  if (!submission) {
    res.status(404).json({ error: 'Submission not found' });
    return;
  }

  if (submission.status !== 'pending') {
    res.status(400).json({ error: 'Submission has already been reviewed' });
    return;
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
    cuisine: submission.cuisine,
    cuisine_type: submission.cuisine,
    slug: uniqueSlug,
    status: 'live',
    is_active: true,
    is_verified: !!submission.is_restaurant_owner,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  if (submission.is_restaurant_owner && submission.submitted_by) {
    restaurantPayload.owner_id = submission.submitted_by;
    restaurantPayload.verified_at = new Date().toISOString();
  }

  const { data: restaurant, error: restaurantError } = await supabaseAdmin
    .from('restaurants')
    .insert(restaurantPayload)
    .select()
    .maybeSingle();

  if (restaurantError) {
    console.error('Failed to create restaurant from submission:', restaurantError);
    res.status(500).json({ error: 'Failed to create restaurant from submission' });
    return;
  }

  const { data: updatedSubmission, error: updateError } = await supabaseAdmin
    .from('restaurant_submissions')
    .update({
      status: 'approved',
      reviewed_by: admin.id,
      reviewed_at: new Date().toISOString(),
      review_notes: submission.review_notes || null,
      delete_requested: false,
      delete_request_reason: null,
      created_restaurant_id: restaurant?.id || submission.created_restaurant_id,
    })
    .eq('id', id)
    .select()
    .maybeSingle();

  if (updateError) {
    console.error('Failed to update submission status:', updateError);
    res.status(500).json({ error: 'Failed to finalize submission' });
    return;
  }

  res.status(200).json({ success: true, restaurant, submission: updatedSubmission });
});
