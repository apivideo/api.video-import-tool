import type { NextApiRequest, NextApiResponse } from 'next';
import Providers, { ProviderName } from '../../../providers';
import { RevokeAccessTokenResponse } from '../../../service/OAuthHelpers';
import { ApiResponse, EncryptedProviderAuthenticationContext, ErrorResponse, MethodNotAllowedResponse, SuccessResponse } from '../../../types/common';


export type RevokeOauthAccessTokenRequestBody = {
    authenticationContext: EncryptedProviderAuthenticationContext,
    provider: ProviderName;
}



export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<ApiResponse<RevokeAccessTokenResponse>>
) {
    if (req.method === "POST") {
        try {
            const body = JSON.parse(req.body) as RevokeOauthAccessTokenRequestBody;

            const providerService = new Providers[body.provider].backendService(body.authenticationContext);

            const token = await providerService.revokeOauthAccessToken()

            res.setHeader('Cache-Control', 'no-store');
            res.status(200).send(SuccessResponse(token));
        } catch (e: any) {
            console.error(e);
            res.status(500).send(ErrorResponse(e.message));
        }
    } else {
        res.status(405).send(MethodNotAllowedResponse);
    }
}
