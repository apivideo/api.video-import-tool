import Video from "@api.video/nodejs-client/lib/model/Video";
import Link from "next/link";
import { useRouter } from "next/router";
import { unparse } from 'papaparse';
import React, { useEffect, useRef, useState } from "react";
import { VideoWithStatus } from "../service/ApiVideoService";
import { callGetVideosStatusApi } from "../service/ClientApiHelpers";

interface ImportProgressProps {
  videos: Video[];
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
    }
    tick();
  }, [delay]);
}

const ImportProgress: React.FC<ImportProgressProps> = (props) => {
  const [videoWithStatus, setVideoWithStatus] = useState<VideoWithStatus[]>(props.videos);
  const statusesFetchIntervalRef = useRef<any>();
  const router = useRouter();

  const isNotTotallyEncoded = (v: VideoWithStatus) => {
    return !v?.status?.encoding?.qualities || v?.status?.encoding?.qualities.length == 0 || v?.status?.encoding?.qualities?.find(s => s.status !== "encoded");
  }

  useInterval(async () => {
    const notDoneVideos = videoWithStatus.filter(isNotTotallyEncoded);

    const res = await callGetVideosStatusApi({
      videos: notDoneVideos,
      apiKey: props.apiVideoApiKey
    });

    setVideoWithStatus([
      ...videoWithStatus.filter(v_1 => !(res.videos as VideoWithStatus[]).find(r => r.videoId == v_1.videoId)),
      ...res.videos
    ]);

    return res.videos.length == 0 || res.videos.filter(isNotTotallyEncoded).length > 0;
  }, 5000);

  const statusCellContent = (video: VideoWithStatus) => {
    if (!video.status?.ingest?.status) {
      return <>
        <p><span className={"icon loading"}></span>ingest</p>
        <p><span className={"icon loading"}></span>encoding</p>
      </>
    }
    const ingested = video.status?.ingest?.status && video.status?.ingest?.status as string !== "ingesting"
    const qualities = video.status?.encoding?.qualities?.filter(q => q.type === "hls") || [];
    const allQualitiesEncoded = qualities.length > 0 && !qualities.find(q => q.status !== "encoded");
    return <>
      <p><span className={"icon " + (ingested ? "done" : "loading")}></span>ingest</p>
      <p><span className={"icon " + (allQualitiesEncoded ? "done" : "loading")}></span>encoding {qualities.map(q => <span key={q.quality + (q.type || "")} className={q.status + " status"}>{q.quality}</span>)}</p>
    </>
  }

  const generateExportVideoItem = (video: VideoWithStatus) => {
    const metadata: { [key: string]: string } = {};
    video.metadata?.forEach(m => {
      if (m.key) metadata[m.key] = m.value || "";
    });
    return {
      [metadata["x-apivideo-migration-provider"] + "_id"]: metadata["x-apivideo-migration-video-id"],
      apivideo_id: video.videoId,
      size: metadata["x-apivideo-migration-video-size"],
      name: video.title,
      apivideo_url: video.assets?.player
    };
  }

  const download = (format: "json" | "csv") => {
    const mimeType = format === "json" ? "application/json" : "text/csv";
    const stringify = format === "json" ? JSON.stringify : unparse;

    var element = document.createElement('a');
    element.setAttribute('href', `data:${mimeType};charset=utf-8,` + encodeURIComponent(stringify(videoWithStatus.map(v => generateExportVideoItem(v)))));
    element.setAttribute('download', `api-video-migration-report.${format}`);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
  }

  return (
    <>
      <p className="explanation">Your videos have been created. You can now close this tab at any moment, even if the encoding isn&apos;t ended.</p>
      {router.pathname !== "/migrations" &&
        <p className="explanation">You&apos;ll be able to see this report again by going to the <Link href="/migrations">my migrations</Link> page </p>
      }
      <p className="explanation">You can download a report of your migration in the following format: <a href="#" onClick={() => download("csv")}>csv</a> or <a href="#" onClick={() => download("json")}>json</a>.</p>
      <table className="result">
        <thead>
          <tr>
            <th>Video</th>
            <th>Progress</th>
          </tr>
        </thead>
        <tbody>
          {videoWithStatus.sort((a, b) => a.title!.localeCompare(b.title!)).map(video =>
            <tr key={video.videoId}>
              <td>{video.status?.encoding?.playable ? <a target="_blank" rel="noreferrer" href={video.assets?.player}>{video.title}</a> : <>{video.title}</>}</td>
              <td className="status">{statusCellContent(video)}</td>
            </tr>
          )}
        </tbody>
      </table>
    </>
  );
}

export default ImportProgress;