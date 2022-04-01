import React, { useState } from "react";
import VideoSource from "../types/videoSource";

interface VimeoLoginProps {
  onSubmit: (apiKey: string, sources: VideoSource[]) => void;
}

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

const VimeoLogin: React.FC<VimeoLoginProps> = (props) => {
  const [apiVideoApiKey, setApiVideoApiKey] = useState<string>("");
  const [vimeoAccessToken, setVimeoAccessToken] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [apiKeyErrorMessage, setApiKeyErrorMessage] = useState<string>("");
  const [vimeoTokenErrorMessage, setVimeoTokenErrorMessage] = useState<string>("");

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
    return callVimeoApi("https://api.vimeo.com" + (pageUrl || "/me/videos?per_page=1"))
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

  const verifyApiVideoApiKey = async (): Promise<string> => {
    if(apiVideoApiKey.trim() === "") {
      return "Please enter your api.video API key";
    }
    return fetch("/api/apivideo/verify-api-key", {
      method: "POST",
      body: JSON.stringify({
        apiKey: apiVideoApiKey
      })
    })
      .then((e) => e.status == 403 ? "Please verify your api key" : "")
  }


  const verifyVimeoToken = async (): Promise<string> => {
    if(vimeoAccessToken.trim() === "") {
      return "Please enter your Vimeo access token";
    }
    return callVimeoApi("https://api.vimeo.com/me").then(res => {
      if (res.error) {
        return "Your access token seems to be invalid";
      }
      if (res.account === "basic" || res.account === "plus") {
        return "Basic and Plus Vimeo account are not compatible with the migration tool";
      }
      return "";
    });

  }

  return (
    <>
      <div>
        <label htmlFor="apiVideoApiKey">Enter your api.video API key</label>
        <input className={apiKeyErrorMessage ? "error" : ""} id="apiVideoApiKey" type={"password"} value={apiVideoApiKey} onChange={(v) => setApiVideoApiKey(v.target.value)}></input>
        <p className="inputError">{apiKeyErrorMessage}&nbsp;</p>
      </div>
      <div>
        <label htmlFor="vimeoAccessToken">Enter your Vimeo access token <i><a target="_blank" href="/doc/generate-a-vimeo-access-token">how to generate your access token</a></i></label>
        <input className={vimeoTokenErrorMessage ? "error" : ""} id="vimeoAccessToken" type={"password"} value={vimeoAccessToken} onChange={(v) => setVimeoAccessToken(v.target.value)}></input>
        <p className="inputError">{vimeoTokenErrorMessage}&nbsp;</p>
      </div>
      
      <div>
        <button disabled={loading} onClick={async () => {
          setLoading(true);
          setApiKeyErrorMessage("");
          setVimeoTokenErrorMessage("");
          const [apiKeyError, vimeoTokenError] = await Promise.all([verifyApiVideoApiKey(), verifyVimeoToken()]);
          setApiKeyErrorMessage(apiKeyError);
          setVimeoTokenErrorMessage(vimeoTokenError);

          if (apiKeyError || vimeoTokenError) {
            setLoading(false);
          } else {
            fetchVimeoVideos().then((videos) => {
              props.onSubmit(apiVideoApiKey, videos);
              setLoading(false);
            });
          }
        }}>{loading ? "Please wait..." : "Authenticate"}</button>
      </div>
    </>
  );
}

export default VimeoLogin;