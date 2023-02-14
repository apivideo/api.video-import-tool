import React, { useEffect } from 'react';
import { getItem, setItem } from '../../utils/functions/localStorageHelper';
import { ProviderLoginProps } from '../types';

const VimeoLogin = (props: ProviderLoginProps) => {
  const [vimeoAccessToken, setVimeoAccessToken] = React.useState<string>('');


  useEffect(() => {
    const storageItem = getItem('VIMEO');
    if (storageItem) {
      setVimeoAccessToken(storageItem.accessToken);
      
      props.onAuthenticationDataChanged({
        accessToken: storageItem.accessToken || '',
        filled: !!storageItem.accessToken,
      });
    }
  }, []);

  return (
    <div>
      <div className="flex flex-col gap-4">
        <div className="flex gap-2 flex-wrap">
          <label htmlFor="vimeoAccessToken" className="flex gap-4">
            Enter your Vimeo access token
          </label>
          <i>
            <a
              target="_blank"
              href="/doc/generate-a-vimeo-access-token"
              className="text-blue-500 underline text-xs"
            >
              how to generate your access token
            </a>
          </i>
        </div>
        <div className={'mb-4'}>
          <input
            className={`h-10 ${props.errorMessage
                ? 'outline outline-red-500 outline-2'
                : 'outline outline-slate-300 rounded-lg shadow outline-1'
              }`}
            id="vimeoAccessToken"
            type={'password'}
            value={vimeoAccessToken}
            onChange={(v) => {
              setItem('VIMEO', { accessToken: v.target.value });
              setVimeoAccessToken(v.target.value);
              props.onAuthenticationDataChanged({
                accessToken: v.target.value,
                filled: !!v.target.value && v.target.value.length > 0,
              });
            }}
          ></input>
          {props.errorMessage && <p className="text-sm text-red-600 pt-2">{props.errorMessage}&nbsp;</p>}
        </div>
      </div>
    </div>
  );
};

export default VimeoLogin;
