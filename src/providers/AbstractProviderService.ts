import { EncryptedOauthAccessToken, RevokeAccessTokenResponse } from "../service/OAuthHelpers";
import VideoSource, { CredentialsValidationResult, Page } from "../types/common";


abstract class AbstractProviderService {
    abstract getImportableVideos(nextPageFetchDetails?: any): Promise<Page<VideoSource>>;
    abstract validateCredentials(): Promise<CredentialsValidationResult>;
    abstract generatePublicMp4(videoSource: VideoSource): Promise<VideoSource>; 
    abstract getOauthAccessToken(code: string): Promise<EncryptedOauthAccessToken>;
    abstract revokeOauthAccessToken(): Promise<RevokeAccessTokenResponse>;
    abstract getPublicMp4Url(videoSource: VideoSource): Promise<VideoSource>;
    abstract fetchAdditionalUserDataAfterSignin(): Promise<any>;
}

export default AbstractProviderService;