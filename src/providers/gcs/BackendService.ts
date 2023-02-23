import { GCS_CLIENT_ID, GCS_CLIENT_SECRET, GCS_REDIRECT_URL } from "../../env";
import { EncryptedOauthAccessToken, getOauthAccessTokenCall, RevokeAccessTokenResponse, revokeOauthAccessTokenCall } from "../../service/OAuthHelpers";
import VideoSource, { EncryptedProviderAuthenticationContext, Page, ProviderAuthenticationContext } from "../../types/common";
import { decryptProviderAuthenticationContext, encryptAccessToken, getVideoSourceProxyUrl } from "../../utils/functions/crypto";
import AbstractProviderService from "../AbstractProviderService";


export type ProjectBucket = {
    projectName: string;
    projectId: string;
    buckets: string[];
}

class GcsProviderService implements AbstractProviderService {
    authenticationContext?: ProviderAuthenticationContext;

    constructor(authenticationContext?: EncryptedProviderAuthenticationContext) {
        this.authenticationContext = authenticationContext ? decryptProviderAuthenticationContext(authenticationContext) : undefined;
    }

    public async fetchAdditionalUserDataAfterSignin(): Promise<any> {

        if (!this.authenticationContext) {
            throw new Error("No authentication context");
        }

        const res = await fetch(`https://cloudresourcemanager.googleapis.com/v1/projects`, {
            headers: {
                Authorization: `Bearer ${this.authenticationContext?.accessToken}`,
            }
        }).then(res => res.json());

        const buckets: ProjectBucket[] = (await Promise.all(res.projects.map(async (project: any) => {
            const projectBuckets = await fetch(`https://storage.googleapis.com/storage/v1/b?project=${project.projectId}`, {
                headers: {
                    Authorization: `Bearer ${this.authenticationContext?.accessToken}`,
                }
            })
                .then(res => res.json())
                .then((a) => a.items ? a.items.map((b: any) => b.name) : []);

            return {
                projectId: project.projectId,
                projectName: project.name,
                buckets: projectBuckets
            };
        }))).filter(a => a.buckets.length > 0);

        return buckets;
    }

    public async revokeOauthAccessToken(): Promise<RevokeAccessTokenResponse> {
        return await revokeOauthAccessTokenCall("https://oauth2.googleapis.com/revoke", GCS_CLIENT_ID, GCS_CLIENT_SECRET, this.authenticationContext?.accessToken!);;
    }

    public getPublicMp4Url(videoSource: VideoSource): Promise<VideoSource> {
        throw new Error("Method not implemented.");
    }

    public async getOauthAccessToken(code: string): Promise<EncryptedOauthAccessToken> {
        const res = encryptAccessToken(await getOauthAccessTokenCall("https://oauth2.googleapis.com/token", GCS_CLIENT_ID, GCS_CLIENT_SECRET, GCS_REDIRECT_URL, code));
        return res;
    }

    public async generatePublicMp4(videoSource: VideoSource): Promise<VideoSource> {
        throw new Error("Method not implemented.");
    }

    public async validateCredentials(): Promise<string | null> {
        throw new Error("Method not implemented.");
    }

    public async getImportableVideos(nextPageFetchDetails?: any): Promise<Page<VideoSource>> {
        const bucket = this.authenticationContext?.additionnalData?.bucket.split(":")[1];

        const res = await this.callApi(`https://storage.googleapis.com/storage/v1/b/${bucket}/o/` + (nextPageFetchDetails ? `?pageToken=${nextPageFetchDetails}` : ""), "GET");
        return {
            data: (res.items || [])
                .filter((item: any) => item.contentType.indexOf("video") === 0)
                .map((item: any) => ({
                    id: item.name,
                    name: item.name,
                    size: Math.round(item.size),
                    date: new Date(item.timeCreated),
                    url: getVideoSourceProxyUrl(
                        `https://storage.googleapis.com/storage/v1/b/${bucket}/o/${encodeURIComponent(item.name)}?alt=media`,
                        item.name,
                        this.authenticationContext?.accessToken!
                    )
                })),
            nextPageFetchDetails: res.nextPageToken,
            hasMore: !!res.nextPageToken
        }
    };

    private async callApi(path: string, method: string, body?: any): Promise<any> {
        if (!this.authenticationContext) {
            throw new Error("No authentication context provided");
        }

        const headers = new Headers();
        headers.append("Authorization", "Bearer " + this.authenticationContext.accessToken)
        headers.append("Content-Type", "application/json");

        const res = await fetch(path, {
            headers,
            method,
            body: JSON.stringify(body)
        });

        if (!res.ok) {
            const responseText = await res.text();
            throw new Error(`GCS API call failed: ${res.statusText}. Response: ${responseText}`);
        }

        return await res.json();
    }

}

export default GcsProviderService;