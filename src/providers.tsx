import DropboxLogin from './components/provider-login/DropboxLogin';
import VimeoLogin from './components/provider-login/VimeoLogin';
import AbstractProviderService from './service/providers/AbstractProviderService';
import DropboxProviderService from './service/providers/DropboxProviderService';
import VimeoProviderService from './service/providers/VimeoProviderService';
import { ProviderAuthenticationContext } from './types/common';

export type ProviderName = keyof typeof Providers;

export interface ProviderLoginProps {
  onAccessTokenChanged: (accessToken: string | null) => void;
  providerAccessToken: string;
  errorMessage?: string;
  buttonDisabled?: boolean;
  onClick?: () => void;
  loading?: boolean;
}

export enum OptionalFeatureFlag {
  ProviderCredentialsBackendValidation,
  GeneratePublicMp4UrlBeforeVideoCreation,
  WaitForPublicMp4Availibility,
}

export type ImportProvider = {
  displayName: string;
  description?: string;
  title: JSX.Element;
  imgSrc: string;
  intro?: JSX.Element;
  loginComponent: React.FC<ProviderLoginProps>;
  backendService: {
    new (
      authenticationContext?: ProviderAuthenticationContext
    ): AbstractProviderService;
  };
  hasFeature: (feature: OptionalFeatureFlag) => boolean;
  providerErrorMessage?: string | React.ReactNode;
};

export const Providers: { [name: string]: ImportProvider } = {
  VIMEO: {
    displayName: 'Vimeo',
    description: '⚠️ Pro Vimeo plan required',
    intro: (
      <>
        <b>Note</b>: you need at least a <b>Pro</b> Vimeo plan to use this tool.{' '}
        <b>Basic</b> and <b>Plus</b> plans are not supported.
      </>
    ),
    title: (
      <>
        Welcome to the <span style={{ color: 'rgb(0, 173, 239)' }}>Vimeo</span>{' '}
        to <span className="orange">api.video</span> import tool
      </>
    ),
    imgSrc: '/vimeo.svg',
    loginComponent: VimeoLogin,
    backendService: VimeoProviderService,
    hasFeature: (feature: OptionalFeatureFlag) =>
      [OptionalFeatureFlag.ProviderCredentialsBackendValidation].indexOf(
        feature
      ) !== -1,
    providerErrorMessage: (
      <p>
        Make sure you have correctly set the scopes of your{' '}
        <a
          className="text-blue-500 underline"
          href="https://import.api.video/doc/generate-a-vimeo-access-token"
          target="_blank"
          rel="noreferrer"
        >
          access token
        </a>
        .
      </p>
    ),
  },
  DROPBOX: {
    displayName: 'Dropbox',
    description: 'Import from Dropbox',
    title: (
      <>
        Welcome to the <span style={{ color: '#0061fe' }}>Dropbox</span> to{' '}
        <span className="orange">api.video</span> import tool
      </>
    ),
    imgSrc: '/dropbox.svg',
    loginComponent: DropboxLogin,
    backendService: DropboxProviderService,
    hasFeature: (feature: OptionalFeatureFlag) =>
      [OptionalFeatureFlag.GeneratePublicMp4UrlBeforeVideoCreation].indexOf(
        feature
      ) !== -1,
  },
};
