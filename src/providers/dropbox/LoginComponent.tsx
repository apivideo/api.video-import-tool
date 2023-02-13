import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { Check } from 'react-feather';
import { DROPBOX_CLIENT_ID, DROPBOX_REDIRECT_URL } from '../../env';
import { GetOauthAccessTokenRequestResponse } from '../../pages/api/providers/get-oauth-access-token';
import { callGetOAuthAccessTokenApi } from '../../service/ClientApiHelpers';
import { getItem, setItem } from '../../utils/functions/localStorageHelper';
import { ProviderLoginProps } from '../types';

const DropboxLogin = (props: ProviderLoginProps) => {
  const [accessToken, setAccessToken] = useState<string>('');
  const router = useRouter();


  useEffect(() => {
    const item = getItem('DROPBOX')
    if (item) {
      const accessToken = item.accessToken;
      setAccessToken(accessToken);
      props.onAuthenticationDataChanged({
        accessToken,
        filled: !!accessToken,
      });
    }
  }, []);

  useEffect(() => {
    if (router.query.code && !accessToken) {
      callGetOAuthAccessTokenApi({
        provider: 'DROPBOX',
        code: router.query.code as string,
      }).then((res: GetOauthAccessTokenRequestResponse) => {
        if (res.access_token) {
          setAccessToken(res.access_token);
          setItem('DROPBOX', { accessToken: res.access_token }, res.expires_in * 1000);
          
          props.onAuthenticationDataChanged({
            accessToken,
            filled: !!accessToken,
          });
        }
      });
    }
  }, [router.query.code]);

  return (
    <div className="flex flex-col mb-3.5">
      <div className="flex flex-col gap-4">
        <label>Authorize access to Dropbox</label>
        <button
          onClick={() =>
            router.push(
              `https://www.dropbox.com/oauth2/authorize?client_id=${DROPBOX_CLIENT_ID}&response_type=code&redirect_uri=${DROPBOX_REDIRECT_URL}`
            )
          }
          className="bg-dropbox text-sm font-semibold w-full"
        >
          {accessToken ? (
            <div className="flex justify-center items-center gap-2">
              <Check size={20} strokeWidth={'.2rem'} />
              Successfully signed into Dropbox
            </div>
          ) : (
            'Sign in to Dropbox'
          )}
        </button>
      </div>

      <p className="text-sm text-red-600">{props.errorMessage}</p>

    </div>
  );
};

export default DropboxLogin;
