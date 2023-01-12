import type { NextApiRequest, NextApiResponse } from 'next';
import Providers, { ProviderName } from '../../../providers';
import VideoSource, { ApiResponse, AuthenticationContext, ErrorResponse, MethodNotAllowedResponse, Page, SuccessResponse } from '../../../types/common';


export type GetImportableVideosRequestBody = {
    authenticationContext: AuthenticationContext,
    provider: ProviderName,
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

            const providerService = new Providers[body.provider].backendService(body.authenticationContext);

            const videos = await providerService.getImportableVideos(body.nextPageFetchDetails);

            res.status(201).send(SuccessResponse(videos));
        } catch (e: any) {
            console.error(e);
            res.status(500).send(ErrorResponse(e.message));
        }
    } else {
        res.status(405).send(MethodNotAllowedResponse);
    }
}
