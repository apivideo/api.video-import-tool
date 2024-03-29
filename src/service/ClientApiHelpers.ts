import { CreateApiVideoVideoRequestBody, CreateApiVideoVideoRequestResponse } from "../pages/api/apivideo/create-video";
import { GetImportRequestBody, GetImportRequestResponse } from "../pages/api/apivideo/get-import";
import { GetImportsRequestBody, GetImportsRequestResponse } from "../pages/api/apivideo/get-imports";
import { GetVideosStatusRequestBody, GetVideosStatusRequestResponse } from "../pages/api/apivideo/get-videos-status";
import { GetApiVideoApiKeysResponse } from "../pages/api/apivideo/keys";
import { VerifyApiKeyRequestBody, VerifyApiKeyRequestResponse } from "../pages/api/apivideo/verify-api-key";
import { FetchAdditionalUserDataAfterSigninRequestBody, FetchAdditionalUserDataAfterSigninRequestResponse } from "../pages/api/providers/fetch-additional-user-data-after-signin";
import { GeneratePublicMp4RequestBody, GeneratePublicMp4RequestResponse } from "../pages/api/providers/generate-public-mp4";
import { GetImportableVideosRequestBody, GetImportableVideosRequestResponse } from "../pages/api/providers/get-importable-videos";
import { GetOauthAccessTokenRequestBody, GetOauthAccessTokenRequestResponse } from "../pages/api/providers/get-oauth-access-token";
import { GetPublicMp4UrlRequestBody, GetPublicMp4UrlRequestResponse } from "../pages/api/providers/get-public-mp4-url";
import { RevokeOauthAccessTokenRequestBody } from "../pages/api/providers/revoke-oauth-access-token";
import { ValidateProviderCredentialsRequestBody, ValidateProviderCredentialsRequestResponse } from "../pages/api/providers/validate-provider-credentials";
import { ApiResponse } from "../types/common";
import { RevokeAccessTokenResponse } from "./OAuthHelpers";


export const callGeneratePublicMp4Api = async (body: GeneratePublicMp4RequestBody) =>
    callApi<GeneratePublicMp4RequestResponse, GeneratePublicMp4RequestBody>("/api/providers/generate-public-mp4", "POST", body);

export const callGetPublicMp4UrlApi = async (body: GetPublicMp4UrlRequestBody) =>
    callApi<GetPublicMp4UrlRequestResponse, GetPublicMp4UrlRequestBody>("/api/providers/get-public-mp4-url", "POST", body);

export const callCreateApiVideoVideoApi = async (body: CreateApiVideoVideoRequestBody) =>
    callApi<CreateApiVideoVideoRequestResponse, CreateApiVideoVideoRequestBody>("/api/apivideo/create-video", "POST", body);

export const callGetOAuthAccessTokenApi = async (body: GetOauthAccessTokenRequestBody) =>
    callApi<GetOauthAccessTokenRequestResponse, GetOauthAccessTokenRequestBody>("/api/providers/get-oauth-access-token", "POST", body);

export const callRevokeAccessTokenApi = async (body: RevokeOauthAccessTokenRequestBody) =>
    callApi<RevokeAccessTokenResponse, RevokeOauthAccessTokenRequestBody>("/api/providers/revoke-oauth-access-token", "POST", body);

export const callGetImportableVideosApi = async (body: GetImportableVideosRequestBody) =>
    callApi<GetImportableVideosRequestResponse, GetImportableVideosRequestBody>("/api/providers/get-importable-videos", "POST", body);

export const callGetImportsApi = async (body: GetImportsRequestBody) =>
    callApi<GetImportsRequestResponse, GetImportsRequestBody>("/api/apivideo/get-imports", "POST", body);

export const callGetImportApi = async (body: GetImportRequestBody) =>
    callApi<GetImportRequestResponse, GetImportRequestBody>("/api/apivideo/get-import", "POST", body);

export const callGetVideosStatusApi = async (body: GetVideosStatusRequestBody) =>
    callApi<GetVideosStatusRequestResponse, GetVideosStatusRequestBody>("/api/apivideo/get-videos-status", "POST", body);

export const callVerifyApiVideoApiKeyApi = async (body: VerifyApiKeyRequestBody) =>
    callApi<VerifyApiKeyRequestResponse, VerifyApiKeyRequestBody>("/api/apivideo/verify-api-key", "POST", body);

export const callGetApiVideoApiKeysApi = async (accessToken: string) =>
    callApi<GetApiVideoApiKeysResponse, void>("/api/apivideo/keys", "GET", undefined, { authorization: `Bearer ${accessToken}` });

export const callValidateProviderCredentialsApi = async (body: ValidateProviderCredentialsRequestBody) =>
    callApi<ValidateProviderCredentialsRequestResponse, ValidateProviderCredentialsRequestBody>("/api/providers/validate-provider-credentials", "POST", body);


export const callFetchAdditionalUserDataAfterSigninApi = async (body: FetchAdditionalUserDataAfterSigninRequestBody) =>
    callApi<FetchAdditionalUserDataAfterSigninRequestResponse, FetchAdditionalUserDataAfterSigninRequestBody>("/api/providers/fetch-additional-user-data-after-signin", "POST", body);

const callApi = async <U, T>(url: string, method: "POST" | "GET", body: T, headers?: HeadersInit): Promise<U> => {
    const res: ApiResponse<U> = await fetch(url, {
        method: method,
        body: JSON.stringify(body),
        headers
    }).then(a => a.json());

    if (res.error) {
        throw new Error(res.error);
    }
    return res.data!;
}
