import Video from '@api.video/nodejs-client/lib/model/Video';
import type { NextApiRequest, NextApiResponse } from 'next';
import ApiVideoService from '../../../service/ApiVideoService';
import { ApiResponse, ErrorResponse, MethodNotAllowedResponse, SuccessResponse } from '../../../types/common';

export type GetImportRequestBody = {
    apiKey: string;
    importId: string
}

export type GetImportRequestResponse = {
    videos: Video[];
};

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<ApiResponse<GetImportRequestResponse>>
) {
    if (req.method === "POST") {
        try {
            const body = JSON.parse(req.body) as GetImportRequestBody;
            const apiVideoService = new ApiVideoService(body.apiKey);

            const videos = await apiVideoService.getImportById(body.importId);

            res.status(200).json(SuccessResponse({ videos }));
        } catch (e: any) {
            console.error(e);
            res.status(500).send(ErrorResponse(e.message));
        }
    } else {
        res.status(405).send(MethodNotAllowedResponse);
    }
}
