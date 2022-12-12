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
        <div className="flex gap-2">
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
        <input
          className={`h-10 ${props.errorMessage
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
      <button
        className={`${props.buttonDisabled ? 'bg-slate-300' : 'bg-vimeo'} text-sm font-semibold w-full`}
        disabled={props.buttonDisabled}
        onClick={props.onClick}
      >
        {props.loading ? 'Please wait...' : 'Authorize access to Vimeo account'}
      </button>

    </div>
  );
};

export default VimeoLogin;
