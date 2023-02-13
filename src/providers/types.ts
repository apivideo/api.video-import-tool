import { ApiKeySelectorMode } from '../components/commons/ApiKeySelector';
import { ProviderAuthenticationContext } from '../types/common';
import AbstractProviderService from './AbstractProviderService';

export type ProviderAuthenticationData = ProviderAuthenticationContext & { filled: boolean };

export interface ProviderLoginProps {
  onAuthenticationDataChanged: (providerAuthenticationData: ProviderAuthenticationData | null) => void;
  authenticationData: ProviderAuthenticationData | null;
  errorMessage?: string;
}

export enum OptionalFeatureFlag {
  ProviderCredentialsBackendValidation,
  GeneratePublicMp4UrlBeforeVideoCreation,
  WaitForPublicMp4Availibility,
}

export type AuthenticationScope = {
  name: string;
  description: string;
};

export type VideoSourceTableColumn = {
  title: string;
  attributeName: string;
  sortFunction: (a: any, b: any, order: number) => number;
  formatter?: (value: any) => string;
}

export type VideoSourceTableSettings = {
  showThumnail: boolean;
  columns: VideoSourceTableColumn[];
}

export type ImportProvider = {
  displayName: string;
  description?: string;
  imgSrc: string;
  loginComponent: React.FC<ProviderLoginProps>;
  hidden?: boolean;
  backendService: {
    new(
      authenticationContext?: ProviderAuthenticationContext
    ): AbstractProviderService;
  };
  hasFeature: (feature: OptionalFeatureFlag) => boolean;
  providerErrorMessage?: string | React.ReactNode;
  authenticationScopes?: AuthenticationScope[];
  videoTableSettings: VideoSourceTableSettings;
  apiVideoAuthenticationMode: ApiKeySelectorMode;
};

