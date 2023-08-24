import type { NextApiRequest, NextApiResponse } from 'next';
import { ProviderName } from '../../../providers';
import { getProviderBackendService } from '../../../providers/BackendServiceFactory';
import VideoSource, { ApiResponse, EncryptedProviderAuthenticationContext, ErrorResponse, MethodNotAllowedResponse, SuccessResponse } from '../../../types/common';


export type GetPublicMp4UrlRequestBody = {
    provider: ProviderName,
    authenticationContext: EncryptedProviderAuthenticationContext,
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

            const providerService = new (getProviderBackendService(body.provider))(undefined, body.authenticationContext);

            const video = await providerService.getPublicMp4Url(body.video);

            res.setHeader('Cache-Control', 'no-store');
            res.status(201).send(SuccessResponse({ video }));
        } catch (e: any) {
            console.error(e);
            res.status(500).send(ErrorResponse(e.message));
        }
    } else {
        res.status(405).send(MethodNotAllowedResponse);
    }
}
