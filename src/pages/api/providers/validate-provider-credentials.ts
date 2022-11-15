import type { NextApiRequest, NextApiResponse } from 'next';
import AbstractProviderService from '../../../service/providers/AbstractProviderService';
import { ProviderAuthenticationContext } from '../../../types/common';
import { ProviderName, Providers } from '../../../providers';


export interface ValidateProviderCredentialsRequestBody {
    authenticationContext: ProviderAuthenticationContext,
    provider: ProviderName,
}

export interface ValidateProviderCredentialsRequestResponse {
    error: string | null;
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<ValidateProviderCredentialsRequestResponse | string>
) {
    if (req.method === "POST") {
        const body = JSON.parse(req.body) as ValidateProviderCredentialsRequestBody;

        const providerService = new Providers[body.provider].backendService(body.authenticationContext);
        
        providerService.validateCredentials()
            .then(message => res.status(201).send({
                error: message
            }));
    } else {
        res.status(405).send("");
    }
}
