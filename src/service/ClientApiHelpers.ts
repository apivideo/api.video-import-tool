import { CreateApiVideoVideoRequestBody, CreateApiVideoVideoRequestResponse } from "../pages/api/apivideo/create-video";
import { GetMigrationRequestBody, GetMigrationRequestResponse } from "../pages/api/apivideo/get-migration";
import { GetMigrationsRequestBody, GetMigrationsRequestResponse } from "../pages/api/apivideo/get-migrations";
import { GetVideosStatusRequestBody, GetVideosStatusRequestResponse } from "../pages/api/apivideo/get-videos-status";
import { VerifyApiKeyRequestBody, VerifyApiKeyRequestResponse } from "../pages/api/apivideo/verify-api-key";
import { GeneratePublicMp4RequestBody, GeneratePublicMp4RequestResponse } from "../pages/api/providers/generate-public-mp4";
import { GetImportableVideosRequestBody, GetImportableVideosRequestResponse } from "../pages/api/providers/get-importable-videos";
import { GetOauthAccessTokenRequestBody, GetOauthAccessTokenRequestResponse } from "../pages/api/providers/get-oauth-access-token";
import { GetPublicMp4UrlRequestBody, GetPublicMp4UrlRequestResponse } from "../pages/api/providers/get-public-mp4-url";
import { ValidateProviderCredentialsRequestBody, ValidateProviderCredentialsRequestResponse } from "../pages/api/providers/validate-provider-credentials";
import { ApiResponse } from "../types/common";


export const callGeneratePublicMp4Api = async (body: GeneratePublicMp4RequestBody) =>
    callApi<GeneratePublicMp4RequestResponse, GeneratePublicMp4RequestBody>("/api/providers/generate-public-mp4", "POST", body);

export const callGetPublicMp4UrlApi = async (body: GetPublicMp4UrlRequestBody) =>
    callApi<GetPublicMp4UrlRequestResponse, GetPublicMp4UrlRequestBody>("/api/providers/get-public-mp4-url", "POST", body);

export const callCreateApiVideoVideoApi = async (body: CreateApiVideoVideoRequestBody) =>
    callApi<CreateApiVideoVideoRequestResponse, CreateApiVideoVideoRequestBody>("/api/apivideo/create-video", "POST", body);

export const callGetOAuthAccessTokenApi = async (body: GetOauthAccessTokenRequestBody) =>
    callApi<GetOauthAccessTokenRequestResponse, GetOauthAccessTokenRequestBody>("/api/providers/get-oauth-access-token", "POST", body);

export const callGetImportableVideosApi = async (body: GetImportableVideosRequestBody) =>
    callApi<GetImportableVideosRequestResponse, GetImportableVideosRequestBody>("/api/providers/get-importable-videos", "POST", body);

export const callGetMigrationsApi = async (body: GetMigrationsRequestBody) =>
    callApi<GetMigrationsRequestResponse, GetMigrationsRequestBody>("/api/apivideo/get-migrations", "POST", body);

export const callGetMigrationApi = async (body: GetMigrationRequestBody) =>
    callApi<GetMigrationRequestResponse, GetMigrationRequestBody>("/api/apivideo/get-migration", "POST", body);

export const callGetVideosStatusApi = async (body: GetVideosStatusRequestBody) =>
    callApi<GetVideosStatusRequestResponse, GetVideosStatusRequestBody>("/api/apivideo/get-videos-status", "POST", body);

export const callVerifyApiVideoApiKeyApi = async (body: VerifyApiKeyRequestBody) =>
    callApi<VerifyApiKeyRequestResponse, VerifyApiKeyRequestBody>("/api/apivideo/verify-api-key", "POST", body);

export const callValidateProviderCredentialsApi = async (body: ValidateProviderCredentialsRequestBody) =>
    callApi<ValidateProviderCredentialsRequestResponse, ValidateProviderCredentialsRequestBody>("/api/providers/validate-provider-credentials", "POST", body);

const callApi = async <U, T>(url: string, method: "POST" | "GET" = "POST", body?: T): Promise<U> => {
    const res: ApiResponse<U> = await fetch(url, {
        method: method,
        body: JSON.stringify(body)
    }).then(a => a.json());

    if (res.error) {
        throw new Error(res.error);
    }
    return res.data!;
}
