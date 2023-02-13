import { NextApiResponse } from "next";
import { OauthAccessToken, RevokeAccessTokenResponse } from "../../service/OAuthHelpers";
import VideoSource, { Page, ProviderAuthenticationContext } from "../../types/common";
import { uppercaseFirstLetter } from "../../utils/functions";
import AbstractProviderService from "../AbstractProviderService";


type VimeoVideo = {
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


type VimeoApiResult = {
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
    
    public videoDownloadProxy(data: string, res: NextApiResponse<any>): Promise<void> {
        throw new Error("Method not implemented.");
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

    public getOauthAccessToken(code: string): Promise<OauthAccessToken> {
        throw new Error("Method not implemented.");
    }

    public generatePublicMp4(videoSource: VideoSource): Promise<VideoSource> {
        throw new Error("Method not implemented.");
    }

    public async getImportableVideos(nextPageFetchDetails?: any): Promise<Page<VideoSource>> {
        const videos: VimeoApiResult = await this.callApi(`https://api.vimeo.com/me/videos?page=${nextPageFetchDetails?.page || 1}`)

        return {
            data: videos.data.filter((video) => video?.files?.length).map((video) => this.vimeoVideoToVideoSource(video)),
            hasMore: !!videos.paging.next,
            nextPageFetchDetails: {
                page: videos.page + 1
            }
        }
    };

    public async validateCredentials(): Promise<string | null> {
        if (!this.authenticationContext?.accessToken) {
            return "Vimeo access token is required";
        }
        try {
            return await this.callApi("https://api.vimeo.com/me").then(res => {
                if (res.account === "basic" || res.account === "plus" || res.account === "free") {
                    return `${uppercaseFirstLetter(res.account)} Vimeo account is not compatible with the import tool`;
                }
                return null;
            });
        } catch (e) {
            return "Your access token seems to be invalid";
        }
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

    private async callApi(url: string): Promise<any> {
        const headers = new Headers();

        if (!this.authenticationContext) {
            throw new Error("Authentication context is required");
        }

        headers.append("Authorization", `bearer ${this.authenticationContext.accessToken}`);
        headers.append("Content-Type", "application/json");
        headers.append("Accept", "application/vnd.vimeo.*+json;version=3.4");

        const res = await fetch(url, {
            method: "GET",
            headers,
        });

        if (!res.ok) {
            throw new Error("Vimeo API call failed: " + res.statusText);
        }

        return await res.json();

    }
}

export default VimeoProviderService;