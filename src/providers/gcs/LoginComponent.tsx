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
  const [encryptedAccessToken, setEncryptedAccessToken] = useState<string>();
  const [buckets, setBuckets] = useState<ProjectBucket[]>([]);
  const [bucket, setBucket] = useState<string>();
  const router = useRouter();

  useEffect(() => {
    const storageItem = getItem('GCS');
    if (storageItem) {
      setBuckets(storageItem.buckets || []);
      setBucket(storageItem.bucket);
      setEncryptedAccessToken(storageItem.encryptedAccessToken);

      props.onAuthenticationDataChanged({
        encryptedAccessToken: storageItem.encryptedAccessToken || '',
        additionnalData: {
          bucket: storageItem.bucket,
        },
        filled: !!storageItem.encryptedAccessToken && !!storageItem.bucket,
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
        if (res.encrypted_access_token) {
          onNewGcsAccessToken(res.encrypted_access_token, res.expires_in * 1000);
        }
      });
    }
  }, [router.query.code]);

  const onNewGcsAccessToken = async (encryptedAccessToken: string, expiresIn: number) => {
    removeItem('GCS');
    setItem('GCS', { encryptedAccessToken }, expiresIn);
    setEncryptedAccessToken(encryptedAccessToken);

    props.onAuthenticationDataChanged({
      encryptedAccessToken,
      filled: false,
    });

    const buckets: ProjectBucket[] = (await callFetchAdditionalUserDataAfterSigninApi({
      providerName: 'GCS',
      authenticationContext: { encryptedAccessToken }
    }));

    setBuckets(buckets);

    onBucketSelected(buckets[0].projectId + ":" + buckets[0].buckets[0], buckets, encryptedAccessToken)
  }

  const onBucketSelected = (bucket: string, buckets: ProjectBucket[], encryptedAccessToken: string) => {
    setItem('GCS', {
      encryptedAccessToken: encryptedAccessToken!,
      buckets,
      bucket,
    })
    setBucket(bucket);
    
    props.onAuthenticationDataChanged({
      encryptedAccessToken: encryptedAccessToken!,
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
        encryptedAccessToken: encryptedAccessToken!,
      }
    });
    props.onAuthenticationDataChanged({
      encryptedAccessToken: '',
      filled: false,
    });
    removeItem('GCS');
    setEncryptedAccessToken('');
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
        disabled={!!encryptedAccessToken}
        className="bg-gcs text-sm font-semibold w-full"
      >
        {encryptedAccessToken ? (
          <div className="flex justify-center items-center gap-2">
            <Check size={20} strokeWidth={'.2rem'} />
            Successfully signed into GCS
          </div>
        ) : (
          'Sign in to GCS'
        )}
      </button>
    </div>

    <div style={{ ...(!encryptedAccessToken ? { display: "none" } : {}) }}>
      <p className="text-right"><a onClick={() => revokeAccessToken()} className="underline" href="#">Revoke GCS access</a></p>

      <label htmlFor="apiVideoApiKey" className="mb-4 mt-0 block">Select a Storage bucket</label>
      <select
        value={bucket || undefined}
        onChange={(v) => {
          onBucketSelected(v.target.value, buckets, encryptedAccessToken!);
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
