// src/pages/owner/customer-submissions.js
import Head from 'next/head';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

function getStatusMeta(statusValue) {
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

export default function OwnerCustomerSubmissionsPage() {
  const router = useRouter();
  const { user, session, loading } = useAuth();
  const [submissions, setSubmissions] = useState([]);
  const [submissionsLoading, setSubmissionsLoading] = useState(true);
  const [submissionsError, setSubmissionsError] = useState('');
  const [submissionFeedback, setSubmissionFeedback] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    if (!user) {
      setSubmissions([]);
      setSubmissionsLoading(false);
      return;
    }

    let cancelled = false;

    const loadSubmissions = async () => {
      setSubmissionsLoading(true);
      setSubmissionsError('');

      try {
        const { data, error } = await supabase
          .from('restaurant_submissions')
          .select(
            'id, restaurant_name, address, city, state, status, created_at, review_notes, delete_requested'
          )
          .eq('submitted_by', user.id)
          .eq('is_restaurant_owner', false)
          .order('created_at', { ascending: false });

        if (cancelled) return;

        if (error) throw error;
        setSubmissions(data || []);
      } catch (error) {
        if (cancelled) return;
        console.error('Failed to load customer submissions:', error);
        setSubmissionsError(error?.message || 'Unable to load customer submissions');
      } finally {
        if (!cancelled) {
          setSubmissionsLoading(false);
        }
      }
    };

    loadSubmissions();

    return () => {
      cancelled = true;
    };
  }, [user]);

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
      setSubmissionFeedback('Submission deleted.');
    } catch (error) {
      console.error('Failed to delete submission:', error);
      alert(error.message || 'Unable to delete submission');
    } finally {
      setDeletingId(null);
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
        credentials: 'include',
        body: JSON.stringify({ reason: reason || null }),
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

  const beginEditing = (submission) => {
    router.push(`/community/recommend?submissionId=${submission.id}`);
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[rgb(var(--bg))]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-12 w-12 border-4 border-[rgb(var(--accent-light))] border-t-[rgb(var(--primary))] rounded-full animate-spin" />
          <p className="text-sm text-[rgb(var(--muted))]">Loading your submissions…</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Customer submissions - Owner workspace</title>
      </Head>

      <div className="min-h-screen bg-[rgb(var(--bg))] py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl space-y-10">
          <header className="text-center space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[rgb(var(--muted))]">Owner workspace</p>
            <h1 className="text-3xl sm:text-4xl font-bold text-[rgb(var(--ink))]">Customer submissions</h1>
            <p className="text-sm sm:text-base text-[rgb(var(--muted))] max-w-3xl mx-auto">
              These are the restaurants you&apos;ve suggested as a customer. Manage them here or open the community submissions page for the full editing experience.
            </p>
          </header>

          <section className="rounded-3xl border border-black/10 bg-white p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex flex-wrap justify-between gap-3">
              <h2 className="text-xl font-semibold text-[rgb(var(--ink))]">Submission history</h2>
              <Link
                href="/community/recommend"
                className="inline-flex items-center gap-2 rounded-full bg-[rgb(var(--primary))] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:brightness-110 hover:shadow-md"
              >
                Manage in community workspace →
              </Link>
            </div>

            {submissionFeedback && (
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                {submissionFeedback}
              </div>
            )}

            {submissionsLoading ? (
              <div className="flex items-center justify-center py-10">
                <div className="h-10 w-10 border-4 border-orange-100 border-t-orange-500 rounded-full animate-spin" />
              </div>
            ) : submissionsError ? (
              <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {submissionsError}
              </div>
            ) : submissions.length === 0 ? (
              <div className="rounded-lg border border-dashed border-neutral-200 bg-neutral-50 px-4 py-6 text-center text-sm text-neutral-500">
                You haven&apos;t submitted any restaurants as a customer yet.
                <span className="block mt-2 text-sm font-semibold text-orange-600">
                  <Link href="/community/recommend">Share your first suggestion →</Link>
                </span>
              </div>
            ) : (
              <ul className="space-y-4">
                {submissions.map((submission) => {
                  const statusMeta = getStatusMeta(submission.status);
                  return (
                    <li
                      key={submission.id}
                      className="flex flex-col gap-4 rounded-2xl border border-neutral-200/70 bg-white p-5 shadow-sm transition hover:border-orange-200/60 hover:shadow-md md:flex-row md:items-center md:justify-between"
                    >
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
                          {[submission.address, submission.city, submission.state].filter(Boolean).join(', ')}
                        </p>
                        <p className="text-xs text-neutral-500">
                          Submitted {submission.created_at ? new Date(submission.created_at).toLocaleString() : 'recently'}
                        </p>
                        {submission.review_notes && (
                          <p className="text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2 w-fit">
                            Admin note: {submission.review_notes}
                          </p>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-2 md:justify-end">
                        {submission.status !== 'approved' && submission.status !== 'removed' && !submission.delete_requested ? (
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
                            onClick={() => requestDeletion(submission)}
                            className="inline-flex items-center rounded-full border border-rose-200 px-4 py-2 text-xs font-semibold text-rose-600 transition hover:bg-rose-50"
                          >
                            Request removal
                          </button>
                        ) : (
                          <span className="text-xs text-neutral-500">
                            Removal requested. We&apos;ll notify you once it&apos;s processed.
                          </span>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </div>
      </div>
    </>
  );
}
