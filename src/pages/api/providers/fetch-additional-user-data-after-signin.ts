import type { NextApiRequest, NextApiResponse } from 'next';
import Providers, { ProviderName } from '../../../providers';
import { ApiResponse, ErrorResponse, MethodNotAllowedResponse, ProviderAuthenticationContext, SuccessResponse } from '../../../types/common';


export type FetchAdditionalUserDataAfterSigninRequestBody = {
    providerName: ProviderName,
    authenticationContext: ProviderAuthenticationContext,
}

export type FetchAdditionalUserDataAfterSigninRequestResponse = any;

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<ApiResponse<FetchAdditionalUserDataAfterSigninRequestResponse>>
) {
    if (req.method === "POST") {
        try {
            const body = JSON.parse(req.body) as FetchAdditionalUserDataAfterSigninRequestBody;

            const providerService = new Providers[body.providerName].backendService(body.authenticationContext);

            const buckets = await providerService.fetchAdditionalUserDataAfterSignin();
            res.status(201).send(SuccessResponse(buckets));
        } catch (e: any) {
            console.error(e);
            res.status(500).send(ErrorResponse(e.message));
        }
    } else {
        res.status(405).send(MethodNotAllowedResponse);
    }
}
