import React, { useEffect } from "react";
import { ProviderLoginProps } from "../../providers";



const MuxLogin = (props: ProviderLoginProps) => {
  const [muxTokenId, setMuxTokenId] = React.useState<string>("");
  const [muxTokenSecret, setMuxTokenSecret] = React.useState<string>("");

  useEffect(() => {
    const muxTokenId = sessionStorage.getItem("muxTokenId") || "";
    const muxTokenSecret = sessionStorage.getItem("muxTokenSecret") || "";
    setMuxTokenId(muxTokenId);
    setMuxTokenSecret(muxTokenSecret);
    props.onAccessTokenChanged(btoa(muxTokenId + ":" + muxTokenSecret));
  }, []);

  const computeAccessToken = (muxTokenId: string, muxTokenSecret: string) => btoa(muxTokenId + ":" + muxTokenSecret);

  return (
    <>
      <div>
        <label htmlFor="muxTokenId">Enter your Mux token ID</label>
        <input
          className={props.errorMessage ? "error" : ""}
          id="muxTokenId"
          type={"password"}
          value={muxTokenId}
          onChange={(v) => {
            setMuxTokenId(v.target.value);
            props.onAccessTokenChanged(computeAccessToken(v.target.value, muxTokenSecret));
            sessionStorage.setItem("muxTokenId", v.target.value);
          }}></input>

        <label style={{marginTop: "16px"}} htmlFor="muxTokenSecret">Enter your Mux token secret</label>
        <input
          className={props.errorMessage ? "error" : ""}
          id="muxTokenSecret"
          type={"password"}
          value={muxTokenSecret}
          onChange={(v) => {
            setMuxTokenSecret(v.target.value);
            props.onAccessTokenChanged(computeAccessToken(muxTokenId, v.target.value));
            sessionStorage.setItem("muxTokenSecret", v.target.value);
          }}></input>

        <p className="inputError">{props.errorMessage}&nbsp;</p>
      </div>
    </>
  );
}

export default MuxLogin;