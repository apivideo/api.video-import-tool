import React, { useState } from "react";
import VideoSource from "../../types/videoSource";
import { ProviderLoginProps } from "./common";


interface VimeoVideo {
  uri: string;
  name: string;
  duration: number;
  files: {
    rendition: string;
    type: string;
    width: number;
    height: number;
    link: string;
    size: number;
  }[];
  pictures: {
    sizes: {
      width: number;
      height: number;
      link: string;
    }[];
  };
}

interface VimeoApiResult {
  data: VimeoVideo[];
  paging: {
    next?: string;
  }
}

const VimeoLogin: React.FC<ProviderLoginProps> = (props) => {
  const [vimeoAccessToken, setVimeoAccessToken] = useState<string>("");
  const [vimeoTokenErrorMessage, setVimeoTokenErrorMessage] = useState<string>("");

  React.useEffect(() => {
    props.validate.current = verifyVimeoToken;
    props.getVideos.current = fetchVimeoVideos;
  })

  const vimeoVideoToVideoSource = (vimeoVideo: VimeoVideo): VideoSource => {
    const bestSource = vimeoVideo.files
      .filter(f => f.type === "video/mp4")
      .sort((a, b) => b.height - a.height)[0];
    return {
      id: vimeoVideo.uri.split("/")[2],
      name: vimeoVideo.name,
      duration: vimeoVideo.duration,
      url: bestSource.link,
      size: bestSource.size,
      thumbnail: vimeoVideo.pictures.sizes[0].link
    };
  }

  const callVimeoApi = (url: string): Promise<any> => {
    const headers = new Headers();
    headers.append("Authorization", `bearer ${vimeoAccessToken}`);
    headers.append("Content-Type", "application/json");
    headers.append("Accept", "application/vnd.vimeo.*+json;version=3.4");

    return fetch(url, {
      method: "GET",
      headers,
    })
      .then((response) => response.json());

  }

  const fetchVimeoVideos = (pageUrl?: string, previousPages?: VideoSource[]): Promise<VideoSource[]> => {
    return callVimeoApi("https://api.vimeo.com" + (pageUrl || "/me/videos"))
      .then((result: VimeoApiResult) => {
        const allVideos = [
          ...(previousPages || []),
          ...result.data.map((v) => vimeoVideoToVideoSource(v))
        ];

        return !result.paging.next
          ? allVideos
          : fetchVimeoVideos(result.paging.next, allVideos);
      });
  }


  const verifyVimeoToken = async (): Promise<boolean> => {
    let error;
    if(vimeoAccessToken.trim() === "") {
      error = "Please enter your Vimeo access token";
    }
    error = await callVimeoApi("https://api.vimeo.com/me").then(res => {
      if (res.error) {
        return "Your access token seems to be invalid";
      }
      if (res.account === "basic" || res.account === "plus") {
        return "Basic and Plus Vimeo account are not compatible with the migration tool";
      }
      return undefined;
    });
    setVimeoTokenErrorMessage(error || "");
    return !error;
  }

  return (
    <>
      <div>
        <label htmlFor="vimeoAccessToken">Enter your Vimeo access token <i><a target="_blank" href="/doc/generate-a-vimeo-access-token">how to generate your access token</a></i></label>
        <input className={vimeoTokenErrorMessage ? "error" : ""} id="vimeoAccessToken" type={"password"} value={vimeoAccessToken} onChange={(v) => setVimeoAccessToken(v.target.value)}></input>
        <p className="inputError">{vimeoTokenErrorMessage}&nbsp;</p>
      </div>
    </>
  );
}

export default VimeoLogin;