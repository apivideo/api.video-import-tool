import ApiVideoClient from '@api.video/nodejs-client';
import type { NextApiRequest, NextApiResponse } from 'next';
import packageJson from '../../../../package.json';

interface VerifyApiKeyBody {
    apiKey: string;
}

interface VerifyApiKeyResponse {

}

export default function handler(
    req: NextApiRequest,
    res: NextApiResponse<VerifyApiKeyResponse | string>
) {
    if (req.method === "POST") {
        const body = JSON.parse(req.body) as VerifyApiKeyBody;

        const client = new ApiVideoClient({ apiKey: body.apiKey, applicationName: "vimeo-migration-tool", applicationVersion: packageJson.version });

        client.getAccessToken()
            .then(r => res.status(201).send(""))
            .catch(e => res.status(403).send(""));


    } else {
        res.status(405).send("");
    }
}
