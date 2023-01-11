import type { NextApiRequest, NextApiResponse } from 'next';
import Providers, { ProviderName } from '../../../providers';
import { ApiResponse, ErrorResponse, MethodNotAllowedResponse, ProviderAuthenticationContext, SuccessResponse } from '../../../types/common';


export type ValidateProviderCredentialsRequestBody = {
    authenticationContext: ProviderAuthenticationContext,
    provider: ProviderName,
}

export type ValidateProviderCredentialsRequestResponse = {
    error: string | null;
};

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<ApiResponse<ValidateProviderCredentialsRequestResponse>>
) {
    if (req.method === "POST") {
        try {
            const body = JSON.parse(req.body) as ValidateProviderCredentialsRequestBody;

            const providerService = new Providers[body.provider].backendService(body.authenticationContext);

            const errorMessage = await providerService.validateCredentials();
            res.status(201).send(SuccessResponse({ error: errorMessage }));
        } catch (e: any) {
            res.status(500).send(ErrorResponse(e.message));
        }
    } else {
        res.status(405).send(MethodNotAllowedResponse);
    }
}
