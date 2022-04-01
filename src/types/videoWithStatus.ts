import Video from "@api.video/nodejs-client/lib/model/Video";
import VideoStatus from "@api.video/nodejs-client/lib/model/VideoStatus";

export interface VideoWithStatus extends Video {
    status?: VideoStatus
}