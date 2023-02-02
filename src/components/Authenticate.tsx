import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { AlertTriangle } from 'react-feather';
import Providers, {
  ProviderName
} from '../providers';
import { ImportProvider, OptionalFeatureFlag } from '../providers/types';
import {
  callValidateProviderCredentialsApi,
  callVerifyApiVideoApiKeyApi
} from '../service/ClientApiHelpers';
import ApiKeySelector from './commons/ApiKeySelector';
import AuthDisclaimer from './commons/AuthDisclaimer';
import ImportCard from './commons/ImportCard';
import { useGlobalContext } from './context/Global';

const Authenticate: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);

  const [providerAccessToken, setProviderAccessToken] = useState<string | null>(null);
  const [providerErrorMessage, setProviderErrorMessage] = useState<string | null>();

  const [apiVideoApiKey, setApiVideoApiKey] = useState<string | null>(null);
  const [apiVideoErrorMessage, setApiVideoErrorMessage] = useState<string | null>(null);

  const { providerName, setProviderName, setProviderAccessToken: globalSetProviderAccessToken } = useGlobalContext();

  const router = useRouter();


  useEffect(() => {
    if (router?.query?.provider)
      setProviderName(router.query.provider.toString().toUpperCase() as ProviderName);
  }, [router, setProviderName]);



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

  const provider: ImportProvider | undefined = providerName && Providers
    ? Providers[providerName]
    : undefined;


  const validateApiVideoAuthentication = async (): Promise<string | null> => {
    let error = null;
    if (!apiVideoApiKey || apiVideoApiKey.trim() === '') {
      error = 'Please enter your api.video API key';
    } else {
      const res = await callVerifyApiVideoApiKeyApi({ apiKey: apiVideoApiKey });

      if (!res.ok) {
        error = 'Please verify your api key';
      }
    }

    setApiVideoErrorMessage(error);

    return error;
  };

  const handleAuthClick = async () => {
    setLoading(true);

    const authentValidation: (string | null)[] = await Promise.all(
      provider
        ? [validateApiVideoAuthentication(), validateProviderAuthentication()]
        : [validateApiVideoAuthentication()]
    );
    setLoading(false);
    if (authentValidation.length > 1) {
      setLoading(false);
      if (authentValidation[0]) {
        setApiVideoErrorMessage(authentValidation[0]);
      }
      else if (authentValidation[1]) {
        setProviderErrorMessage(authentValidation[1]);
      } else {
        router.push(
          `/${providerName?.toString().toLocaleLowerCase()}/video-selection`
        );
      }
    }
  };

  return (
    <ImportCard activeStep={2} paddingTop>
      <div className="flex flex-col md:flex-row text-sm gap-2 md:gap-10">
        <div className="flex flex-col md:w-2/4 gap-4">
          <h1 className="text-left font-semibold">Authentication</h1>
          <div className="hidden md:block">
            {' '}
            <AuthDisclaimer providerName={providerName} authenticationScopes={provider?.authenticationScopes} />
          </div>
        </div>
        <div className="flex flex-col md:w-2/4">
          <div className="flex flex-col gap-4">
            <ApiKeySelector
              mode={provider?.apiVideoAuthenticationMode || 'apiKey'}
              onApiKeyChange={(apiKey) => {
                setApiVideoApiKey(apiKey);
                setApiVideoErrorMessage(null);
              }}
              errorMessage={apiVideoErrorMessage}
              apiKey={apiVideoApiKey}
            />

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
              buttonDisabled={loading || !providerAccessToken || !apiVideoApiKey}
              onClick={handleAuthClick}
              loading={loading}
            />
          )}
          <div className="block pt-4 md:hidden">
            {' '}
            <AuthDisclaimer providerName={providerName} authenticationScopes={provider?.authenticationScopes} />
          </div>
        </div>
      </div>
      <div className="w-full bg-yellow-50 flex gap-10 text-xs p-4 rounded mt-8 text-blue-900">
        <AlertTriangle color={'#F59E0B'} size={12} strokeWidth={'.2rem'} />
        <ul>
          <li className="list-disc">If you are importing to a sandbox project, your videos will be watermarked and deleted after 24 hours.</li>
          <li className="list-disc">If you are importing to a production project, your videos will count towards your encoding and hosting usage quota.</li>
          <li>Depending on your plan, this might incur additional usage charges.</li>
        </ul>
      </div>
    </ImportCard>
  );
};

export default Authenticate;
