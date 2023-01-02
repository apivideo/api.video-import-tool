import Video from '@api.video/nodejs-client/lib/model/Video';
import type { NextApiRequest, NextApiResponse } from 'next';
import { ProviderName } from '../../../providers';
import ApiVideoService from '../../../service/ApiVideoService';
import { ApiResponse, ErrorResponse, MethodNotAllowedResponse, SuccessResponse } from '../../../types/common';

export type GetMigrationsRequestBody = {
    apiKey: string;
    provider?: ProviderName;
}

export type GetMigrationsRequestResponse = {
    videos: Video[];
};

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<ApiResponse<GetMigrationsRequestResponse>>
) {
    if (req.method === "POST") {
        try {
            const body = JSON.parse(req.body) as GetMigrationsRequestBody;

            const apiVideoService = new ApiVideoService(body.apiKey);

            const videos = await apiVideoService.getMigrations(body.provider);

            res.status(200).json(SuccessResponse({ videos }));
        } catch (e: any) {
            res.status(500).send(ErrorResponse(e.message));
        }
    } else {
        res.status(405).send(MethodNotAllowedResponse);
    }
}
