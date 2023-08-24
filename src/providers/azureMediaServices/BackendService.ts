import { JWT } from "google-auth-library";
import { GCS_CLIENT_EMAIL, GCS_CLIENT_SECRET } from "../../env";
import {
  EncryptedOauthAccessToken,
  RevokeAccessTokenResponse,
} from "../../service/OAuthHelpers";
import VideoSource, {
  CredentialsValidationResult,
  EncryptedProviderAuthenticationContext,
  Page,
  ClearProviderAuthenticationContext,
} from "../../types/common";
import {
  decryptProviderAuthenticationContext,
  encrypt,
  encryptProviderAuthenticationContext,
  getVideoSourceProxyUrlDefault,
} from "../../utils/functions/crypto";
import AbstractProviderService from "../AbstractProviderService";
import { ClientSecretCredential } from "@azure/identity";
import { Asset, AzureMediaServices } from "@azure/arm-mediaservices";
import { BlobItem, BlobServiceClient } from "@azure/storage-blob";

export type ProjectBucket = {
  projectName: string;
  projectId: string;
  buckets: string[];
};

type Credentials = {
  AZURE_CLIENT_ID: string;
  AZURE_CLIENT_SECRET: string;
  AZURE_TENANT_DOMAIN: string;
  AZURE_TENANT_ID: string;
  AZURE_MEDIA_SERVICES_ACCOUNT_NAME: string;
  AZURE_RESOURCE_GROUP: string;
  AZURE_SUBSCRIPTION_ID: string;
  AZURE_ARM_TOKEN_AUDIENCE: string;
  AZURE_ARM_ENDPOINT: string;
};

type ParsedPrivateData = {
  sasUrl: string;
  credentials: Credentials;
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
    const missing = [
      "AZURE_CLIENT_ID",
      "AZURE_CLIENT_SECRET",
      "AZURE_TENANT_ID",
      "AZURE_MEDIA_SERVICES_ACCOUNT_NAME",
      "AZURE_RESOURCE_GROUP",
      "AZURE_SUBSCRIPTION_ID",
    ].filter(
      (key) =>
        !this.authenticationContext!.credentials![key as keyof Credentials]
    );

    if (missing.length) {
      return {
        error: `Missing values in the JSON file: ${missing.join(", ")}`,
      };
    }
    try {
      const importableVideos = await this.getImportableVideos(undefined, 1);
      if (importableVideos.data.length > 0) {
        const fRes = await fetch(importableVideos.data[0].url!);
        if (fRes.status > 400) {
          const txt = await fRes.text();
          if (txt.includes("<Message>") && txt.includes("</Message>")) {
            return {
              ...encryptProviderAuthenticationContext({
                clearPrivateData: JSON.stringify(this.authenticationContext),
              }),
              error: `Got an error from Azure when trying to access the bucket: ${
                txt.split("<Message>")[1].split("</Message>")[0]
              }`,
            };
          }
          return {
            ...encryptProviderAuthenticationContext({
              clearPrivateData: JSON.stringify(this.authenticationContext),
            }),
            error: "Please verify your SAS URL",
          };
        }
      }
    } catch (e: any) {

      return {
        ...encryptProviderAuthenticationContext({
          clearPrivateData: JSON.stringify(this.authenticationContext),
        }),
        error: "Please verify your credentials. Error from Azure: " + e.message
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

    const cred = new ClientSecretCredential(
      this.authenticationContext.credentials.AZURE_TENANT_ID,
      this.authenticationContext.credentials.AZURE_CLIENT_ID,
      this.authenticationContext.credentials.AZURE_CLIENT_SECRET
    );
    const mediaServicesClient = new AzureMediaServices(
      cred,
      this.authenticationContext.credentials.AZURE_SUBSCRIPTION_ID
    );

    const videoSources: VideoSource[] = [];
    let i = 0;
    for await (const asset of mediaServicesClient.assets.list(
      this.authenticationContext.credentials.AZURE_RESOURCE_GROUP,
      this.authenticationContext.credentials.AZURE_MEDIA_SERVICES_ACCOUNT_NAME
    )) {
      try {
        const videoSource = await this.parseAsset(asset);
        if (videoSource) {
          videoSources.push(videoSource);
        }
      } catch (e: any) {
        if (e.code === "ERR_INVALID_URL") {
          throw new Error("Invalid SAS URL");
        }
        throw e;
      }
      if (limit && i++ > limit) {
        break;
      }
    }

    return {
      data: videoSources,
      hasMore: false,
      nextPageFetchDetails: undefined,
    };
  }

  async parseAsset(asset: Asset): Promise<VideoSource | undefined> {
    if (!asset.container) {
      console.log("no container");
      return;
    }

    if (!this.authenticationContext?.sasUrl) {
      throw new Error("Missing SAS URL");
    }

    const blobServiceClient = new BlobServiceClient(
      this.authenticationContext?.sasUrl
    );

    const containerClient = blobServiceClient.getContainerClient(
      asset.container
    );

    let videoBlob: BlobItem | undefined = undefined;

    for await (const blob of containerClient.listBlobsFlat()) {
      if (blob.properties.contentType) {
        const contentType = blob.properties.contentType as string;
        if (contentType === "video/mp4") {
          if (
            (blob.properties.contentLength || 0) >=
            (videoBlob?.properties?.contentLength || 0)
          )
            videoBlob = blob;
        }
      }
    }

    if (!videoBlob) {
      console.log("no video blob");
      return;
    }

    console.log(videoBlob.properties);

    return {
      creationDate: videoBlob.properties.createdOn?.toISOString(),
      url: containerClient.getBlockBlobClient(videoBlob.name).url,
      size: videoBlob.properties.contentLength,
      name: videoBlob.name,
      id: asset.assetId!,
    };
  }
}

export default AzureProviderService;
