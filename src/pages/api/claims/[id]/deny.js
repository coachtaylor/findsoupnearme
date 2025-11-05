// src/pages/api/admin/claims/[id]/deny.js
/**
 * API Endpoint: Deny Restaurant Claim
 * Updates claim status to denied with optional notes
 */

import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import { requireAdminMiddleware } from '../../../../../lib/apiMiddleware';

export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  // Require admin
  const admin = await requireAdminMiddleware(req, res);
  if (!admin) return; // Response already sent
  
  const { id: claimId } = req.query;
  const { decision_notes } = req.body;
  
  if (!claimId) {
    return res.status(400).json({ error: 'Missing claim ID' });
  }
  
  try {
    const supabase = createServerSupabaseClient({ req, res });
    
    // 1. Get the claim
    const { data: claim, error: claimError } = await supabase
      .from('claims')
      .select('*')
      .eq('id', claimId)
      .single();
    
    if (claimError || !claim) {
      return res.status(404).json({ error: 'Claim not found' });
    }
    
    if (claim.status !== 'pending') {
      return res.status(400).json({ error: 'Claim has already been processed' });
    }
    
    // 2. Update claim status to denied
    const { error: updateError } = await supabase
      .from('claims')
      .update({
        status: 'denied',
        reviewed_by: admin.id,
        reviewed_at: new Date().toISOString(),
        decision_notes: decision_notes || 'Claim denied by administrator',
        updated_at: new Date().toISOString(),
      })
      .eq('id', claimId);
    
    if (updateError) {
      console.error('Error updating claim:', updateError);
      return res.status(500).json({ error: 'Failed to deny claim' });
    }
    
    // 3. Create audit log
    await supabase
      .from('audit_logs')
      .insert({
        actor_user_id: admin.id,
        action: 'DENY_CLAIM',
        target_table: 'claims',
        target_id: claimId,
        diff_json: {
          claim_id: claimId,
          status: 'denied',
          reason: decision_notes,
        },
      });
    
    return res.status(200).json({
      success: true,
      message: 'Claim denied',
      claim_id: claimId,
    });
    
  } catch (error) {
    console.error('Error denying claim:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
}