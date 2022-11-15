import React, { useEffect } from "react";
import { ProviderLoginProps } from "../../providers";



const VimeoLogin = (props: ProviderLoginProps) => {
  const [vimeoAccessToken, setVimeoAccessToken] = React.useState<string>("");

  useEffect(() => {
    const accessToken = sessionStorage.getItem("vimeoAccessToken") || "";
    setVimeoAccessToken(accessToken);
    props.onAccessTokenChanged(accessToken);
  }, []);

  return (
    <>
      <div>
        <label htmlFor="vimeoAccessToken">Enter your Vimeo access token <i><a target="_blank" href="/doc/generate-a-vimeo-access-token">how to generate your access token</a></i></label>
        <input
          className={props.errorMessage ? "error" : ""}
          id="vimeoAccessToken"
          type={"password"}
          value={vimeoAccessToken}
          onChange={(v) => {
            setVimeoAccessToken(v.target.value);
            props.onAccessTokenChanged(v.target.value);
            sessionStorage.setItem("vimeoAccessToken", v.target.value);
          }}></input>
        <p className="inputError">{props.errorMessage}&nbsp;</p>
      </div>
    </>
  );
}

export default VimeoLogin;