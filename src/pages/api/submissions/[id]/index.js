import { createClient } from '@supabase/supabase-js';
import { checkMethodMiddleware, requireAuthMiddleware, withErrorHandler } from '../../../../lib/apiMiddleware';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

const hasAdminClient = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);

const normalize = (value) => (typeof value === 'string' ? value.trim() : '');
const optional = (value) => {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

export default withErrorHandler(async (req, res) => {
  if (!checkMethodMiddleware(req, res, ['GET', 'PATCH', 'DELETE'])) return;

  if (!hasAdminClient) {
    res.status(500).json({ error: 'Server is not configured for submissions' });
    return;
  }

  const user = await requireAuthMiddleware(req, res);
  if (!user) return;

  const { id } = req.query;
  if (!id || Array.isArray(id)) {
    res.status(400).json({ error: 'Submission id is required' });
    return;
  }

  const { data: existing, error: fetchError } = await supabaseAdmin
    .from('restaurant_submissions')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (fetchError) {
    console.error('Failed to load submission:', fetchError);
    res.status(500).json({ error: 'Unable to load submission' });
    return;
  }

  if (!existing || existing.submitted_by !== user.id) {
    res.status(404).json({ error: 'Submission not found' });
    return;
  }

  if (req.method === 'GET') {
    res.status(200).json({ submission: existing });
    return;
  }

  if (req.method === 'DELETE') {
    const { error: deleteError } = await supabaseAdmin
      .from('restaurant_submissions')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Failed to delete submission:', deleteError);
      res.status(500).json({ error: 'Failed to delete submission' });
      return;
    }

    res.status(200).json({ success: true });
    return;
  }

  const {
    restaurantName,
    address,
    city,
    state,
    zipCode,
    phone,
    website,
    contactName,
    contactEmail,
    contactPhone,
    isRestaurantOwner,
    submissionNotes,
    photoUrls,
  } = req.body || {};

  const updatePayload = {
    restaurant_name: restaurantName ? normalize(restaurantName) : existing.restaurant_name,
    address: address ? normalize(address) : existing.address,
    city: city ? normalize(city) : existing.city,
    state: state ? normalize(state).toUpperCase() : existing.state,
    zip_code: zipCode !== undefined ? optional(zipCode) : existing.zip_code,
    phone: phone !== undefined ? optional(phone) : existing.phone,
    website: website !== undefined ? optional(website) : existing.website,
    contact_name: contactName ? normalize(contactName) : existing.contact_name,
    contact_email: contactEmail ? normalize(contactEmail).toLowerCase() : existing.contact_email,
    contact_phone: contactPhone !== undefined ? optional(contactPhone) : existing.contact_phone,
    is_restaurant_owner:
      typeof isRestaurantOwner === 'boolean' ? isRestaurantOwner : existing.is_restaurant_owner,
    submission_notes: submissionNotes !== undefined ? optional(submissionNotes) : existing.submission_notes,
    photo_urls: Array.isArray(photoUrls)
      ? photoUrls.map((url) => (typeof url === 'string' ? url.trim() : '')).filter((url) => url.length > 0)
      : existing.photo_urls,
    updated_at: new Date().toISOString(),
  };

  if (!updatePayload.photo_urls || updatePayload.photo_urls.length === 0) {
    updatePayload.photo_urls = null;
  }

  const { data, error: updateError } = await supabaseAdmin
    .from('restaurant_submissions')
    .update(updatePayload)
    .eq('id', id)
    .select()
    .single();

  if (updateError) {
    console.error('Failed to update submission:', updateError);
    res.status(500).json({ error: 'Failed to update submission' });
    return;
  }

  res.status(200).json({ success: true, submission: data });
});
