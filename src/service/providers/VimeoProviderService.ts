import VideoSource, { Page, ProviderAuthenticationContext } from "../../types/common";
import { OauthAccessToken } from "../oauth";
import AbstractProviderService from "./AbstractProviderService";


interface VimeoVideo {
    uri: string;
    name: string;
    duration: number;
    files: {
        rendition: string;
        type: string;
        width: number;
        height: number;
        link: string;
        size: number;
    }[];
    pictures: {
        sizes: {
            width: number;
            height: number;
            link: string;
        }[];
    };
}


interface VimeoApiResult {
    data: VimeoVideo[];
    total: number,
    page: number,
    per_page: number,
    paging: {
        next: string | null,
        previous: string | null
    },
}


class VimeoProviderService implements AbstractProviderService {
    authenticationContext?: ProviderAuthenticationContext;

    constructor(authenticationContext?: ProviderAuthenticationContext) {
        this.authenticationContext = authenticationContext;
    }

    public getOauthAccessToken(code: string): Promise<OauthAccessToken> {
        throw new Error("Method not implemented.");
    }

    public beforeVideoCreationHook(videoSource: VideoSource): Promise<VideoSource> {
        throw new Error("Method not implemented.");
    }

    public async getImportableVideos(nextPageFetchDetails?: any): Promise<Page<VideoSource>> {
        const videos: VimeoApiResult = await this.callVimeoApi(`https://api.vimeo.com/me/videos?page=${nextPageFetchDetails?.page || 1}`)

        return {
            data: videos.data.map((video) => this.vimeoVideoToVideoSource(video)),
            hasMore: !!videos.paging.next,
            nextPageFetchDetails: {
                page: videos.page + 1
            }
        }
    };

    public async validateCredentials(): Promise<string | null> {
        if(!this.authenticationContext?.providerAccessToken) { 
            return "Vimeo access token is required";
        }
        let error = await this.callVimeoApi("https://api.vimeo.com/me").then(res => {
            if (res.error) {
                return "Your access token seems to be invalid";
            }
            if (res.account === "basic" || res.account === "plus") {
                return "Basic and Plus Vimeo account are not compatible with the migration tool";
            }
            return null;
        });
        return error;
    }

    vimeoVideoToVideoSource(vimeoVideo: VimeoVideo): VideoSource {
        const bestSource = vimeoVideo.files
            .filter(f => f.type === "video/mp4")
            .sort((a, b) => b.height - a.height)[0];

        return {
            id: vimeoVideo.uri.split("/")[2],
            name: vimeoVideo.name,
            duration: vimeoVideo.duration,
            url: bestSource.link,
            size: bestSource.size,
            thumbnail: vimeoVideo.pictures.sizes[0].link
        };
    }

    private callVimeoApi(url: string): Promise<any> {
        const headers = new Headers();

        if(!this.authenticationContext) {
            throw new Error("Authentication context is required");
        }

        headers.append("Authorization", `bearer ${this.authenticationContext.providerAccessToken}`);
        headers.append("Content-Type", "application/json");
        headers.append("Accept", "application/vnd.vimeo.*+json;version=3.4");

        return fetch(url, {
            method: "GET",
            headers,
        })
            .then((response) => response.json());

    }
}

export default VimeoProviderService;