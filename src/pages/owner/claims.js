// src/pages/owner/claims.js
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import useDebouncedValue from '../../hooks/useDebouncedValue';

function formatClaimStatus(status) {
  const normalized = (status || '').toLowerCase();
  if (normalized === 'approved') {
    return { label: 'Approved', classes: 'bg-emerald-100 text-emerald-700 border border-emerald-200' };
  }
  if (normalized === 'rejected') {
    return { label: 'Rejected', classes: 'bg-rose-100 text-rose-700 border border-rose-200' };
  }
  if (normalized === 'needs_more_info') {
    return { label: 'Needs more info', classes: 'bg-amber-100 text-amber-700 border border-amber-200' };
  }
  return { label: 'Pending review', classes: 'bg-blue-100 text-blue-700 border border-blue-200' };
}

export default function OwnerClaimsPage() {
  const router = useRouter();
  const { user, userProfile, loading } = useAuth();

  const [claimSearchQuery, setClaimSearchQuery] = useState('');
  const [claimSuggestions, setClaimSuggestions] = useState([]);
  const [claimDropdownOpen, setClaimDropdownOpen] = useState(false);
  const [claimInputFocused, setClaimInputFocused] = useState(false);
  const [isSearchingClaims, setIsSearchingClaims] = useState(false);
  const [selectedClaimRestaurant, setSelectedClaimRestaurant] = useState(null);
  const [isSubmittingClaim, setIsSubmittingClaim] = useState(false);
  const [claimError, setClaimError] = useState('');
  const [claimSuccess, setClaimSuccess] = useState('');
  const [claimSearchResults, setClaimSearchResults] = useState([]);

  const [ownerClaims, setOwnerClaims] = useState([]);
  const [ownerClaimsLoading, setOwnerClaimsLoading] = useState(true);
  const [ownerClaimsError, setOwnerClaimsError] = useState('');

  const claimRef = useRef(null);
  const claimBlurTimeoutRef = useRef(null);
  const lastClaimQueryRef = useRef('');
  const debouncedClaimQuery = useDebouncedValue(claimSearchQuery, 300);

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/auth/login?redirectTo=/owner/claims');
    }
  }, [user, loading, router]);

  const fetchOwnerClaims = useCallback(async () => {
    if (!user || loading) return;

    setOwnerClaimsLoading(true);
    setOwnerClaimsError('');

    try {
      const { data: claimsData, error: claimsError } = await supabase
        .from('claims')
        .select('id, restaurant_id, status, created_at, updated_at, evidence')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (claimsError) throw claimsError;

      const restaurantIds = Array.from(
        new Set((claimsData || []).map((claim) => claim.restaurant_id).filter(Boolean)),
      );

      let restaurantMap = {};
      if (restaurantIds.length > 0) {
        const { data: restaurantData, error: restaurantsError } = await supabase
          .from('restaurants')
          .select('id, name, city, state, slug, is_verified, status, address')
          .in('id', restaurantIds);

        if (restaurantsError) throw restaurantsError;

        restaurantMap = (restaurantData || []).reduce((acc, restaurant) => {
          acc[restaurant.id] = restaurant;
          return acc;
        }, {});
      }

      setOwnerClaims(
        (claimsData || []).map((claim) => ({
          ...claim,
          restaurant: restaurantMap[claim.restaurant_id] || null,
        })),
      );
    } catch (error) {
      console.error('Error loading owner claims:', error);
      setOwnerClaimsError(error?.message || 'Failed to load your claimed restaurants.');
    } finally {
      setOwnerClaimsLoading(false);
    }
  }, [user, loading]);

  useEffect(() => {
    fetchOwnerClaims();
  }, [fetchOwnerClaims]);

  useEffect(() => {
    const trimmed = debouncedClaimQuery.trim();
    const normalizedTrimmed = trimmed.toLowerCase();

    setClaimSuccess('');

    if (selectedClaimRestaurant) {
      const selectedName = (selectedClaimRestaurant.name || '').toLowerCase().trim();
      if (selectedName !== normalizedTrimmed) {
        setSelectedClaimRestaurant(null);
      }
    }

    if (!trimmed) {
      setClaimError('');
      setClaimSuggestions([]);
      setClaimSearchResults([]);
      setIsSearchingClaims(false);
      lastClaimQueryRef.current = '';
      if (!claimInputFocused) {
        setClaimDropdownOpen(false);
      }
      return;
    }

    if (trimmed.length < 3) {
      setClaimError('');
      setClaimSuggestions([]);
      setClaimSearchResults([]);
      setIsSearchingClaims(false);
      lastClaimQueryRef.current = '';
      setClaimDropdownOpen(claimInputFocused);
      return;
    }

    if (lastClaimQueryRef.current === trimmed) {
      setClaimDropdownOpen(claimInputFocused);
      return;
    }

    let isCancelled = false;
    setIsSearchingClaims(true);

    const sanitized = trimmed.replace(/[%_]/g, (match) => `\\${match}`);

    supabase
      .from('restaurants')
      .select('id, name, address, city, state, phone, is_active, slug')
      .or(`name.ilike.%${sanitized}%,address.ilike.%${sanitized}%,city.ilike.%${sanitized}%`)
      .limit(20)
      .then(({ data, error }) => {
        if (isCancelled) return;

        if (error) {
          console.error('Search error:', error);
          setClaimError('We could not search right now. Please try again in a moment.');
          setClaimSuggestions([]);
          setClaimSearchResults([]);
          setClaimDropdownOpen(false);
          return;
        }

        const results = data || [];
        lastClaimQueryRef.current = trimmed;
        setClaimSuggestions(results);
        setClaimSearchResults(results);
        setClaimDropdownOpen(claimInputFocused);
        if (results.length === 0) {
          setClaimError('No matching listings found. Try another name or city.');
        } else {
          setClaimError('');
        }
      })
      .catch((error) => {
        if (isCancelled) return;
        console.error('Search error:', error);
        setClaimError('We could not search right now. Please try again in a moment.');
        setClaimSuggestions([]);
        setClaimSearchResults([]);
        setClaimDropdownOpen(false);
      })
      .finally(() => {
        if (!isCancelled) {
          setIsSearchingClaims(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [debouncedClaimQuery, claimInputFocused, selectedClaimRestaurant]);

  const claimHasMinChars = claimSearchQuery.trim().length >= 3;
  const claimSuggestionList = claimSuggestions.slice(0, 8);

  const handleClaimSearch = (event) => {
    event.preventDefault();
    const term = claimSearchQuery.trim();
    if (!term) return;

    if (term.length < 3) {
      setClaimError('Please enter at least 3 characters to search.');
      setClaimDropdownOpen(true);
      return;
    }

    setClaimDropdownOpen(false);
    if (claimSuggestions.length === 0) {
      setClaimSearchResults([]);
      setClaimError('No matching listings found. Try another name or city.');
      return;
    }

    setClaimSearchResults(claimSuggestions);
    setClaimError('');
  };

  const handleClaimSuggestionSelect = (restaurant) => {
    setClaimSearchQuery(restaurant.name || '');
    setSelectedClaimRestaurant(restaurant);
    setClaimDropdownOpen(false);
    setClaimError('');
    lastClaimQueryRef.current = (restaurant.name || '').trim();
    setClaimSearchResults([restaurant]);
  };

  const handleSubmitClaim = async () => {
    if (!selectedClaimRestaurant || !user) return;

    setIsSubmittingClaim(true);
    setClaimError('');
    setClaimSuccess('');

    try {
      const { error: claimErrorResult } = await supabase.from('claims').insert({
        restaurant_id: selectedClaimRestaurant.id,
        user_id: user.id,
        status: 'pending',
        evidence: {
          user_email: user.email,
          user_phone: user.user_metadata?.phone_number || userProfile?.phone || '',
          restaurant_name: selectedClaimRestaurant.name,
        },
      });

      if (claimErrorResult) throw claimErrorResult;

      setClaimSuccess('Thanks! We received your claim and will verify ownership within 48 hours.');
      setClaimSearchResults([]);
      setSelectedClaimRestaurant(null);
      setClaimSearchQuery('');
      fetchOwnerClaims();
    } catch (error) {
      console.error('Claim submission error:', error);
      setClaimError(error?.message || 'Unable to submit your claim right now.');
    } finally {
      setIsSubmittingClaim(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-orange-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-12 w-12 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin" />
          <p className="text-sm text-orange-600">Loading your claims…</p>
        </div>
      </div>
    );
  }

  const hasClaims = ownerClaims.length > 0;

  return (
    <>
      <Head>
        <title>Owner Claims - FindSoupNearMe</title>
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto space-y-10">
          <header className="rounded-3xl border border-orange-200/60 bg-white/95 p-6 sm:p-8 shadow-sm">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="space-y-3">
                <p className="text-sm font-semibold uppercase tracking-wide text-orange-600">Owner workspace</p>
                <h1 className="text-3xl sm:text-4xl font-bold text-neutral-900">Restaurant claims</h1>
                <p className="text-sm sm:text-base text-neutral-600 max-w-2xl">
                  Find existing listings, submit claims, and track their verification status.
                </p>
              </div>
              <Link
                href="/owner/submissions"
                className="inline-flex items-center justify-center rounded-full border border-orange-200 bg-white px-6 py-3 text-sm sm:text-base font-semibold text-orange-600 shadow-sm transition hover:bg-orange-50"
              >
                Manage submissions
              </Link>
            </div>
          </header>

          <section
            id="claim"
            ref={claimRef}
            className="rounded-3xl border border-neutral-200/70 bg-white/95 p-6 sm:p-8 shadow-sm"
          >
            <div className="flex flex-col gap-2 mb-6">
              <h2 className="text-2xl font-semibold text-neutral-900">Claim an existing listing</h2>
              <p className="text-sm text-neutral-600 max-w-2xl">
                Found your restaurant already on FindSoupNearMe? Search for it below and submit a claim so you can manage the listing.
              </p>
            </div>

            <form onSubmit={handleClaimSearch} className="flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={claimSearchQuery}
                  onChange={(event) => {
                    setClaimSearchQuery(event.target.value);
                    lastClaimQueryRef.current = '';
                  }}
                  onFocus={(event) => {
                    if (claimBlurTimeoutRef.current) {
                      clearTimeout(claimBlurTimeoutRef.current);
                      claimBlurTimeoutRef.current = null;
                    }
                    setClaimInputFocused(true);
                    if (event.target.value.trim().length > 0) {
                      setClaimDropdownOpen(true);
                    }
                  }}
                  onBlur={() => {
                    claimBlurTimeoutRef.current = setTimeout(() => {
                      setClaimInputFocused(false);
                      setClaimDropdownOpen(false);
                    }, 150);
                  }}
                  placeholder="Search by restaurant name, address, or city"
                  className="w-full rounded-lg border border-neutral-300 px-4 py-3 text-neutral-900 shadow-sm focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-200"
                />

                {claimDropdownOpen && (
                  <div className="absolute left-0 right-0 z-30 mt-2 overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-xl">
                    {isSearchingClaims ? (
                      <div className="flex items-center gap-2 px-4 py-3 text-sm text-neutral-500">
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-orange-200 border-t-orange-500" />
                        Searching…
                      </div>
                    ) : claimHasMinChars ? (
                      claimSuggestionList.length > 0 ? (
                        <ul className="max-h-72 overflow-y-auto py-1">
                          {claimSuggestionList.map((restaurant) => (
                            <li key={restaurant.id}>
                              <button
                                type="button"
                                onMouseDown={(event) => {
                                  event.preventDefault();
                                  handleClaimSuggestionSelect(restaurant);
                                }}
                                className="flex w-full flex-col items-start gap-1 px-4 py-3 text-left transition hover:bg-orange-50 focus:outline-none focus-visible:bg-orange-100"
                              >
                                <span className="text-sm font-semibold text-neutral-900">
                                  {restaurant.name}
                                </span>
                                <span className="text-xs text-neutral-500">
                                  {[restaurant.address, [restaurant.city, restaurant.state].filter(Boolean).join(', ')].filter(Boolean).join(' • ')}
                                </span>
                              </button>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <div className="px-4 py-3 text-sm text-neutral-500">
                          {claimError || 'No matching listings found. Try another name or city.'}
                        </div>
                      )
                    ) : (
                      <div className="px-4 py-3 text-sm text-neutral-500">
                        {claimSearchQuery.trim().length > 0
                          ? 'Type at least 3 characters to see suggestions.'
                          : 'Start typing to search for your restaurant.'}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={isSearchingClaims}
                className="rounded-lg bg-orange-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-700 disabled:opacity-60"
              >
                {isSearchingClaims ? 'Searching…' : 'Search'}
              </button>
            </form>

            {claimError && (
              <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {claimError}
              </div>
            )}
            {claimSuccess && (
              <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                {claimSuccess}
              </div>
            )}

            {claimSearchResults.length > 0 && (
              <div className="mt-6 space-y-4">
                {claimSearchResults.map((restaurant) => (
                  <label
                    key={restaurant.id}
                    className={`block cursor-pointer rounded-xl border px-4 py-4 shadow-sm transition ${
                      selectedClaimRestaurant?.id === restaurant.id
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-neutral-200 hover:border-neutral-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <p className="text-base font-semibold text-neutral-900">{restaurant.name}</p>
                        <p className="text-sm text-neutral-600">
                          {[restaurant.address, restaurant.city, restaurant.state]
                            .filter(Boolean)
                            .join(', ')}
                        </p>
                        {restaurant.phone && (
                          <p className="text-xs text-neutral-500">Phone: {restaurant.phone}</p>
                        )}
                      </div>
                      <input
                        type="radio"
                        name="claim-restaurant"
                        value={restaurant.id}
                        checked={selectedClaimRestaurant?.id === restaurant.id}
                        onChange={() => setSelectedClaimRestaurant(restaurant)}
                        className="mt-1"
                      />
                    </div>
                  </label>
                ))}
              </div>
            )}

            {selectedClaimRestaurant && (
              <div className="mt-6 flex flex-col items-start gap-2 rounded-xl border border-orange-200 bg-orange-50 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-orange-700">
                  You&apos;re claiming <span className="font-semibold">{selectedClaimRestaurant.name}</span>.
                  We&apos;ll review your claim and follow up if we need more details.
                </p>
                <button
                  type="button"
                  onClick={handleSubmitClaim}
                  disabled={isSubmittingClaim}
                  className="rounded-lg bg-orange-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-700 disabled:opacity-60"
                >
                  {isSubmittingClaim ? 'Submitting…' : 'Submit claim'}
                </button>
              </div>
            )}

            <div className="mt-10 border-t border-neutral-200/70 pt-6">
              <div className="flex flex-col gap-2 mb-6">
                <h3 className="text-xl font-semibold text-neutral-900">Your claim history</h3>
                <p className="text-sm text-neutral-600 max-w-2xl">
                  Track each claim you&apos;ve submitted and see when it&apos;s approved or if our team needs more information.
                </p>
              </div>

              {ownerClaimsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="h-10 w-10 border-4 border-orange-100 border-t-orange-500 rounded-full animate-spin" />
                </div>
              ) : ownerClaimsError ? (
                <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {ownerClaimsError}
                </div>
              ) : !hasClaims ? (
                <div className="rounded-xl border border-dashed border-neutral-300 bg-neutral-50 px-6 py-8 text-center text-sm text-neutral-600">
                  Once you submit a claim, it will show up here with its verification status.
                </div>
              ) : (
                <ul className="divide-y divide-neutral-200/70">
                  {ownerClaims.map((claim) => {
                    const statusMeta = formatClaimStatus(claim.status);
                    const restaurant = claim.restaurant;
                    return (
                      <li key={claim.id} className="flex flex-col gap-3 py-5 sm:flex-row sm:items-start sm:justify-between">
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center gap-3">
                            <h4 className="text-lg font-semibold text-neutral-900">
                              {restaurant?.name || 'Restaurant'}
                            </h4>
                            <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${statusMeta.classes}`}>
                              {statusMeta.label}
                            </span>
                          </div>
                          <p className="text-sm text-neutral-600">
                            {[restaurant?.address, [restaurant?.city, restaurant?.state].filter(Boolean).join(', ')].filter(Boolean).join(' • ') || 'Awaiting restaurant details'}
                          </p>
                          <p className="text-xs text-neutral-500">
                            Claimed {claim.created_at ? new Date(claim.created_at).toLocaleString() : 'recently'}
                          </p>
                          {claim.status === 'needs_more_info' && claim.evidence ? (
                            <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 w-fit">
                              We requested additional details. Update your claim via email reply.
                            </p>
                          ) : null}
                        </div>
                        {restaurant?.slug ? (
                          <div className="flex flex-col gap-2 text-sm text-neutral-500 sm:text-right">
                            <Link
                              href={`/${restaurant.state?.toLowerCase() || ''}/${(restaurant.city || '').toLowerCase().replace(/\s+/g, '-')}/${restaurant.slug}`}
                              className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-4 py-2 text-xs font-semibold text-neutral-700 transition hover:bg-neutral-50"
                            >
                              👀 View listing
                            </Link>
                          </div>
                        ) : null}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
