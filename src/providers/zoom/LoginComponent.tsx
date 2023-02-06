import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { ArrowRight, Check } from 'react-feather';
import { ZOOM_CLIENT_ID, ZOOM_REDIRECT_URL } from '../../env';
import { GetOauthAccessTokenRequestResponse } from '../../pages/api/providers/get-oauth-access-token';
import { callGetOAuthAccessTokenApi, callRevokeAccessTokenApi } from '../../service/ClientApiHelpers';
import { ProviderLoginProps } from '../types';

const ZoomLogin = (props: ProviderLoginProps) => {
  const [zoomAccessToken, setZoomAccessToken] = useState<string>('');
  const router = useRouter();

  useEffect(() => {
    if(localStorage.getItem('zoomAccessToken')) {
      const accessToken = JSON.parse(localStorage.getItem('zoomAccessToken') || "{}");
      const expireInSecs = (accessToken.expiration - new Date().getTime()) / 1000;
      if(!accessToken.expiration || expireInSecs < 60 * 10) {
        localStorage.removeItem('zoomAccessToken');
        return;
      }
      setZoomAccessToken(accessToken.access_token);
      props.onAccessTokenChanged(accessToken.access_token);
    }
  }, []);

  useEffect(() => {
    if (router.query.code) {
      callGetOAuthAccessTokenApi({
        provider: 'ZOOM',
        code: router.query.code as string,
      }).then((res: GetOauthAccessTokenRequestResponse) => {
        if (res.access_token) {
          localStorage.setItem('zoomAccessToken', JSON.stringify({
            expiration: new Date().getTime() + (res.expires_in * 1000),
            ...res
          }));
          setZoomAccessToken(res.access_token);
          props.onAccessTokenChanged(res.access_token);
        }
      });
    }
  }, [router.query.code]);

  
  const revokeAccessToken = async () => {
    
    await callRevokeAccessTokenApi({
      provider: 'ZOOM',
      authenticationContext: {
        providerAccessToken: localStorage.getItem('zoomAccessToken') ? JSON.parse(localStorage.getItem('zoomAccessToken') || "{}").access_token || '' : '',
      }
    });
    props.onAccessTokenChanged('');
    localStorage.removeItem('zoomAccessToken');
    setZoomAccessToken('');

  };

  return (
    <div className="flex flex-col mb-3.5">
      <div className="flex flex-col gap-4">
        <label>Authorize access to Zoom</label>
        <button
          onClick={() =>
            router.push(
              `https://zoom.us/oauth/authorize?response_type=code&client_id=${ZOOM_CLIENT_ID}&redirect_uri=${ZOOM_REDIRECT_URL}`
            )
          }
          disabled={!!zoomAccessToken}
          className="bg-dropbox text-sm font-semibold w-full"
        >
          {zoomAccessToken ? (
            <div className="flex justify-center items-center gap-2">
              <Check size={20} strokeWidth={'.2rem'} />
              Successfully signed into Zoom
            </div>
          ) : (
            'Sign in to Zoom'
          )}
        </button>
      </div>
      <p style={{...(!zoomAccessToken ? {display: "none"} : {})}} className="text-right"><a onClick={() => revokeAccessToken()} className="text-dropbox underline" href="#">Revoke Zoom access</a></p>

      <p className="text-sm text-red-600">{props.errorMessage}</p>
      {zoomAccessToken && <button
        className={`text-sm font-semibold w-full mt-3 ${props.buttonDisabled ? 'bg-slate-300' : 'bg-black'
      }`}
        disabled={props.buttonDisabled}
        onClick={props.onClick}
      >
        {props.loading ? (
          'Please wait...'
        ) : (
          <div className="flex justify-center items-center gap-2">
            Proceed to import <ArrowRight size={14} strokeWidth={'.2rem'} />
          </div>
        )}
      </button>}

    </div>
  );
};

export default ZoomLogin;
