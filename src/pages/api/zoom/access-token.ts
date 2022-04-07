import type { NextApiRequest, NextApiResponse } from 'next';
import { ZOOM_CLIENT_ID, ZOOM_CLIENT_SECRET, ZOOM_REDIRECT_URL } from './common';

interface ZoomAccessTokenBody {
    code: string;
}

interface ZoomAccessTokenResponse {

}

export default function handler(
    req: NextApiRequest,
    res: NextApiResponse<ZoomAccessTokenResponse | string>
) {
    if (req.method === "POST") {
        const body = JSON.parse(req.body) as ZoomAccessTokenBody;

        const headers = new Headers();
        headers.append("Authorization", `Basic ${btoa(ZOOM_CLIENT_ID + ":" + ZOOM_CLIENT_SECRET)}`);
        headers.append("Content-Type", "application/x-www-form-urlencoded");

        fetch("https://zoom.us/oauth/token", {
            method: "POST",
            body: `code=${body.code}&grant_type=authorization_code&redirect_uri=${ZOOM_REDIRECT_URL}`,
            headers
        })
            .then((e) => e.json())
            .then(j => res.status(201).send(j));
    } else {
        res.status(405).send("");
    }
}
