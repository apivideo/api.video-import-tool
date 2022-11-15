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
    providerAccessToken: string;
};

export type AuthenticationContext = ApiVideoAuthenticationContext & ProviderAuthenticationContext;

export type ApiResponse<T> = {
    data?: T;
    error?: string;
}


export const SuccessResponse = <T> (data: T) => ({
    data
});

export const ErrorResponse = (error: string) => ({
    error
});

export const MethodNotAllowedResponse = ErrorResponse("Method not allowed");