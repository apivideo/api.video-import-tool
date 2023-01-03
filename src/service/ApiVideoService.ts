import ApiVideoClient from "@api.video/nodejs-client";
import Video from "@api.video/nodejs-client/lib/model/Video";
import VideoStatus from "@api.video/nodejs-client/lib/model/VideoStatus";
import packageJson from '../../package.json';
import { ProviderName } from "../providers";

export type VideoCreationOptions = {
    title: string;
    source: string;
    providerName: ProviderName;
    migrationId: string;
    videoSourceId: string;
    videoSourceSize?: number;
}

export type VideoWithStatus = Video & {
    status?: VideoStatus
}


class ApiVideoService {
    apiKey: string;
    client: ApiVideoClient;

    constructor(apiKey: string) {
        this.apiKey = apiKey;
        this.client = new ApiVideoClient({
            apiKey,
            applicationName: "apivideo-migration-tool",
            applicationVersion: packageJson.version,
        });
    }

    public async createVideo(options: VideoCreationOptions): Promise<Video> {
        return await this.client.videos.create({
            title: options.title,
            source: options.source,
            metadata: [
                { key: "x-apivideo-is-import", value: "1" },
                { key: "x-apivideo-import-provider", value: options.providerName as string },
                { key: "x-apivideo-import-id", value: options.migrationId },
                { key: "x-apivideo-import-video-id", value: options.videoSourceId },
                { key: "x-apivideo-import-video-size", value: `${options.videoSourceSize}` },
            ]
        });
    }

    public async getVideosStatuses(videos: Video[]): Promise<VideoWithStatus[]> {
        const promises: Promise<VideoWithStatus>[] = videos.map(v => this.client.videos.getStatus(v.videoId).then(status => ({
            ...v,
            status
        })));

        return Promise.all(promises)
    }

    public async apiKeyIsValid(): Promise<boolean> {
        try {
            const token = await this.client.getAccessToken();
            return !!token;
        } catch (e) {
            return false;
        }
    }

    public async getMigrations(provider?: ProviderName): Promise<Video[]> {
        let allVideos: Video[] = [];

        const metadata: { [key: string]: string; } = provider
            ? { "x-apivideo-import-provider": provider as string }
            : { "x-apivideo-is-import": "1" };

        for (let currentPage = 1; ; currentPage++) {
            const res = await this.client.videos.list({ metadata, currentPage });
            allVideos = [...allVideos, ...res.data];
            if (currentPage >= (res?.pagination?.pagesTotal || 0)) {
                break;
            }
        }

        return allVideos;
    }

    public async getMigrationById(migrationId: string): Promise<Video[]> {
        let allVideos: Video[] = [];

        for (let currentPage = 1; ; currentPage++) {
            const res = await this.client.videos.list({ metadata: { "x-apivideo-import-id": migrationId }, currentPage });
            allVideos = [...allVideos, ...res.data];
            if (currentPage >= (res?.pagination?.pagesTotal || 0)) {
                break;
            }
        }

        return allVideos;
    }
}

export default ApiVideoService;