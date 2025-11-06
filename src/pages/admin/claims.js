// src/pages/admin/claims.js
import { useEffect, useMemo, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRequireAdmin } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import slugify from 'slugify';

const STATUS_TABS = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'denied', label: 'Denied' },
];

const STATUS_BADGE = {
  pending: 'bg-amber-100 text-amber-700 border border-amber-200',
  approved: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
  denied: 'bg-rose-100 text-rose-700 border border-rose-200',
};

export default function AdminClaimsDashboard() {
  const { user, loading, isAdmin } = useRequireAdmin('/auth/login');
  const [claims, setClaims] = useState([]);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [isLoadingClaims, setIsLoadingClaims] = useState(true);
  const [actionError, setActionError] = useState('');
  const [globalError, setGlobalError] = useState('');
  const [actionInFlight, setActionInFlight] = useState(null);
  const [denyModalClaim, setDenyModalClaim] = useState(null);
  const [denyReason, setDenyReason] = useState('');
  const [denySubmitting, setDenySubmitting] = useState(false);

  useEffect(() => {
    if (!loading && isAdmin) {
      fetchClaims();
      const interval = setInterval(() => fetchClaims(false), 45_000);
      return () => clearInterval(interval);
    }
  }, [loading, isAdmin]);

  const fetchClaims = async (withSpinner = true) => {
    if (withSpinner) setIsLoadingClaims(true);
    setGlobalError('');
    try {
      const { data, error } = await supabase
        .from('claims')
        .select(
          `
            id,
            status,
            restaurant_id,
            user_id,
            created_at,
            reviewed_at,
            reviewed_by,
            decision_notes,
            evidence,
            restaurant:restaurants(id,name,city,state,slug,owner_org_id),
            claimer:users!claims_user_id_fkey(id,email,full_name),
            reviewer:users!claims_reviewed_by_fkey(id,email,full_name)
          `
        )
        .order('created_at', { ascending: false });

      if (error) throw error;
      setClaims(data || []);
    } catch (error) {
      console.error('Error loading claims:', error);
      setGlobalError(error.message || 'Failed to load claims');
    } finally {
      setIsLoadingClaims(false);
    }
  };

  const statusCounts = useMemo(() => {
    const counts = { pending: 0, approved: 0, denied: 0 };
    claims.forEach((claim) => {
      if (claim.status in counts) counts[claim.status] += 1;
    });
    return counts;
  }, [claims]);

  const filteredClaims = useMemo(() => {
    if (statusFilter === 'all') return claims;
    return claims.filter((claim) => claim.status === statusFilter);
  }, [claims, statusFilter]);

  const resetActionState = () => {
    setActionInFlight(null);
    setActionError('');
  };

  const handleApprove = async (claim) => {
    setActionInFlight(claim.id);
    setActionError('');
    try {
      const response = await fetch(`/api/claims/${claim.id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurant_id: claim.restaurant_id,
          user_id: claim.user_id,
        }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.error || 'Failed to approve claim');
      }

      await fetchClaims(false);
    } catch (error) {
      console.error('Approve claim failed:', error);
      setActionError(error.message || 'Failed to approve claim');
    } finally {
      resetActionState();
    }
  };

  const openDenyModal = (claim) => {
    setDenyModalClaim(claim);
    setDenyReason('');
    setActionError('');
  };

  const closeDenyModal = () => {
    setDenyModalClaim(null);
    setDenyReason('');
    setDenySubmitting(false);
    setActionError('');
  };

  const handleDeny = async () => {
    if (!denyModalClaim) return;
    setDenySubmitting(true);
    setActionError('');
    try {
      const response = await fetch(`/api/claims/${denyModalClaim.id}/deny`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decision_notes: denyReason.trim() }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.error || 'Failed to deny claim');
      }

      await fetchClaims(false);
      closeDenyModal();
    } catch (error) {
      console.error('Deny claim failed:', error);
      setActionError(error.message || 'Failed to deny claim');
      setDenySubmitting(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-12 w-12 rounded-full border-4 border-orange-200 border-t-orange-500 animate-spin" />
          <p className="text-sm text-neutral-500">Preparing admin dashboard…</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Admin Claims Dashboard - FindSoupNearMe</title>
      </Head>
      <div className="min-h-screen bg-neutral-50 py-10 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-8">
          <header className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-widest text-orange-600">
              Admin Console
            </p>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h1 className="text-3xl font-semibold text-neutral-900">
                Restaurant Claims
              </h1>
              <button
                onClick={() => fetchClaims()}
                className="inline-flex items-center gap-2 rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm font-medium text-neutral-700 shadow-sm transition hover:border-neutral-400"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.75}
                    d="M4 4v5h.582m15.356 2a8.001 8.001 0 00-15.356-2m0 0H4m0 11v-5h.582m15.356-2a8.001 8.001 0 01-15.356 2m0 0H4"
                  />
                </svg>
                Refresh
              </button>
            </div>
            <p className="text-sm text-neutral-600">
              Review and manage restaurant ownership claims. Approving a claim
              creates an owner org and verifies the restaurant automatically.
            </p>
          </header>

          <section className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                Pending
              </p>
              <p className="mt-2 text-3xl font-semibold text-neutral-900">
                {statusCounts.pending}
              </p>
              <p className="text-xs text-neutral-500">
                Awaiting verification
              </p>
            </div>
            <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                Approved
              </p>
              <p className="mt-2 text-3xl font-semibold text-neutral-900">
                {statusCounts.approved}
              </p>
              <p className="text-xs text-neutral-500">
                Live verified listings
              </p>
            </div>
            <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                Denied
              </p>
              <p className="mt-2 text-3xl font-semibold text-neutral-900">
                {statusCounts.denied}
              </p>
              <p className="text-xs text-neutral-500">
                Rejected ownership claims
              </p>
            </div>
          </section>

          <div className="flex flex-wrap gap-3">
            {STATUS_TABS.map((tab) => {
              const active = statusFilter === tab.value;
              return (
                <button
                  key={tab.value}
                  onClick={() => setStatusFilter(tab.value)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                    active
                      ? 'bg-orange-600 text-white shadow-sm'
                      : 'bg-white text-neutral-600 border border-neutral-200 hover:border-neutral-300'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {globalError && (
            <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {globalError}
            </div>
          )}

          <section className="rounded-3xl border border-neutral-200 bg-white shadow-sm">
            {isLoadingClaims ? (
              <div className="flex flex-col gap-4 p-10">
                {Array.from({ length: 4 }).map((_, idx) => (
                  <div
                    key={idx}
                    className="h-24 animate-pulse rounded-2xl bg-neutral-100"
                  />
                ))}
              </div>
            ) : filteredClaims.length === 0 ? (
              <div className="p-12 text-center text-sm text-neutral-500">
                No claims match this filter.
              </div>
            ) : (
              <ul className="divide-y divide-neutral-100">
                {filteredClaims.map((claim) => {
                  const statusClass =
                    STATUS_BADGE[claim.status] || 'bg-neutral-100 text-neutral-600';
                  const restaurantName =
                    claim.restaurant?.name ||
                    claim.evidence?.restaurant_name ||
                    'Unlisted Restaurant';
                  const restaurantLocation = claim.restaurant
                    ? `${claim.restaurant.city || 'Unknown'}, ${
                        claim.restaurant.state || 'N/A'
                      }`
                    : 'Location pending';
                  const restaurantSlug =
                    claim.restaurant?.slug ||
                    slugify(
                      `${restaurantName} ${
                        claim.restaurant?.city || ''
                      } ${claim.restaurant?.state || ''}`,
                      { lower: true, strict: true, trim: true }
                    );
                  const claimEvidence = claim.evidence || {};
                  const primaryEmail =
                    claimEvidence.user_email ||
                    claim.claimer?.email ||
                    'Not provided';
                  const primaryPhone =
                    claimEvidence.user_phone ||
                    'Not provided';
                  const claimedRestaurant = restaurantName;
                  const ridQuery =
                    claim.restaurant?.slug ? '' : `?rid=${claim.restaurant_id}`;

                  return (
                    <li
                      key={claim.id}
                      className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between"
                    >
                      <div className="space-y-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-lg font-semibold text-neutral-900">
                            {restaurantName}
                          </span>
                          <span
                            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${statusClass}`}
                          >
                            {claim.status.charAt(0).toUpperCase() +
                              claim.status.slice(1)}
                          </span>
                        </div>
                        <div className="text-sm text-neutral-600">
                          <p>
                            <span className="font-medium text-neutral-700">
                              Claimed by:
                            </span>{' '}
                            {claim.claimer?.full_name || 'Unknown owner'} (
                            {primaryEmail})
                          </p>
                          <p>
                            <span className="font-medium text-neutral-700">
                              Phone:
                            </span>{' '}
                            {primaryPhone}
                          </p>
                          <p>
                            <span className="font-medium text-neutral-700">
                              Submitted:
                            </span>{' '}
                            {new Date(claim.created_at).toLocaleString()}
                          </p>
                          <p>
                            <span className="font-medium text-neutral-700">
                              Restaurant (submitted):
                            </span>{' '}
                            {claimedRestaurant}
                          </p>
                          <p className="text-xs text-neutral-400">
                            ID: {claim.id}
                          </p>
                        </div>
                        {claim.decision_notes && claim.status !== 'pending' && (
                          <div className="rounded-lg bg-neutral-50 p-3 text-xs text-neutral-600">
                            <p className="font-semibold text-neutral-700">
                              Decision notes:
                            </p>
                            <p>{claim.decision_notes}</p>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col gap-3 text-sm">
                        <div className="flex flex-wrap gap-2">
                          <Link
                            href={
                              restaurantSlug
                                ? `/${(claim.restaurant?.state || '')
                                    .toLowerCase()}/${(claim.restaurant?.city || '')
                                    .toLowerCase()
                                    .replace(/\s+/g, '-')}/${restaurantSlug}${ridQuery}`
                                : '#'
                            }
                            className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2 font-medium transition ${
                              restaurantSlug
                                ? 'border-neutral-200 text-neutral-600 hover:border-neutral-300'
                                : 'border-neutral-200 text-neutral-400 cursor-not-allowed'
                            }`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            View Listing
                          </Link>
                          <Link
                            href={`/onboarding/owner?restaurantId=${claim.restaurant_id}`}
                            className="inline-flex items-center gap-2 rounded-lg border border-neutral-200 px-4 py-2 font-medium text-neutral-600 transition hover:border-neutral-300"
                          >
                            Edit Record
                          </Link>
                        </div>

                        {claim.status === 'pending' ? (
                          <div className="flex flex-wrap gap-2">
                            <button
                              onClick={() => handleApprove(claim)}
                              disabled={actionInFlight === claim.id}
                              className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-400"
                            >
                              {actionInFlight === claim.id ? (
                                <>
                                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                                  Approving…
                                </>
                              ) : (
                                <>
                                  ✅ Approve Claim
                                </>
                              )}
                            </button>
                            <button
                              onClick={() => openDenyModal(claim)}
                              className="inline-flex items-center justify-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-4 py-2 font-semibold text-rose-600 transition hover:bg-rose-100"
                            >
                              ❌ Deny Claim
                            </button>
                          </div>
                        ) : (
                          <div className="rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-2 text-xs text-neutral-500">
                            Reviewed{' '}
                            {claim.reviewed_at
                              ? new Date(claim.reviewed_at).toLocaleString()
                              : '—'}
                          </div>
                        )}

                        <p className="text-xs text-neutral-500">
                          Restaurant location: {restaurantLocation}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          {actionError && (
            <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {actionError}
            </div>
          )}
        </div>
      </div>

      {denyModalClaim && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-neutral-900/50 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <h2 className="text-xl font-semibold text-neutral-900">
              Deny Claim
            </h2>
            <p className="mt-2 text-sm text-neutral-600">
              {denyModalClaim.user?.full_name || 'Owner'} ·{' '}
              {denyModalClaim.user?.email}
            </p>

            <label className="mt-4 block text-sm font-medium text-neutral-700">
              Reason for denial
            </label>
            <textarea
              rows={4}
              className="mt-1 w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm text-neutral-800 shadow-sm focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-200"
              value={denyReason}
              onChange={(event) => setDenyReason(event.target.value)}
              placeholder="Briefly explain why this claim is being denied"
            />

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={closeDenyModal}
                className="rounded-lg border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-600 transition hover:border-neutral-300"
                disabled={denySubmitting}
              >
                Cancel
              </button>
              <button
                onClick={handleDeny}
                disabled={denySubmitting || denyReason.trim().length === 0}
                className="inline-flex items-center gap-2 rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:bg-rose-400"
              >
                {denySubmitting ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    Denying…
                  </>
                ) : (
                  'Confirm Denial'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
