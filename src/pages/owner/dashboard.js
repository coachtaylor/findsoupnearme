// src/pages/owner/dashboard.js
import { useEffect, useMemo, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { getUserOrgIds } from '../../lib/authz';

function formatStatus({ is_verified, verified_at, status }) {
  if (is_verified || verified_at) return { label: 'Verified', tone: 'success' };
  if (status === 'draft') return { label: 'Draft', tone: 'warning' };
  if (status === 'suspended') return { label: 'Suspended', tone: 'danger' };
  return { label: 'Pending Verification', tone: 'info' };
}

function getRestaurantUrl({ slug, city, state, id }) {
  if (slug && city && state) {
    const stateSlug = state.toLowerCase();
    const citySlug = city.toLowerCase().replace(/\s+/g, '-');
    return `/${stateSlug}/${citySlug}/${slug}`;
  }
  return `/restaurants/${id}`;
}

function getEditUrl(restaurant) {
  if (restaurant.slug) {
    return `/restaurants/${restaurant.slug}/edit`;
  }
  return `/restaurants/edit?id=${restaurant.id}`;
}

function getSubmissionStatusMeta(statusValue) {
  const status = (statusValue || 'pending').toLowerCase();
  switch (status) {
    case 'approved':
      return { label: 'Approved', classes: 'bg-emerald-100 text-emerald-700 border border-emerald-200' };
    case 'rejected':
      return { label: 'Needs updates', classes: 'bg-rose-100 text-rose-700 border border-rose-200' };
    case 'removed':
      return { label: 'Removed', classes: 'bg-neutral-200 text-neutral-700 border border-neutral-300' };
    default:
      return { label: 'Pending review', classes: 'bg-amber-100 text-amber-700 border border-amber-200' };
  }
}

export default function OwnerDashboard() {
  const router = useRouter();
  const { user, loading, isAdmin } = useAuth();
  const [restaurants, setRestaurants] = useState([]);
  const [isLoadingRestaurants, setIsLoadingRestaurants] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [customerSubmissions, setCustomerSubmissions] = useState([]);
  const [customerSubmissionsLoading, setCustomerSubmissionsLoading] = useState(true);
  const [customerSubmissionsError, setCustomerSubmissionsError] = useState('');

  const ownerOrgIds = useMemo(() => (user ? getUserOrgIds(user) : []), [user]);

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/auth/login?redirectTo=/owner/dashboard');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!user || loading) return;

    const fetchRestaurants = async () => {
      setIsLoadingRestaurants(true);
      setFetchError('');

      try {
        let query = supabase
          .from('restaurants')
          .select(
            'id,name,slug,is_verified,verified_at,status,city,state,owner_id,owner_org_id,updated_at',
          )
          .order('updated_at', { ascending: false });

        if (isAdmin && ownerOrgIds.length === 0) {
          const { data, error } = await query.limit(200);
          if (error) throw error;
          setRestaurants(data || []);
          return;
        }

        if (ownerOrgIds.length > 0) {
          const orgFilter = ownerOrgIds.join(',');
          query = query.or(
            `owner_id.eq.${user.id},owner_org_id.in.(${orgFilter})`,
          );
        } else {
          query = query.eq('owner_id', user.id);
        }

        const { data, error } = await query;
        if (error) throw error;
        setRestaurants(data || []);
      } catch (error) {
        console.error('Error loading owner restaurants:', error);
        setFetchError(
          error?.message || 'Failed to load your restaurants. Please try again.',
        );
      } finally {
        setIsLoadingRestaurants(false);
      }
    };

    fetchRestaurants();
  }, [user, loading, ownerOrgIds, isAdmin]);

  useEffect(() => {
    if (!user || loading) return;

    let cancelled = false;

    const loadCustomerSubmissions = async () => {
      setCustomerSubmissionsLoading(true);
      setCustomerSubmissionsError('');

      try {
        const { data, error } = await supabase
          .from('restaurant_submissions')
          .select(
            'id, restaurant_name, address, city, state, status, created_at, review_notes, delete_requested, website'
          )
          .eq('submitted_by', user.id)
          .eq('is_restaurant_owner', false)
          .order('created_at', { ascending: false });

        if (cancelled) return;

        if (error) throw error;
        setCustomerSubmissions(data || []);
      } catch (error) {
        if (cancelled) return;
        console.error('Error loading customer submissions:', error);
        setCustomerSubmissionsError(
          error?.message || 'Failed to load your customer submissions. Please try again.'
        );
      } finally {
        if (!cancelled) {
          setCustomerSubmissionsLoading(false);
        }
      }
    };

    loadCustomerSubmissions();

    return () => {
      cancelled = true;
    };
  }, [user, loading]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-12 w-12 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin" />
          <p className="text-sm text-gray-500">Preparing your dashboard…</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Owner Dashboard - FindSoupNearMe</title>
      </Head>
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto space-y-8">
          <header className="space-y-2">
            <p className="text-sm font-semibold uppercase tracking-wide text-orange-600">
              Restaurant Owner
            </p>
            <h1 className="text-3xl sm:text-4xl font-bold text-neutral-900">
              Your Restaurants
            </h1>
            <p className="text-neutral-600 max-w-2xl">
              Manage your soup listings, track verification status, and keep your
              restaurant information up to date.
            </p>
          </header>

          <section className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Link
              href="/owner/submissions"
              className="group rounded-3xl border border-neutral-200/70 bg-white/95 p-6 sm:p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <div className="flex h-full flex-col gap-4">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-100 text-2xl">
                  🍲
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-semibold text-neutral-900">Owner restaurant submissions</h2>
                  <p className="text-sm text-neutral-600">
                    Submit new restaurants as an owner, edit or delete pending submissions, and request removal of approved ones.
                  </p>
                </div>
                <span className="mt-auto text-sm font-semibold text-orange-600">Open owner submissions →</span>
              </div>
            </Link>

            <Link
              href="/owner/claims"
              className="group rounded-3xl border border-neutral-200/70 bg-white/95 p-6 sm:p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <div className="flex h-full flex-col gap-4">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-2xl">
                  🗂️
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-semibold text-neutral-900">Restaurant claims</h2>
                  <p className="text-sm text-neutral-600">
                    Submit new claims, delete pending ones, and manage details for approved claims to keep your listing accurate.
                  </p>
                </div>
                <span className="mt-auto text-sm font-semibold text-orange-600">Open claims workspace →</span>
              </div>
            </Link>

            <Link
              href="/owner/customer-submissions"
              className="group rounded-3xl border border-neutral-200/70 bg-white/95 p-6 sm:p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <div className="flex h-full flex-col gap-4">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-100 text-2xl">
                  🙌
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-semibold text-neutral-900">Customer submissions</h2>
                  <p className="text-sm text-neutral-600">
                    Review the restaurants you&apos;ve submitted as a community member, update pending suggestions, or request deletion when they&apos;re approved.
                  </p>
                </div>
                <span className="mt-auto text-sm font-semibold text-orange-600">Manage customer submissions →</span>
              </div>
            </Link>

            <Link
              href="/owner/reviews"
              className="group rounded-3xl border border-neutral-200/70 bg-white/95 p-6 sm:p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <div className="flex h-full flex-col gap-4">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 text-2xl">
                  ⭐
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-semibold text-neutral-900">Owner review management</h2>
                  <p className="text-sm text-neutral-600">
                    Add reviews for restaurants you don’t own, edit previous feedback, and remove notes when they’re no longer needed.
                  </p>
                </div>
                <span className="mt-auto text-sm font-semibold text-orange-600">Manage reviews →</span>
              </div>
            </Link>

            <Link
              href="/owner/saved"
              className="group rounded-3xl border border-neutral-200/70 bg-white/95 p-6 sm:p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <div className="flex h-full flex-col gap-4">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-100 text-2xl">
                  📌
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-semibold text-neutral-900">Saved restaurants</h2>
                  <p className="text-sm text-neutral-600">
                    Build and curate your favorites list. Save restaurants to revisit later and prep them for a public highlight.
                  </p>
                </div>
                <span className="mt-auto text-sm font-semibold text-orange-600">Open saved list →</span>
              </div>
            </Link>
          </section>

          {fetchError && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {fetchError}
            </div>
          )}

          {isLoadingRestaurants ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={`skeleton-${index}`}
                  className="h-32 animate-pulse rounded-2xl border border-neutral-200/60 bg-white/80"
                />
              ))}
            </div>
          ) : (
            <section className="space-y-4">
              {restaurants.map((restaurant) => {
                const status = formatStatus(restaurant);
                const viewUrl = getRestaurantUrl(restaurant);
                const editUrl = getEditUrl(restaurant);

                return (
                  <article
                    key={restaurant.id}
                    className="flex flex-col gap-4 rounded-2xl border border-neutral-200/70 bg-white/90 p-6 shadow-sm transition hover:border-orange-200/80 hover:shadow-md md:flex-row md:items-center md:justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-xl font-semibold text-neutral-900">
                          {restaurant.name}
                        </h2>
                        <span
                          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                            status.tone === 'success'
                              ? 'bg-emerald-100 text-emerald-700'
                              : status.tone === 'warning'
                                ? 'bg-amber-100 text-amber-700'
                                : status.tone === 'danger'
                                  ? 'bg-red-100 text-red-700'
                                  : 'bg-blue-100 text-blue-700'
                          }`}
                        >
                          {status.label}
                        </span>
                      </div>
                      <p className="text-sm text-neutral-600">
                        {restaurant.city}, {restaurant.state}
                      </p>
                      <div className="flex flex-wrap gap-2 text-xs text-neutral-500">
                        {restaurant.owner_org_id && (
                          <span className="rounded-full bg-neutral-100 px-3 py-1">
                            Org ID: {restaurant.owner_org_id}
                          </span>
                        )}
                        {restaurant.verified_at && (
                          <span className="rounded-full bg-neutral-100 px-3 py-1">
                            Verified {new Date(restaurant.verified_at).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <Link
                        href={editUrl}
                        className="inline-flex items-center gap-2 rounded-lg border border-orange-200 bg-orange-50 px-4 py-2 text-sm font-semibold text-orange-600 transition hover:bg-orange-100"
                      >
                        ✏️ Edit
                      </Link>
                      <Link
                        href={viewUrl}
                        className="inline-flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-4 py-2 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-50"
                      >
                        👀 View Listing
                      </Link>
                    </div>
                  </article>
                );
              })}
            </section>
          )}

          <footer className="rounded-2xl border border-neutral-200/60 bg-white/90 p-6 text-sm text-neutral-600 shadow-sm">
            <h3 className="text-base font-semibold text-neutral-900">
              Need help with your listing?
            </h3>
            <p className="mt-2">
              Our concierge team verifies new restaurants in under 48 hours. Email{' '}
              <a
                href="mailto:support@findsoupnearme.com"
                className="font-semibold text-orange-600 hover:underline"
              >
                support@findsoupnearme.com
              </a>{' '}
              if you have questions or need to update information quickly.
            </p>
          </footer>
        </div>
      </div>
    </>
  );
}
