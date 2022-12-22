import Video from '@api.video/nodejs-client/lib/model/Video';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import Thumbnail from './commons/Thumbnail';

import { OptionalFeatureFlag, Providers } from '../providers';
import {
  callCreateApiVideoVideoApi,
  callGeneratePublicMp4Api,
  callGetImportableVideosApi,
  callGetPublicMp4UrlApi,
} from '../service/ClientApiHelpers';
import VideoSource, { AuthenticationContext, ProviderAuthenticationContext } from '../types/common';
import { buildId, formatSize } from '../utils/functions';
import MigrationCard from './commons/MigrationCard';
import { useGlobalContext } from './context/Global';



type ColumnName = 'name' | 'size' | 'duration';

const VideoSourceSelector: React.FC = () => {
  const [authenticationContext, setAuthenticationContext] =
    useState<AuthenticationContext>();
  const [videoSources, setVideoSources] = useState<VideoSource[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<ColumnName>('name');
  const [sortOrder, setSortOrder] = useState<1 | -1>(1);
  const [createdCount, setCreatedCount] = useState<number>(0);
  const [fetchingVideos, setFetchingVideos] = useState<boolean>(true);
  const [migrationId, _] = useState<string>(buildId(9));
  const { providerName, providerAccessToken, setVideos, setMigrationId } = useGlobalContext()
  const router = useRouter()

  useEffect(() => {
    if (!providerName || !providerAccessToken) {
      const pName = router.query.provider
      pName && router.push(`/${pName}`)
    } else {
      const apiVideoApiKey = sessionStorage.getItem('apiVideoApiKey') || ''
      const authenticationContext: AuthenticationContext = { apiVideoApiKey, providerAccessToken }
      setAuthenticationContext(authenticationContext)
      fetchVideos(authenticationContext);
    }
  }, [router, providerName]);


  const fetchVideos = async (
    authenticationContext: AuthenticationContext,
    videos: VideoSource[] = [],
    nextPageFetchDetails?: any
  ) => {
    try {
      const res = await callGetImportableVideosApi({
        authenticationContext,
        provider: providerName,
        nextPageFetchDetails,
      });
      videos = videos.concat(res.data);
      setVideoSources(videos);
      setSelectedIds(videos.map((video) => video.id));

      if (res.hasMore) {
        fetchVideos(authenticationContext, videos, res.nextPageFetchDetails);
      } else {
        setFetchingVideos(false);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const toggleSelection = (id: string) => {
    if (selectedIds.indexOf(id) === -1) {
      setSelectedIds([...selectedIds, id]);
    } else {
      setSelectedIds(selectedIds.filter((i) => i !== id));
    }
  };


  const multiSelectionToggle = () => {
    if (selectedIds.length) {
      setSelectedIds([]);
    } else {
      let arrSelected: string[] = []
      videoSources.map(({ id }) => {
        arrSelected.push(id)

      })
      setSelectedIds(arrSelected)
    }

  };

  const formatDuration = (durationSec: number) => {
    const seconds = Math.round((durationSec % 60) * 100) / 100;
    const minutes = Math.floor(durationSec / 60) % 60;
    const hours = Math.floor(durationSec / 3600) % 3600;

    const twoDigits = (t: number) => (t < 10 ? '0' + t : t);

    if (hours > 0)
      return `${hours}h ${twoDigits(minutes)}m ${twoDigits(seconds)}s`;
    if (minutes > 0) return `${minutes}m ${twoDigits(seconds)}s`;
    return `${twoDigits(seconds)}s`;
  };

  const getSelectedVideos = (): VideoSource[] => {
    return videoSources.filter((a) => selectedIds.indexOf(a.id) > -1);
  };

  const timeout = async (ms: number) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
  };

  const createApiVideoVideo = async (
    video: VideoSource
  ): Promise<{ result: Video | Error; source: VideoSource }> => {
    try {
      if (
        Providers[providerName].hasFeature(
          OptionalFeatureFlag.GeneratePublicMp4UrlBeforeVideoCreation
        )
      ) {
        video = (
          await callGeneratePublicMp4Api({
            providerName,
            authenticationContext: authenticationContext as ProviderAuthenticationContext,
            video: video,
          })
        ).video;
      }

      if (
        Providers[providerName].hasFeature(
          OptionalFeatureFlag.WaitForPublicMp4Availibility
        )
      ) {
        while (true) {
          const url =
            (
              await callGetPublicMp4UrlApi({
                authenticationContext: authenticationContext as ProviderAuthenticationContext,
                provider: providerName,
                video: video,
              })
            ).video?.url || null;
          if (url) {
            video.url = url;
            break;
          }
          await timeout(5000);
        }
      }

      const res = (
        await callCreateApiVideoVideoApi({
          apiKey: authenticationContext?.apiVideoApiKey as string,
          migrationId,
          providerName,
          videoSource: video,
        })
      ).video;

      setCreatedCount(createdCount + 1);

      return {
        result: res,
        source: video,
      };
    } catch (e: any) {
      return {
        result: e,
        source: video,
      };
    }
  };

  const createApiVideoVideos = async (): Promise<{
    successes: Video[];
    fails: VideoSource[];
  }> => {
    const selectedVideos = getSelectedVideos();
    const successes: Video[] = [];
    const fails: VideoSource[] = [];

    const results = await Promise.all(
      selectedVideos.map((selectedVideo) => createApiVideoVideo(selectedVideo))
    );

    results.forEach((result, index) => {
      if (result.result instanceof Error) {
        fails.push(result.source);
      } else {
        successes.push(result.result);
      }
    });

    return {
      successes,
      fails,
    };
  };

  const getButtonLabel = () => {
    if (createdCount)
      return `Please wait... ${createdCount} / ${selectedIds.length} videos created`;
    if (loading) return `Please wait...`;
    if (selectedIds.length === 0) return 'First select some videos to import';
    const selectedVideosSize =
      getSelectedVideos()
        .map((v) => v.size)
        .reduce((partialSum, a) => (partialSum || 0) + (a || 0), 0) || 0;
    return (
      `Import ${selectedIds.length} video${selectedIds.length > 1 ? 's' : ''}` +
      (selectedVideosSize > 0 ? ` (${formatSize(selectedVideosSize)})` : '')
    );
  };

  const onSortClick = (column: ColumnName) => {
    if (sortBy === column) {
      setSortOrder(-sortOrder as 1 | -1);
    } else {
      setSortBy(column);
    }
  };

  const compareFn = (a: VideoSource, b: VideoSource): number => {
    switch (sortBy) {
      case 'name':
        return sortOrder * a.name.localeCompare(b.name);
      case 'duration':
        return sortOrder * ((a.duration || 0) - (b.duration || 0));
      case 'size':
        return sortOrder * ((a.size || 0) - (b.size || 0));
    }
  };

  if (!fetchingVideos && (!videoSources || videoSources.length === 0)) {
    return <MigrationCard activeStep={3} paddingTop><p>We found no videos that can be imported :(</p></MigrationCard >;
  }

  const hasDurations = !!videoSources.find((v) => !!v.duration);
  const hasSizes = !!videoSources.find((v) => !!v.size);

  return (
    <MigrationCard activeStep={3} paddingTop>
      {fetchingVideos ? (
        <p className="text-sm">
          {`Retrieving videos from ${Providers[providerName]?.displayName}
          ${videoSources.length} retrieved so far...`}
        </p>
      ) : (
        <>
          <div className="pb-2">
            <h1 className="text-left font-semibold">
              Select videos to migrate
            </h1>
            <p className="text-sm">
              Please select the videos you would like to import. Once you have
              made your selection, click the button below to start the import
              process.
            </p>
          </div>

          {!createdCount && (
            <table className="w-full">
              <thead className="border-b">
                <tr className="text-sm font-semibold pb-2">
                  <th colSpan={2}>
                    <div className="flex gap-2 items-center">
                      <input
                        className="h-4 w-4 cursor-pointer"
                        type="checkbox"
                        checked={videoSources.length === selectedIds.length}
                        onChange={() => multiSelectionToggle()
                        }
                      />
                      <a href="#" className="hidden md:block" onClick={() => onSortClick('name')}>
                        Video
                      </a>
                      <a href="#" className="block md:hidden" onClick={() => onSortClick('name')}>
                        Select all
                      </a>
                    </div>
                  </th>
                  {hasSizes && (
                    <th className="hidden md:block">
                      <a href="#" onClick={() => onSortClick('size')}>
                        Size
                      </a>
                    </th>
                  )}
                  {hasDurations && (
                    <th className="hidden md:table-cell">
                      <a href="#" onClick={() => onSortClick('duration')}>
                        Duration
                      </a>
                    </th>
                  )}
                </tr>
              </thead>

              <tbody>
                {videoSources
                  .sort((a, b) => compareFn(a, b))
                  .map((videoSource, i) => (
                    <tr
                      className="text-sm align-top font-semibold border-b border-slate-300 cursor-pointer last:border-0"
                      key={`${videoSource.id}${i}`}
                      onClick={() => toggleSelection(videoSource.id)}
                    >
                      <td className="w-6 pt-2.5">
                        <input
                          type="checkbox"
                          className="h-4 w-4 cursor-pointer"
                          checked={selectedIds.indexOf(videoSource.id) !== -1}
                          onChange={(a) => toggleSelection(videoSource.id)}
                        />
                      </td>
                      <td className="py-2.5 md:w-6/12">
                        <div className="flex flex-col md:flex-row gap-2">
                          <Thumbnail
                            className="h-[75px] w-[100px] object-contain bg-black"
                            width={100}
                            height={75}
                            src={videoSource.thumbnail}
                            alt={videoSource.name} />

                          {videoSource.name}
                          {videoSource.size && (
                            <span className="block md:hidden">{formatSize(videoSource.size)}</span>
                          )}
                          {hasDurations && (
                            <span className="block md:hidden">
                              {videoSource.duration &&
                                formatDuration(videoSource.duration)}
                            </span>
                          )}
                        </div>
                      </td>

                      {videoSource.size && (
                        <td className="py-2.5 hidden md:table-cell">{formatSize(videoSource.size)}</td>
                      )}
                      {hasDurations && (
                        <td className="py-2.5 hidden md:table-cell">
                          {videoSource.duration &&
                            formatDuration(videoSource.duration)}
                        </td>
                      )}

                    </tr>
                  ))}
              </tbody>
            </table>
          )}
          <button
            className="text-sm mt-4 font-semibold"
            disabled={selectedIds.length == 0 || loading || !!createdCount}
            onClick={() => {
              setLoading(true);
              createApiVideoVideos()
                .then((result) => {
                  setVideos(result.successes)
                  setMigrationId(migrationId)
                  router.push(`/${providerName.toString().toLowerCase()}/${migrationId}`)
                  // TODO manage video creation fails in result.failed
                })
                .catch((e) => {
                  alert('Video creation failed.');
                  setLoading(false);
                });
            }}
          >
            {getButtonLabel()}
          </button>
        </>
      )}
    </MigrationCard>
  );
};

export default VideoSourceSelector;
