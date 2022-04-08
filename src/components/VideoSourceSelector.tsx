import PlayerThemeCreationPayload from "@api.video/nodejs-client/lib/model/PlayerThemeCreationPayload";
import Video from "@api.video/nodejs-client/lib/model/Video";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import VideoSource from "../types/videoSource";

interface VideoSourceSelectorProps {
  videoSources: VideoSource[];
  apiVideoApiKey: string;
  migrationId: string;
  providerName: string;
  onSubmit: (videoSources: Video[]) => void;
}

type ColumnName = "name" | "size" | "duration";

const VideoSourceSelector: React.FC<VideoSourceSelectorProps> = (props) => {
  const [selectedIds, setSelectedIds] = useState<string[]>(props.videoSources.map(p => p.id));
  const [loading, setLoading] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<ColumnName>("name");
  const [sortOrder, setSortOrder] = useState<1 | -1>(1);
  const [createdCount, setCreatedCount] = useState<number | undefined>();

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

    if (hours > 0) return `${hours}h ${twoDigits(minutes)}m ${twoDigits(seconds)}s`;
    if (minutes > 0) return `${minutes}m ${twoDigits(seconds)}s`;
    return `${twoDigits(seconds)}s`;
  }

  const formatSize = (size: number) => {
    return (Math.round(size / 1024 / 1024 * 100) / 100) + " MB";
  }

  const getSelectedVideos = (): VideoSource[] => {
    return props.videoSources.filter(a => selectedIds.indexOf(a.id) > -1);
  }

  const createApiVideoVideos = async (): Promise<{successes: Video[], fails: VideoSource[]}> => {
    const selectedVideos = getSelectedVideos();
    const successes: Video[] = [];
    const fails: VideoSource[] = [];

    for (let selectedVideo of selectedVideos) {

      await fetch("/api/apivideo/create-video", {
        method: "POST",
        body: JSON.stringify({
          apiKey: props.apiVideoApiKey,
          migrationId: props.migrationId,
          provider: props.providerName,
          videoSource: selectedVideo,
        })
      })
        .then(response => {
          if (!response.ok) {
            fails.push(selectedVideo)
          }
          response.json().then(v => successes.push(v))
        });

      setCreatedCount(successes.length);
    }

    return {successes, fails};
  }

  const getButtonLabel = () => {
    if (createdCount) return `Please wait... ${createdCount} / ${selectedIds.length} videos created`;
    if (loading) return `Please wait...`;
    if (selectedIds.length === 0) return "First select some videos to import";
    const selectedVideosSize = getSelectedVideos().map(v => v.size).reduce((partialSum, a) => partialSum + a, 0);
    return `Import ${selectedIds.length} video${selectedIds.length > 1 ? "s" : ""} (${formatSize(selectedVideosSize)})`;
  }

  const onSortClick = (column: ColumnName) => {
    if (sortBy === column) {
      setSortOrder(-sortOrder as 1 | -1);
    } else {
      setSortBy(column);
    }
  }

  const compareFn = (a: VideoSource, b: VideoSource): number => {
    switch (sortBy) {
      case "name":
        return sortOrder * a.name.localeCompare(b.name);
      case "duration":
        return sortOrder * ((a.duration || 0) - (b.duration || 0));
      case "size":
        return sortOrder * ((a.size || 0) - (b.size || 0))
    }
  }

  if (!props.videoSources || props.videoSources.length === 0) {
    return <p>We found no video that can be imported :(</p>
  }


  return (
    <>
      <p className="explanation">Please select the videos you want to import using the check boxes. Once you have made your selection, click on the button at the bottom of the page to start the import.</p>
      {!createdCount && <table>
        <thead>
          <tr>
            <th></th>
            <th colSpan={2}><a href="#" className={sortBy === "name" ? "current" : ""} onClick={() => onSortClick("name")}>Video</a></th>
            <th><a href="#" className={sortBy === "size" ? "current" : ""} onClick={() => onSortClick("size")}>Size</a></th>
            <th><a href="#" className={sortBy === "duration" ? "current" : ""} onClick={() => onSortClick("duration")}>Duration</a></th>
          </tr>
        </thead>
        <tbody>
          {props.videoSources.sort((a, b) => compareFn(a, b)).map(videoSource =>
            <tr key={videoSource.id} onClick={() => toggleSelection(videoSource.id)}>
              <td><input type="checkbox" checked={selectedIds.indexOf(videoSource.id) !== -1} onChange={(a) => toggleSelection(videoSource.id)} /></td>
              <td>{videoSource.thumbnail && <Image height="75px" width="100px" alt={videoSource.name} src={videoSource.thumbnail} />}</td>
              <td>{videoSource.name}</td>
              <td>{formatSize(videoSource.size)}</td>
              <td>{videoSource.duration && formatDuration(videoSource.duration)}</td>
            </tr>
          )}
        </tbody>
      </table>}
      <button className="submitButton" disabled={selectedIds.length == 0 || loading || !!createdCount} onClick={() => {
        setLoading(true);
        createApiVideoVideos().then(result => {
          // TODO manage video creation fails in result.failed
          props.onSubmit(result.successes);
        }).catch((e) => {
          alert("Video creation failed.");
          setLoading(false);
        });
      }}>{getButtonLabel()}</button>
    </>
  );
}

export default VideoSourceSelector;