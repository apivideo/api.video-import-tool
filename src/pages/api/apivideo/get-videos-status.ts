import Video from '@api.video/nodejs-client/lib/model/Video';
import type { NextApiRequest, NextApiResponse } from 'next';
import ApiVideoService, { VideoWithStatus } from '../../../service/ApiVideoService';
import { ApiResponse, ErrorResponse, MethodNotAllowedResponse, SuccessResponse } from '../../../types/common';


export type GetVideosStatusRequestBody = {
    encryptedApiKey: string;
    videos: Video[];
}

export type GetVideosStatusRequestResponse = {
    videos: VideoWithStatus[];
};

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<ApiResponse<GetVideosStatusRequestResponse>>
) {
    if (req.method === "POST") {
        try {
            const body = JSON.parse(req.body) as GetVideosStatusRequestBody;

            const apiVideo = new ApiVideoService(body.encryptedApiKey);

            const videosWithStatuses = await apiVideo.getVideosStatuses(body.videos);

            res.setHeader('Cache-Control', 'no-store');
            res.status(200).json(SuccessResponse({ videos: videosWithStatuses }));
        } catch (e: any) {
            console.error(e);
            res.status(500).send(ErrorResponse(e.message));
        }
    } else {
        res.status(405).send(MethodNotAllowedResponse);
    }
}
