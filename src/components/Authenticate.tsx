import React, { useEffect, useState } from 'react';
import { OptionalFeatureFlag, ProviderName, Providers } from '../providers';
import {
  callValidateProviderCredentialsApi,
  callVerifyApiVideoApiKeyApi,
} from '../service/ClientApiHelpers';
import { AuthenticationContext } from '../types/common';

interface AuthenticateProps {
  onSubmit: (authenticationContext: AuthenticationContext) => void;
  introMessage?: JSX.Element;
  providerName?: ProviderName;
}

const Authenticate: React.FC<AuthenticateProps> = (props) => {
  const [apiVideoApiKey, setApiVideoApiKey] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [apiVideoErrorMessage, setApiVideoErrorMessage] = useState<
    string | null
  >(null);
  const [providerAccessToken, setProviderAccessToken] = useState<string | null>(
    null
  );
  const [providerErrorMessage, setProviderErrorMessage] = useState<
    string | null
  >();

  useEffect(() => {
    setApiVideoApiKey(sessionStorage.getItem('apiVideoApiKey') || '');
  }, []);

  const validateApiVideoAuthentication = async (): Promise<string | null> => {
    let errorMessage = null;
    if (apiVideoApiKey.trim() === '') {
      errorMessage = 'Please enter your api.video API key';
    }
    const res = await callVerifyApiVideoApiKeyApi({ apiKey: apiVideoApiKey });

    if (!res.ok) {
      errorMessage = 'Please verify your api key';
    }

    setApiVideoErrorMessage(errorMessage);

    return errorMessage;
  };

  const validateProviderAuthentication = async (): Promise<string | null> => {
    if (!props.providerName) {
      return null;
    }

    const provider = Providers[props.providerName];

    if (!providerAccessToken) {
      return `Missing ${provider.displayName} authentication`;
    }

    if (
      !provider.hasFeature(
        OptionalFeatureFlag.ProviderCredentialsBackendValidation
      )
    ) {
      return null;
    }

    try {
      const res = await callValidateProviderCredentialsApi({
        authenticationContext: {
          providerAccessToken,
        },
        provider: props.providerName,
      });
      return res.error;
    } catch (e: any) {
      return e.message;
    }
  };

  const provider = props.providerName
    ? Providers[props.providerName]
    : undefined;

  return (
    <>
      {props.introMessage && (
        <p className="explanation">{props.introMessage}</p>
      )}

      <div className="flex text-sm">
        <div className="flex flex-col">
          <h1 className="text-left font-semibold">Authentication</h1>
          <p>
            Authorize access to your Dropbox account to access the videos you
            would like to import to api.video.
          </p>
          <p>
            This application will access the following data from your account:
          </p>
          <ul className="list-disc">
            <li>
              files.content.read: View content of your Dropbox files and folders
            </li>
            <li>
              files.metadata.read: View information about your Dropbox files and
              folders
            </li>
          </ul>
          <p>
            No sensitive data from your dropbox account will be sent to
            api.video.
          </p>
        </div>

        <input
          className={`h-10 ${
            apiVideoErrorMessage
              ? 'outline outline-red-500 outline-2'
              : 'outline outline-slate-300 rounded-lg shadow outline-1'
          }`}
          id="apiVideoApiKey"
          type={'password'}
          value={apiVideoApiKey}
          onChange={(v) => {
            sessionStorage.setItem('apiVideoApiKey', v.target.value);
            setApiVideoApiKey(v.target.value);
          }}
        ></input>
        <p className="inputError">{apiVideoErrorMessage}&nbsp;</p>
      </div>

      {provider && (
        <div>
          <provider.loginComponent
            onAccessTokenChanged={(providerAccessToken) =>
              setProviderAccessToken(providerAccessToken)
            }
            errorMessage={providerErrorMessage || undefined}
          />
        </div>
      )}

      <div>
        <button
          disabled={loading}
          onClick={async () => {
            setLoading(true);

            const authentValidation: (string | null)[] = await Promise.all(
              provider
                ? [
                    validateApiVideoAuthentication(),
                    validateProviderAuthentication(),
                  ]
                : [validateApiVideoAuthentication()]
            );

            setApiVideoErrorMessage(authentValidation[0]);

            if (authentValidation.length > 1) {
              setProviderErrorMessage(authentValidation[1]);
            }

            if (authentValidation.filter((v) => v !== null).length > 0) {
              setLoading(false);
              return;
            }

            props.onSubmit({
              apiVideoApiKey: apiVideoApiKey,
              providerAccessToken: providerAccessToken!,
            });

            setLoading(false);
          }}
        >
          {loading ? 'Please wait...' : 'Authenticate'}
        </button>
      </div>
    </>
  );
};

export default Authenticate;
