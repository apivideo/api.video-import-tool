import React, { ReactNode, useRef, useState } from "react";
import { MigrationProvider } from "../types/providers";
import VideoSource from "../types/videoSource";
import VimeoLogin from "./providers/VimeoLogin";
import ZoomLogin from "./providers/ZoomLogin";

interface AuthenticateProps {
  onSubmit: (apiKey: string, sources: VideoSource[]) => void;
  provider: MigrationProvider;
}

const Authenticate: React.FC<AuthenticateProps> = (props) => {
  const [apiVideoApiKey, setApiVideoApiKey] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [apiKeyErrorMessage, setApiKeyErrorMessage] = useState<string>("");
  const providerValidateRef = useRef<() => Promise<boolean>>(null);
  const providerGetVideosRef = useRef<() => Promise<VideoSource[]>>(null);

  const validateApiVideoAuthentication = async (): Promise<boolean> => {
    let errorMessage;
    if (apiVideoApiKey.trim() === "") {
      errorMessage = "Please enter your api.video API key";
    }
    errorMessage = await fetch("/api/apivideo/verify-api-key", {
      method: "POST",
      body: JSON.stringify({
        apiKey: apiVideoApiKey
      })
    }).then((e) => e.status == 403 ? "Please verify your api key" : "")

    setApiKeyErrorMessage(errorMessage);
    return !errorMessage;
  }

  const validateProviderAuthentication = async () => {
    return providerValidateRef?.current && await providerValidateRef?.current() || false
  }

  const getVideosFromProvider = async (): Promise<VideoSource[]> => {
    if(!props.provider.loginComponent) {
      return [];
    }
    
    return providerGetVideosRef?.current && await providerGetVideosRef?.current() || [];;
  }

  return (
    <>
      {props.provider.intro && <p className="explanation">{props.provider.intro}</p>}

      <div>
        <label htmlFor="apiVideoApiKey">Enter your api.video API key</label>
        <input className={apiKeyErrorMessage ? "error" : ""} id="apiVideoApiKey" type={"password"} value={apiVideoApiKey} onChange={(v) => setApiVideoApiKey(v.target.value)}></input>
        <p className="inputError">{apiKeyErrorMessage}&nbsp;</p>
      </div>
      {props.provider.loginComponent &&
        <div>
          <props.provider.loginComponent validate={providerValidateRef} getVideos={providerGetVideosRef} />
        </div>
      }

      <div>
        <button disabled={loading} onClick={async () => {
          setLoading(true);

          const authentValidation: boolean[] = await Promise.all(props.provider.loginComponent 
              ? [validateApiVideoAuthentication(), validateProviderAuthentication()]
              : [validateApiVideoAuthentication()]);

          if (authentValidation.filter(v => !v).length > 0) {
            setLoading(false);
            return;
          }

          props.onSubmit(apiVideoApiKey, await getVideosFromProvider());

          setLoading(false);
        }}>{loading ? "Please wait..." : "Authenticate"}</button>
      </div>
    </>
  );
}

export default Authenticate;