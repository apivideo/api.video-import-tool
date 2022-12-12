import Video from '@api.video/nodejs-client/lib/model/Video';
import type { NextApiRequest, NextApiResponse } from 'next';
import ApiVideoService from '../../../service/ApiVideoService';
import { ApiResponse, ErrorResponse, MethodNotAllowedResponse, SuccessResponse } from '../../../types/common';

export type GetMigrationRequestBody = {
    apiKey: string;
    migrationId: string
}

export type GetMigrationRequestResponse = {
    videos: Video[];
};

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<ApiResponse<GetMigrationRequestResponse>>
) {
    if (req.method === "POST") {
        try {
            const body = JSON.parse(req.body) as GetMigrationRequestBody;
            const apiVideoService = new ApiVideoService(body.apiKey);

            const videos = await apiVideoService.getMigrationById(body.migrationId);

            res.status(200).json(SuccessResponse({ videos }));
        } catch (e: any) {
            res.status(500).send(ErrorResponse(e.message));
        }
    } else {
        res.status(405).send(MethodNotAllowedResponse);
    }
}
