export default interface VideoSource {
    id: string;
    name: string;
    url: string;
    thumbnail: string;
    duration?: number;
    size: number;
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