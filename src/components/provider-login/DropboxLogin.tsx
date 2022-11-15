import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { DROPBOX_CLIENT_ID, DROPBOX_REDIRECT_URL } from "../../env";
import { GetOauthAccessTokenRequestBody, GetOauthAccessTokenRequestResponse } from "../../pages/api/providers/get-oauth-access-token";
import { ProviderLoginProps, Providers } from "../../providers";


const DropboxLogin = (props: ProviderLoginProps) => {
  const [dropboxAccessToken, setDropboxAccessToken] = useState<string>("");
  const router = useRouter();


  useEffect(() => {
    const accessToken = sessionStorage.getItem("dropboxAccessToken") || "";
    setDropboxAccessToken(accessToken);

    if (!accessToken && router.query.code) {
      const body: GetOauthAccessTokenRequestBody = {
        provider: "DROPBOX",
        code: router.query.code as string,
      }
      fetch(`/api/providers/get-oauth-access-token`, {
        method: "POST",
        body: JSON.stringify(body)
      })
        .then(res => res.json())
        .then((res: GetOauthAccessTokenRequestResponse) => {
          if (res.access_token) {
            sessionStorage.setItem("dropboxAccessToken", res.access_token);
            setDropboxAccessToken(res.access_token);
            props.onAccessTokenChanged(res.access_token);
          }
        });
    }

    props.onAccessTokenChanged(accessToken);
  }, [router.query.code]);


  return (
    <>
      <div>
        <label>Click on the button to login into Dropbox</label>
        {dropboxAccessToken
          ? <p><span style={{ fontWeight: "bold", fontSize: "1.6em", position: "relative", top: "3px", marginRight: "10px", color: "rgb(45, 140, 255)" }}>✓</span><b>You&apos;re logged in.</b></p>
          : <button
            onClick={() => router.push(`https://www.dropbox.com/oauth2/authorize?client_id=${DROPBOX_CLIENT_ID}&response_type=code&redirect_uri=${DROPBOX_REDIRECT_URL}`)}
            style={{ backgroundColor: "rgb(45, 140, 255)" }}>Dropbox login</button>}
        <p className="inputError">{props.errorMessage}&nbsp;</p>
      </div>
    </>
  );
}

export default DropboxLogin;