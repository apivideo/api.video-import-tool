import type { NextApiRequest, NextApiResponse } from 'next';

interface ZoomRecordingsBody {
    access_token: string;
}

interface ZoomRecordingsResponse {

}

export default function handler(
    req: NextApiRequest,
    res: NextApiResponse<ZoomRecordingsResponse | string>
) {
    if (req.method === "POST") {
        const body = JSON.parse(req.body) as ZoomRecordingsBody;
        const headers = new Headers();
        headers.append("Authorization", "Bearer " + body.access_token)
        fetch("https://api.zoom.us/v2/users/me/recordings", {
            headers
        })
            .then(a => a.json())
            .then(a => res.status(201).send(a));
    } else {
        res.status(405).send("");
    }
}
