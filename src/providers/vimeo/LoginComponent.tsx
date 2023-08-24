import React, { useEffect, useState } from 'react';
import { getItem, removeItem, setItem } from '../../utils/functions/localStorageHelper';
import { ProviderLoginProps } from '../types';
import VimeoLoginPopup from './LoginPopup'
import { Check } from 'react-feather';

const VimeoLogin = (props: ProviderLoginProps) => {
  const [encryptedAccessToken, setEncryptedAccessToken] = useState<string>();
  const [popupVisible, setPopupVisible] = useState<boolean>(false);

  
  useEffect(() => {
    const storageItem = getItem('VIMEO');
    if (storageItem) {
      onChange(storageItem.encryptedAccessToken);
    }
  }, []);

  const onChange = (encryptedAccessToken?: string) => {
    if (encryptedAccessToken) {
      setItem('VIMEO', {
        encryptedAccessToken,
      });
    } else {
      removeItem('VIMEO');
    }
    setEncryptedAccessToken(encryptedAccessToken);
    props.onAuthenticationDataChanged({
      encryptedPrivateData: encryptedAccessToken,
      filled: !!encryptedAccessToken,
    });
  };

  return (
    <div className="flex flex-col mb-3.5">

    {popupVisible && <VimeoLoginPopup
      onSuccess={(encryptedAccessToken) => {
        onChange(encryptedAccessToken);
        setPopupVisible(false);
      }}
      onCancel={() => setPopupVisible(false)}
    />}

    <div className="flex flex-col">
      <label className="font-semibold">Authorize access to Vimeo</label>
      <button
        onClick={() => setPopupVisible(true)}
        disabled={!!encryptedAccessToken}
        className="bg-dropbox text-sm font-semibold w-full mt-4"
      >
        {encryptedAccessToken ? (
          <div className="flex justify-center items-center gap-2">
            <Check size={20} strokeWidth={'.2rem'} />
            Successfully signed into Vimeo
          </div>
        ) : (
          'Sign in to Vimeo'
        )}
      </button>
      {encryptedAccessToken && <p className="text-right"><a onClick={() => {
        onChange(undefined);
      }} className="text-orange underline" href="#">Revoke Vimeo access</a></p>}
    </div>

    <p className="text-sm text-red-600 mt-4">{props.errorMessage}</p>


  </div>
  );
};

export default VimeoLogin;
