import type { NextApiRequest, NextApiResponse } from 'next';
import { ProviderName } from '../../../providers';
import { getProviderBackendService } from '../../../providers/BackendServiceFactory';
import { ApiResponse, CredentialsValidationResult, EncryptedProviderAuthenticationContext, ErrorResponse, MethodNotAllowedResponse, SuccessResponse } from '../../../types/common';


export type ValidateProviderCredentialsRequestBody = {
    authenticationContext: EncryptedProviderAuthenticationContext,
    provider: ProviderName,
}

export type ValidateProviderCredentialsRequestResponse = CredentialsValidationResult;

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<ApiResponse<ValidateProviderCredentialsRequestResponse>>
) {
    if (req.method === "POST") {
        try {
            const body = JSON.parse(req.body) as ValidateProviderCredentialsRequestBody;

            const providerService = new (getProviderBackendService(body.provider))(body.authenticationContext);


            res.setHeader('Cache-Control', 'no-store');
            res.status(201).send(SuccessResponse(await providerService.validateCredentials()));
        } catch (e: any) {
            console.error(e);
            res.status(500).send(ErrorResponse(e.message));
        }
    } else {
        res.status(405).send(MethodNotAllowedResponse);
    }
}
