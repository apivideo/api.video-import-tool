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
  encrypt,
} from "../../utils/functions/crypto";
import AbstractProviderService from "../AbstractProviderService";



type WistiaVideo = {
  id: number;
  name: string;
  type: string;
  created: string;
  duration: number;
  thumbnail: {
    url: string;
  };
  assets: {
    url: string;
    contentType: string;
    type: string;
    fileSize: number;
  }[];
};

type WistiaApiResult = WistiaVideo[];

const PER_PAGE = 3; //FIXME

class WistiaProviderService implements AbstractProviderService {
  accessToken: string;

  constructor(
    clearAuthenticationContext?: ClearProviderAuthenticationContext,
    encryptedAuthenticationContext?: EncryptedProviderAuthenticationContext
  ) {
    if (encryptedAuthenticationContext) {
      clearAuthenticationContext = decryptProviderAuthenticationContext(
        encryptedAuthenticationContext
      );
    }

    if (!clearAuthenticationContext?.clearPrivateData) {
      throw new Error("Missing access token.");
    }

    this.accessToken = clearAuthenticationContext.clearPrivateData;
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

  public getOauthAccessToken(code: string): Promise<EncryptedOauthAccessToken> {
    throw new Error("Method not implemented.");
  }

  public generatePublicMp4(videoSource: VideoSource): Promise<VideoSource> {
    throw new Error("Method not implemented.");
  }

  public async getImportableVideos(
    nextPageFetchDetails?: any
  ): Promise<Page<VideoSource>> {
    const pageToFetch = nextPageFetchDetails?.page || 1;
    const videos: WistiaApiResult = await this.callApi(
      `https://api.wistia.com/v1/medias.json?page=${pageToFetch}&per_page=${PER_PAGE}`
    );

    const hasMore = videos.length >= PER_PAGE;
    console.log(`https://api.wistia.com/v1/medias.json?page=${pageToFetch}&per_page=${PER_PAGE}, hasMore: ${hasMore}`)

    return {
      data: videos.map((video) => this.wistiaVideoToVideoSource(video)),
      hasMore,
      nextPageFetchDetails: hasMore
        ? {
            page: pageToFetch + 1,
          }
        : undefined,
    };
  }

  public async validateCredentials(): Promise<CredentialsValidationResult> {
    return new Promise(async (resolve, reject) => {
      if (!this.accessToken) {
        resolve({
          error: "Wistia access token is required",
        });
        return;
      }

      try {
        const res = await this.callApi("https://api.wistia.com/v1/medias.json?per_page=1");

        resolve({
          encryptedPrivateData: encrypt(this.accessToken),
        });
      } catch (e) {
        console.log(e);
        resolve({
          error: "Your access token seems to be invalid",
        });
      }
    });
  }

  wistiaVideoToVideoSource(wistiaVideo: WistiaVideo): VideoSource {
    const bestSource = wistiaVideo.assets.find((f) => f.type === "OriginalFile");

    return {
      id: "" + wistiaVideo.id,
      name: wistiaVideo.name,
      duration: wistiaVideo.duration,
      url: bestSource?.url,
      size: bestSource?.fileSize,
      thumbnail: wistiaVideo.thumbnail.url,
    };
  }

  private async callApi(url: string): Promise<any> {
    const headers = new Headers();

    if (!this.accessToken) {
      throw new Error("Authentication context is required");
    }

    headers.append("Authorization", `Bearer ${this.accessToken}`);
    headers.append("Content-Type", "application/json");
    headers.append("Accept", "application/json");


    const res = await fetch(url, {
      method: "GET",
      headers,
    });

    if (!res.ok) {
      throw new Error("Wistia API call failed: " + res.statusText);
    }

    return await res.json();
  }
}

export default WistiaProviderService;
