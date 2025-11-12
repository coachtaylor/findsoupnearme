// src/pages/onboarding/owner.js
import { useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';

export default function OwnerOnboardingRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/owner/submissions');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-orange-50 px-4">
      <Head>
        <title>Redirecting… - FindSoupNearMe</title>
      </Head>
      <div className="max-w-md rounded-2xl border border-orange-200 bg-white p-8 text-center shadow-sm">
        <h1 className="text-xl font-semibold text-neutral-900">Redirecting you to the owner dashboard…</h1>
        <p className="mt-3 text-sm text-neutral-600">
          If you&apos;re not redirected automatically,{' '}
          <button
            type="button"
            onClick={() => router.replace('/owner/submissions')}
            className="font-semibold text-orange-600 hover:underline"
          >
            continue here
          </button>
          .
        </p>
      </div>
    </div>
  );
}
