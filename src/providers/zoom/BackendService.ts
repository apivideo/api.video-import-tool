import { ZOOM_CLIENT_ID, ZOOM_CLIENT_SECRET, ZOOM_REDIRECT_URL } from "../../env";
import { EncryptedOauthAccessToken, getOauthAccessTokenCall, RevokeAccessTokenResponse, revokeOauthAccessTokenCall } from "../../service/OAuthHelpers";
import VideoSource, { EncryptedProviderAuthenticationContext, Page, ProviderAuthenticationContext } from "../../types/common";
import { decryptProviderAuthenticationContext, encryptAccessToken } from "../../utils/functions/crypto";
import AbstractProviderService from "../AbstractProviderService";

type ZoomRecordingsApiResponse = {
    from: string;
    to: string;
    page_size: number;
    total_records: number;
    next_page_token: string;
    meetings: Array<{
        uuid: string;
        id: number;
        host_id: string;
        topic: string;
        type: number;
        start_time: string;
        duration: number;
        timezone: string;
        created_at: string;
        join_url: string;
        recording_count: number;
        recording_files: Array<{
            id: string;
            meeting_id: string;
            recording_start: string;
            recording_end: string;
            file_type: string;
            file_size: number;
            play_url: string;
            download_url: string;
            status: string;
            recording_type: string;
            deleted_time: string;
            recording_format: string;
            recording_count: number;
            recording_size: number;
            recording_duration: number;
        }>
    }>
}


class ZoomProviderService implements AbstractProviderService {
    authenticationContext?: ProviderAuthenticationContext;

    constructor(authenticationContext?: EncryptedProviderAuthenticationContext) {
        this.authenticationContext = authenticationContext ? decryptProviderAuthenticationContext(authenticationContext) : undefined;
    }
    
    public fetchAdditionalUserDataAfterSignin(): Promise<any> {
        throw new Error("Method not implemented.");
    }

    public async revokeOauthAccessToken(): Promise<RevokeAccessTokenResponse> {
        return await revokeOauthAccessTokenCall("https://zoom.us/oauth/revoke", ZOOM_CLIENT_ID, ZOOM_CLIENT_SECRET, this.authenticationContext?.additionnalData!);;
    }

    public getPublicMp4Url(videoSource: VideoSource): Promise<VideoSource> {
        throw new Error("Method not implemented.");
    }

    public async getOauthAccessToken(code: string): Promise<EncryptedOauthAccessToken> {
        return encryptAccessToken(await getOauthAccessTokenCall("https://zoom.us/oauth/token", ZOOM_CLIENT_ID, ZOOM_CLIENT_SECRET, ZOOM_REDIRECT_URL, code));
    }

    public async generatePublicMp4(videoSource: VideoSource): Promise<VideoSource> {
        throw new Error("Method not implemented.");
    }

    public async validateCredentials(): Promise<string | null> {
        throw new Error("Method not implemented.");
    }

    public async getImportableVideos(nextPageFetchDetails?: any): Promise<Page<VideoSource>> {
        const monthsInPast = nextPageFetchDetails?.monthsInPast || 0;
        const date = new Date();
        date.setMonth(date.getMonth() - monthsInPast);
        const toDate = date.toISOString().split("T")[0];
        date.setMonth(date.getMonth() - 1);
        date.setDate(date.getDate() + 1);
        const fromDate = date.toISOString().split("T")[0];

        const params = [
            ["from", fromDate],
            ["to", toDate],
            ["page_size", "30"],
        ];

        if (nextPageFetchDetails?.nexPageToken) {
            params.push(["next_page_token", nextPageFetchDetails.nexPageToken])
        }

        const queryParams = params.map(([key, value]) => `${key}=${value}`).join("&");

        const zoomRes: ZoomRecordingsApiResponse = await this.callApi(`https://api.zoom.us/v2/accounts/me/recordings?${queryParams}`, "GET")

        return {
            data: zoomRes.meetings
                .map((meeting) => meeting.recording_files
                    .filter(recording => recording.file_type === "MP4")
                    .map(recording => ({
                        id: meeting.uuid,
                        name: meeting.topic,
                        thumbnail: "/zoom.svg",
                        url: `${recording.download_url}?access_token=${this.authenticationContext?.accessToken}`,
                        duration: meeting.duration,
                        size: recording.file_size,
                        date: new Date(meeting.start_time),
                    })))
                .flatMap(x => x),
            hasMore: zoomRes.next_page_token !== "" || monthsInPast < 12,
            nextPageFetchDetails: {
                nexPageToken: zoomRes.next_page_token,
                monthsInPast: zoomRes.next_page_token ? monthsInPast : monthsInPast + 1
            }
        };
    };

    private async callApi(path: string, method: string, body?: any): Promise<any> {
        if (!this.authenticationContext) {
            throw new Error("No authentication context provided");
        }

        const headers = new Headers();
        headers.append("Authorization", "Bearer " + this.authenticationContext.accessToken)
        headers.append("Content-Type", "application/json");

        const res = await fetch(path, {
            headers,
            method,
            body: JSON.stringify(body)
        });

        if (!res.ok) {
            const responseText = await res.text();
            throw new Error(`Zoom API call failed: ${res.statusText}. Response: ${responseText}`);
        }

        return await res.json();
    }

}

export default ZoomProviderService;