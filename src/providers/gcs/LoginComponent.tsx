import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { getItem, setItem } from '../../utils/functions/localStorageHelper';
import { ProviderLoginProps } from '../types';


const GcsLogin = (props: ProviderLoginProps) => {
  const [encryptedAccessToken, setEncryptedAccessToken] = useState<string>();
  const [bucket, setBucket] = useState<string>();
  const router = useRouter();

  useEffect(() => {
    const storageItem = getItem('GCS');
    if (storageItem) {
      setBucket(storageItem.bucket);
      setEncryptedAccessToken(storageItem.encryptedAccessToken);

      props.onAuthenticationDataChanged({
        encryptedPrivateData: storageItem.encryptedAccessToken || '',
        publicData: {
          bucket: storageItem.bucket,
        },
        filled: !!storageItem.bucket,
      });
    }
  }, []);

  useEffect(() => {
    if(props.authenticationData) {
      setItem('GCS', {
        bucket,
        encryptedAccessToken: props.authenticationData.encryptedPrivateData,
      });
    }
  }, [props.authenticationData]);


return (
  <div>
  <div className="flex flex-col gap-4">
    <div className="flex gap-2 flex-wrap">
      <label htmlFor="bucketName" className="flex gap-4 font-semibold">
        Enter the name of your Storage bucket
      </label>
     
    </div>
    <div className={'mb-4'}>
      <input
        className={`h-10 ${props.errorMessage
            ? 'outline outline-red-500 outline-2'
            : 'outline outline-slate-300 rounded-lg shadow outline-1'
          }`}
        id="bucketName"
        type={'text'}
        value={bucket}
        onChange={(v) => {
          setItem('GCS', { 
            bucket: v.target.value,
            encryptedAccessToken: encryptedAccessToken 
          });
          setBucket(v.target.value);
          props.onAuthenticationDataChanged({
            publicData: {
              bucket: v.target.value,
            },
            filled: !!v.target.value && v.target.value.length > 0,
          });
        }}
      ></input>
       <p className="mt-2"><i>
        You first have to grant the Video Import Tool read access to the bucket, as described&nbsp;
        <a
          target="_blank"
          href="/doc/grant-read-access-to-your-google-cloud-storage-bucket"
          className="text-blue-500 underline"
        >here</a>.
      </i></p>
      {props.errorMessage && <p className="text-sm text-red-600 pt-2">{props.errorMessage}&nbsp;</p>}
    </div>
  </div>
</div>
);
};

export default GcsLogin;
