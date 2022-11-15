import type { NextApiRequest, NextApiResponse } from 'next';
import { ProviderName, Providers } from '../../../providers';
import VideoSource, { ApiResponse, ErrorResponse, MethodNotAllowedResponse, ProviderAuthenticationContext, SuccessResponse } from '../../../types/common';


export type GetPublicMp4UrlRequestBody = {
    provider: ProviderName,
    authenticationContext: ProviderAuthenticationContext,
    video: VideoSource,
}

export type GetPublicMp4UrlRequestResponse = {
    video: VideoSource;
};

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<ApiResponse<GetPublicMp4UrlRequestResponse>>
) {
    if (req.method === "POST") {
        try {
            const body = JSON.parse(req.body) as GetPublicMp4UrlRequestBody;

            const providerService = new Providers[body.provider].backendService(body.authenticationContext);

            const video = await providerService.getPublicMp4Url(body.video);
            res.status(201).send(SuccessResponse({ video }));
        } catch (e: any) {
            res.status(500).send(ErrorResponse(e.message));
        }
    } else {
        res.status(405).send(MethodNotAllowedResponse);
    }
}
