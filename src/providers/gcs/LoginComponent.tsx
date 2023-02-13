import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { Check } from 'react-feather';
import { GCS_CLIENT_ID, GCS_REDIRECT_URL } from '../../env';
import { GetOauthAccessTokenRequestResponse } from '../../pages/api/providers/get-oauth-access-token';
import { callFetchAdditionalUserDataAfterSigninApi, callGetOAuthAccessTokenApi, callRevokeAccessTokenApi } from '../../service/ClientApiHelpers';
import { getItem, removeItem, setItem } from '../../utils/functions/localStorageHelper';
import { ProviderLoginProps } from '../types';
import { ProjectBucket } from './BackendService';


const GcsLogin = (props: ProviderLoginProps) => {
  const [accessToken, setAccessToken] = useState<string>();
  const [buckets, setBuckets] = useState<ProjectBucket[]>([]);
  const [bucket, setBucket] = useState<string>();
  const router = useRouter();

  useEffect(() => {
    const storageItem = getItem('GCS');
    if (storageItem) {
      setBuckets(storageItem.buckets || []);
      setBucket(storageItem.bucket);
      setAccessToken(storageItem.accessToken);

      props.onAuthenticationDataChanged({
        accessToken: storageItem.accessToken || '',
        additionnalData: {
          bucket: storageItem.bucket,
        },
        filled: !!storageItem.accessToken && !!storageItem.bucket,
      });
    }
  }, []);

  useEffect(() => {
    if (router.query.code) {
      if(getItem('GCS')) {
        return;
      }
      callGetOAuthAccessTokenApi({
        provider: 'GCS',
        code: router.query.code as string,
      }).then((res: GetOauthAccessTokenRequestResponse) => {
        if (res.access_token) {
          onNewGcsAccessToken(res.access_token, res.expires_in * 1000);
        }
      });
    }
  }, [router.query.code]);

  const onNewGcsAccessToken = async (accessToken: string, expiresIn: number) => {
    removeItem('GCS');
    setItem('GCS', { accessToken }, expiresIn);
    setAccessToken(accessToken);

    props.onAuthenticationDataChanged({
      accessToken,
      filled: false,
    });

    const buckets: ProjectBucket[] = (await callFetchAdditionalUserDataAfterSigninApi({
      providerName: 'GCS',
      authenticationContext: { accessToken }
    }));

    setBuckets(buckets);

    setItem('GCS', { accessToken, buckets });

    onBucketSelected(buckets[0].buckets[0], buckets, accessToken)
  }

  const onBucketSelected = (bucket: string, buckets: ProjectBucket[], accessToken: string) => {
    setItem('GCS', {
      accessToken: accessToken!,
      buckets,
      bucket,
    })
    setBucket(bucket);
    
    props.onAuthenticationDataChanged({
      accessToken: accessToken!,
      additionnalData: {
        bucket,
      },
      filled: true,
    });
  }

  const revokeAccessToken = async () => {
    await callRevokeAccessTokenApi({
      provider: 'GCS',
      authenticationContext: {
        accessToken: accessToken!,
      }
    });
    props.onAuthenticationDataChanged({
      accessToken: '',
      filled: false,
    });
    removeItem('GCS');
    setAccessToken('');
}

return (
  <div className="flex flex-col mb-3.5">
    <div className="flex flex-col gap-4">
      <label>Authorize access to Google Cloud Storage</label>
      <button
        onClick={() =>
          router.push(
            `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GCS_CLIENT_ID}&redirect_uri=${GCS_REDIRECT_URL}&response_type=code&scope=https://www.googleapis.com/auth/devstorage.read_only https://www.googleapis.com/auth/cloudplatformprojects.readonly`
          )
        }
        disabled={!!accessToken}
        className="bg-gcs text-sm font-semibold w-full"
      >
        {accessToken ? (
          <div className="flex justify-center items-center gap-2">
            <Check size={20} strokeWidth={'.2rem'} />
            Successfully signed into GCS
          </div>
        ) : (
          'Sign in to GCS'
        )}
      </button>
    </div>

    <div style={{ ...(!accessToken ? { display: "none" } : {}) }}>
      <p className="text-right"><a onClick={() => revokeAccessToken()} className="underline" href="#">Revoke GCS access</a></p>

      <label htmlFor="apiVideoApiKey" className="mb-4 mt-0 block">Select a Storage bucket</label>
      <select
        value={bucket || undefined}
        onChange={(v) => {
          onBucketSelected(v.target.value, buckets, accessToken!);
        }}
        className="border border-gray-300 text-gray-900 text-sm  block w-full p-2.5"
      >
        {(buckets || []).map((b, i) => {
          return <optgroup key={i} label={b.projectName}>
            {b.buckets.map((bucket) => <option key={bucket} value={b.projectId + ":" + bucket}>{bucket}</option>)}
          </optgroup>
        })}

      </select>
    </div>
    <p className="text-sm text-red-600">{props.errorMessage}</p>


  </div>
);
};

export default GcsLogin;
