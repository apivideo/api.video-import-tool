import type { NextApiRequest, NextApiResponse } from 'next';
import { DASHBOARD_DOMAIN } from '../../../env';
import { ApiResponse, ErrorResponse, MethodNotAllowedResponse, SuccessResponse } from '../../../types/common';

export type VerifyApiKeyRequestBody = {
    apiKey: string;
}

type Key = {
    name: string;
    key: string;
    projectId: string;
    projectName: string;
};


export type ProjectWithApiKeys = {
    name: string;
    keys: {
        production: Key[];
        sandbox: Key[];
    };
};


export type GetApiVideoApiKeysResponse = ProjectWithApiKeys[];

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
            
            const json = await res1.json();

            res.status(200).json(SuccessResponse(json));
        } catch (e: any) {
            console.error(e);
            res.status(500).send(ErrorResponse(e.message));
        }
    } else {
        res.status(405).send(MethodNotAllowedResponse);
    }
}
