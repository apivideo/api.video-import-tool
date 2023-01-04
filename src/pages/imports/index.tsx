import Video from '@api.video/nodejs-client/lib/model/Video';
import type { NextPage } from 'next';
import { useEffect, useState } from 'react';
import { callGetImportsApi } from '../../service/ClientApiHelpers';
import ImportInfo from '../../components/commons/ImportInfo';
import { ProviderName } from '../../providers';
import ImportCard from '../../components/commons/ImportCard';
import { Import } from '../../types/common';

const ImportsHome: NextPage = () => {
  const [apiVideoApiKey, setApiVideoApiKey] = useState<string>();
  const [apiVideoErrorMessage, setApiVideoErrorMessage] = useState<string>('');
  const [noResults, setNoResults] = useState<string>('');
  const [imports, setImports] = useState<Import[]>();
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const apiKey = sessionStorage.getItem('apiVideoApiKey');
    if (apiKey) {
      setApiVideoApiKey(apiVideoApiKey);
      getImportedVideos(apiKey);
    } else {
      setLoading(false);
    }
  }, []);

  const getImportedVideos = (apiKey: string) => {
    setLoading(true);
    setImports([]);
    apiKey &&
      callGetImportsApi({ apiKey })
        .then((res) => {
          if (!res?.videos?.length) {
            setLoading(false);
            setNoResults('No imports were found for this API key.');
          } else {
            const importedVideosByImport: { [id: string]: Video[] } = {};
            res.videos.forEach((v) => {
              const id =
                v?.metadata?.find((v) => v.key === 'x-apivideo-import-id')
                  ?.value || 'unknown';
              if (!importedVideosByImport[id]) {
                importedVideosByImport[id] = [];
              }
              importedVideosByImport[id].push(v);
            });

            const finalImports = Object.keys(importedVideosByImport).map(
              (importId): Import => {
                return {
                  date: new Date(
                    importedVideosByImport[importId][0]
                      .createdAt! as unknown as string
                  ),
                  id: importId,
                  videos: importedVideosByImport[importId],
                  providerName: importedVideosByImport[
                    importId
                  ][0].metadata
                    ?.find((a) => a.key === 'x-apivideo-import-provider')
                    ?.value?.toUpperCase() as ProviderName,
                };
              }
            );
            setLoading(false);
            setImports(
              finalImports.sort(
                (a, b) =>
                  new Date(b.date).getTime() - new Date(a.date).getTime()
              )
            );
          }
        })
        .catch((err) => {
          setApiVideoErrorMessage(err.message);
        });
  };

  return (
    <ImportCard hideDescription>
      <h1 className="text-left font-semibold pb-4">My imports</h1>
      <div className="h-px w-full bg-slate-300"></div>
      <div className="flex flex-col lg:flex-row lg:items-start pt-8 gap-4">
        <div className="flex flex-col gap-2.5 lg:w-3/6">
          <h1 className="text-left font-semibold">
            Access previous imports
          </h1>
          <p className="text-sm">
            If you have used this tool to import videos to your api.video
            project, you can retrieve previous import reports thanks to
            metadata in your video library. Enter an API key to see previous
            imports.
          </p>
        </div>
        <div className="flex flex-col lg:w-3/6">
          <div className="flex flex-col">
            <label htmlFor="apiVideoApiKey" className="pb-4">
              Enter your api.video API key
            </label>
            <input
              className={`h-10 ${apiVideoErrorMessage
                ? 'outline outline-red-500 outline-2'
                : 'outline outline-slate-300 rounded-lg shadow outline-1'
                }`}
              id="apiVideoApiKey"
              type={'password'}
              value={apiVideoApiKey}
              onChange={(v) => {
                setNoResults('');
                setApiVideoErrorMessage('');
                sessionStorage.setItem('apiVideoApiKey', v.target.value);
                setApiVideoApiKey(v.target.value);
              }}
            ></input>
            {apiVideoErrorMessage && (
              <p className="text-sm text-red-600 pt-2">
                {apiVideoErrorMessage}
              </p>
            )}
          </div>
          <button
            className={`mt-4 ${!apiVideoApiKey ? 'bg-slate-300' : 'bg-black'
              } text-sm font-semibold w-full`}
            disabled={!apiVideoApiKey}
            onClick={() => getImportedVideos(apiVideoApiKey!)}
          >
            See previous imports
          </button>
        </div>
      </div>
      {!loading && imports?.length ? (
        <div>
          {' '}
          <p className="text-sm pt-6">
            Your API key returned the following imports.
          </p>
          <ImportInfo imports={imports} allowLink showDate />
        </div>
      ) : null}
      {loading && (
        <div className="flex justify-center text-2xl mt-8">
          <span className="icon loading"></span>
        </div>
      )}
      {!loading && noResults ? (
        <p className="text-sm pt-6">{noResults}</p>
      ) : null}
    </ImportCard>
  );
};

export default ImportsHome;
