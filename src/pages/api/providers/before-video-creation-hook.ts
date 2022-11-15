import type { NextApiRequest, NextApiResponse } from 'next';
import AbstractProviderService from '../../../service/providers/AbstractProviderService';
import VideoSource, { ProviderAuthenticationContext } from '../../../types/common';
import { ProviderName, Providers } from '../../../providers';


export interface BeforeVideoCreationHookRequestBody {
    provider: ProviderName,
    authenticationContext: ProviderAuthenticationContext,
    video: VideoSource,
}

export interface BeforeVideoCreationHookRequestResponse {
    video: VideoSource;
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<BeforeVideoCreationHookRequestResponse | string>
) {
    if (req.method === "POST") {
        const body = JSON.parse(req.body) as BeforeVideoCreationHookRequestBody;
        
        const providerService = new Providers[body.provider].backendService(body.authenticationContext);
        
        providerService.beforeVideoCreationHook(body.video)
            .then(video => res.status(201).send({video}));
    } else {
        res.status(405).send("");
    }
}
