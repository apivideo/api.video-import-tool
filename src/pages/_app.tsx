import '../../styles/globals.css';
import type { AppProps } from 'next/app';
import Layout from '../components/layout';
import { GlobalContextProvider } from '../components/context/Global';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <GlobalContextProvider>
    <Layout>
        <Component {...pageProps} />
    </Layout>
    </GlobalContextProvider>
  );
}

export default MyApp;
