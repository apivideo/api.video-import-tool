import Video from '@api.video/nodejs-client/lib/model/Video';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { unparse } from 'papaparse';
import React, { useEffect, useRef, useState } from 'react';
import { VideoWithStatus } from '../service/ApiVideoService';
import { callGetVideosStatusApi } from '../service/ClientApiHelpers';
import Image from 'next/image';
import { formatSize } from '../utils/functions';
import VideoSource from '../types/common';
import { Check, Eye } from 'react-feather';
import Quality from '@api.video/nodejs-client/lib/model/Quality';

interface ImportProgressProps {
  videos: Video[];
  sourceVideos: VideoSource[];
  apiVideoApiKey: string;
}

const useInterval = (callback: () => Promise<boolean>, delay: number) => {
  const savedCallback = useRef<() => Promise<boolean>>();

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    const tick = async () => {
      if (savedCallback.current) {
        if (await savedCallback.current()) {
          setTimeout(() => tick(), delay);
        }
      }
    };
    tick();
  }, [delay]);
};

const ImportProgress: React.FC<ImportProgressProps> = (props) => {
  const [videoWithStatus, setVideoWithStatus] = useState<VideoWithStatus[]>(
    props.videos
  );
  const statusesFetchIntervalRef = useRef<any>();
  const router = useRouter();
  const isNotTotallyEncoded = (v: VideoWithStatus) => {
    return (
      !v?.status?.encoding?.qualities ||
      v?.status?.encoding?.qualities.length == 0 ||
      v?.status?.encoding?.qualities?.find((s) => s.status !== 'encoded')
    );
  };

  useInterval(async () => {
    const notDoneVideos = videoWithStatus.filter(isNotTotallyEncoded);

    const res = await callGetVideosStatusApi({
      videos: notDoneVideos,
      apiKey: props.apiVideoApiKey,
    });

    setVideoWithStatus([
      ...videoWithStatus.filter(
        (v_1) =>
          !(res.videos as VideoWithStatus[]).find(
            (r) => r.videoId == v_1.videoId
          )
      ),
      ...res.videos,
    ]);

    return (
      res.videos.length == 0 ||
      res.videos.filter(isNotTotallyEncoded).length > 0
    );
  }, 5000);

  const statusColors: { [key: string]: string } = {
    waiting: 'bg-slate-200 text-slate-500',
    missing: 'bg-slate-200 text-slate-500',
    encoding: 'bg-yellow-100 text-amber-700',
    uploading: 'bg-yellow-100 text-amber-700',
    encoded: 'bg-green-200 text-teal-700',
    uploaded: 'bg-green-200 text-teal-700',
    ingested: 'bg-green-200 text-teal-700',
    failed: 'bg-rose-200 text-rose-700',
  };

  const statusCellContent = (video: VideoWithStatus) => {
    const ingested =
      video.status?.ingest?.status &&
      (video.status?.ingest?.status as string) !== 'ingesting';
    const qualities: Quality[] | undefined = video.status?.encoding?.qualities;
    const hlsQualities = qualities?.filter((q) => q.type === 'hls');
    const mp4Qualities = qualities?.filter((q) => q.type === 'mp4');
    const allQualitiesEncoded =
      qualities &&
      qualities?.length > 0 &&
      !qualities?.find((q) => q.status !== 'encoded');
    const isPlayable = video.status?.encoding?.playable;
    return (
      <div className="pl-4 flex flex-col gap-4 relative">
        <div className="grid grid-cols-[170px_1fr]">
          <div className="flex gap-2 items-start">
            {ingested ? (
              <Check color={'#10B981'} size={18} strokeWidth={'.2rem'} />
            ) : (
              <span className={'icon loading'}></span>
            )}
            Ingest status
          </div>
          {video.status?.ingest?.status ? (
            <div
              className={`${
                statusColors[`${video.status.ingest.status}`]
              } font-jetbrains font-medium p-1 rounded-md text-xs w-fit`}
            >
              {video.status.ingest.status}
            </div>
          ) : null}
        </div>
        <div className="grid grid-cols-[170px_1fr]">
          <div className="flex gap-2 items-start">
            {allQualitiesEncoded ? (
              <Check color={'#10B981'} size={18} strokeWidth={'.2rem'} />
            ) : (
              <span className={'icon loading'}></span>
            )}
            Encoding qualities
          </div>
          <div className="font-jetbrains flex flex-col gap-2">
            {hlsQualities?.length ? (
              <div className="flex gap-2">
                <div className="text-sky-900">HLS:</div>
                <div className="flex gap-2">
                  {hlsQualities.map((q, i) => (
                    <span
                      className={`${
                        statusColors[`${q.status}`]
                      } font-medium p-1 rounded-md text-xs`}
                      key={`hls-${i}`}
                    >
                      {q.quality}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}

            {mp4Qualities?.length ? (
              <div className="flex gap-2">
                <div className="text-sky-900">MP4:</div>
                <div className="flex gap-2">
                  {mp4Qualities.map((q, i) => (
                    <span
                      className={`${
                        statusColors[`${q.status}`]
                      } font-medium p-1 rounded-md text-xs`}
                      key={`mp4-${i}`}
                    >
                      {q.quality}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </div>
        {isPlayable ? (
          <button className="bg-white text-sky-900 border border-slate-300 rounded-md absolute right-0 text-sm p-1 font-semibold">
            <a
              href={video.assets?.player}
              target="_blank"
              rel="noreferrer"
              className="flex gap-1 items-center"
            >
              <Eye size={16} strokeWidth={'.2rem'} />
              View video
            </a>
          </button>
        ) : null}
      </div>
    );
  };

  const generateExportVideoItem = (video: VideoWithStatus) => {
    const metadata: { [key: string]: string } = {};
    video.metadata?.forEach((m) => {
      if (m.key) metadata[m.key] = m.value || '';
    });
    return {
      [metadata['x-apivideo-migration-provider'] + '_id']:
        metadata['x-apivideo-migration-video-id'],
      apivideo_id: video.videoId,
      size: metadata['x-apivideo-migration-video-size'],
      name: video.title,
      apivideo_url: video.assets?.player,
    };
  };

  const download = (format: 'json' | 'csv') => {
    const mimeType = format === 'json' ? 'application/json' : 'text/csv';
    const stringify = format === 'json' ? JSON.stringify : unparse;

    var element = document.createElement('a');
    element.setAttribute(
      'href',
      `data:${mimeType};charset=utf-8,` +
        encodeURIComponent(
          stringify(videoWithStatus.map((v) => generateExportVideoItem(v)))
        )
    );
    element.setAttribute('download', `api-video-migration-report.${format}`);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
  };

  const getFileSize = (video: VideoWithStatus) => {
    const sizeMetadata =
      video?.metadata &&
      video.metadata.find((mt) => mt.key === 'x-apivideo-migration-video-size');
    return sizeMetadata && formatSize(Number(sizeMetadata?.value));
  };

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
        <p className="explanation">
          You can download a report of your migration in the following formats:{' '}
          <a
            href="#"
            className="text-blue-500 underline"
            onClick={() => download('csv')}
          >
            csv
          </a>{' '}
          or{' '}
          <a
            href="#"
            className="text-blue-500 underline"
            onClick={() => download('json')}
          >
            json
          </a>
          .
        </p>
      </div>

      <table className="w-full mt-6">
        <thead className="border-b">
          <tr className="text-sm font-semibold pb-2">
            <th>Video</th>
            <th>Progress</th>
          </tr>
        </thead>

        <tbody>
          {videoWithStatus
            // .sort((a, b) => compareFn(a, b))
            .map((videoSource) => (
              <tr
                className="text-sm align-top font-semibold border-b border-slate-300 last:border-0"
                key={videoSource.videoId}
              >
                <td className="py-2.5 w-5/12">
                  {videoSource.assets?.thumbnail && (
                    <div className="grid grid-cols-[110px_1fr_1fr]">
                      {videoSource.assets?.thumbnail.startsWith('data') ? (
                        <img
                          height="75px"
                          width="100px"
                          src={videoSource.assets?.thumbnail}
                          alt={videoSource.title}
                        />
                      ) : (
                        <Image
                          height="75"
                          width="100"
                          alt={videoSource.title as string}
                          src={videoSource.assets?.thumbnail}
                        />
                      )}
                      <span>{videoSource.title}</span>
                      <span>{getFileSize(videoSource)}</span>
                    </div>
                  )}
                </td>
                <td className="py-2.5 font-medium">
                  <div className="border-l border-slate-300">
                    {statusCellContent(videoSource)}
                  </div>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </>
  );
};

export default ImportProgress;
