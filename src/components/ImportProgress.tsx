import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import MigrationInfo from './commons/MigrationInfo';
import VideoImportTable from './commons/VideoImportTable';
import MigrationCard from './commons/MigrationCard';
import { useGlobalContext } from './context/Global';

const ImportProgress: React.FC = () => {
  const [apiVideoApiKey, setApiVideoApiKey] = useState('')
  const router = useRouter();
  const { videos, migrationId, providerName } = useGlobalContext()

  useEffect(() => {
    const apiKey = sessionStorage.getItem('apiVideoApiKey') || ''
    setApiVideoApiKey(apiKey)
    if (!migrationId) {
      const mId = router.query.migrationId
      router.push(`/migrations/${mId}`)
    }
  }, [router, migrationId])

  return (
    <MigrationCard activeStep={4} paddingTop>
      <div className="text-sm flex flex-col gap-4">
        <p>
          Your videos have been created. You can close this tab at any moment,
          even if the encoding hasn’t ended yet.
        </p>
        {router.pathname !== '/migrations' && (
          <p>
            You’ll be able to see this report again by visiting the{' '}
            <Link href="/migrations" className="text-blue-500 underline">
              my migrations
            </Link>{' '}
            page.
          </p>
        )}
      </div>
      {videos?.length && migrationId && apiVideoApiKey && <>
        <MigrationInfo migrations={[{ id: migrationId, providerName: providerName, videos: videos, date: new Date() }]} />
        <VideoImportTable videos={videos} apiVideoApiKey={apiVideoApiKey} />
      </>}

    </MigrationCard>
  );
};

export default ImportProgress;
