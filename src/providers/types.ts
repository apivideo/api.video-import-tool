import { ProviderAuthenticationContext } from '../types/common';
import AbstractProviderService from './AbstractProviderService';

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
  };
  
