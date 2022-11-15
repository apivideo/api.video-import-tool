import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import MigrationTool from '../components/MigrationTool';
import { ProviderName, Providers } from '../providers';

const Provider: NextPage = () => {
  const [providerName, setProviderName] = useState<ProviderName>();
  const router = useRouter();

  useEffect(() => {
    const providerName = (router.query.provider as string)?.toUpperCase();
    
    if (providerName) {
      if (Providers[providerName]) {
        setProviderName(providerName);
      } else {
        router.push("/");
      }
    }
  }, [router.query.provider, router]);
  
  return providerName
    ? <MigrationTool providerName={providerName} />
    : <div>Loading...</div>
}

export default Provider
