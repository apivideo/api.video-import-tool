import type { NextApiRequest, NextApiResponse } from 'next';
import { ProviderName, Providers } from '../../../providers';
import { OauthAccessToken } from '../../../service/oauth';


export interface GetOauthAccessTokenRequestBody {
    code: string;
    provider: ProviderName;
}

export interface GetOauthAccessTokenRequestResponse extends OauthAccessToken {};


export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<GetOauthAccessTokenRequestResponse | string>
) {
    if (req.method === "POST") {
        const body = JSON.parse(req.body) as GetOauthAccessTokenRequestBody;

        const providerService = new Providers[body.provider].backendService();
        
        providerService.getOauthAccessToken(body.code)
            .then(token => res.status(201).send(token));
    } else {
        res.status(405).send("");
    }
}
