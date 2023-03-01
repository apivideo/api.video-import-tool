import Quality from '@api.video/nodejs-client/lib/model/Quality';
import Video from '@api.video/nodejs-client/lib/model/Video';
import React, { useState } from 'react';
import { Check, Eye } from 'react-feather';
import { VideoWithStatus } from '../../service/ApiVideoService';
import { callGetVideosStatusApi } from '../../service/ClientApiHelpers';
import { beautifyVideoName, formatSize } from '../../utils/functions';
import { useInterval } from '../../utils/hooks';
import Thumbnail from './Thumbnail';

interface VideoImportTableProps {
  videos: Video[];
  apiVideoEncryptedKey: string;
}

const VideoImportTable: React.FC<VideoImportTableProps> = (props) => {
  const [videoWithStatus, setVideoWithStatus] = useState<VideoWithStatus[]>(
    props.videos
  );

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
      encryptedApiKey: props.apiVideoEncryptedKey,
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
    ingesting: 'bg-yellow-100 text-amber-700',
    encoded: 'bg-green-200 text-teal-700',
    uploaded: 'bg-green-200 text-teal-700',
    ingested: 'bg-green-200 text-teal-700',
    failed: 'bg-rose-200 text-rose-700',
  };

  const formatIngestStatus = (status: string) => {
    switch (status) {
      case 'ingesting':
        return 'uploading';
      case 'ingested':
        return 'uploaded';
      default:
        return status;
    }
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
        <div className="flex flex-col gap-2 md:grid grid-cols-[170px_1fr]">
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
              className={`${statusColors[`${video.status.ingest.status}`]
                } font-jetbrains font-medium p-1 rounded-md text-xs w-fit`}
            >
              {formatIngestStatus(video.status.ingest.status)}
            </div>
          ) : null}
        </div>
        <div className="flex flex-col gap-2 md:grid grid-cols-[170px_1fr]">
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
                <div className="flex gap-2 flex-wrap">
                  {hlsQualities.map((q, i) => (
                    <span
                      className={`${statusColors[`${q.status}`]
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
                      className={`${statusColors[`${q.status}`]
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
          <button className="bg-white text-sky-900 border border-slate-300 rounded-md lg:absolute right-0 text-sm p-1 font-semibold w-fit">
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

  const getFileSize = (video: VideoWithStatus) => {
    const sizeMetadata =
      video?.metadata &&
      video.metadata.find((mt) => mt.key === 'x-apivideo-import-video-size');
    return sizeMetadata && sizeMetadata?.value !== "undefined" && formatSize(Number(sizeMetadata?.value));
  };

  return (
    <table className="w-full mt-6">
      <thead className="border-b">
        <tr className="text-sm font-semibold pb-2">
          <th className="hidden lg:table-cell">Video</th>
          <th className="lg:hidden">Videos</th>
          <th className="hidden lg:table-cell">Progress</th>
        </tr>
      </thead>

      <tbody>
        {videoWithStatus?.length &&
          videoWithStatus.map((videoSource) => (
            <tr
              className="flex flex-col lg:table-row text-sm align-top font-semibold border-b border-slate-300 last:border-0"
              key={videoSource.videoId}
            >
              <td className="py-2.5 w-full lg:w-5/12">
                <div className="grid grid-cols-[110px_1fr_1fr]">
                  <div className="h-[75px] w-[100px]">
                    <Thumbnail
                      className="h-[75px] w-[100px] object-contain bg-black"
                      width={100}
                      height={75}
                      src={videoSource.assets?.thumbnail}
                      alt={videoSource.title as string} />
                  </div>
                  <span>{beautifyVideoName(videoSource.title || "")}</span>
                  <span>{getFileSize(videoSource)}</span>
                </div>
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
  );
};

export default VideoImportTable;
