import Video from '@api.video/nodejs-client/lib/model/Video';
import type { NextPage } from 'next';
import { useEffect, useState } from 'react';
import { callGetImportApi } from '../../../service/ClientApiHelpers';
import { ArrowLeft } from 'react-feather';
import ImportInfo from '../../../components/commons/ImportInfo';
import { ProviderName } from '../../../providers';
import { useRouter } from 'next/router';
import ImportCard from '../../../components/commons/ImportCard';
import Link from 'next/link';
import VideoImportTable from '../../../components/commons/VideoImportTable';
import { Import } from '../../../types/common';

const ImportView: NextPage = () => {
  const [apiVideoApiKey, setApiVideoApiKey] = useState<string>();
  const [importsError, setImportsError] = useState<string>('');
  const [videos, setVideos] = useState<Video[]>([]);
  const [selectedImport, setSelectedImport] = useState<Import>();
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    const apiKey = sessionStorage.getItem('apiVideoApiKey') || '';
    setApiVideoApiKey(apiKey);
    if (router?.query?.importId) {
      const getImportedVideos = async (apiKey: string) => {
        const importId = router.query.importId as string;
        if (importId) {
          try {
            setLoading(true);
            await callGetImportApi({ apiKey, importId }).then((res) => {
              setVideos(res.videos);
              const video: Video = res.videos[0];
              const videoImport: Import = {
                date: new Date(video.createdAt! as unknown as string),
                id: router.query.importId as string,
                videos: res.videos,
                providerName: video.metadata
                  ?.find((a) => a.key === 'x-apivideo-import-provider')
                  ?.value?.toUpperCase() as ProviderName,
              };
              setSelectedImport(videoImport);
            });
            setLoading(false);
          } catch (err) {
            setImportsError(
              'Could not find imports for the requested Import-id.'
            );
            console.error(err);
          }
        }
      };
      getImportedVideos(apiKey);
    }
  }, [router]);

  return (
    <ImportCard hideDescription>
      <h1 className="text-left font-semibold pb-4">My imports</h1>
      <div className="h-px w-full bg-slate-300"></div>
      <Link
        className="flex gap-2 items-center text-sm pt-6"
        href={'/imports'}
      >
        <ArrowLeft size={16} strokeWidth={'.2rem'} />
        Back to my imports
      </Link>
      {selectedImport && (
        <ImportInfo imports={[selectedImport]} showDate />
      )}
      {!loading && videos?.length ? (
        <VideoImportTable
          videos={videos}
          apiVideoApiKey={apiVideoApiKey as string}
        />
      ) : null}
      {loading && (
        <div className="flex justify-center text-2xl mt-8">
          <span className="icon loading"></span>
        </div>
      )}
      {importsError && <p className="text-sm pt-8">{importsError}</p>}
    </ImportCard>
  );
};

export default ImportView;
