// src/pages/cities/index.js
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function CitiesPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to restaurants page where cities are now shown
    router.replace('/restaurants');
  }, [router]);
  
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Head>
        <title>Redirecting... | FindSoupNearMe</title>
      </Head>
      <div className="text-center">
        <p className="text-neutral-600">Redirecting to restaurants page...</p>
      </div>
    </div>
  );
}