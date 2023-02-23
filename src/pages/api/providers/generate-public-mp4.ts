import type { NextApiRequest, NextApiResponse } from 'next';
import Providers, { ProviderName } from '../../../providers';
import VideoSource, { ApiResponse, EncryptedProviderAuthenticationContext, ErrorResponse, MethodNotAllowedResponse, SuccessResponse } from '../../../types/common';


export type GeneratePublicMp4RequestBody = {
    providerName: ProviderName,
    authenticationContext: EncryptedProviderAuthenticationContext,
    video: VideoSource,
}

export type GeneratePublicMp4RequestResponse = {
    video: VideoSource;
};

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<ApiResponse<GeneratePublicMp4RequestResponse>>
) {
    if (req.method === "POST") {
        try {
            const body = JSON.parse(req.body) as GeneratePublicMp4RequestBody;

            const providerService = new Providers[body.providerName].backendService(body.authenticationContext);

            const video = await providerService.generatePublicMp4(body.video);
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
    