import { BlobServiceClient } from "@azure/storage-blob";
import {
  EncryptedOauthAccessToken,
  RevokeAccessTokenResponse,
} from "../../service/OAuthHelpers";
import VideoSource, {
  ClearProviderAuthenticationContext,
  CredentialsValidationResult,
  EncryptedProviderAuthenticationContext,
  Page,
} from "../../types/common";
import {
  decryptProviderAuthenticationContext,
  encryptProviderAuthenticationContext,
} from "../../utils/functions/crypto";
import AbstractProviderService from "../AbstractProviderService";


type ParsedPrivateData = {
  sasUrl: string;
  containerName?: string;
};

class AzureProviderService implements AbstractProviderService {
  authenticationContext?: ParsedPrivateData;

  constructor(
    clearAuthenticationContext?: ClearProviderAuthenticationContext,
    encryptedAuthenticationContext?: EncryptedProviderAuthenticationContext
  ) {
    if (encryptedAuthenticationContext) {
      clearAuthenticationContext = decryptProviderAuthenticationContext(
        encryptedAuthenticationContext
      );
    }

    this.authenticationContext = clearAuthenticationContext?.clearPrivateData
      ? JSON.parse(clearAuthenticationContext?.clearPrivateData)
      : undefined;
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

  public async getOauthAccessToken(
    code: string
  ): Promise<EncryptedOauthAccessToken> {
    throw new Error("Method not implemented.");
  }

  public async generatePublicMp4(
    videoSource: VideoSource
  ): Promise<VideoSource> {
    throw new Error("Method not implemented.");
  }

  public async validateCredentials(): Promise<CredentialsValidationResult> {
    if (!this.authenticationContext) {
      return {
        error: "Missing credentials",
      };
    }
    try {
      const blobServiceClient = new BlobServiceClient(
        this.authenticationContext?.sasUrl
      );

      if (this.authenticationContext?.containerName) {
        const containerClient = blobServiceClient.getContainerClient(
          this.authenticationContext?.containerName
        );
        const res = await containerClient.listBlobsFlat();
        await res.next();
      } else {
        const containers = await blobServiceClient.listContainers();
        await containers.next();
      }
    } catch (e: any) {
      return {
        ...encryptProviderAuthenticationContext({
          clearPrivateData: JSON.stringify(this.authenticationContext),
        }),
        error: "Please verify your credentials. Error from Azure: " + e.message,
      };
    }
    return {
      ...encryptProviderAuthenticationContext({
        clearPrivateData: JSON.stringify(this.authenticationContext),
      }),
    };
  }

  public async getImportableVideos(
    nextPageFetchDetails?: any,
    limit?: number
  ): Promise<Page<VideoSource>> {
    if (!this.authenticationContext) {
      throw new Error("Missing authentication context");
    }
    let data: VideoSource[] = [];
    const blobServiceClient = new BlobServiceClient(
      this.authenticationContext?.sasUrl
    );
    if (!this.authenticationContext.containerName) {
      const containers = await blobServiceClient.listContainers();

      for await (const container of containers) {
        data = [
          ...data,
          ...(await this.getContainerVideos(blobServiceClient, container.name)),
        ];
      }
    } else {
      data = await this.getContainerVideos(
        blobServiceClient,
        this.authenticationContext.containerName
      );
    }

    return {
      data,
      hasMore: false,
      nextPageFetchDetails: undefined,
    };
  }

  private async getContainerVideos(
    blobServiceClient: BlobServiceClient,
    container: string
  ): Promise<VideoSource[]> {
    const containerClient = blobServiceClient.getContainerClient(container);
    const videoSources: VideoSource[] = [];
    for await (const blob of containerClient.listBlobsFlat()) {
      if (blob.properties.contentType) {
        const contentType = blob.properties.contentType as string;
        if (contentType === "video/mp4") {
          videoSources.push({
            creationDate: blob.properties.createdOn?.toISOString(),
            url: containerClient.getBlockBlobClient(blob.name).url,
            size: blob.properties.contentLength,
            name: `${container}/${blob.name}`,
            id: `${container}/${blob.name}`,
            folder: container,
          });
        }
      }
    }
    return videoSources;
  }
}

export default AzureProviderService;
