import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { AlertTriangle } from 'react-feather';
import {
  MigrationProvider,
  OptionalFeatureFlag,
  Providers,
} from '../providers';
import {
  callValidateProviderCredentialsApi,
  callVerifyApiVideoApiKeyApi,
} from '../service/ClientApiHelpers';
import AuthDisclaimer from './commons/AuthDisclaimer';
import MigrationCard from './commons/MigrationCard';
import { useGlobalContext } from './context/Global';

const Authenticate: React.FC = () => {
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

  const { providerName, setProviderName, setProviderAccessToken: globalSetProviderAccessToken } = useGlobalContext();

  const router = useRouter();

  useEffect(() => {
    const apiKey = sessionStorage.getItem('apiVideoApiKey') || ''
    if (apiKey) setApiVideoApiKey(apiKey)
  }, [])

  useEffect(() => {
    if (router?.query?.provider)
      setProviderName(router.query.provider.toString().toUpperCase());
  }, [router, setProviderName]);

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
    if (!providerName) {
      return null;
    }

    const provider = Providers[providerName];

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
        provider: providerName,
      });
      return res.error;
    } catch (e: any) {
      return e.message;
    }
  };

  const provider: MigrationProvider | undefined = providerName
    ? Providers[providerName]
    : undefined;

  const handleAuthClick = async () => {
    setLoading(true);

    const authentValidation: (string | null)[] = await Promise.all(
      provider
        ? [validateApiVideoAuthentication(), validateProviderAuthentication()]
        : [validateApiVideoAuthentication()]
    );
    setLoading(false);
    setApiVideoErrorMessage(authentValidation[0]);

    if (authentValidation.length > 1) {
      if (authentValidation[1]) {
        setProviderErrorMessage(authentValidation[1]);
      } else {
        router.push(
          `/${providerName?.toString().toLocaleLowerCase()}/video-selection`
        );
      }
    } else if (authentValidation.filter((v) => v !== null).length > 0) {
      setLoading(false);
      return;
    } else {
      !providerErrorMessage &&
        router.push(
          `/${providerName?.toString().toLocaleLowerCase()}/video-selection`
        );
    }
  };

  return (
    <MigrationCard activeStep={2} paddingTop>
      <div className="flex flex-col md:flex-row text-sm gap-2 md:gap-10">
        <div className="flex flex-col md:w-2/4 gap-4">
          <h1 className="text-left font-semibold">Authentication</h1>
          <div className="hidden md:block">
            {' '}
            <AuthDisclaimer providerName={providerName as string} />
          </div>
        </div>
        <div className="flex flex-col md:w-2/4">
          <div className="flex flex-col gap-4">
            <label htmlFor="apiVideoApiKey">Enter your api.video API key</label>
            <div className={'mb-4'}>
              <input
                className={`h-10 ${apiVideoErrorMessage
                  ? 'outline outline-red-500 outline-2'
                  : 'outline outline-slate-300 rounded-lg shadow outline-1'
                  }`}
                id="apiVideoApiKey"
                type={'password'}
                value={apiVideoApiKey}
                onChange={(v) => {
                  setApiVideoErrorMessage('');
                  sessionStorage.setItem('apiVideoApiKey', v.target.value);
                  setApiVideoApiKey(v.target.value);
                }}
              ></input>
              {apiVideoErrorMessage && (
                <p className="text-sm text-red-600 pt-2">
                  {apiVideoErrorMessage}&nbsp;
                </p>
              )}
            </div>
          </div>

          {provider && (
            <provider.loginComponent
              onAccessTokenChanged={(providerAccessToken) => {
                setLoading(false);
                setProviderErrorMessage('');
                setProviderAccessToken(providerAccessToken);
                globalSetProviderAccessToken(providerAccessToken as string)
              }}
              providerAccessToken={providerAccessToken as string}
              errorMessage={providerErrorMessage || undefined}
              buttonDisabled={loading || !providerAccessToken}
              onClick={handleAuthClick}
              loading={loading}
            />
          )}
          <div className="block pt-4 md:hidden">
            {' '}
            <AuthDisclaimer providerName={providerName as string} />
          </div>
        </div>
      </div>
      <div className="w-full bg-yellow-50 flex gap-10 text-xs p-4 rounded mt-8 text-blue-900">
        <AlertTriangle color={'#F59E0B'} size={12} strokeWidth={'.2rem'}/>
        <ul>
          <li className="list-disc">If you are migrating to a sandbox project, your videos will be watermarked and deleted after 24 hours.</li>
          <li className="list-disc">If you are migrating to a production project, your videos will count towards your encoding and hosting usage quota.</li>
          <li>Depending on your plan, this might incur additional usage charges.</li>
        </ul>
      </div>
    </MigrationCard>
  );
};

export default Authenticate;
