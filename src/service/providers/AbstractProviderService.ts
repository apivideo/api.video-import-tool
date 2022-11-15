import VideoSource, { Page } from "../../types/common";
import { OauthAccessToken } from "../oauth";

abstract class AbstractProviderService {
    abstract getImportableVideos(nextPageFetchDetails?: any): Promise<Page<VideoSource>>;
    abstract validateCredentials(): Promise<string | null>;
    abstract beforeVideoCreationHook(videoSource: VideoSource): Promise<VideoSource>; 
    abstract getOauthAccessToken(code: string): Promise<OauthAccessToken>;
}

export default AbstractProviderService;