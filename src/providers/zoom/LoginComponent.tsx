import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { Check } from 'react-feather';
import { ZOOM_CLIENT_ID, ZOOM_REDIRECT_URL } from '../../env';
import { GetOauthAccessTokenRequestResponse } from '../../pages/api/providers/get-oauth-access-token';
import { callGetOAuthAccessTokenApi, callRevokeAccessTokenApi } from '../../service/ClientApiHelpers';
import { getItem, removeItem, setItem } from '../../utils/functions/localStorageHelper';
import { ProviderLoginProps } from '../types';

const ZoomLogin = (props: ProviderLoginProps) => {
  const [accessToken, setAccessToken] = useState<string>('');
  const router = useRouter();

  useEffect(() => {
    const item = getItem('ZOOM')
    if (item) {
      onNewAccessToken(item.encryptedAccessToken);
      const encryptedAccessToken = item.encryptedAccessToken;
      setAccessToken(encryptedAccessToken);
      props.onAuthenticationDataChanged({
        encryptedAccessToken,
        filled: !!encryptedAccessToken,
      });
    }
  }, []);

  useEffect(() => {
    if (router.query.code && !accessToken) {
      callGetOAuthAccessTokenApi({
        providerName: 'ZOOM',
        code: router.query.code as string,
      }).then((res: GetOauthAccessTokenRequestResponse) => {
        if (res.encrypted_access_token) {
          removeItem('ZOOM');
          onNewAccessToken(res.encrypted_access_token, res.expires_in * 1000);
          router.replace('/zoom');
        }
      });
    }
  }, [router.query.code]);

  const onNewAccessToken = async (encryptedAccessToken: string, expiresIn?: number) => {
    setItem('ZOOM', { encryptedAccessToken }, expiresIn);
    setAccessToken(encryptedAccessToken);
    props.onAuthenticationDataChanged({
      encryptedAccessToken,
      filled: !!encryptedAccessToken,
    });
  };
 
  const revokeAccessToken = async () => {

    await callRevokeAccessTokenApi({
      provider: 'ZOOM',
      authenticationContext: {
        encryptedAccessToken: accessToken,
      }
    });
    props.onAuthenticationDataChanged({
      encryptedAccessToken: '',
      filled: false,
    });
    removeItem('ZOOM');
    setAccessToken('');
  };

  return (
    <div className="flex flex-col mb-3.5">
      <div className="flex flex-col gap-4">
        <label className="font-semibold">Authorize access to Zoom</label>
        <button
          onClick={() =>
            router.push(
              `https://zoom.us/oauth/authorize?response_type=code&client_id=${ZOOM_CLIENT_ID}&redirect_uri=${ZOOM_REDIRECT_URL}`
            )
          }
          disabled={!!accessToken}
          className="bg-dropbox text-sm font-semibold w-full"
        >
          {accessToken ? (
            <div className="flex justify-center items-center gap-2">
              <Check size={20} strokeWidth={'.2rem'} />
              Successfully signed into Zoom
            </div>
          ) : (
            'Sign in to Zoom'
          )}
        </button>
      </div>
      <p style={{ ...(!accessToken ? { display: "none" } : {}) }} className="text-right"><a onClick={() => revokeAccessToken()} className="underline" href="#">Revoke Zoom access</a></p>

      <p className="text-sm text-red-600">{props.errorMessage}</p>
    </div>
  );
};

export default ZoomLogin;
