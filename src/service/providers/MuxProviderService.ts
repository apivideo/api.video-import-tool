import VideoSource, { Page, ProviderAuthenticationContext } from "../../types/common";
import { OauthAccessToken } from "../OAuthHelpers";
import AbstractProviderService from "./AbstractProviderService";

type MuxVideo = {
    id: string;
    playback_ids: Array<{
        id: string;
        policy: string;
    }>;
    status: string;
    duration: number;
    created_at: string;
    updated_at: string;
    max_stored_resolution: string;
    max_stored_frame_rate: number;
    aspect_ratio: string;
    mp4_support: string;
    master_access: string;
    master?: {
        status: string;
        url?: string;
    }
}

type MuxVideoGetResult = {
    data: MuxVideo;
}

type MuxVideosListResult = {
    data: MuxVideo[];
}

class MuxProviderService implements AbstractProviderService {
    authenticationContext?: ProviderAuthenticationContext;

    constructor(authenticationContext?: ProviderAuthenticationContext) {
        this.authenticationContext = authenticationContext;
    }

    public async getPublicMp4Url(videoSource: VideoSource): Promise<VideoSource> {
        const getResult: MuxVideoGetResult = await this.callApi(`https://api.mux.com/video/v1/assets/${videoSource.id}`, "GET");
        return this.toVideoSource(getResult.data);
    }

    public async getOauthAccessToken(code: string): Promise<OauthAccessToken> {
        throw new Error("Method not implemented.");
    }

    public async generatePublicMp4(videoSource: VideoSource): Promise<VideoSource> {

        await this.callApi(`https://api.mux.com/video/v1/assets/${videoSource.id}/master-access`, "PUT", {
            master_access: "temporary"
        });

        return videoSource;
    }

    public async validateCredentials(): Promise<string | null> {
        const res = await this.callApi("https://api.mux.com/video/v1/assets", "GET");

        if (res.error) {
            return res.error.messages[0];
        }

        return null;
    }


    public async getImportableVideos(nextPageFetchDetails?: any): Promise<Page<VideoSource>> {
        const limit = 25;
        const page = nextPageFetchDetails?.page || 1;
        const res: MuxVideosListResult = await this.callApi(`https://api.mux.com/video/v1/assets?limit=${limit}&page=${page}`, "GET");

        const videoSources: VideoSource[] = res.data.map(video => this.toVideoSource(video));

        const hasMore = videoSources.length >= limit;
        return {
            data: videoSources,
            hasMore,
            nextPageFetchDetails: hasMore
                ? { page: (nextPageFetchDetails?.page || 1) + 1 }
                : {}
        };
    };

    private toVideoSource(video: MuxVideo): VideoSource {
        const publicPlaybackId = video.playback_ids.find(playbackId => playbackId.policy === "public")?.id;
        return {
            id: video.id,
            name: video.id,
            thumbnail: `https://image.mux.com/${publicPlaybackId}/thumbnail.jpg`,
            duration: video.duration,
            url: video?.master?.url
        }
    }

    private async callApi(path: string, method: string, body?: any): Promise<any> {
        if (!this.authenticationContext) {
            throw new Error("No authentication context provided");
        }

        const headers = new Headers();
        headers.append("Authorization", "Basic " + this.authenticationContext.providerAccessToken)
        headers.append("Content-Type", "application/json");

        const res = await fetch(path, {
            headers,
            method,
            body: JSON.stringify(body)
        });

        if(!res.ok) {
            throw new Error("Mux API call failed: " + res.statusText);
        }

        return await res.json();
    }


}

export default MuxProviderService;