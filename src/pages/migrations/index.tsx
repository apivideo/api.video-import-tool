import Video from '@api.video/nodejs-client/lib/model/Video';
import type { NextPage } from 'next';
import { useState } from 'react';
import { callGetMigrationsApi } from '../../service/ClientApiHelpers';
import MigrationInfo from '../../components/commons/MigrationInfo';
import { ProviderName } from '../../providers';
import MigrationCard from '../../components/commons/MigrationCard';
import { Migration } from '../../types/common';

const MigrationsHome: NextPage = () => {
  const [apiVideoApiKey, setApiVideoApiKey] = useState<string>();
  const [apiVideoErrorMessage, setApiVideoErrorMessage] = useState<string>('');
  const [noResults, setNoResults] = useState<string>('');
  const [migrations, setMigrations] = useState<Migration[]>();

  const getMigratedVideos = () => {
    apiVideoApiKey &&
      callGetMigrationsApi({ apiKey: apiVideoApiKey })
        .then((res) => {
          if (!res?.videos?.length) {
            setNoResults('No migrations were found for this API key.');
          } else {
            const migratedVideosByMigration: { [id: string]: Video[] } = {};
            res.videos.forEach((v) => {
              const id =
                v?.metadata?.find((v) => v.key === 'x-apivideo-migration-id')
                  ?.value || 'unknown';
              if (!migratedVideosByMigration[id]) {
                migratedVideosByMigration[id] = [];
              }
              migratedVideosByMigration[id].push(v);
            });

            const finalMigrations = Object.keys(migratedVideosByMigration).map(
              (migrationId): Migration => {
                return {
                  date: new Date(
                    migratedVideosByMigration[migrationId][0]
                      .createdAt! as unknown as string
                  ),
                  id: migrationId,
                  videos: migratedVideosByMigration[migrationId],
                  providerName: migratedVideosByMigration[
                    migrationId
                  ][0].metadata
                    ?.find((a) => a.key === 'x-apivideo-migration-provider')
                    ?.value?.toUpperCase() as ProviderName,
                };
              }
            );
            setMigrations(
              finalMigrations.sort(
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
    <MigrationCard hideDescription>
      <h1 className="text-left font-semibold pb-4">My migrations</h1>
      <div className="h-px w-full bg-slate-300"></div>
      <div className="flex flex-col lg:flex-row lg:items-start pt-8 gap-4">
        <div className="flex flex-col gap-2.5 lg:w-3/6">
          <h1 className="text-left font-semibold">
            Access previous migrations
          </h1>
          <p className="text-sm">
            If you have used this tool to migrate videos to your api.video
            project, you can retrieve previous migration reports thanks to
            metadata in your video library. Enter an API key to see previous
            migrations.
          </p>
        </div>
        <div className="flex flex-col lg:w-3/6">
          <div className="flex flex-col">
            <label htmlFor="apiVideoApiKey" className="pb-4">
              Enter your api.video API key
            </label>
            <input
              className={`h-10 ${
                apiVideoErrorMessage
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
            className={`mt-4 ${
              !apiVideoApiKey ? 'bg-slate-300' : 'bg-black'
            } text-sm font-semibold w-full`}
            disabled={!apiVideoApiKey}
            onClick={() => getMigratedVideos()}
          >
            See previous migrations
          </button>
        </div>
      </div>
      {migrations?.length ? (
        <div>
          {' '}
          <p className="text-sm pt-6">
            Your API key returned the following migrations.
          </p>
          <MigrationInfo migrations={migrations} allowLink showDate />
        </div>
      ) : null}
      {noResults ? <p className="text-sm pt-6">{noResults}</p> : null}
    </MigrationCard>
  );
};

export default MigrationsHome;