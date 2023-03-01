import { EncryptedProviderAuthenticationContext } from '../types/common';

export type EncryptedProviderAuthenticationData = EncryptedProviderAuthenticationContext & { filled: boolean };

export interface ProviderLoginProps {
  onAuthenticationDataChanged: (providerAuthenticationData: Partial<EncryptedProviderAuthenticationData> | null) => void;
  authenticationData: EncryptedProviderAuthenticationData | null;
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
  hasFeature: (feature: OptionalFeatureFlag) => boolean;
  providerErrorMessage?: string | React.ReactNode;
  authenticationScopes?: AuthenticationScope[];
  videoTableSettings: VideoSourceTableSettings;
};

