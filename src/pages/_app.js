// src/pages/_app.js
import '../styles/globals.css';
import Layout from '../components/layout/Layout';
import { AuthProvider } from '../contexts/AuthContext';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

function MyApp({ Component, pageProps }) {
  const router = useRouter();

  // Debug router events
  useEffect(() => {
    const handleRouteChange = (url) => {
      console.log('App is changing to route:', url);
    };

    const handleRouteComplete = (url) => {
      console.log('App completed route change to:', url);
    };

    const handleRouteError = (err, url) => {
      console.error('Route error for URL', url, err);
    };

    router.events.on('routeChangeStart', handleRouteChange);
    router.events.on('routeChangeComplete', handleRouteComplete);
    router.events.on('routeChangeError', handleRouteError);

    return () => {
      router.events.off('routeChangeStart', handleRouteChange);
      router.events.off('routeChangeComplete', handleRouteComplete);
      router.events.off('routeChangeError', handleRouteError);
    };
  }, [router]);

  // Use the layout from props or default to the main layout
  const getLayout = Component.getLayout || ((page) => (
    <Layout title={pageProps.title} description={pageProps.description}>
      {page}
    </Layout>
  ));

  return (
    <AuthProvider>
      {getLayout(<Component {...pageProps} />)}
    </AuthProvider>
  );
}

export default MyApp;