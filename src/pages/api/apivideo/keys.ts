import type { NextApiRequest, NextApiResponse } from 'next';
import { DASHBOARD_DOMAIN } from '../../../env';
import { ApiResponse, ErrorResponse, MethodNotAllowedResponse, SuccessResponse } from '../../../types/common';
import { encryptProjectWithApiKeys } from '../../../utils/functions/crypto';

export type VerifyApiKeyRequestBody = {
    apiKey: string;
}

type Key = {
    name: string;
    key: string;
    projectId: string;
    projectName: string;
};

type EncryptedKey = {
    name: string;
    encryptedKey: string;
    projectId: string;
    projectName: string;
};


type AbstractProjectWithApiKeys<T> = {
    name: string;
    keys: {
        production: T[];
        sandbox: T[];
    };
};

export type ProjectWithApiKeys = AbstractProjectWithApiKeys<Key>;
export type ProjectWithEncryptedApiKeys = AbstractProjectWithApiKeys<EncryptedKey>;


export type GetApiVideoApiKeysResponse = ProjectWithEncryptedApiKeys[];

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<ApiResponse<GetApiVideoApiKeysResponse>>
) {
    if (req.method === "GET") {
        try {
            const headers = req.headers;
            const bearerToken = headers.authorization;
            const res1 = await fetch(`${DASHBOARD_DOMAIN}/api/video-import-tool`, {
                method: 'GET',
                headers: {
                    'Authorization': bearerToken as string,
                    "Cookie": "av_session=1"
                }
            });
            
            const json: ProjectWithApiKeys[] = await res1.json();
            
            res.setHeader('Cache-Control', 'no-store');
            res.status(200).json(SuccessResponse(json.map(a => encryptProjectWithApiKeys(a))));
        } catch (e: any) {
            console.error(e);
            res.status(500).send(ErrorResponse(e.message));
        }
    } else {
        res.status(405).send(MethodNotAllowedResponse);
    }
}
