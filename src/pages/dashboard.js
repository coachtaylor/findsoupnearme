import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useRef, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import RestaurantSubmissionForm from '../components/forms/RestaurantSubmissionForm';
import { supabase } from '../lib/supabase';

export default function Dashboard() {
  const { user, userProfile, loading, session } = useAuth();
  const router = useRouter();
  const [submissionFeedback, setSubmissionFeedback] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [submissionsLoading, setSubmissionsLoading] = useState(true);
  const [submissionsError, setSubmissionsError] = useState('');
  const [editingSubmission, setEditingSubmission] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const formRef = useRef(null);
  const isEditing = Boolean(editingSubmission);

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [loading, user, router]);

  useEffect(() => {
    if (!user) {
      setSubmissions([]);
      setSubmissionsLoading(false);
      return;
    }

    let isMounted = true;
    const fetchSubmissions = async () => {
      setSubmissionsLoading(true);
      setSubmissionsError('');
      try {
        const { data, error } = await supabase
          .from('restaurant_submissions')
          .select('*')
          .eq('submitted_by', user.id)
          .order('created_at', { ascending: false });

        if (!isMounted) return;

        if (error) {
          throw error;
        }

        setSubmissions(data || []);
      } catch (error) {
        if (!isMounted) return;
        console.error('Failed to load submissions:', error);
        setSubmissionsError(error.message || 'Unable to load submissions');
      } finally {
        if (isMounted) {
          setSubmissionsLoading(false);
        }
      }
    };

    fetchSubmissions();

    return () => {
      isMounted = false;
    };
  }, [user]);

  const handleScrollToForm = () => {
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const profileDefaults = useMemo(() => {
    if (!user) return {};

    const metadata = user.user_metadata || {};
    const profile = userProfile || {};

    return {
      contactName:
        profile.full_name ||
        profile.fullName ||
        metadata.full_name ||
        metadata.fullName ||
        '',
      contactEmail: user.email || profile.contact_email || '',
      contactPhone: profile.phone || profile.phone_number || metadata.phone || '',
      isRestaurantOwner: profile.user_type === 'owner',
    };
  }, [user, userProfile]);

  const editingDefaults = useMemo(() => {
    if (!editingSubmission) return null;
    return {
      restaurantName: editingSubmission.restaurant_name || '',
      address: editingSubmission.address || '',
      city: editingSubmission.city || '',
      state: editingSubmission.state || '',
      zipCode: editingSubmission.zip_code || '',
      phone: editingSubmission.phone || '',
      website: editingSubmission.website || '',
      contactName: editingSubmission.contact_name || '',
      contactEmail: editingSubmission.contact_email || '',
      contactPhone: editingSubmission.contact_phone || '',
      cuisine: editingSubmission.cuisine_other ? 'Other' : editingSubmission.cuisine || '',
      cuisineOther: editingSubmission.cuisine_other || '',
      soupTags: Array.isArray(editingSubmission.soup_tags) ? editingSubmission.soup_tags : [],
      soupTagsOther: editingSubmission.soup_tags_other || '',
      isRestaurantOwner: !!editingSubmission.is_restaurant_owner,
      submissionNotes: editingSubmission.submission_notes || '',
    };
  }, [editingSubmission]);

  const formDefaults = editingDefaults || profileDefaults;

  const isRestaurantOwner = (userProfile?.user_type || '').toLowerCase() === 'owner';

  const beginEditing = (submission) => {
    setSubmissionFeedback(null);
    setEditingSubmission(submission);
    requestAnimationFrame(() => {
      if (formRef.current) {
        formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  };

  const handleCancelEdit = () => {
    setEditingSubmission(null);
    setSubmissionFeedback(null);
  };

  const handleDeleteSubmission = async (submission) => {
    if (!session?.access_token) return;
    const confirmed = window.confirm(`Delete ${submission.restaurant_name}? This cannot be undone.`);
    if (!confirmed) return;

    setDeletingId(submission.id);
    try {
      const response = await fetch(`/api/submissions/${submission.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        credentials: 'include',
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.error || 'Failed to delete submission');
      }

      setSubmissions((prev) => prev.filter((item) => item.id !== submission.id));
      if (editingSubmission?.id === submission.id) {
        setEditingSubmission(null);
      }
      setSubmissionFeedback('Submission deleted.');
    } catch (error) {
      console.error('Failed to delete submission:', error);
      alert(error.message || 'Unable to delete submission');
    } finally {
      setDeletingId(null);
    }
  };

  const handleFormSubmitted = ({ submission, action }) => {
    if (!submission) return;

    setSubmissions((prev) => {
      const filtered = prev.filter((item) => item.id !== submission.id);
      return [submission, ...filtered];
    });

    setSubmissionFeedback(action === 'update' ? 'Submission updated.' : 'Submission received.');
    if (action === 'update') {
      setEditingSubmission(null);
    }
  };

  const requestDeletion = async (submission) => {
    const reason = window.prompt('Tell us why you want to remove this restaurant (optional):');
    try {
      const response = await fetch(`/api/submissions/${submission.id}/request-delete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
        },
        body: JSON.stringify({ reason: reason || null }),
        credentials: 'include',
      });

      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(payload.error || 'Failed to request removal');
      }

      const updated = payload.submission;
      setSubmissions((prev) => {
        const filtered = prev.filter((item) => item.id !== submission.id);
        return [updated, ...filtered];
      });
      setSubmissionFeedback('Removal request sent. Our team will review it soon.');
    } catch (error) {
      console.error('Failed to request deletion:', error);
      alert(error.message || 'Unable to request deletion');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[rgb(var(--bg))]">
        <div className="h-12 w-12 border-4 border-[rgb(var(--accent-light))] border-t-[rgb(var(--primary))] rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <>
      <Head>
        <title>User Dashboard - FindSoupNearMe</title>
        <meta
          name="description"
          content="Manage your FindSoupNearMe account, recommend restaurants, and keep track of upcoming features."
        />
      </Head>
      <div className="min-h-screen bg-[rgb(var(--bg))] py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto space-y-10">
          <header className="rounded-3xl border border-black/10 bg-white p-6 sm:p-8 shadow-sm">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm uppercase tracking-wide text-[rgb(var(--muted))] font-semibold">
                  {isRestaurantOwner ? 'Owner workspace' : 'Dashboard'}
                </p>
                <h1 className="mt-2 text-3xl sm:text-4xludget arbeite font-bold text-[rgb(var(--ink))]">
                  Welcome back, {userProfile?.full_name || userProfile?.name || user.email}
                </h1>
                <p className="mt-3 text-sm sm:text-base text-[rgb(var(--muted))] max-w-xl">
                  {isRestaurantOwner
                    ? 'Thanks for representing your restaurant on FindSoupNearMe. Share updates or recommend other soup spots you love.'
                    : 'Help the community discover hidden soup gems and keep track of your recommendations in one place.'}
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={handleScrollToForm}
                  className="inline-flex items-center justify-center rounded-full bg-[rgb(var(--primary))] px-6 py-3 text-sm sm:text-base font-semibold text-white shadow-sm transition hover:brightness-110 hover:shadow-md"
                >
                  Recommend a Restaurant
                </button>
                <Link
                  href="/restaurants"
                  className="inline-flex items-center justify-center rounded-full border border-[rgb(var(--primary))] px-6 py-3 text-sm sm:text-base font-semibold text-[rgb(var(--primary))] shadow-sm transition hover:bg-[rgba(var(--accent-light),0.5)]"
                >
                  Browse Restaurants
                </Link>
              </div>
            </div>
          </header>

          {isRestaurantOwner ? (
            <section className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <Link
                href="/owner/submissions"
                className="group rounded-2xl border border-black/10 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <div className="flex flex-col gap-3">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 text-lg">🍲</span>
                  <div className="space-y-2">
                    <h2 className="text-lg font-semibold text-[rgb(var(--ink))]">Submit a restaurant</h2>
                    <p className="text-sm text-[rgb(var(--muted))] leading-relaxed">
                      Open the owner workspace to add new restaurants or update pending submissions.
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-[rgb(var(--accent))]">Go to submissions →</span>
                </div>
              </Link>
              <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-3">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-lg">⭐</span>
                  <div className="space-y-2">
                    <h2 className="text-lg font-semibold text-[rgb(var(--ink))]">Reviews</h2>
                    <p className="text-sm text-[rgb(var(--muted))] leading-relaxed">
                      Keep track of customer feedback. Review management tools launch soon—stay tuned.
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled
                    className="inline-flex w-fit cursor-not-allowed items-center rounded-full border border-black/10 bg-[rgb(var(--surface))] px-4 py-2 text-xs font-semibold text-[rgb(var(--muted))]"
                  >
                    Coming soon
                  </button>
                </div>
              </div>
              <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-3">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-sky-100 text-lg">📌</span>
                  <div className="space-y-2">
                    <h2 className="text-lg font-semibold text-[rgb(var(--ink))]">Saved spots</h2>
                    <p className="text-sm text-[rgb(var(--muted))] leading-relaxed">
                      Bookmark go-to soup destinations. Personal lists will arrive soon so you can share favorites.
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled
                    className="inline-flex w-fit cursor-not-allowed items-center rounded-full border border-black/10 bg-[rgb(var(--surface))] px-4 py-2 text-xs font-semibold text-[rgb(var(--muted))]"
                  >
                    Coming soon
                  </button>
                </div>
              </div>
            </section>
          ) : (
            <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Link
                href="#my-submissions"
                className="group rounded-2xl border border-black/10 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <div className="flex flex-col gap-2">
                  <h2 className="text-lg font-semibold text-[rgb(var(--ink))]">My suggested restaurants</h2>
                  <p className="text-sm text-[rgb(var(--muted))] leading-relaxed">
                    Jump straight to your latest suggestions, track their status, and resubmit when needed.
                  </p>
                  <p className="mt-3 text-xs text-[rgb(var(--muted))] group-hover:text-[rgb(var(--accent))]">
                    View submission history →
                  </p>
                </div>
              </Link>
              <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-[rgb(var(--ink))] mb-2">My reviews</h2>
                <p className="text-sm text-[rgb(var(--muted))] leading-relaxed">
                  Rate bowls you&apos;ve tried and share tasting notes. Review tracking launches soon—keep those thoughts handy.
                </p>
              </div>
              <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-[rgb(var(--ink))] mb-2">Saved spots</h2>
                <p className="text-sm text-[rgb(var(--muted))] leading-relaxed">
                  A personal soup list is on the way. For now, bookmark favorites in your browser and send us new finds.
                </p>
              </div>
            </section>
          )}

          <section id="my-submissions" className="rounded-3xl border border-black/10 bg-white p-6 sm:p-8 shadow-sm">
            <div className="flex flex-col gap-2 mb-6">
              <h2 className="text-2xl font-semibold text-[rgb(var(--ink))]">
                {userProfile?.full_name || userProfile?.name || user.email}, here are your suggested restaurants
              </h2>
              <p className="text-sm text-[rgb(var(--muted))] max-w-2xl">
                Keep tabs on the soup spots you&apos;ve shared with the community. Review their status below and submit a new recommendation whenever inspiration strikes.
              </p>
            </div>

            {submissionsLoading ? (
              <div className="flex items-center justify-center py-10">
                <div className="h-10 w-10 border-4 border-[rgb(var(--accent-light))] border-t-[rgb(var(--primary))] rounded-full animate-spin" />
              </div>
            ) : submissionsError ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {submissionsError}
              </div>
            ) : submissions.length === 0 ? (
              <div className="rounded-2xl border border-black/5 bg-[rgb(var(--surface))] p-6 text-center text-sm text-[rgb(var(--muted))]">
                You haven&apos;t suggested any restaurants yet. Use the form below to share your first soup spot with the community.
              </div>
            ) : (
              <ul className="divide-y divide-black/5">
                {submissions.map((submission) => {
                  const statusValue = (submission.status || 'pending').toLowerCase();
                  let statusClasses = 'bg-amber-100 text-amber-700 border border-amber-200';
                  let statusLabel = 'Pending review';
 
                  if (statusValue === 'approved') {
                    statusClasses = 'bg-emerald-100 text-emerald-700 border border-emerald-200';
                    statusLabel = 'Approved';
                  } else if (statusValue === 'rejected') {
                    statusClasses = 'bg-rose-100 text-rose-700 border border-rose-200';
                    statusLabel = 'Needs updates';
                  }
 
                  return (
                    <li key={submission.id} className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center sm:justify-between">
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-3">
                          <h3 className="text-lg font-semibold text-[rgb(var(--ink))]">
                            {submission.restaurant_name}
                          </h3>
                          <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${statusClasses}`}>
                            {statusLabel}
                          </span>
                          {submission.delete_requested && (
                            <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold bg-rose-100 text-rose-700 border border-rose-200">
                              Delete requested
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-[rgb(var(--muted))]">
                          {[submission.address, submission.city, submission.state].filter(Boolean).join(', ')}
                        </p>
                        <p className="text-xs text-[rgb(var(--muted))]">
                          Submitted {submission.created_at ? new Date(submission.created_at).toLocaleString() : 'recently'}
                        </p>
                        {submission.review_notes && (
                          <p className="text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2 w-fit">
                            Admin note: {submission.review_notes}
                          </p>
                        )}
                        {submission.status === 'removed' && (
                          <p className="text-xs text-[rgb(var(--muted))]">
                            This listing has been removed. Reach out to support if you have questions.
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col gap-2 text-sm text-[rgb(var(--muted))] sm:text-right">
                        {submission.website && (
                          <a
                            href={
                              submission.website.startsWith('http')
                                ? submission.website
                                : `https://${submission.website}`
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[rgb(var(--accent))] font-medium hover:underline"
                          >
                            View website ↗
                          </a>
                        )}
                        {submission.photo_urls && submission.photo_urls.length > 0 && (
                          <span>{submission.photo_urls.length} photo{submission.photo_urls.length === 1 ? '' : 's'} attached</span>
                        )}
                        <div className="flex flex-wrap gap-2 justify-end">
                          {submission.status !== 'approved' && submission.status !== 'removed' && !submission.delete_requested ? (
                            <>
                              <button
                                type="button"
                                onClick={() => beginEditing(submission)}
                                className="inline-flex items-center rounded-full border border-[rgb(var(--primary))]/40 px-4 py-2 text-xs font-semibold text-[rgb(var(--primary))] transition hover:bg-[rgba(var(--accent-light),0.5)]"
                              >
                                Edit submission
                              </button>
                              <button
                                type="button"
                                disabled={deletingId === submission.id}
                                onClick={() => handleDeleteSubmission(submission)}
                                className="inline-flex items-center rounded-full border border-rose-200 px-4 py-2 text-xs font-semibold text-rose-600 transition hover:bg-rose-50 disabled:opacity-50"
                              >
                                {deletingId === submission.id ? 'Deleting…' : 'Delete'}
                              </button>
                            </>
                          ) : submission.status === 'approved' && !submission.delete_requested ? (
                            <button
                              type="button"
                              onClick={() => requestDeletion(submission)}
                              className="inline-flex items-center rounded-full border border-rose-200 px-4 py-2 text-xs font-semibold text-rose-600 transition hover:bg-rose-50"
                            >
                              Request removal
                            </button>
                          ) : (
                            <span className="text-xs text-[rgb(var(--muted))]">
                              Removal request sent. We’ll notify you after it’s processed.
                            </span>
                          )}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          {submissionFeedback && (
            <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-6 shadow-sm text-center text-sm text-emerald-700">
              {submissionFeedback}
            </div>
          )}

          <section
            ref={formRef}
            id="recommend"
            className="rounded-3xl border border-black/10 bg-white p-6 sm:p-8 shadow-sm"
          >
            <div className="mb-6 flex flex-col gap-2 text-center">
              <span className="inline-flex w-max self-center items-center rounded-full bg-[rgb(var(--accent-light))]/60 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[rgb(var(--accent))]">
                {isEditing ? 'Editing submission' : 'New submission'}
              </span>
              <h2 className="text-2xl font-semibold text-[rgb(var(--ink))]">
                {isEditing
                  ? `Update ${editingSubmission?.restaurant_name ?? 'your recommendation'}`
                  : 'Recommend a soup restaurant'}
              </h2>
              <p className="text-sm sm:text-base text-[rgb(var(--muted))] max-w-2xl mx-auto">
                {isEditing
                  ? 'Make changes and save to refresh your submission. Cancel if you change your mind.'
                  : 'Complete the form below to add another soup spot to the review queue.'}
              </p>
            </div>

            <RestaurantSubmissionForm
              key={editingSubmission?.id || 'new'}
              defaultValues={formDefaults}
              submissionId={editingSubmission?.id || null}
              onSubmitted={handleFormSubmitted}
              onCancelEdit={handleCancelEdit}
            />
          </section>
        </div>
      </div>
    </>
  );
}
