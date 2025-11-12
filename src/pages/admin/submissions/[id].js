// src/pages/admin/submissions/[id].js
import { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { supabase } from '../../../lib/supabase';
import { useRequireAdmin } from '../../../contexts/AuthContext';

const INITIAL_STATE = {
  restaurant_name: '',
  address: '',
  city: '',
  state: '',
  zip_code: '',
  phone: '',
  website: '',
  contact_name: '',
  contact_email: '',
  contact_phone: '',
  submission_notes: '',
};

export default function AdminSubmissionDetail() {
  const router = useRouter();
  const { id } = router.query;
  const { loading, isAdmin } = useRequireAdmin('/auth/login');

  const [submission, setSubmission] = useState(null);
  const [formState, setFormState] = useState(INITIAL_STATE);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [actionInFlight, setActionInFlight] = useState(false);

  const fetchSubmission = async (submissionId) => {
    try {
      const { data, error: fetchError } = await supabase
        .from('restaurant_submissions')
        .select('*')
        .eq('id', submissionId)
        .single();

      if (fetchError) throw fetchError;
      setSubmission(data);
      setFormState({
        restaurant_name: data.restaurant_name || '',
        address: data.address || '',
        city: data.city || '',
        state: data.state || '',
        zip_code: data.zip_code || '',
        phone: data.phone || '',
        website: data.website || '',
        contact_name: data.contact_name || '',
        contact_email: data.contact_email || '',
        contact_phone: data.contact_phone || '',
        submission_notes: data.submission_notes || '',
      });
    } catch (err) {
      console.error('Failed to load submission:', err);
      setError(err.message || 'Unable to load submission');
    }
  };

  useEffect(() => {
    if (!loading && isAdmin && id) {
      fetchSubmission(id);
    }
  }, [loading, isAdmin, id]);

  const handleSave = async () => {
    if (!submission) return;
    setSaving(true);
    setError('');
    try {
      const { error: updateError } = await supabase
        .from('restaurant_submissions')
        .update({
          restaurant_name: formState.restaurant_name,
          address: formState.address,
          city: formState.city,
          state: formState.state,
          zip_code: formState.zip_code || null,
          phone: formState.phone || null,
          website: formState.website || null,
          contact_name: formState.contact_name,
          contact_email: formState.contact_email,
          contact_phone: formState.contact_phone || null,
          submission_notes: formState.submission_notes || null,
        })
        .eq('id', submission.id);

      if (updateError) throw updateError;
      await fetchSubmission(submission.id);
    } catch (err) {
      console.error('Failed to save submission:', err);
      setError(err.message || 'Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const handleApprove = async () => {
    if (!submission) return;
    setActionInFlight(true);
    setActionError('');
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const response = await fetch(`/api/submissions/${submission.id}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
        },
        credentials: 'include',
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.error || 'Failed to approve submission');
      }
      router.push('/admin/submissions');
    } catch (err) {
      console.error('Approval failed:', err);
      setActionError(err.message || 'Failed to approve submission');
    } finally {
      setActionInFlight(false);
    }
  };

  const handleReject = async () => {
    if (!submission) return;
    const reason = window.prompt('Provide a reason for rejection:');
    if (!reason) return;

    setActionInFlight(true);
    setActionError('');
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const response = await fetch(`/api/submissions/${submission.id}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
        },
        body: JSON.stringify({ reason }),
        credentials: 'include',
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.error || 'Failed to reject submission');
      }
      router.push('/admin/submissions');
    } catch (err) {
      console.error('Rejection failed:', err);
      setActionError(err.message || 'Failed to reject submission');
    } finally {
      setActionInFlight(false);
    }
  };

  if (loading || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-12 w-12 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin" />
          <p className="text-sm text-neutral-500">Loading submission…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-neutral-50 py-10 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="rounded-xl bg-white border border-rose-200 p-8 text-rose-700">
            <h1 className="text-xl font-semibold mb-3">Unable to load submission</h1>
            <p>{error}</p>
            <button
              onClick={() => router.push('/admin/submissions')}
              className="mt-6 inline-flex items-center px-4 py-2 rounded-md bg-orange-600 text-white hover:bg-orange-700"
            >
              Return to submissions
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!submission) {
    return null;
  }

  return (
    <>
      <Head>
        <title>Submission: {submission.restaurant_name}</title>
      </Head>
      <div className="min-h-screen bg-neutral-50 py-10 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <Link href="/admin/submissions" className="text-sm text-neutral-600 hover:text-neutral-900">
                ← Back to submissions
              </Link>
              <h1 className="mt-4 text-3xl font-semibold text-neutral-900">
                {submission.restaurant_name}
              </h1>
              <p className="text-sm text-neutral-500">
                Submitted {new Date(submission.created_at).toLocaleString()}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleApprove}
                disabled={actionInFlight || submission.status !== 'pending'}
                className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-400"
              >
                {actionInFlight ? 'Processing…' : 'Approve & Publish'}
              </button>
              {submission.status === 'pending' && (
                <button
                  onClick={handleReject}
                  className="inline-flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-4 py-2 font-semibold text-rose-600 transition hover:bg-rose-100"
                >
                  Reject
                </button>
              )}
            </div>
          </div>

          {actionError && (
            <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {actionError}
            </div>
          )}

          <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wide">Restaurant Name</label>
                <input
                  type="text"
                  value={formState.restaurant_name}
                  onChange={(e) => setFormState((prev) => ({ ...prev, restaurant_name: e.target.value }))}
                  className="mt-1 w-full rounded-md border border-neutral-200 px-3 py-2 text-sm text-neutral-800 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-200"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wide">Phone</label>
                <input
                  type="text"
                  value={formState.phone}
                  onChange={(e) => setFormState((prev) => ({ ...prev, phone: e.target.value }))}
                  className="mt-1 w-full rounded-md border border-neutral-200 px-3 py-2 text-sm text-neutral-800 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-200"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wide">Address</label>
                <input
                  type="text"
                  value={formState.address}
                  onChange={(e) => setFormState((prev) => ({ ...prev, address: e.target.value }))}
                  className="mt-1 w-full rounded-md border border-neutral-200 px-3 py-2 text-sm text-neutral-800 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-200"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wide">City</label>
                <input
                  type="text"
                  value={formState.city}
                  onChange={(e) => setFormState((prev) => ({ ...prev, city: e.target.value }))}
                  className="mt-1 w-full rounded-md border border-neutral-200 px-3 py-2 text-sm text-neutral-800 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-200"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wide">State</label>
                <input
                  type="text"
                  maxLength={2}
                  value={formState.state}
                  onChange={(e) => setFormState((prev) => ({ ...prev, state: e.target.value.toUpperCase() }))}
                  className="mt-1 w-full rounded-md border border-neutral-200 px-3 py-2 text-sm text-neutral-800 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-200"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wide">ZIP Code</label>
                <input
                  type="text"
                  value={formState.zip_code}
                  onChange={(e) => setFormState((prev) => ({ ...prev, zip_code: e.target.value }))}
                  className="mt-1 w-full rounded-md border border-neutral-200 px-3 py-2 text-sm text-neutral-800 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-200"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wide">Website</label>
                <input
                  type="text"
                  value={formState.website}
                  onChange={(e) => setFormState((prev) => ({ ...prev, website: e.target.value }))}
                  className="mt-1 w-full rounded-md border border-neutral-200 px-3 py-2 text-sm text-neutral-800 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-200"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wide">Contact Name</label>
                <input
                  type="text"
                  value={formState.contact_name}
                  onChange={(e) => setFormState((prev) => ({ ...prev, contact_name: e.target.value }))}
                  className="mt-1 w-full rounded-md border border-neutral-200 px-3 py-2 text-sm text-neutral-800 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-200"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wide">Contact Email</label>
                <input
                  type="email"
                  value={formState.contact_email}
                  onChange={(e) => setFormState((prev) => ({ ...prev, contact_email: e.target.value }))}
                  className="mt-1 w-full rounded-md border border-neutral-200 px-3 py-2 text-sm text-neutral-800 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-200"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wide">Contact Phone</label>
                <input
                  type="text"
                  value={formState.contact_phone}
                  onChange={(e) => setFormState((prev) => ({ ...prev, contact_phone: e.target.value }))}
                  className="mt-1 w-full rounded-md border border-neutral-200 px-3 py-2 text-sm text-neutral-800 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-200"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wide">Notes</label>
                <textarea
                  rows={4}
                  value={formState.submission_notes}
                  onChange={(e) => setFormState((prev) => ({ ...prev, submission_notes: e.target.value }))}
                  className="mt-1 w-full rounded-md border border-neutral-200 px-3 py-2 text-sm text-neutral-800 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-200"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-lg bg-orange-600 px-4 py-2 font-semibold text-white shadow-sm transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:bg-orange-400"
              >
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
