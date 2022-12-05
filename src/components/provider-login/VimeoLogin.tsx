import React, { useEffect } from 'react';
import { ProviderLoginProps } from '../../providers';

const VimeoLogin = (props: ProviderLoginProps) => {
  const [vimeoAccessToken, setVimeoAccessToken] = React.useState<string>('');

  useEffect(() => {
    const accessToken = sessionStorage.getItem('vimeoAccessToken') || '';
    setVimeoAccessToken(accessToken);
    props.onAccessTokenChanged(accessToken);
  }, []);

  return (
    <div>
      <div className="flex flex-col gap-4">
        <label htmlFor="vimeoAccessToken" className="flex gap-4">
          Enter your Vimeo access token
          <i>
            <a
              target="_blank"
              href="/doc/generate-a-vimeo-access-token"
              className="text-blue-500 underline text-xs"
            >
              how to generate your access token
            </a>
          </i>
        </label>
        <input
          className={`h-10 ${
            props.errorMessage
              ? 'outline outline-red-500 outline-2'
              : 'outline outline-slate-300 rounded-lg shadow outline-1'
          }`}
          id="vimeoAccessToken"
          type={'password'}
          value={vimeoAccessToken}
          onChange={(v) => {
            setVimeoAccessToken(v.target.value);
            props.onAccessTokenChanged(v.target.value);
            sessionStorage.setItem('vimeoAccessToken', v.target.value);
          }}
        ></input>
      </div>
      <p className="text-sm text-red-600">{props.errorMessage}&nbsp;</p>
    </div>
  );
};

export default VimeoLogin;
