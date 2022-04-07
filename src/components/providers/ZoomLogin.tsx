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

const ZoomLogin: React.FC<ProviderLoginProps> = (props) => {
  const [vimeoAccessToken, setVimeoAccessToken] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");

  React.useEffect(() => {
    props.validate.current = validate;
    props.getVideos.current = getVideos;
  })

  const validate = async () => {
    setErrorMessage("Please try again later");
    return false;
  }

  const getVideos = async () => {
    return [];
  }


  return (
    <>
      <div>
        <label>Click on the button to login into Zoom</label>
        <button disabled={true} style={{backgroundColor: "rgb(45, 140, 255)"}}>Zoom login</button>
        <p className="inputError">{errorMessage}&nbsp;</p>
      </div>
    </>
  );
}

export default ZoomLogin;