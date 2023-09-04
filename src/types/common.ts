import Video from "@api.video/nodejs-client/lib/model/Video";
import { ProviderName } from "../providers";

export default interface VideoSource {
    id: string;
    name: string;
    url?: string;
    thumbnail?: string;
    duration?: number;
    size?: number;
    folder?: string;
    creationDate?: string;
}

export type Page<T> = {
    data: T[];
    hasMore: boolean;
    nextPageFetchDetails: any;
}

export type ApiVideoAuthenticationContext = {
    apiVideoApiKey: string;
};

export type EcryptedApiVideoAuthenticationContext = {
    encryptedApiKey: string;
};

export type ClearProviderAuthenticationContext = {
    clearPrivateData?: string;
    publicData?: any;
};  

export type EncryptedProviderAuthenticationContext = {
    encryptedPrivateData?: string;
    publicData?: any;
};  

export type CredentialsValidationResult = {
    error?: string;
    encryptedPrivateData?: string;
    publicData?: any;
}

export type ClearAuthenticationContext = ApiVideoAuthenticationContext & ClearProviderAuthenticationContext;
export type EncryptedAuthenticationContext = ApiVideoAuthenticationContext & EncryptedProviderAuthenticationContext;

export type ApiResponse<T> = {
    data?: T;
    error?: string;
}

export type Import = {
    id: string;
    date: Date;
    videos: Video[];
    providerName: ProviderName;
};

export const SuccessResponse = <T>(data: T) => ({
    data
});

export const ErrorResponse = (error: string) => ({
    error
});



export const MethodNotAllowedResponse = ErrorResponse("Method not allowed");