import Video from '@api.video/nodejs-client/lib/model/Video';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';

import Link from 'next/link';
import { ChevronDown, ChevronUp } from 'react-feather';
import Providers from '../providers';
import { OptionalFeatureFlag, VideoSourceTableColumn } from '../providers/types';
import {
  callCreateApiVideoVideoApi,
  callGeneratePublicMp4Api, callGetImportableVideosApi, callGetImportsApi,
  callGetPublicMp4UrlApi
} from '../service/ClientApiHelpers';
import VideoSource, {
  EcryptedApiVideoAuthenticationContext, EncryptedProviderAuthenticationContext
} from '../types/common';
import { buildId, formatSize } from '../utils/functions';
import { getItem } from '../utils/functions/localStorageHelper';
import ImportCard from './commons/ImportCard';
import { useGlobalContext } from './context/Global';
import VideoSourceTable from './VideoSourceTable';

interface VideoSourceExtended extends VideoSource {
  alreadyImported: boolean;
}

const VideoSourceSelector: React.FC = () => {
  const [providerAuthenticationContext, setProviderAuthenticationContext] =
    useState<EncryptedProviderAuthenticationContext>();
  const [apiVideoAuthenticationContext, setApiVideoAuthenticationContext] =
    useState<EcryptedApiVideoAuthenticationContext>();
  const [videoSources, setVideoSources] = useState<VideoSourceExtended[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<VideoSourceTableColumn | null>();
  const [sortOrder, setSortOrder] = useState<1 | -1>(1);
  const [createdCount, setCreatedCount] = useState<number>(0);
  const [fetchingVideos, setFetchingVideos] = useState<boolean>(true);
  const [importId, _] = useState<string>(buildId(9));
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const { providerName, providerAuthenticationData, setVideos, setImportId } =
    useGlobalContext();
  const router = useRouter();

  const provider = Providers[providerName as keyof typeof Providers];

  useEffect(() => {
    if (!providerName || !providerAuthenticationData.encryptedAccessToken) {
      const pName = router.query.provider;
      pName && router.push(`/${pName}`);
    } else {
      const item = getItem('APIVIDEO');
      const encryptedApiKey = item?.encryptedKey || '';

      setProviderAuthenticationContext(providerAuthenticationData);
      setApiVideoAuthenticationContext({ encryptedApiKey });

      (async () => {
        const alreadyImported = await fetchAlreadyImportedVideos(encryptedApiKey);
        fetchVideos(providerAuthenticationData, alreadyImported);
      })();
    }
  }, [router, providerName]);

  const fetchAlreadyImportedVideos = async (apiVideoEncryptedKey: string) => {
    const previousImports = await callGetImportsApi({
      encryptedApiKey: apiVideoEncryptedKey,
      provider: providerName,
    });

    return previousImports.videos.reduce(
      (
        acc: { [key: string]: { videoId: string; size?: number } },
        current: Video
      ) => {
        const providerId = current.metadata?.find(
          (m) => m.key === 'x-apivideo-import-video-id'
        ) as any;
        const providerSize = current.metadata?.find(
          (m) => m.key === 'x-apivideo-import-video-size'
        ) as any;
        if (providerId) {
          if (!acc[providerId['value'] as string]) {
            acc[providerId['value'] as string] = {
              videoId: current.videoId,
              ...(providerSize ? { size: providerSize['value'] } : {}),
            };
          } else {
            acc[providerId['value'] as string].videoId = current.videoId;
            if(providerSize) {
              acc[providerId['value'] as string].size = providerSize['value'];
            }
          }
        }
        return acc;
      },
      {}
    );
  };

  const fetchVideos = async (
    providerAutenticationContext: EncryptedProviderAuthenticationContext,
    alreadyImported: { [key: string]: { videoId: string; size?: number } },
    videos: VideoSourceExtended[] = [],
    nextPageFetchDetails?: any
  ) => {
    try {
      const res = await callGetImportableVideosApi({
        authenticationContext: providerAutenticationContext,
        providerName: providerName,
        nextPageFetchDetails,
      });
      videos = videos.concat(
        res.data.map((video) => ({
          ...video,
          alreadyImported: alreadyImported[video.id] && (!alreadyImported[video.id]?.size || alreadyImported[video.id]?.size == video.size),
        }))
      );
      setVideoSources(sortVideos(videos, 1, null));
      setSelectedIds(
        videos.filter((v) => !v.alreadyImported).map((video) => video.id)
      );

      if (res.hasMore) {
        fetchVideos(
          providerAutenticationContext,
          alreadyImported,
          videos,
          res.nextPageFetchDetails
        );
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
      let arrSelected: string[] = [];
      videoSources
        .filter((v) => !v.alreadyImported)
        .map(({ id }) => {
          arrSelected.push(id);
        });
      setSelectedIds(arrSelected);
    }
  };



  const getSelectedVideos = (): VideoSourceExtended[] => {
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
            authenticationContext:
              providerAuthenticationContext as EncryptedProviderAuthenticationContext,
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
                authenticationContext:
                  providerAuthenticationContext as EncryptedProviderAuthenticationContext,
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
          encryptedApiKey: apiVideoAuthenticationContext?.encryptedApiKey!,
          importId,
          providerName,
          videoSource: video,
        })
      ).video;

      

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

    for(let i = 0; i < selectedVideos.length; i++) {
      const result = await createApiVideoVideo(selectedVideos[i]);
      if (result.result instanceof Error) {
        fails.push(result.source);
      } else {
        successes.push(result.result);
        setTimeout(() => setCreatedCount(i+1), 10);
      }
      await timeout(100);
    }
    
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

  const onSortClick = (column?: VideoSourceTableColumn) => {
    let newSortOrder = sortOrder;
    let newSortBy = sortBy;
    if ((!column && !sortBy) || sortBy?.attributeName === column?.attributeName) {
      newSortOrder = -sortOrder as 1 | -1;
    } else {
      newSortBy = column || null;
    }

    setVideoSources(sortVideos(videoSources, newSortOrder, newSortBy || null));

    setSortOrder(newSortOrder);
    setSortBy(newSortBy);
  };

  const sortVideos = (videos: VideoSourceExtended[], order: number, column: VideoSourceTableColumn | null): VideoSourceExtended[] => {
    return [...videos].sort((a, b) => {
      if (column) {
        return column.sortFunction(a, b, order);
      }
      return order * a.name.localeCompare(b.name)
    });
  }

  if (!fetchingVideos && (!videoSources || videoSources.length === 0)) {
    return (
      <ImportCard activeStep={3} paddingTop>
        <p>
          {`No videos could be found in the ${Providers[providerName]?.displayName} account you authenticated.`}
          <br />
          {`Make
          sure there is at least one video in your ${Providers[providerName]?.displayName} account.`}
          {Providers[providerName]?.providerErrorMessage ?? null}
          {` Alternatively,`}{' '}
          <a
            href={`/${providerName.toString().toLocaleLowerCase()}`}
            className={'text-blue-500 underline'}
          >
            go back to Step 2
          </a>{' '}
          {`and authenticate a different ${Providers[providerName]?.displayName}
          account.`}
        </p>
      </ImportCard>
    );
  }

  return (
    <ImportCard activeStep={3} paddingTop>
      {fetchingVideos ? (
        <p className="text-sm">
          {`Retrieving videos from ${Providers[providerName]?.displayName}
          ${videoSources.length} retrieved so far...`}
        </p>
      ) : (
        <>
          <div className="pb-8">
            <h1 className="text-left font-semibold">
              Select videos to import
            </h1>
            <p className="text-sm">
              Please select the videos you would like to import. Once you have
              made your selection, click the button below to start the import
              process.
            </p>
          </div>

          {!createdCount && (
            <>
              {videoSources
                .filter((video) => video.alreadyImported).length > 0 &&
                <>
                  {' '}
                  <div
                    onClick={() =>
                      setIsCollapsed((prevCollapse) => !prevCollapse)
                    }
                    className="cursor-pointer flex justify-between border-b border-slate-200 pb-2 mb-2 flex-wrap"
                  >
                    <h1 className="font-semibold flex align-middle gap-2">
                      {isCollapsed ? <ChevronDown /> : <ChevronUp />}
                      {`Already imported videos (${videoSources.filter((video) => video.alreadyImported)
                        .length
                        })`}
                    </h1>
                    <Link
                      href={'/imports'}
                      target="_blank"
                      className="rounded border border-slate-200 text-gray-500 font-semibold px-2"
                    >
                      View previous imports
                    </Link>
                  </div>
                  <VideoSourceTable
                    isCollapsed={isCollapsed}
                    onSortClick={onSortClick}
                    videoSourceTableSettings={provider.videoTableSettings}
                    videoSources={videoSources.filter((video) => video.alreadyImported)}
                  ></VideoSourceTable>
                </>
              }

              <h1 className="font-semibold border-b border-slate-200 pb-2 mb-2">{`New videos to import (${videoSources.filter((v) => !v.alreadyImported).length})`}</h1>
              <VideoSourceTable
                isCollapsed={false}
                onSortClick={onSortClick}
                videoSourceTableSettings={provider.videoTableSettings}
                videoSources={videoSources.filter((video) => !video.alreadyImported)}
                selection={{
                  toggleSelection,
                  selectedIds,
                  multiSelectionToggle
                }}
              ></VideoSourceTable>
            </>
          )}
          <button
            className="text-sm mt-4 font-semibold"
            disabled={selectedIds.length == 0 || loading || !!createdCount}
            onClick={() => {
              setLoading(true);
              createApiVideoVideos()
                .then((result) => {
                  setVideos(result.successes);
                  setImportId(importId);
                  router.push(
                    `/${providerName.toString().toLowerCase()}/${importId}`
                  );
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
    </ImportCard>
  );
};

export default VideoSourceSelector;
