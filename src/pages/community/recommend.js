import { useEffect, useMemo, useRef, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import RestaurantSubmissionForm from '../../components/forms/RestaurantSubmissionForm';
import { useAuth, useRequireAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

const Spinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-[rgb(var(--bg))]">
    <div className="flex flex-col items-center gap-3">
      <div className="h-12 w-12 border-4 border-[rgb(var(--accent-light))] border-t-[rgb(var(--primary))] rounded-full animate-spin" />
      <p className="text-sm text-[rgb(var(--muted))]">Loading submission form…</p>
    </div>
  </div>
);

export default function RecommendRestaurantPage() {
  const router = useRouter();
  const { user: authUser, userProfile, session } = useAuth();
  const { user, loading } = useRequireAuth('/auth/login');
  const [submissionFeedback, setSubmissionFeedback] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [submissionsLoading, setSubmissionsLoading] = useState(true);
  const [submissionsError, setSubmissionsError] = useState('');
  const [editingSubmission, setEditingSubmission] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const formRef = useRef(null);
  const lastSubmissionIdApplied = useRef(null);

  const profileDefaults = useMemo(() => {
    if (!authUser && !userProfile) {
      return {};
    }

    const profile = userProfile || {};
    const metadata = authUser?.user_metadata || {};

    return {
      contactName:
        profile.full_name ||
        profile.fullName ||
        metadata.full_name ||
        metadata.fullName ||
        '',
      contactEmail: authUser?.email || profile.contact_email || '',
      contactPhone: profile.phone || profile.phone_number || metadata.phone || '',
      isRestaurantOwner: profile.user_type === 'owner',
    };
  }, [authUser, userProfile]);

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

  useEffect(() => {
    if (!user || loading) return;

    let isMounted = true;

    const loadSubmissions = async () => {
      setSubmissionsLoading(true);
      setSubmissionsError('');
      try {
        const { data, error } = await supabase
          .from('restaurant_submissions')
          .select('*')
          .eq('submitted_by', user.id)
          .order('created_at', { ascending: false });

        if (!isMounted) return;

        if (error) throw error;

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

    loadSubmissions();

    return () => {
      isMounted = false;
    };
  }, [user, loading]);

  const submissionFromQuery = useMemo(() => {
    const submissionId = router.query?.submissionId;
    if (!submissionId || submissions.length === 0) return null;
    return submissions.find((submission) => submission.id === submissionId) || null;
  }, [router.query?.submissionId, submissions]);

  const hasAppliedFromQuery = useRef(false);

  useEffect(() => {
    if (!router.isReady) return;
    if (!submissionFromQuery) return;
    if (hasAppliedFromQuery.current && editingSubmission?.id === submissionFromQuery.id) return;

    beginEditing(submissionFromQuery);
    hasAppliedFromQuery.current = true;
  }, [router.isReady, submissionFromQuery?.id]);

  if (loading || !user) {
    return <Spinner />;
  }

  const formDefaults = editingDefaults || profileDefaults;

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

  const handleCancelEdit = () => {
    setEditingSubmission(null);
    setSubmissionFeedback(null);
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
        throw new Error(payload.error || 'Failed to request deletion');
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

  const beginEditing = (submission) => {
    setSubmissionFeedback(null);
    setEditingSubmission(submission);
    requestAnimationFrame(() => {
      if (formRef.current) {
        formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  };

  return (
    <>
      <Head>
        <title>My Submissions - FindSoupNearMe</title>
        <meta
          name="description"
          content="Review the restaurants you have suggested to FindSoupNearMe and submit another recommendation."
        />
      </Head>

      <div className="min-h-screen bg-[rgb(var(--bg))] py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-10">
          <div className="flex flex-col gap-4 text-center">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[rgb(var(--muted))]">My Submissions</p>
              <h1 className="text-3xl sm:text-4xl font-bold text-[rgb(var(--ink))] tracking-tight">
                Restaurants I&apos;ve Suggested
              </h1>
            </div>
            <p className="text-lg text-[rgb(var(--muted))] max-w-2xl mx-auto leading-relaxed">
              Keep track of the soup spots you&apos;ve sent our team. When you&apos;re ready, add another recommendation using the button below.
            </p>
            <div className="flex justify-center">
              <a
                href="#recommend"
                className="inline-flex items-center justify-center rounded-full bg-[rgb(var(--primary))] px-6 py-3 text-base font-semibold text-white shadow-sm transition hover:brightness-110 hover:shadow-md"
              >
                Submit another restaurant
              </a>
            </div>
          </div>

          <section
            ref={formRef}
            id="recommend"
            className="rounded-3xl border border-black/10 bg-white p-6 sm:p-8 shadow-sm"
          >
            <div className="flex flex-col gap-2 mb-6 text-center">
              <span className="inline-flex w-max self-center items-center rounded-full bg-[rgb(var(--accent-light))]/60 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[rgb(var(--accent))]">
                {editingSubmission ? 'Editing submission' : 'New submission'}
              </span>
              <h2 className="text-2xl font-semibold text-[rgb(var(--ink))]">
                {editingSubmission
                  ? `Update ${editingSubmission?.restaurant_name ?? 'your recommendation'}`
                  : 'Recommend a soup restaurant'}
              </h2>
              <p className="text-sm sm:text-base text-[rgb(var(--muted))] max-w-2xl mx-auto">
                {editingSubmission
                  ? 'Make changes and save to update your submission. You can also cancel if you change your mind.'
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

          {submissionFeedback && (
            <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-6 shadow-sm text-center text-sm text-emerald-700">
              {submissionFeedback}
            </div>
          )}

          <div className="rounded-2xl border border-[rgb(var(--accent-light))]/60 bg-[rgb(var(--surface))] p-6 sm:p-8 shadow-sm">
            <h2 className="text-xl font-semibold text-[rgb(var(--ink))] mb-3">Need help?</h2>
            <p className="text-sm text-[rgb(var(--muted))]">
              Have questions about your submission? Reach out at{' '}
              <a href="mailto:hello@findsoupnearme.com" className="text-[rgb(var(--accent))] font-medium hover:underline">
                hello@findsoupnearme.com
              </a>{' '}
              and we&apos;ll get back to you.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
