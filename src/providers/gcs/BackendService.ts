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
  VideoSourceProxyParams,
  decrypt,
  decryptProviderAuthenticationContext,
  encrypt,
  getVideoSourceProxyUrlDefault,
} from "../../utils/functions/crypto";
import AbstractProviderService from "../AbstractProviderService";

export type ProjectBucket = {
  projectName: string;
  projectId: string;
  buckets: string[];
};

class GcsProviderService implements AbstractProviderService {
  authenticationContext?: Promise<ClearProviderAuthenticationContext>;

  constructor(
    clearAuthenticationContext?: ClearProviderAuthenticationContext,
    encryptedAuthenticationContext?: EncryptedProviderAuthenticationContext
  ) {
    this.authenticationContext = new Promise(async (resolve, reject) => {
      if (encryptedAuthenticationContext) {
        clearAuthenticationContext = decryptProviderAuthenticationContext(
          encryptedAuthenticationContext
        );
      }
      if (!clearAuthenticationContext) {
        resolve({
          clearPrivateData: "",
        });
        return;
      }
      if (clearAuthenticationContext.clearPrivateData) {
        resolve(clearAuthenticationContext);
        return;
      }

      new JWT({
        email: GCS_CLIENT_EMAIL,
        key: atob(GCS_CLIENT_SECRET),
        scopes: ["https://www.googleapis.com/auth/devstorage.read_only"],
      }).authorize((err, tokens) => {
        if (err) {
          return;
        }
        resolve({
          ...clearAuthenticationContext,
          clearPrivateData: tokens?.access_token!,
        });
      });
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
    try {
      const res = await this.getImportableVideos();

      if (res.data.length > 0) {
        const first = res.data[0];
        const video: VideoSourceProxyParams = JSON.parse(
          decrypt(first.url?.split("&data=")[1]!)
        );
        const fRes = await fetch(video.url, {
          headers: video.headers,
          method: "GET",
        });
        if (fRes.status > 400) {
          return { error: await fRes.text() };
        }
      }

      return {
        encryptedPrivateData: encrypt(
          (await this.authenticationContext)?.clearPrivateData!
        ),
        publicData: {
          bucket: (await this.authenticationContext)?.publicData?.bucket,
        },
      };
    } catch (e: any) {
      try {
        const code = JSON.parse(("" + e).split("Response:")[1]).error.code;
        if (code === 404) {
          return { error: "This bucket does not exist" };
        }
        if (code === 403) {
          return {
            error:
              "The Video Import Tool does not have access to this bucket. Please verify that you have granted the correct permissions to the service account",
          };
        }
      } catch (e) {}
      return {
        error: "An error occured while trying to access the bucket",
        encryptedPrivateData: "",
      };
    }
  }

  public async getImportableVideos(
    nextPageFetchDetails?: any
  ): Promise<Page<VideoSource>> {
    const authenticationContext = await this.authenticationContext;
    const bucket = authenticationContext?.publicData?.bucket;

    console.log({ authenticationContext, bucket });

    const res = await this.callApi(
      `https://storage.googleapis.com/storage/v1/b/${bucket}/o/` +
        (nextPageFetchDetails ? `?pageToken=${nextPageFetchDetails}` : ""),
      "GET"
    );
    return {
      data: (res.items || [])
        .filter((item: any) => item.contentType.indexOf("video") === 0)
        .map((item: any) => ({
          id: item.name,
          name: item.name,
          size: Math.round(item.size),
          date: new Date(item.timeCreated),
          url: getVideoSourceProxyUrlDefault(
            `https://storage.googleapis.com/storage/v1/b/${bucket}/o/${encodeURIComponent(
              item.name
            )}?alt=media`,
            item.name,
            authenticationContext?.clearPrivateData!
          ),
        })),
      nextPageFetchDetails: res.nextPageToken,
      hasMore: !!res.nextPageToken,
    };
  }

  private async callApi(
    path: string,
    method: string,
    body?: any
  ): Promise<any> {
    if (!this.authenticationContext) {
      throw new Error("No authentication context provided");
    }

    const authenticationContext = await this.authenticationContext;

    const headers = new Headers();
    headers.append(
      "Authorization",
      "Bearer " + authenticationContext.clearPrivateData
    );
    headers.append("Content-Type", "application/json");

    const res = await fetch(path, {
      headers,
      method,
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const responseText = await res.text();
      throw new Error(
        `GCS API call failed: ${res.statusText}. Response: ${responseText}`
      );
    }

    return await res.json();
  }
}

export default GcsProviderService;
