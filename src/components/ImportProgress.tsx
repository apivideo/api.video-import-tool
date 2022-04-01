import Video from "@api.video/nodejs-client/lib/model/Video";
import React, { useEffect, useRef, useState } from "react";
import { VideoWithStatus } from "../types/videoWithStatus";

interface ImportProgressProps {
  videos: Video[];
  apiVideoApiKey: string;
}

const ImportProgress: React.FC<ImportProgressProps> = (props) => {
  const [videoWithStatus, setVideoWithStatus] = useState<VideoWithStatus[]>(props.videos);
  const statusesFetchIntervalRef = useRef<any>();

  useEffect(() => {
    const id = setInterval(() => {
      const notDoneVideos = videoWithStatus.filter((v: VideoWithStatus) => !v?.status?.encoding?.qualities || v?.status?.encoding?.qualities.length == 0 || v?.status?.encoding?.qualities?.find(s => s.status !== "encoded"));

      if (notDoneVideos.length === 0) {
        clearInterval(statusesFetchIntervalRef.current);
        statusesFetchIntervalRef.current = undefined;
        return;
      }

      return fetch("/api/apivideo/status", {
        method: "POST",
        body: JSON.stringify({
          videos: notDoneVideos,
          apiKey: props.apiVideoApiKey
        })
      })
        .then(v => v.json())
        .then(res => setVideoWithStatus([
          ...videoWithStatus.filter(v => !(res.videos as VideoWithStatus[]).find(r => r.videoId == v.videoId)),
          ...res.videos
        ]));
    }, 5000);

    statusesFetchIntervalRef.current = id;

    return () => {
      clearInterval(statusesFetchIntervalRef.current);
    };
  });

  const statusCellContent = (video: VideoWithStatus) => {
    if(!video.status?.ingest?.status) {
      return <p><span className={"icon loading"}></span></p>
    }
    const ingested = video.status?.ingest?.status && video.status?.ingest?.status as string !== "ingesting"
    const qualities = video.status?.encoding?.qualities?.filter(q => q.type === "hls") || [];
    const allQualitiesEncoded = qualities.length > 0 && !qualities.find(q => q.status !== "encoded");
    return <>
      <p><span className={"icon " + (ingested ? "done" : "loading")}></span>ingest</p>
      <p><span className={"icon " + (allQualitiesEncoded ? "done" : "loading")}></span>encoding {qualities.map(q => <span key={q.quality+(q.type || "")} className={q.status + " status"}>{q.quality}</span>)}</p>
    </>
  }

  return (
    <>
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