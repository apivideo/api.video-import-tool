import type { NextApiRequest, NextApiResponse } from 'next';
import { ProviderName } from '../../../providers';
import { getProviderBackendService } from '../../../providers/BackendServiceFactory';
import VideoSource, { ApiResponse, EncryptedProviderAuthenticationContext, ErrorResponse, MethodNotAllowedResponse, Page, SuccessResponse } from '../../../types/common';


export type GetImportableVideosRequestBody = {
    authenticationContext: EncryptedProviderAuthenticationContext,
    providerName: ProviderName,
    nextPageFetchDetails?: any;
}

export type GetImportableVideosRequestResponse = Page<VideoSource>;

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<ApiResponse<GetImportableVideosRequestResponse>>
) {
    if (req.method === "POST") {
        try {
            const body = JSON.parse(req.body) as GetImportableVideosRequestBody;

            const providerService = new (getProviderBackendService(body.providerName))(undefined, body.authenticationContext);

            const videos = await providerService.getImportableVideos(body.nextPageFetchDetails);

            res.setHeader('Cache-Control', 'no-store');
            res.status(201).send(SuccessResponse(videos));
        } catch (e: any) {
            console.error(e);
            res.status(500).send(ErrorResponse(e.message));
        }
    } else {
        res.status(405).send(MethodNotAllowedResponse);
    }
}
