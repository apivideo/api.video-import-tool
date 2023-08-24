import AWS from "aws-sdk";
import { EncryptedOauthAccessToken, RevokeAccessTokenResponse } from "../../service/OAuthHelpers";
import VideoSource, { ClearProviderAuthenticationContext, CredentialsValidationResult, EncryptedProviderAuthenticationContext, Page } from "../../types/common";
import { decryptProviderAuthenticationContext, encrypt, encryptProviderAuthenticationContext, getVideoSourceProxyUrl } from "../../utils/functions/crypto";
import AbstractProviderService from "../AbstractProviderService";



type S3Params = {
    bucket: string;
    object: string;
    accessKey: string;
    secretKey: string;
}

export type ProjectBucket = {
    projectName: string;
    projectId: string;
    buckets: string[];
}

const VIDEO_FILE_EXTENSIONS = ['.webm', '.mkv', '.flv', '.vob', '.ogv', '.ogg', '.rrc', '.gifv', '.mng', '.mov', '.avi', '.qt', '.wmv', '.yuv', '.rm', '.asf', '.amv', '.mp4', '.m4p', '.m4v', '.mpg', '.mp2', '.mpeg', '.mpe', '.mpv', '.m4v', '.svi', '.3gp', '.3g2', '.mxf', '.roq', '.nsv', '.flv', '.f4v', '.f4p', '.f4a', '.f4b', '.mod'];

class S3ProviderService implements AbstractProviderService {
    accessKey: string;
    secretKey: string;
    bucket?: string;
    buckets?: string[];
    s3: AWS.S3;

    constructor(clearAuthenticationContext?: ClearProviderAuthenticationContext,
        encryptedAuthenticationContext?: EncryptedProviderAuthenticationContext) {

            console.log(clearAuthenticationContext, encryptedAuthenticationContext);

        if (encryptedAuthenticationContext) {
            clearAuthenticationContext = decryptProviderAuthenticationContext(encryptedAuthenticationContext);
        } 
        
        if(!clearAuthenticationContext) {
            throw new Error("No authentication context provided");
        }

        
        
        const decryptedAccessToken = JSON.parse(clearAuthenticationContext.clearPrivateData!);
        this.accessKey = decryptedAccessToken.accessKey;
        this.secretKey = decryptedAccessToken.secretKey;
        this.bucket = clearAuthenticationContext.publicData?.bucket;
        this.buckets = clearAuthenticationContext.publicData?.buckets;

        
        this.s3 = new AWS.S3({
            accessKeyId: this.accessKey,
            secretAccessKey: this.secretKey,
        });

    }

    public async fetchAdditionalUserDataAfterSignin(): Promise<any> {
        throw new Error("Method not implemented.");
    }

    public async revokeOauthAccessToken(): Promise<RevokeAccessTokenResponse> {
        throw new Error("Method not implemented.");
    }

    public getPublicMp4Url(videoSource: VideoSource): Promise<VideoSource> {
        throw new Error("Method not implemented.");
    }

    public async getOauthAccessToken(code: string): Promise<EncryptedOauthAccessToken> {
        throw new Error("Method not implemented.");
    }

    public async generatePublicMp4(videoSource: VideoSource): Promise<VideoSource> {
        throw new Error("Method not implemented.");
    }

    public async validateCredentials(): Promise<CredentialsValidationResult> {
        if(this.bucket) {
            return encryptProviderAuthenticationContext({
                clearPrivateData: JSON.stringify({ accessKey: this.accessKey, secretKey: this.secretKey }),
                publicData: {
                    buckets: [this.bucket],
                    bucket: this.bucket,
                }
            })
        }

        return new Promise((resolve, reject) => {
            this.s3.listBuckets((err, data) => {
                if (err) {
                    resolve({
                        error: err.message
                    });
                } else {
                    resolve(encryptProviderAuthenticationContext({
                        clearPrivateData: JSON.stringify({ accessKey: this.accessKey, secretKey: this.secretKey }),
                        publicData: {
                            buckets: data.Buckets?.map(bucket => bucket.Name!) || [],
                        },
                    }));
                }
            })
        });
    }

    public async getImportableVideos(nextPageFetchDetails?: any): Promise<Page<VideoSource>> {
        const data = await this.s3.listObjectsV2({
            Bucket: this.bucket!,
            MaxKeys: 500,
            ContinuationToken: nextPageFetchDetails,
        }).promise();

        return {
            data: (data.Contents?.map(content => {
                const proxyLinkParams: S3Params = {
                    bucket: this.bucket!,
                    object: content.Key!,
                    accessKey: this.accessKey,
                    secretKey: this.secretKey,
                };

                return {
                    id: content.Key!,
                    name: content.Key!,
                    size: content.Size!,
                    date: new Date(content.LastModified!),
                    url: getVideoSourceProxyUrl("s3", proxyLinkParams),
                }
            }) || []).filter(video => !!video.name && video.name.indexOf(".") > -1 && VIDEO_FILE_EXTENSIONS.includes(video.name.substr(video.name.lastIndexOf('.')))),
            nextPageFetchDetails: data.NextContinuationToken,
            hasMore: !!data.NextContinuationToken
        };

    };

    private async callApi(path: string, method: string, body?: any): Promise<any> {
        throw new Error("Method not implemented.");
    }

}

export default S3ProviderService;