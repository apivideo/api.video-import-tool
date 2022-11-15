import type { NextApiRequest, NextApiResponse } from 'next';
import AbstractProviderService from '../../../service/providers/AbstractProviderService';
import VideoSource, { AuthenticationContext, Page } from '../../../types/common';
import { ProviderName, Providers } from '../../../providers';


export interface GetImportableVideosRequestBody {
    authenticationContext: AuthenticationContext,
    provider: ProviderName,
    nextPageFetchDetails?: any;
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<Page<VideoSource> | string>
) {
    if (req.method === "POST") {
        const body = JSON.parse(req.body) as GetImportableVideosRequestBody;
        console.log(body);

        const providerService = new Providers[body.provider].backendService(body.authenticationContext);
        
        providerService.getImportableVideos(body.nextPageFetchDetails)
            .then(videos => res.status(201).send(videos));
    } else {
        res.status(405).send("");
    }
}
