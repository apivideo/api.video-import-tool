import type { NextApiRequest, NextApiResponse } from 'next';
import ApiVideoService from '../../../service/ApiVideoService';
import { ApiResponse, ErrorResponse, MethodNotAllowedResponse, SuccessResponse } from '../../../types/common';

export type VerifyApiKeyRequestBody = {
    apiKey: string;
}

export type VerifyApiKeyRequestResponse = {
    ok: boolean;
};

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<ApiResponse<VerifyApiKeyRequestResponse>>
) {
    if (req.method === "POST") {
        try {
            const body = JSON.parse(req.body) as VerifyApiKeyRequestBody;

            const apiVideoService = new ApiVideoService(body.apiKey);

            const ok = await apiVideoService.apiKeyIsValid();

            res.status(200).json(SuccessResponse({ ok }));
        } catch (e: any) {
            res.status(500).send(ErrorResponse(e.message));
        }
    } else {
        res.status(405).send(MethodNotAllowedResponse);
    }
}
