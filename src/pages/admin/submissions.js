// src/pages/admin/submissions.js
import { useEffect, useMemo, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useAuth, useRequireAdmin } from '../../contexts/AuthContext';

const STATUS_TABS = [
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'all', label: 'All' },
  { value: 'removed', label: 'Removed' },
];

export default function AdminSubmissionsPage() {
  const { session } = useAuth();
  const { loading, isAdmin } = useRequireAdmin('/auth/login');
  const [submissions, setSubmissions] = useState([]);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [actionInFlight, setActionInFlight] = useState(null);
  const [rejectModal, setRejectModal] = useState({ open: false, id: null, reason: '' });
  const [removingId, setRemovingId] = useState(null);

  const fetchSubmissions = async (status = statusFilter) => {
    setRefreshing(true);
    setError('');
    try {
      if (!session?.access_token) {
        throw new Error('Missing admin session');
      }

      const params = new URLSearchParams();
      if (status && status !== 'all') {
        params.append('status', status);
      }

      const response = await fetch(`/api/admin/submissions?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        credentials: 'include',
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || 'Failed to load submissions');
      }

      setSubmissions(payload.submissions || []);
    } catch (err) {
      console.error('Failed to load submissions:', err);
      setError(err.message || 'Failed to load submissions');
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (!loading && isAdmin && session?.access_token) {
      fetchSubmissions(statusFilter);
    }
  }, [loading, isAdmin, session?.access_token, statusFilter]);

  const filteredSubmissions = useMemo(() => {
    if (statusFilter === 'all') return submissions;
    return submissions.filter((submission) => submission.status === statusFilter);
  }, [submissions, statusFilter]);

  const handleApprove = async (submissionId) => {
    setActionInFlight(submissionId);
    setActionError('');
    try {
      if (!session?.access_token) {
        throw new Error('Missing admin session');
      }

      const response = await fetch(`/api/admin/submissions/${submissionId}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
        },
        credentials: 'include',
      });

      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(payload.error || 'Failed to approve submission');
      }

      await fetchSubmissions(statusFilter);
    } catch (err) {
      console.error('Approve submission failed:', err);
      setActionError(err.message || 'Failed to approve submission');
    } finally {
      setActionInFlight(null);
    }
  };

  const handleReject = async () => {
    if (!rejectModal.id) return;
    setActionInFlight(rejectModal.id);
    setActionError('');

    try {
      if (!session?.access_token) {
        throw new Error('Missing admin session');
      }

      const response = await fetch(`/api/admin/submissions/${rejectModal.id}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
        },
        body: JSON.stringify({ reason: rejectModal.reason }),
        credentials: 'include',
      });

      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(payload.error || 'Failed to reject submission');
      }

      setRejectModal({ open: false, id: null, reason: '' });
      await fetchSubmissions(statusFilter);
    } catch (err) {
      console.error('Reject submission failed:', err);
      setActionError(err.message || 'Failed to reject submission');
    } finally {
      setActionInFlight(null);
    }
  };

  const handleRemoveRestaurant = async (submissionId) => {
    setRemovingId(submissionId);
    setActionError('');
    try {
      if (!session?.access_token) {
        throw new Error('Missing admin session');
      }

      const response = await fetch(`/api/admin/submissions/${submissionId}/remove`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        credentials: 'include',
      });

      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(payload.error || 'Failed to remove restaurant');
      }

      await fetchSubmissions(statusFilter);
    } catch (err) {
      console.error('Remove restaurant failed:', err);
      setActionError(err.message || 'Failed to remove restaurant');
    } finally {
      setRemovingId(null);
    }
  };

  if (loading || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-12 w-12 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin" />
          <p className="text-sm text-neutral-500">Preparing admin submissions dashboard…</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Restaurant Submissions - Admin</title>
      </Head>
      <div className="min-h-screen bg-neutral-50 py-10 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-8">
          <header className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-widest text-orange-600">Admin Console</p>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h1 className="text-3xl font-semibold text-neutral-900">Restaurant Submissions</h1>
              <button
                onClick={() => fetchSubmissions(statusFilter)}
                disabled={refreshing}
                className="inline-flex items-center gap-2 rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm font-medium text-neutral-700 shadow-sm transition hover:border-neutral-400 disabled:opacity-50"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                  <path d="M4 4v5h.582m15.356 2a8.001 8.001 0 00-15.356-2m0 0H4m0 11v-5h.582m15.356-2a8.001 8.001 0 01-15.356 2m0 0H4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Refresh
              </button>
            </div>
            <p className="text-sm text-neutral-600">
              Review restaurants submitted by owners and customers before publishing them to the directory.
            </p>
          </header>

          <div className="flex flex-wrap gap-3">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setStatusFilter(tab.value)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  statusFilter === tab.value
                    ? 'bg-orange-600 text-white shadow-sm'
                    : 'bg-white text-neutral-600 border border-neutral-200 hover:border-neutral-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {error && (
            <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          )}

          {actionError && (
            <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {actionError}
            </div>
          )}

          <section className="rounded-3xl border border-neutral-200 bg-white shadow-sm">
            {filteredSubmissions.length === 0 ? (
              <div className="p-12 text-center text-sm text-neutral-500">
                No submissions match this filter.
              </div>
            ) : (
              <ul className="divide-y divide-neutral-100">
                {filteredSubmissions.map((submission) => (
                  <li key={submission.id} className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-xl font-semibold text-neutral-900">
                          {submission.restaurant_name}
                        </h2>
                        <span
                          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                            submission.status === 'pending'
                              ? 'bg-amber-100 text-amber-700 border border-amber-200'
                              : submission.status === 'approved'
                              ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                              : submission.status === 'removed'
                              ? 'bg-blue-100 text-blue-700 border-blue-200'
                              : 'bg-rose-100 text-rose-700 border-rose-200'
                          }`}
                        >
                          {submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}
                        </span>
                        {submission.delete_requested && (
                          <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold bg-rose-100 text-rose-700 border border-rose-200">
                            Delete requested
                          </span>
                        )}
                        <span
                          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold border ${
                            submission.is_restaurant_owner
                              ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                              : 'bg-blue-100 text-blue-700 border-blue-200'
                          }`}
                        >
                          {submission.is_restaurant_owner ? 'Restaurant owner' : 'Soup lover'}
                        </span>
                      </div>
                      <p className="text-sm text-neutral-600">
                        {submission.address}, {submission.city}, {submission.state}
                      </p>
                      <p className="text-sm text-neutral-600">
                        Cuisine: {submission.cuisine}
                        {submission.cuisine_other && (
                          <span className="ml-1 text-xs text-neutral-500">({submission.cuisine_other})</span>
                        )}
                      </p>
                      {Array.isArray(submission.soup_tags) && submission.soup_tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 text-xs text-neutral-600">
                          {submission.soup_tags.map((tag) => (
                            <span key={tag} className="inline-flex items-center rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 font-medium">
                              {tag}
                            </span>
                          ))}
                          {submission.soup_tags_other && (
                            <span className="inline-flex items-center rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 font-medium">
                              {submission.soup_tags_other}
                            </span>
                          )}
                        </div>
                      )}
                      <p className="text-sm text-neutral-600">
                        Submitted by: {submission.contact_name} ({submission.contact_email})
                      </p>
                      <p className="text-xs text-neutral-500">
                        Submitted {new Date(submission.created_at).toLocaleString()}
                      </p>
                      {submission.delete_request_reason && (
                        <p className="text-xs text-neutral-500 italic">
                          Request reason: {submission.delete_request_reason}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2 text-sm">
                      <Link
                        href={`/admin/submissions/${submission.id}`}
                        className="inline-flex items-center gap-2 rounded-lg border border-neutral-200 px-4 py-2 font-medium text-neutral-600 transition hover:border-neutral-300"
                      >
                        View Submission
                      </Link>
                      {submission.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleApprove(submission.id)}
                            disabled={actionInFlight === submission.id}
                            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-400"
                          >
                            {actionInFlight === submission.id ? 'Approving…' : 'Approve'}
                          </button>
                          <button
                            onClick={() => setRejectModal({ open: true, id: submission.id, reason: '' })}
                            className="inline-flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-4 py-2 font-semibold text-rose-600 transition hover:bg-rose-100"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      {submission.delete_requested && (
                        <button
                          onClick={() => handleRemoveRestaurant(submission.id)}
                          disabled={removingId === submission.id}
                          className="inline-flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-4 py-2 font-semibold text-rose-600 transition hover:bg-rose-100 disabled:opacity-50"
                        >
                          {removingId === submission.id ? 'Removing…' : 'Remove restaurant'}
                        </button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>

      {rejectModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/50">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <h2 className="text-xl font-semibold text-neutral-900">Reject Submission</h2>
            <p className="mt-2 text-sm text-neutral-600">
              Provide a short explanation so the submitter understands what needs to change.
            </p>
            <textarea
              rows={4}
              className="mt-4 w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm text-neutral-800 shadow-sm focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-200"
              value={rejectModal.reason}
              onChange={(event) => setRejectModal((prev) => ({ ...prev, reason: event.target.value }))}
              placeholder="Reason for rejection"
            />
            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setRejectModal({ open: false, id: null, reason: '' })}
                className="rounded-lg border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-600 transition hover:border-neutral-300"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={!rejectModal.reason.trim() || actionInFlight === rejectModal.id}
                className="inline-flex items-center gap-2 rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:bg-rose-400"
              >
                {actionInFlight === rejectModal.id ? 'Rejecting…' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
