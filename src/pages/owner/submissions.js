// src/pages/owner/submissions.js
import { useEffect, useMemo, useRef, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import RestaurantSubmissionForm from '../../components/forms/RestaurantSubmissionForm';

const SUBMISSION_STATUS_STYLES = {
  pending: {
    label: 'Pending review',
    classes: 'bg-amber-100 text-amber-700 border border-amber-200',
  },
  approved: {
    label: 'Approved',
    classes: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
  },
  rejected: {
    label: 'Needs updates',
    classes: 'bg-rose-100 text-rose-700 border border-rose-200',
  },
  removed: {
    label: 'Removed',
    classes: 'bg-neutral-200 text-neutral-700 border border-neutral-300',
  },
};

function getSubmissionStatusMeta(statusValue) {
  const normalized = (statusValue || 'pending').toLowerCase();
  return SUBMISSION_STATUS_STYLES[normalized] || SUBMISSION_STATUS_STYLES.pending;
}

function mapSubmissionToFormDefaults(submission, fallbackName, fallbackEmail, fallbackPhone) {
  if (!submission) return null;

  return {
    restaurantName: submission.restaurant_name || '',
    address: submission.address || '',
    city: submission.city || '',
    state: submission.state || '',
    zipCode: submission.zip_code || '',
    phone: submission.phone || '',
    website: submission.website || '',
    contactName: submission.contact_name || fallbackName,
    contactEmail: submission.contact_email || fallbackEmail,
    contactPhone: submission.contact_phone || fallbackPhone,
    cuisine: submission.cuisine_other ? 'Other' : submission.cuisine || '',
    cuisineOther: submission.cuisine_other || '',
    soupTags: Array.isArray(submission.soup_tags) ? submission.soup_tags : [],
    soupTagsOther: submission.soup_tags_other || '',
    isRestaurantOwner: submission.is_restaurant_owner ?? true,
    submissionNotes: submission.submission_notes || '',
  };
}

export default function OwnerSubmissionsPage() {
  const router = useRouter();
  const { user, userProfile, session, loading } = useAuth();

  const [submissions, setSubmissions] = useState([]);
  const [submissionsLoading, setSubmissionsLoading] = useState(true);
  const [submissionsError, setSubmissionsError] = useState('');
  const [editingSubmission, setEditingSubmission] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [submissionFeedback, setSubmissionFeedback] = useState('');

  const formRef = useRef(null);

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/auth/login?redirectTo=/owner/submissions');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!user || loading) return;

    const fetchSubmissions = async () => {
      setSubmissionsLoading(true);
      setSubmissionsError('');

      try {
        const { data, error } = await supabase
          .from('restaurant_submissions')
          .select(
            'id, restaurant_name, address, city, state, zip_code, status, created_at, review_notes, delete_requested, delete_request_reason, photo_urls, website, phone, cuisine, cuisine_other, soup_tags, soup_tags_other, contact_name, contact_email, contact_phone, is_restaurant_owner, submission_notes'
          )
          .eq('submitted_by', user.id)
          .eq('is_restaurant_owner', true)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setSubmissions(data || []);
      } catch (error) {
        console.error('Error loading owner submissions:', error);
        setSubmissionsError(error?.message || 'Failed to load your submitted restaurants. Please try again.');
      } finally {
        setSubmissionsLoading(false);
      }
    };

    fetchSubmissions();
  }, [user, loading]);

  const ownerContactName = useMemo(() => {
    return (
      userProfile?.full_name ||
      userProfile?.name ||
      user?.user_metadata?.full_name ||
      user?.email ||
      ''
    );
  }, [userProfile, user]);

  const ownerContactPhone = useMemo(() => {
    return (
      editingSubmission?.contact_phone ||
      userProfile?.phone ||
      user?.user_metadata?.phone_number ||
      ''
    );
  }, [editingSubmission?.contact_phone, userProfile, user]);

  const baseFormDefaults = useMemo(
    () => ({
      restaurantName: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      phone: '',
      website: '',
      contactName: ownerContactName,
      contactEmail: user?.email || '',
      contactPhone: ownerContactPhone,
      cuisine: '',
      cuisineOther: '',
      soupTags: [],
      soupTagsOther: '',
      isRestaurantOwner: true,
      submissionNotes: '',
    }),
    [ownerContactName, ownerContactPhone, user?.email],
  );

  const editingDefaults = useMemo(
    () =>
      editingSubmission
        ? mapSubmissionToFormDefaults(
            editingSubmission,
            ownerContactName,
            user?.email || '',
            ownerContactPhone,
          )
        : null,
    [editingSubmission, ownerContactName, ownerContactPhone, user?.email],
  );

  const formDefaults = editingDefaults || baseFormDefaults;
  const formSubmissionId = editingSubmission?.id ?? null;

  const beginEditing = (submission) => {
    setSubmissionFeedback('');
    setEditingSubmission(submission);
    requestAnimationFrame(() => {
      if (formRef.current) {
        formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  };

  const handleCancelEdit = () => {
    setEditingSubmission(null);
    setSubmissionFeedback('');
  };

  const handleDeleteSubmission = async (submission) => {
    if (!session?.access_token) {
      alert('Please sign in again to manage your submission.');
      return;
    }

    const confirmed = window.confirm(
      `Delete ${submission.restaurant_name}? This cannot be undone and any progress will be lost.`,
    );
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

  const requestSubmissionDeletion = async (submission) => {
    const reason = window.prompt(
      'Tell us why you would like this listing removed (optional):',
    );

    try {
      const response = await fetch(`/api/submissions/${submission.id}/request-delete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
        },
        credentials: 'include',
        body: JSON.stringify({ reason: reason || null }),
      });

      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(payload.error || 'Failed to request removal');
      }

      const updated = payload.submission;
      setSubmissions((prev) => {
        const filtered = prev.filter((item) => item.id !== updated.id);
        return [updated, ...filtered];
      });
      setSubmissionFeedback('Your removal request has been sent to our concierge team.');
    } catch (error) {
      console.error('Failed to request deletion:', error);
      alert(error.message || 'Unable to request deletion');
    }
  };

  const handleFormSubmitted = ({ submission, action }) => {
    if (!submission) return;

    setSubmissions((prev) => {
      const filtered = prev.filter((item) => item.id !== submission.id);
      return [submission, ...filtered];
    });

    if (action === 'update') {
      setEditingSubmission(null);
      setSubmissionFeedback('Submission updated. Our team will review the changes.');
    } else {
      setSubmissionFeedback('Thanks! Your restaurant submission is on its way to our team.');
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-orange-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-12 w-12 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin" />
          <p className="text-sm text-orange-600">Preparing your submissions…</p>
        </div>
      </div>
    );
  }

  const hasSubmissions = submissions.length > 0;

  return (
    <>
      <Head>
        <title>Owner Submissions - FindSoupNearMe</title>
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto space-y-10">
          <header className="rounded-3xl border border-orange-200/60 bg-white/95 p-6 sm:p-8 shadow-sm">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="space-y-3">
                <p className="text-sm font-semibold uppercase tracking-wide text-orange-600">Owner workspace</p>
                <h1 className="text-3xl sm:text-4xl font-bold text-neutral-900">Restaurant submissions</h1>
                <p className="text-sm sm:text-base text-neutral-600 max-w-2xl">
                  Keep track of everything you&apos;ve submitted and add new restaurants when you&apos;re ready.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href="/owner/claims"
                  className="inline-flex items-center justify-center rounded-full border border-orange-200 bg-white px-6 py-3 text-sm sm:text-base font-semibold text-orange-600 shadow-sm transition hover:bg-orange-50"
                >
                  View claims
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    requestAnimationFrame(() => {
                      if (formRef.current) {
                        formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }
                    });
                  }}
                  className="inline-flex items-center justify-center rounded-full bg-orange-600 px-6 py-3 text-sm sm:text-base font-semibold text-white shadow-sm transition hover:bg-orange-700"
                >
                  Add a restaurant
                </button>
              </div>
            </div>
          </header>

          <section className="rounded-3xl border border-neutral-200/70 bg-white/95 p-6 sm:p-8 shadow-sm">
            <div className="flex flex-col gap-2 mb-6">
              <h2 className="text-2xl font-semibold text-neutral-900">Your submitted restaurants</h2>
              <p className="text-sm text-neutral-600 max-w-2xl">
                Review the listings you&apos;ve submitted. Pending entries can be edited or withdrawn—approved listings can request removal if something changes.
              </p>
            </div>

            {submissionFeedback && (
              <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                {submissionFeedback}
              </div>
            )}

            {submissionsLoading ? (
              <div className="flex items-center justify-center py-10">
                <div className="h-10 w-10 border-4 border-orange-100 border-t-orange-500 rounded-full animate-spin" />
              </div>
            ) : submissionsError ? (
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {submissionsError}
              </div>
            ) : !hasSubmissions ? (
              <div className="rounded-xl border border-dashed border-neutral-300 bg-neutral-50 px-6 py-8 text-center text-sm text-neutral-600">
                You haven&apos;t submitted a restaurant yet. Use the form below to get started.
              </div>
            ) : (
              <ul className="divide-y divide-neutral-200/70">
                {submissions.map((submission) => {
                  const statusMeta = getSubmissionStatusMeta(submission.status);

                  return (
                    <li key={submission.id} className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center sm:justify-between">
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-3">
                          <h3 className="text-lg font-semibold text-neutral-900">
                            {submission.restaurant_name}
                          </h3>
                          <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${statusMeta.classes}`}>
                            {statusMeta.label}
                          </span>
                          {submission.delete_requested && (
                            <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold bg-rose-100 text-rose-700 border border-rose-200">
                              Delete requested
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-neutral-600">
                          {[submission.address, submission.city, submission.state]
                            .filter(Boolean)
                            .join(', ')}
                        </p>
                        <p className="text-xs text-neutral-500">
                          Submitted {submission.created_at ? new Date(submission.created_at).toLocaleString() : 'recently'}
                        </p>
                        {submission.review_notes && (
                          <p className="text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2 w-fit">
                            Admin note: {submission.review_notes}
                          </p>
                        )}
                        {submission.status === 'removed' && submission.delete_request_reason && (
                          <p className="text-xs text-neutral-500">
                            Removal reason: {submission.delete_request_reason}
                          </p>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-sm text-neutral-500 sm:text-right">
                        {submission.website && (
                          <a
                            href={submission.website.startsWith('http') ? submission.website : `https://${submission.website}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-orange-600 font-medium hover:underline"
                          >
                            View website ↗
                          </a>
                        )}
                        {submission.photo_urls && submission.photo_urls.length > 0 && (
                          <span>{submission.photo_urls.length} photo{submission.photo_urls.length === 1 ? '' : 's'} attached</span>
                        )}
                        <div className="flex flex-wrap gap-2 justify-end">
                          {submission.status !== 'approved' &&
                          submission.status !== 'removed' &&
                          !submission.delete_requested ? (
                            <>
                              <button
                                type="button"
                                onClick={() => beginEditing(submission)}
                                className="inline-flex items-center rounded-full border border-orange-200 bg-orange-50 px-4 py-2 text-xs font-semibold text-orange-600 transition hover:bg-orange-100"
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
                              onClick={() => requestSubmissionDeletion(submission)}
                              className="inline-flex items-center rounded-full border border-rose-200 px-4 py-2 text-xs font-semibold text-rose-600 transition hover:bg-rose-50"
                            >
                              Request removal
                            </button>
                          ) : null}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}

            <div ref={formRef} className="mt-10 border-t border-neutral-200/70 pt-6">
              <div className="flex flex-col gap-2 mb-6">
                <h3 className="text-xl font-semibold text-neutral-900">
                  {editingSubmission ? 'Update your submission' : 'Submit a new restaurant'}
                </h3>
                <p className="text-sm text-neutral-600 max-w-2xl">
                  Provide as much detail as possible so our team can verify your restaurant quickly. Required fields are marked with an asterisk.
                </p>
              </div>

              {editingSubmission && (
                <div className="mb-6 flex flex-col gap-3 rounded-xl border border-orange-200 bg-orange-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="text-sm text-orange-700">
                    Editing <span className="font-semibold">{editingSubmission.restaurant_name}</span>. Submit the updated details and we&apos;ll take another look.
                  </div>
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="inline-flex items-center rounded-full border border-orange-200 bg-white px-4 py-2 text-xs font-semibold text-orange-600 transition hover:bg-orange-50"
                  >
                    Cancel editing
                  </button>
                </div>
              )}

              <RestaurantSubmissionForm
                key={formSubmissionId || 'new-owner-submission'}
                defaultValues={formDefaults}
                submissionId={formSubmissionId}
                requireOwnerConfirmation
                onSubmitted={handleFormSubmitted}
                onCancelEdit={handleCancelEdit}
              />
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
