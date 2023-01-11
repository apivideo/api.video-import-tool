import Video from '@api.video/nodejs-client/lib/model/Video';
import type { NextApiRequest, NextApiResponse } from 'next';
import { ProviderName } from '../../../providers';
import ApiVideoService from '../../../service/ApiVideoService';
import VideoSource, { ApiResponse, ErrorResponse, MethodNotAllowedResponse, SuccessResponse } from '../../../types/common';

export type CreateApiVideoVideoRequestBody = {
    apiKey: string;
    importId: string;
    providerName: ProviderName;
    videoSource: VideoSource;
}

export type CreateApiVideoVideoRequestResponse = {
    video: Video
};

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<ApiResponse<CreateApiVideoVideoRequestResponse>>
) {
    if (req.method === "POST") {
        try {
            const body = JSON.parse(req.body) as CreateApiVideoVideoRequestBody;

            const apiVideoService = new ApiVideoService(body.apiKey);

            const video = await apiVideoService.createVideo({
                title: body.videoSource.name,
                source: body.videoSource.url!,
                importId: body.importId,
                providerName: body.providerName,
                videoSourceId: body.videoSource.id,
                videoSourceSize: body.videoSource.size,
            })
            res.status(200).json(SuccessResponse({ video }));
        } catch (e: any) {
            console.error(e);
            res.status(500).send(ErrorResponse(e.message));
        }
    } else {
        res.status(405).send(MethodNotAllowedResponse);
    }
}
