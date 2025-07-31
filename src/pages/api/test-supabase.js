// src/pages/api/test-supabase.js
import { supabase } from '../../lib/supabase';

export default async function handler(req, res) {
  try {
    // Simple test query
    const { data, error } = await supabase
      .from('restaurants')
      .select('id, name, city, state')
      .limit(5);
    
    if (error) {
      return res.status(500).json({ 
        error: 'Supabase query failed', 
        details: error,
        environmentVars: {
          url: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Missing',
          key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Missing'
        }
      });
    }
    
    return res.status(200).json({
      success: true,
      message: 'Supabase connection successful',
      count: data?.length || 0,
      data: data
    });
  } catch (err) {
    return res.status(500).json({ 
      error: 'Exception in test endpoint', 
      details: err.message,
      environmentVars: {
        url: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Missing',
        key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Missing'
      }
    });
  }
}