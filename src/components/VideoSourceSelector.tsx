import PlayerThemeCreationPayload from "@api.video/nodejs-client/lib/model/PlayerThemeCreationPayload";
import Video from "@api.video/nodejs-client/lib/model/Video";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import VideoSource from "../types/videoSource";

interface VideoSourceSelectorProps {
  videoSources: VideoSource[];
  apiVideoApiKey: string;
  onSubmit: (videoSources: Video[]) => void;
}

const VideoSourceSelector: React.FC<VideoSourceSelectorProps> = (props) => {
  const [selectedIds, setSelectedIds] = useState<string[]>(props.videoSources.map(p => p.id));
  const [loading, setLoading] = useState<boolean>(false);

  const toggleSelection = (id: string) => {
    if (selectedIds.indexOf(id) === -1) {
      setSelectedIds([
        ...selectedIds,
        id
      ]);
    } else {
      setSelectedIds(selectedIds.filter(i => i !== id))
    }
  }

  const formatDuration = (durationSec: number) => {
    const seconds = durationSec % 60;
    const minutes = Math.floor(durationSec / 60) % 60;
    const hours = Math.floor(durationSec / 3600) % 3600;
    
    const twoDigits = (t: number) => t < 10 ? "0" + t : t;

    if(hours > 0) return `${hours}h ${twoDigits(minutes)}m ${twoDigits(seconds)}s`;
    if(minutes > 0) return `${minutes}m ${twoDigits(seconds)}s`;
    return `${twoDigits(seconds)}s`;
  }

  const createApiVideoVideos = (): Promise<Video[]> => {
    return fetch("/api/apivideo/video", {
      method: "POST",
      body: JSON.stringify({
        videoSources: props.videoSources.filter(a => selectedIds.indexOf(a.id) > -1),
        apiKey: props.apiVideoApiKey
      })
    })
      .then(v => v.json())
      .then(v => v.videos)
  }

  const getButtonLabel = () => {
    if (loading) return "Please wait...";
    if (selectedIds.length === 0) return "First select some videos to import";
    return `Import ${selectedIds.length} video${selectedIds.length > 1 ? "s" : ""}`;
  }

  if(!props.videoSources || props.videoSources.length === 0) {
    return <p>We found no video that can be imported :(</p>
  }

  return (
    <>
      <p className="explanation">Please select the videos you want to import using the check boxes. Once you have made your selection, click on the button at the bottom of the page to start the import.</p>
      <table>
        <thead>
          <tr>
            <th></th>
            <th colSpan={2}>Video</th>
            <th>Size</th>
            <th>Duration</th>
          </tr>
        </thead>
        <tbody>
          {props.videoSources.map(videoSource =>
            <tr key={videoSource.id}>
              <td><input type="checkbox" checked={selectedIds.indexOf(videoSource.id) !== -1} onChange={(a) => toggleSelection(videoSource.id)} /></td>
              <td>{ videoSource.thumbnail && <Image height="75px" width="100px" alt={videoSource.name} src={videoSource.thumbnail} />}</td>
              <td>{videoSource.name}</td>
              <td>{Math.round(videoSource.size / 1024 / 1024 * 100) / 100} MB</td>
              <td>{videoSource.duration && formatDuration(videoSource.duration)}</td>
            </tr>
          )}
        </tbody>
      </table>
      <button className="submitButton" disabled={selectedIds.length == 0 || loading} onClick={() => {
        setLoading(true);
        createApiVideoVideos().then(videos => {
          props.onSubmit(videos);
          setLoading(false);
        });
      }}>{getButtonLabel()}</button>
    </>
  );
}

export default VideoSourceSelector;