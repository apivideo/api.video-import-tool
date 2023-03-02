import { EncryptedOauthAccessToken, RevokeAccessTokenResponse } from "../../service/OAuthHelpers";
import VideoSource, { CredentialsValidationResult, EncryptedProviderAuthenticationContext, Page } from "../../types/common";
import { decryptProviderAuthenticationContext, encrypt } from "../../utils/functions/crypto";
import AbstractProviderService from "../AbstractProviderService";



type S3Params = {
    bucket: string;
    object: string;
    accessKey: string;
    secretKey: string;
}

export type ProjectBucket = {
    projectName: string;
    projectId: string;
    buckets: string[];
}

const VIDEO_FILE_EXTENSIONS = ['.webm', '.mkv', '.flv', '.vob', '.ogv', '.ogg', '.rrc', '.gifv', '.mng', '.mov', '.avi', '.qt', '.wmv', '.yuv', '.rm', '.asf', '.amv', '.mp4', '.m4p', '.m4v', '.mpg', '.mp2', '.mpeg', '.mpe', '.mpv', '.m4v', '.svi', '.3gp', '.3g2', '.mxf', '.roq', '.nsv', '.flv', '.f4v', '.f4p', '.f4a', '.f4b', '.mod'];

class GcsProviderService implements AbstractProviderService {
    accessKey: string;
    secretKey: string;


    constructor(authenticationContext?: EncryptedProviderAuthenticationContext) {
        if (authenticationContext?.encryptedAccessToken) {
            const decrypted = decryptProviderAuthenticationContext(authenticationContext);
            const decryptedAccessToken = JSON.parse(decrypted.accessToken);
            this.accessKey = decryptedAccessToken.accessKey;
            this.secretKey = decryptedAccessToken.secretKey;
        } else {
            this.accessKey = authenticationContext?.additionnalData.accessKey;
            this.secretKey = authenticationContext?.additionnalData.secretKey;
        }

    }

    public async fetchAdditionalUserDataAfterSignin(): Promise<any> {
        throw new Error("Method not implemented.");
    }

    public async revokeOauthAccessToken(): Promise<RevokeAccessTokenResponse> {
        throw new Error("Method not implemented.");
    }

    public async getPublicMp4Url(videoSource: VideoSource): Promise<VideoSource> {
        const apiRes = await this.callApi(`https://api.mux.com/video/v1/assets/${videoSource.id}`, "GET");

        return {
            ...videoSource,
            url: apiRes.data.master?.url,
        }
    }

    public async getOauthAccessToken(code: string): Promise<EncryptedOauthAccessToken> {
        throw new Error("Method not implemented.");
    }

    public async generatePublicMp4(videoSource: VideoSource): Promise<VideoSource> {

        if (!videoSource.url || videoSource.url.length === 0) {
            await this.callApi(`https://api.mux.com/video/v1/assets/${videoSource.id}/master-access`, "PUT", {
                "master_access": "temporary"
            });
        }
        return videoSource;
    }

    public async validateCredentials(): Promise<CredentialsValidationResult> {
        const apiRes = await this.callApi("https://api.mux.com/video/v1/assets", "GET");

        if (apiRes.error) {
            return {
                error: apiRes.error.messages[0]
            }
        }

        return {
            encryptedAccessToken: encrypt(JSON.stringify({ accessKey: this.accessKey, secretKey: this.secretKey })),
        }
    }

    public async getImportableVideos(nextPageFetchDetails?: any): Promise<Page<VideoSource>> {
        const apiRes = await this.callApi("https://api.mux.com/video/v1/assets" + (nextPageFetchDetails?.page ? `?page=${nextPageFetchDetails?.page }` : ""), "GET");
        const hasMore = apiRes.data.length == 25;

        return {
            data: apiRes.data.map((video: any) => ({
                id: video.id,
                name: video.id,
                duration: video.duration,
                date: new Date(video.created_at! * 1000),
                url: video.master?.url,
            })),
            nextPageFetchDetails: hasMore ? { page: nextPageFetchDetails?.page ? nextPageFetchDetails?.page + 1 : 2 } : undefined,
            hasMore
        };
    };

    private async callApi(path: string, method: string, body?: any): Promise<any> {
        const fetchRes = await fetch(path, {
            method: method,
            headers: {
                Authorization: `Basic ${btoa(`${this.accessKey}:${this.secretKey}`)}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body)
        });
        return await fetchRes.json();
    }

}

export default GcsProviderService;