import VideoSource, { Page } from "../../types/common";
import { OauthAccessToken } from "../OAuthHelpers";

abstract class AbstractProviderService {
    abstract getImportableVideos(nextPageFetchDetails?: any): Promise<Page<VideoSource>>;
    abstract validateCredentials(): Promise<string | null>;
    abstract generatePublicMp4(videoSource: VideoSource): Promise<VideoSource>; 
    abstract getOauthAccessToken(code: string): Promise<OauthAccessToken>;
    abstract getPublicMp4Url(videoSource: VideoSource): Promise<VideoSource>;
}

export default AbstractProviderService;