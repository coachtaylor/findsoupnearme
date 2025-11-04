// src/pages/api/submit-restaurant.js
import { supabase } from '../../lib/supabase';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
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
    } = req.body;

    // Validate required fields
    if (!restaurantName || !address || !city || !state || !contactName || !contactEmail) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Insert submission into database
    const { data, error } = await supabase
      .from('restaurant_submissions')
      .insert([
        {
          restaurant_name: restaurantName,
          address: address,
          city: city,
          state: state.toUpperCase(),
          zip_code: zipCode || null,
          phone: phone || null,
          website: website || null,
          contact_name: contactName,
          contact_email: contactEmail,
          contact_phone: contactPhone || null,
          is_restaurant_owner: isRestaurantOwner || false,
          submission_notes: submissionNotes || null,
          photo_urls: photoUrls && photoUrls.length > 0 ? photoUrls : null,
          status: 'pending',
        },
      ])
      .select();

    if (error) {
      console.error('Error inserting restaurant submission:', error);
      return res.status(500).json({ error: 'Failed to submit restaurant' });
    }

    return res.status(200).json({
      success: true,
      message: 'Restaurant submission received',
      submissionId: data[0].id,
    });
  } catch (error) {
    console.error('Error in submit-restaurant API:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

