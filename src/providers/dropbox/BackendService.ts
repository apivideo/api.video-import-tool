import { DROPBOX_CLIENT_ID, DROPBOX_CLIENT_SECRET, DROPBOX_REDIRECT_URL } from "../../env";
import { EncryptedOauthAccessToken, getOauthAccessTokenCall, RevokeAccessTokenResponse } from "../../service/OAuthHelpers";
import VideoSource, { ClearProviderAuthenticationContext, CredentialsValidationResult, EncryptedProviderAuthenticationContext, Page } from "../../types/common";
import { decryptProviderAuthenticationContext, encryptAccessToken } from "../../utils/functions/crypto";
import AbstractProviderService from "../AbstractProviderService";

type DropboxSearchApiResponse = {
    has_more: boolean;
    cursor: string;
    matches: Array<{
        metadata: {
            metadata: {
                client_modified: string;
                content_hash: string;
                id: string;
                is_downloadable: boolean;
                name: string;
                path_display: string;
                path_lower: string;
                rev: string;
                server_modified: string;
                size: number;
            }
        }
    }>
}


class DropboxProviderService implements AbstractProviderService {
    accessToken?: string;

    constructor(clearAuthenticationContext?: ClearProviderAuthenticationContext,
        encryptedAuthenticationContext?: EncryptedProviderAuthenticationContext) {
        if(encryptedAuthenticationContext) {
            this.accessToken = decryptProviderAuthenticationContext(encryptedAuthenticationContext).clearPrivateData;
        } 
    }

    public fetchAdditionalUserDataAfterSignin(): Promise<any> {
        throw new Error("Method not implemented.");
    }
    
    public revokeOauthAccessToken(): Promise<RevokeAccessTokenResponse> {
        throw new Error("Method not implemented.");
    }

    public getPublicMp4Url(videoSource: VideoSource): Promise<VideoSource> {
        throw new Error("Method not implemented.");
    }

    public async getOauthAccessToken(code: string): Promise<EncryptedOauthAccessToken> {
        return encryptAccessToken(await getOauthAccessTokenCall("https://api.dropbox.com/oauth2/token", DROPBOX_CLIENT_ID, DROPBOX_CLIENT_SECRET, DROPBOX_REDIRECT_URL, code));
    }

    public async generatePublicMp4(videoSource: VideoSource): Promise<VideoSource> {
        const dropboxRes = await this.callApi("https://api.dropboxapi.com/2/files/get_temporary_link", "POST", {
            "path": videoSource.id
        });

        return {
            ...videoSource,
            url: dropboxRes.link
        }
    }

    public async validateCredentials(): Promise<CredentialsValidationResult> {
        throw new Error("Method not implemented.");
    }

    public async getImportableVideos(nextPageFetchDetails?: any): Promise<Page<VideoSource>> {
        const dropboxRes: DropboxSearchApiResponse = nextPageFetchDetails
            ? await this.callApi("https://api.dropboxapi.com/2/files/search/continue_v2", "POST", nextPageFetchDetails)
            : await this.callApi("https://api.dropboxapi.com/2/files/search_v2", "POST", {
                options: {
                    file_status: "active",
                    filename_only: false,
                    max_results: 20,
                    path: "/",
                    file_categories: ["video"],
                    order_by: "last_modified_time"
                },
                query: "video"
            });

        const withThumbnails = await this.getThumbnails(dropboxRes);

        return {
            data: withThumbnails,
            hasMore: dropboxRes.has_more,
            nextPageFetchDetails: {
                cursor: dropboxRes.cursor
            }
        };
    };

    private async callApi(path: string, method: string, body?: any): Promise<any> {
        if (!this.accessToken) {
            throw new Error("No authentication context provided");
        }

        const headers = new Headers();
        headers.append("Authorization", "Bearer " + this.accessToken)
        headers.append("Content-Type", "application/json");

        const res = await fetch(path, {
            headers,
            method,
            body: JSON.stringify(body)
        });

        if (!res.ok) {
            const responseText = await res.text();
            throw new Error(`Dropbox API call failed: ${res.statusText}. Response: ${responseText}`);
        }

        return await res.json();
    }


    private async getThumbnails(searchResponse: DropboxSearchApiResponse): Promise<VideoSource[]> {
        const thumbnails = await this.callApi("https://content.dropboxapi.com/2/files/get_thumbnail_batch", "POST", {
            entries: searchResponse.matches.map(match => ({
                format: "jpeg",
                mode: "strict",
                size: "w128h128",
                path: match.metadata.metadata.path_lower
            }))
        });

        return searchResponse.matches.map(match => {
            let thumbnail = thumbnails.entries.find((entry: any) => entry.metadata.path_lower === match.metadata.metadata.path_lower);

            return {
                id: match.metadata.metadata.path_lower,
                name: match.metadata.metadata.name,
                thumbnail: thumbnail && thumbnail.thumbnail ? `data:image/jpg;base64, ${thumbnail.thumbnail}` : "",
                size: match.metadata.metadata.size
            }
        });

    }
}

export default DropboxProviderService;