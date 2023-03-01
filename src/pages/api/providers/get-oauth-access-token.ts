import type { NextApiRequest, NextApiResponse } from 'next';
import { ProviderName } from '../../../providers';
import { getProviderBackendService } from '../../../providers/BackendServiceFactory';
import { EncryptedOauthAccessToken } from '../../../service/OAuthHelpers';
import { ApiResponse, ErrorResponse, MethodNotAllowedResponse, SuccessResponse } from '../../../types/common';


export type GetOauthAccessTokenRequestBody = {
    code: string;
    providerName: ProviderName;
}

export type GetOauthAccessTokenRequestResponse = EncryptedOauthAccessToken;


export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<ApiResponse<GetOauthAccessTokenRequestResponse>>
) {
    if (req.method === "POST") {
        try {
            const body = JSON.parse(req.body) as GetOauthAccessTokenRequestBody;

            const providerService = new (getProviderBackendService(body.providerName))();

            const token = await providerService.getOauthAccessToken(body.code)

            res.setHeader('Cache-Control', 'no-store');
            res.status(201).send(SuccessResponse(token));
        } catch (e: any) {
            console.error(e);
            res.status(500).send(ErrorResponse(e.message));
        }
    } else {
        res.status(405).send(MethodNotAllowedResponse);
    }
}
