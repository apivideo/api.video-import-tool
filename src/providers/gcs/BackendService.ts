import { NextApiResponse } from "next";
import { GCS_CLIENT_ID, GCS_CLIENT_SECRET, GCS_REDIRECT_URL } from "../../env";
import { getOauthAccessTokenCall, OauthAccessToken, RevokeAccessTokenResponse, revokeOauthAccessTokenCall } from "../../service/OAuthHelpers";
import VideoSource, { Page, ProviderAuthenticationContext } from "../../types/common";
import { decrypt, encrypt } from "../../utils/functions/crypto";
import AbstractProviderService from "../AbstractProviderService";

type GcsRecordingsApiResponse = {
    next_page_token: string;
}

type VideoDownloadProxyData = {
    bucket: string;
    objectName: string;
    accessToken: string;
}


export type ProjectBucket = {
    projectName: string;
    projectId: string;
    buckets: string[];
}

class GcsProviderService implements AbstractProviderService {
    authenticationContext?: ProviderAuthenticationContext;

    constructor(authenticationContext?: ProviderAuthenticationContext) {
        this.authenticationContext = authenticationContext;
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

    public async videoDownloadProxy(encryptedData: string, res: NextApiResponse<any>): Promise<void> {
        const data: VideoDownloadProxyData = JSON.parse(decrypt(encryptedData));
        console.log(data);
        const { bucket, objectName, accessToken } = data;

        const mediaRes = await fetch(`https://storage.googleapis.com/storage/v1/b/${bucket}/o/${encodeURIComponent(objectName)}?alt=media`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        });

        console.log(mediaRes.status);

        if (mediaRes.status !== 200) {
            res.status(500).send("Error");
            return;
        }

        res.setHeader("Content-Type", "video/mp4");
        res.setHeader("Content-Disposition", `attachment; filename=${objectName.replaceAll("/", "_")}`);
        //@ts-ignore
        mediaRes.body?.pipe(res);

        console.log(mediaRes.status);
    }

    public async revokeOauthAccessToken(): Promise<RevokeAccessTokenResponse> {
        return await revokeOauthAccessTokenCall("https://oauth2.googleapis.com/revoke", GCS_CLIENT_ID, GCS_CLIENT_SECRET, this.authenticationContext?.accessToken!);;
    }

    public getPublicMp4Url(videoSource: VideoSource): Promise<VideoSource> {
        throw new Error("Method not implemented.");
    }

    public async getOauthAccessToken(code: string): Promise<OauthAccessToken> {
        return await getOauthAccessTokenCall("https://oauth2.googleapis.com/token", GCS_CLIENT_ID, GCS_CLIENT_SECRET, GCS_REDIRECT_URL, code);;
    }

    public async generatePublicMp4(videoSource: VideoSource): Promise<VideoSource> {
        throw new Error("Method not implemented.");
    }

    public async validateCredentials(): Promise<string | null> {
        throw new Error("Method not implemented.");
    }

    public async getImportableVideos(nextPageFetchDetails?: any): Promise<Page<VideoSource>> {
        const bucket = this.authenticationContext?.additionnalData?.bucket;
        const res = await this.callApi(`https://storage.googleapis.com/storage/v1/b/${bucket}/o/`, "GET");

        return {
            data: res.items
                .filter((item: any) => item.contentType.indexOf("video") === 0)
                .map((item: any) => {
                    const data: VideoDownloadProxyData = {
                        bucket,
                        objectName: item.name,
                        accessToken: this.authenticationContext?.accessToken!
                    }
                    const url = `https://import.api.video/api/download?provider=gcs&data=${encrypt(JSON.stringify(data))}`;
                    console.log(url);
                    return {
                        id: item.name,
                        name: item.name,
                        size: item.size,
                        date: new Date(item.timeCreated),
                        url
                    }
                }),
            nextPageFetchDetails: null,
            hasMore: false
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