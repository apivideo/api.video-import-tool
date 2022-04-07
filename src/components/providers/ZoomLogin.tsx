import { useRouter } from "next/router";
import React, { useState } from "react";
import { ZOOM_REDIRECT_URL } from "../../pages/api/zoom/common";
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

const ZoomLogin: React.FC<ProviderLoginProps> = (props) => {
  const [zoomAccessToken, setZoomAccessToken] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const router = useRouter()

  React.useEffect(() => {
    props.validate.current = validate;
    props.getVideos.current = getVideos;

    if (router.query.code) {
      if (!zoomAccessToken) {
        fetch("/api/zoom/access-token", {
          method: "POST",
          body: JSON.stringify({
            code: router.query.code
          })
        }).then(e => e.json())
          .then((e) => {
            setZoomAccessToken(e.access_token);
          })
      }
    }
  })

  const validate = async () => {
    if (!zoomAccessToken) {
      setErrorMessage("Please try again later");
      return false;
    }
    return true;
  }

  const getVideos = async () => {
    const zoomVideos = await fetch("/api/zoom/recordings", {
      method: "POST",
      body: JSON.stringify({
        access_token: zoomAccessToken
      })
    })
      .then(a => a.json());

    const res: VideoSource[] = [];
    zoomVideos.meetings.forEach((m: any) => {
      if (m.recording_files) {
        
        const f = m.recording_files.filter((r: any) => r.file_type === "MP4")[0];
        console.log(f);
        res.push({
          id: f.id,
          url: f.download_url,
          name: m.topic,
          size: f.file_size
        })
      }
    });
    console.log(res);
    return res;
  }


  return (
    <>
      <div>
        <label>Click on the button to login into Zoom</label>
        { zoomAccessToken
          ? <p><span style={{fontWeight: "bold", fontSize: "1.6em", position: "relative", top: "3px", marginRight: "10px", color: "rgb(45, 140, 255)"}}>✓</span><b>You&apos;re logged in.</b></p>
         : <button 
          onClick={() => router.push("https://zoom.us/oauth/authorize?response_type=code&client_id=NWItzjLDRHOZErQncaO1fA&redirect_uri=" + ZOOM_REDIRECT_URL)} 
          style={{ backgroundColor: "rgb(45, 140, 255)" }}>Zoom login</button> }
        <p className="inputError">{errorMessage}&nbsp;</p>
      </div>
    </>
  );
}

export default ZoomLogin;