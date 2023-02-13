import Video from "@api.video/nodejs-client/lib/model/Video";
import { ProviderName } from "../providers";

export default interface VideoSource {
    id: string;
    name: string;
    url?: string;
    thumbnail: string;
    duration?: number;
    size?: number;
}

export type Page<T> = {
    data: T[];
    hasMore: boolean;
    nextPageFetchDetails: any;
}

export type ApiVideoAuthenticationContext = {
    apiVideoApiKey: string;
};

export type ProviderAuthenticationContext = {
    accessToken: string;
    additionnalData?: any;
};  

export type AuthenticationContext = ApiVideoAuthenticationContext & ProviderAuthenticationContext;

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