import '../styles/globals.css';
import { useEffect } from 'react';
import { AuthProvider } from '../contexts/AuthContext';
import Layout from '../components/layout/Layout';

let hasPatchedPerformance = false;

function patchPerformanceMeasure() {
  if (hasPatchedPerformance) return;
  if (typeof window === 'undefined') return;

  const perf = window.performance;
  if (!perf || typeof perf.measure !== 'function' || typeof perf.mark !== 'function') {
    return;
  }

  const originalMeasure = perf.measure.bind(perf);
  const getEntriesByName =
    typeof perf.getEntriesByName === 'function' ? perf.getEntriesByName.bind(perf) : null;

  perf.measure = (name, startMark, endMark) => {
    try {
      return originalMeasure(name, startMark, endMark);
    } catch (err) {
      const missingStartMark =
        startMark &&
        err instanceof DOMException &&
        err.name === 'SyntaxError' &&
        getEntriesByName &&
        getEntriesByName(startMark).length === 0;

      if (missingStartMark) {
        perf.mark(startMark);
        if (endMark && getEntriesByName && getEntriesByName(endMark).length === 0) {
          perf.mark(endMark);
        }
        return originalMeasure(name, startMark, endMark);
      }

      throw err;
    }
  };

  hasPatchedPerformance = true;
}

function MyApp({ Component, pageProps }) {
  useEffect(() => {
    patchPerformanceMeasure();
  }, []);

  return (
    <AuthProvider>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </AuthProvider>
  );
}

export default MyApp;
