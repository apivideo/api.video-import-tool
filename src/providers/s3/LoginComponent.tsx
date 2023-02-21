import { useEffect, useState } from 'react';
import { Check } from 'react-feather';
import { getItem, removeItem, setItem } from '../../utils/functions/localStorageHelper';
import { ProviderLoginProps } from '../types';
import S3LoginPopup from './LoginPopup';


const S3Login = (props: ProviderLoginProps) => {
  const [encryptedAccessToken, setEncryptedAccessToken] = useState<string>();
  const [buckets, setBuckets] = useState<string[]>([]);
  const [popupVisible, setPopupVisible] = useState<boolean>(false);


  useEffect(() => {
    const storageItem = getItem('S3');
    if (storageItem) {
      onChange(storageItem.encryptedAccessToken, storageItem.buckets, storageItem.bucket);
    }
  }, []);

  const onChange = (encryptedAccessToken?: string, buckets?: string[], bucket?: string) => {
    if (encryptedAccessToken) {
      setItem('S3', {
        encryptedAccessToken,
        buckets,
        bucket,
      });
    } else {
      removeItem('S3');
    }
    setEncryptedAccessToken(encryptedAccessToken);
    setBuckets(buckets || []);
    props.onAuthenticationDataChanged({
      encryptedAccessToken,
      additionnalData: {
        bucket,
      },
      filled: !!encryptedAccessToken && !!bucket,
    });
  };

  return (
    <div className="flex flex-col mb-3.5">

      {popupVisible && <S3LoginPopup
        onSuccess={(buckets, encryptedAccessToken) => {
          onChange(encryptedAccessToken, buckets, buckets && buckets.length > 0 ? buckets[0] : undefined);
          setPopupVisible(false);
        }}
        onCancel={() => setPopupVisible(false)}
      />}

      <div className="flex flex-col">
        <label className="font-semibold">Authorize access to Amazon S3</label>
        <button
          onClick={() => setPopupVisible(true)}
          disabled={!!encryptedAccessToken}
          className="bg-dropbox text-sm font-semibold w-full mt-4"
        >
          {encryptedAccessToken ? (
            <div className="flex justify-center items-center gap-2">
              <Check size={20} strokeWidth={'.2rem'} />
              Successfully signed into S3
            </div>
          ) : (
            'Sign in to Amazon S3'
          )}
        </button>
        {encryptedAccessToken && <p className="text-right"><a onClick={() => {
          onChange(undefined, undefined, undefined);
        }} className="text-orange underline" href="#">Revoke S3 access</a></p>}
      </div>

      {encryptedAccessToken && <>
        <label htmlFor="apiVideoApiKey" className="mb-4 block">Select your S3 bucket</label>
        <select
          value={buckets[0] || undefined}
          onChange={(v) => {

          }}
          className="border border-gray-300 text-gray-900 text-sm  block w-full p-2.5">
          {(buckets || []).map((key, i) =>
            <option key={key} value={key}>{key}</option>,

          )}

        </select>
      </>}

      <p className="text-sm text-red-600 mt-4">{props.errorMessage}</p>


    </div>
  );
};

export default S3Login;
