import Video from '@api.video/nodejs-client/lib/model/Video';
import type { NextPage } from 'next';
import { useEffect, useState } from 'react';
import { callGetMigrationApi } from '../../../service/ClientApiHelpers';
import { ArrowLeft } from 'react-feather';
import MigrationInfo from '../../../components/commons/MigrationInfo';
import { ProviderName } from '../../../providers';
import { useRouter } from 'next/router';
import MigrationCard from '../../../components/commons/MigrationCard';
import Link from 'next/link';
import VideoImportTable from '../../../components/commons/VideoImportTable';
import { Migration } from '../../../types/common';

const MigrationView: NextPage = () => {
  const [apiVideoApiKey, setApiVideoApiKey] = useState<string>();

  const [videos, setVideos] = useState<Video[]>([]);
  const [selectedMigration, setSelectedMigration] = useState<Migration>();
  const router = useRouter();

  useEffect(() => {
    const apiKey = sessionStorage.getItem('apiVideoApiKey') || '';
    setApiVideoApiKey(apiKey);
    if (router?.query?.migrationId) {
      const getMigratedVideos = async (apiKey: string) => {
        const migrationId = router.query.migrationId as string;

        if (migrationId) {
          await callGetMigrationApi({ apiKey, migrationId }).then((res) => {
            setVideos(res.videos);
            const video: Video = res.videos[0];
            const videoMigration: Migration = {
              date: new Date(video.createdAt! as unknown as string),
              id: router.query.migrationId as string,
              videos: res.videos,
              providerName: video.metadata
                ?.find((a) => a.key === 'x-apivideo-migration-provider')
                ?.value?.toUpperCase() as ProviderName,
            };
            setSelectedMigration(videoMigration);
          });
        }
      };
      getMigratedVideos(apiKey);
    }
  }, [router]);

  return (
    <MigrationCard hideDescription>
      <h1 className="text-left font-semibold pb-4">My migrations</h1>
      <div className="h-px w-full bg-slate-300"></div>
      <Link
        className="flex gap-2 items-center text-sm pt-6"
        href={'/migrations'}
      >
        <ArrowLeft size={16} strokeWidth={'.2rem'} />
        Back to my migrations
      </Link>
      {selectedMigration && <MigrationInfo migrations={[selectedMigration]} showDate />}
      {videos?.length ? (
        <VideoImportTable
          videos={videos}
          apiVideoApiKey={apiVideoApiKey as string}
        />
      ) : null}
    </MigrationCard>
  );
};

export default MigrationView;
