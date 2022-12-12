import Video from '@api.video/nodejs-client/lib/model/Video';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { unparse } from 'papaparse';
import React, { useEffect, useRef, useState } from 'react';
import { VideoWithStatus } from '../service/ApiVideoService';
import { callGetVideosStatusApi } from '../service/ClientApiHelpers';
import Image from 'next/image';
import { formatSize } from '../utils/functions';
import { Check, Eye } from 'react-feather';
import Quality from '@api.video/nodejs-client/lib/model/Quality';
import { ProviderName, Providers } from '../providers';
import MigrationInfo from './commons/MigrationInfo';
import { useInterval } from '../utils/hooks';
import VideoImportTable from './commons/VideoImportTable';

interface ImportProgressProps {
  videos: Video[];
  apiVideoApiKey: string;
  migrationId: string;
  providerName: ProviderName;
}

const ImportProgress: React.FC<ImportProgressProps> = (props) => {
  const router = useRouter();


  return (
    <>
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
      <MigrationInfo migrations={[{ id: props.migrationId, providerName: props.providerName, videos: props.videos, date: new Date() }]} />
      <VideoImportTable videos={props.videos} apiVideoApiKey={props.apiVideoApiKey} />
    </>
  );
};

export default ImportProgress;
