import { NextApiResponse } from "next";
import { OauthAccessToken, RevokeAccessTokenResponse } from "../service/OAuthHelpers";
import VideoSource, { Page } from "../types/common";

abstract class AbstractProviderService {
    abstract getImportableVideos(nextPageFetchDetails?: any): Promise<Page<VideoSource>>;
    abstract validateCredentials(): Promise<string | null>;
    abstract generatePublicMp4(videoSource: VideoSource): Promise<VideoSource>; 
    abstract getOauthAccessToken(code: string): Promise<OauthAccessToken>;
    abstract revokeOauthAccessToken(): Promise<RevokeAccessTokenResponse>;
    abstract getPublicMp4Url(videoSource: VideoSource): Promise<VideoSource>;
    abstract videoDownloadProxy(data: string, res: NextApiResponse): Promise<void>;
    abstract fetchAdditionalUserDataAfterSignin(): Promise<any>;
}

export default AbstractProviderService;