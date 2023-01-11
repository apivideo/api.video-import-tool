import React from 'react';
import { ProviderLoginProps } from '../types';

const VimeoLogin = (props: ProviderLoginProps) => {
  const [vimeoAccessToken, setVimeoAccessToken] = React.useState<string>('');

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
              setVimeoAccessToken(v.target.value);
              props.onAccessTokenChanged(v.target.value);
            }}
          ></input>
          {props.errorMessage && <p className="text-sm text-red-600 pt-2">{props.errorMessage}&nbsp;</p>}
        </div>
      </div>

      <button
        className={`${props.buttonDisabled ? 'bg-slate-300' : 'bg-vimeo'
          } text-sm font-semibold w-full`}
        disabled={props.buttonDisabled}
        onClick={props.onClick}
      >
        {props.loading ? 'Please wait...' : 'Authorize access to Vimeo account'}
      </button>
    </div>
  );
};

export default VimeoLogin;
