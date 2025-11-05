// src/pages/api/admin/claims/[id]/approve.js
/**
 * API Endpoint: Approve Restaurant Claim
 * Creates organization, links user, verifies restaurant
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
  const { restaurant_id, user_id } = req.body;
  
  if (!claimId || !restaurant_id || !user_id) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  try {
    const supabase = createServerSupabaseClient({ req, res });
    
    // 1. Get the claim
    const { data: claim, error: claimError } = await supabase
      .from('claims')
      .select('*, restaurant:restaurants(*), user:users(*)')
      .eq('id', claimId)
      .single();
    
    if (claimError || !claim) {
      return res.status(404).json({ error: 'Claim not found' });
    }
    
    if (claim.status !== 'pending') {
      return res.status(400).json({ error: 'Claim has already been processed' });
    }
    
    // 2. Check if user already has an org
    const { data: existingMembership } = await supabase
      .from('org_members')
      .select('org_id')
      .eq('user_id', user_id)
      .limit(1)
      .single();
    
    let orgId;
    
    if (existingMembership) {
      // User already belongs to an org
      orgId = existingMembership.org_id;
    } else {
      // 3. Create organization for this owner
      const orgName = claim.restaurant?.name 
        ? `${claim.restaurant.name} Organization`
        : `${claim.user?.full_name || 'Restaurant'} Organization`;
      
      const { data: newOrg, error: orgError } = await supabase
        .from('orgs')
        .insert({
          name: orgName,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();
      
      if (orgError) {
        console.error('Error creating org:', orgError);
        return res.status(500).json({ error: 'Failed to create organization' });
      }
      
      orgId = newOrg.id;
      
      // 4. Link user to organization as owner
      const { error: memberError } = await supabase
        .from('org_members')
        .insert({
          org_id: orgId,
          user_id: user_id,
          role_in_org: 'owner',
          created_at: new Date().toISOString(),
        });
      
      if (memberError) {
        console.error('Error creating org membership:', memberError);
        return res.status(500).json({ error: 'Failed to link user to organization' });
      }
    }
    
    // 5. Update restaurant with org ownership and verify
    const { error: restaurantError } = await supabase
      .from('restaurants')
      .update({
        owner_org_id: orgId,
        verified_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', restaurant_id);
    
    if (restaurantError) {
      console.error('Error updating restaurant:', restaurantError);
      return res.status(500).json({ error: 'Failed to verify restaurant' });
    }
    
    // 6. Update claim status to approved
    const { error: updateClaimError } = await supabase
      .from('claims')
      .update({
        status: 'approved',
        reviewed_by: admin.id,
        reviewed_at: new Date().toISOString(),
        decision_notes: 'Claim approved by administrator',
        updated_at: new Date().toISOString(),
      })
      .eq('id', claimId);
    
    if (updateClaimError) {
      console.error('Error updating claim:', updateClaimError);
      return res.status(500).json({ error: 'Failed to update claim status' });
    }
    
    // 7. Create audit log
    await supabase
      .from('audit_logs')
      .insert({
        actor_user_id: admin.id,
        action: 'APPROVE_CLAIM',
        target_table: 'claims',
        target_id: claimId,
        diff_json: {
          claim_id: claimId,
          restaurant_id,
          user_id,
          org_id: orgId,
          status: 'approved',
        },
      });
    
    return res.status(200).json({
      success: true,
      message: 'Claim approved successfully',
      claim_id: claimId,
      org_id: orgId,
      restaurant_id,
    });
    
  } catch (error) {
    console.error('Error approving claim:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
}