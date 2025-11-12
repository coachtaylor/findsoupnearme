import { createClient } from '@supabase/supabase-js';
import { checkMethodMiddleware, requireAuthMiddleware, withErrorHandler } from '../../../lib/apiMiddleware';

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

const normalizeRequired = (value) => (typeof value === 'string' ? value.trim() : '');
const normalizeOptional = (value) => {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

export default withErrorHandler(async (req, res) => {
  if (!checkMethodMiddleware(req, res, ['POST'])) return;

  if (!hasAdminClient) {
    res.status(500).json({ error: 'Server is not configured for submissions' });
    return;
  }

  const user = await requireAuthMiddleware(req, res);
  if (!user) return;

  const {
    restaurantName,
    address,
    cuisine,
    cuisineOther,
    soupTags,
    soupTagsOther,
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

  const requiredFields = [
    ['restaurantName', restaurantName],
    ['address', address],
    ['cuisine', cuisine],
    ['city', city],
    ['state', state],
    ['contactName', contactName],
    ['contactEmail', contactEmail],
  ];

  for (const [field, value] of requiredFields) {
    if (!value || !normalizeRequired(value)) {
      res.status(400).json({ error: `Missing required field: ${field}` });
      return;
    }
  }

  const normalizedState = normalizeRequired(state).toUpperCase();
  if (normalizedState.length !== 2) {
    res.status(400).json({ error: 'State must be a 2-letter abbreviation' });
    return;
  }

  const normalizedEmail = normalizeRequired(contactEmail).toLowerCase();
  if (!normalizedEmail.includes('@')) {
    res.status(400).json({ error: 'Please provide a valid contact email' });
    return;
  }

  const supabase = supabaseAdmin;

  const resolvedCuisine = normalizeRequired(cuisine === 'Other' ? cuisineOther : cuisine);
  const submissionPayload = {
    restaurant_name: normalizeRequired(restaurantName),
    address: normalizeRequired(address),
    cuisine: resolvedCuisine,
    cuisine_other: cuisine === 'Other' ? normalizeOptional(cuisineOther) : null,
    soup_tags: Array.isArray(soupTags)
      ? soupTags
          .map((tag) => (typeof tag === 'string' ? tag.trim() : ''))
          .filter((tag) => tag.length > 0)
      : [],
    soup_tags_other: normalizeOptional(soupTagsOther),
    city: normalizeRequired(city),
    state: normalizedState,
    zip_code: normalizeOptional(zipCode),
    phone: normalizeOptional(phone),
    website: normalizeOptional(website),
    contact_name: normalizeRequired(contactName),
    contact_email: normalizedEmail,
    contact_phone: normalizeOptional(contactPhone),
    is_restaurant_owner: !!isRestaurantOwner,
    submission_notes: normalizeOptional(submissionNotes),
    photo_urls: Array.isArray(photoUrls)
      ? photoUrls
          .map((url) => (typeof url === 'string' ? url.trim() : ''))
          .filter((url) => url.length > 0)
      : null,
    status: 'pending',
    submitted_by: user.id,
  };

  if (!submissionPayload.photo_urls || submissionPayload.photo_urls.length === 0) {
    submissionPayload.photo_urls = null;
  }

  const { data, error } = await supabase
    .from('restaurant_submissions')
    .insert(submissionPayload)
    .select()
    .single();

  if (error) {
    console.error('Failed to create restaurant submission:', error);
    res.status(500).json({ error: 'Failed to create submission' });
    return;
  }

  res.status(201).json({ success: true, submissionId: data.id, submission: data });
});
