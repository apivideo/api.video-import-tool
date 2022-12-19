import '../../styles/globals.css';
import type { AppProps } from 'next/app';
import Layout from '../components/layout';
import { GlobalContextProvider } from '../components/context/Global';
import { GoogleAnalytics } from "nextjs-google-analytics";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <GlobalContextProvider>
    <Layout>
        <GoogleAnalytics trackPageViews={{ ignoreHashChange: true }} />
        <Component {...pageProps} />
    </Layout>
    </GlobalContextProvider>
  );
}

export default MyApp;
