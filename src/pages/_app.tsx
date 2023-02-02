import { Auth0Provider } from '@auth0/auth0-react';
import type { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import '../../styles/globals.css';
import { GlobalContextProvider } from '../components/context/Global';
import Layout from '../components/layout';
import { AUTH0_CLIENT_ID, AUTH0_DOMAIN } from '../env';
import * as gtag from '../utils/google-analytics';

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter()

  useEffect(() => {
    const handleRouteChange = (url: URL) => {
      gtag.pageview(url)
    }
    router.events.on('routeChangeComplete', handleRouteChange)
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange)
    }
  }, [router.events])

  return ( 
    <Auth0Provider
      domain={AUTH0_DOMAIN}
      clientId={AUTH0_CLIENT_ID}
    >
      <GlobalContextProvider>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </GlobalContextProvider>
    </Auth0Provider>
  );
}

export default MyApp;
