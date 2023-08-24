import { useEffect, useState } from 'react';
import { Check } from 'react-feather';
import { getItem, removeItem, setItem } from '../../utils/functions/localStorageHelper';
import { ProviderLoginProps } from '../types';
import AZURELoginPopup from './LoginPopup';


const AzureLogin = (props: ProviderLoginProps) => {
  const [encryptedPrivateData, setEncryptedPrivateData] = useState<string>();
  const [popupVisible, setPopupVisible] = useState<boolean>(false);


  useEffect(() => {
    const storageItem = getItem('AZURE_MEDIA');
    if (storageItem) {
      onChange(storageItem.encryptedPrivateData);
    }
  }, []);

  const onChange = (encryptedPrivateData?: string) => {
    if (encryptedPrivateData) {
      setItem('AZURE_MEDIA', {
        encryptedPrivateData,
      });
    } else {
      removeItem('AZURE_MEDIA');
    }
    setEncryptedPrivateData(encryptedPrivateData);
    props.onAuthenticationDataChanged({
      encryptedPrivateData: encryptedPrivateData,
      filled: !!encryptedPrivateData,
    });
  };

  return (
    <div className="flex flex-col mb-3.5">

      {popupVisible && <AZURELoginPopup
        onSuccess={(encryptedPrivateData) => {
          onChange(encryptedPrivateData);
          setPopupVisible(false);
        }}
        onCancel={() => setPopupVisible(false)}
      />}

      <div className="flex flex-col">
        <label className="font-semibold">Authorize access to AZURE</label>
        <button
          onClick={() => setPopupVisible(true)}
          disabled={!!encryptedPrivateData}
          className="bg-dropbox text-sm font-semibold w-full mt-4"
        >
          {encryptedPrivateData ? (
            <div className="flex justify-center items-center gap-2">
              <Check size={20} strokeWidth={'.2rem'} />
              Successfully signed into AZURE
            </div>
          ) : (
            'Sign in to AZURE'
          )}
        </button>
        {encryptedPrivateData && <p className="text-right"><a onClick={() => {
          onChange(undefined);
        }} className="text-orange underline" href="#">Revoke AZURE access</a></p>}
      </div>

      <p className="text-sm text-red-600 mt-4">{props.errorMessage}</p>


    </div>
  );
};

export default AzureLogin;
  