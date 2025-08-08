// src/pages/_app.js
import '../styles/globals.css';
import Layout from '../components/layout/Layout';
import { AuthProvider } from '../contexts/AuthContext';

function MyApp({ Component, pageProps }) {
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