import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { ArrowRight, Check } from 'react-feather';
import { ProviderLoginProps } from '..';
import { DROPBOX_CLIENT_ID, DROPBOX_REDIRECT_URL } from '../../env';
import { GetOauthAccessTokenRequestResponse } from '../../pages/api/providers/get-oauth-access-token';
import { callGetOAuthAccessTokenApi } from '../../service/ClientApiHelpers';

const DropboxLogin = (props: ProviderLoginProps) => {
  const [dropboxAccessToken, setDropboxAccessToken] = useState<string>('');
  const router = useRouter();

  useEffect(() => {
    if (router.query.code) {
      callGetOAuthAccessTokenApi({
        provider: 'DROPBOX',
        code: router.query.code as string,
      }).then((res: GetOauthAccessTokenRequestResponse) => {
        if (res.access_token) {
          setDropboxAccessToken(res.access_token);
          props.onAccessTokenChanged(res.access_token);
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
          {dropboxAccessToken ? (
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
      {dropboxAccessToken && <button
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

export default DropboxLogin;
