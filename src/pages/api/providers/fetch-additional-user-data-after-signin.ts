import type { NextApiRequest, NextApiResponse } from 'next';
import { ProviderName } from '../../../providers';
import { getProviderBackendService } from '../../../providers/BackendServiceFactory';
import { ApiResponse, EncryptedProviderAuthenticationContext, ErrorResponse, MethodNotAllowedResponse, SuccessResponse } from '../../../types/common';


export type FetchAdditionalUserDataAfterSigninRequestBody = {
    providerName: ProviderName,
    authenticationContext: EncryptedProviderAuthenticationContext,
}

export type FetchAdditionalUserDataAfterSigninRequestResponse = any;

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<ApiResponse<FetchAdditionalUserDataAfterSigninRequestResponse>>
) {
    if (req.method === "POST") {
        try {
            const body = JSON.parse(req.body) as FetchAdditionalUserDataAfterSigninRequestBody;

            const providerService = new (getProviderBackendService(body.providerName))(undefined, body.authenticationContext)
            //const providerService = new Providers[body.providerName].backendService(body.authenticationContext);

            const buckets = await providerService.fetchAdditionalUserDataAfterSignin();
            res.setHeader('Cache-Control', 'no-store');
            res.status(201).send(SuccessResponse(buckets));
        } catch (e: any) {
            console.error(e);
            res.status(500).send(ErrorResponse(e.message));
        }
    } else {
        res.status(405).send(MethodNotAllowedResponse);
    }
}
