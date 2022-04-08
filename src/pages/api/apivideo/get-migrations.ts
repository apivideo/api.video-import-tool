import ApiVideoClient from '@api.video/nodejs-client';
import Video from '@api.video/nodejs-client/lib/model/Video';
import type { NextApiRequest, NextApiResponse } from 'next';
import { VideoWithStatus } from '../../../types/videoWithStatus';
import packageJson from '../../../../package.json';

interface GetStatusBody {
    apiKey: string;
    videos: Video[]
}

interface GetStatusResponse {
    videos: Video[];
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<GetStatusResponse | string>
) {
    if (req.method === "POST") {
        const body = JSON.parse(req.body) as GetStatusBody;

        const client = new ApiVideoClient({ apiKey: body.apiKey, applicationName: "vimeo-migration-tool", applicationVersion: packageJson.version });

        let allVideos: Video[] = [];

        for (let currentPage = 1; ; currentPage++) {
            const res = await client.videos.list({ metadata: { "x-apivideo-is-migration": "1" }, currentPage });
            allVideos = [...allVideos, ...res.data];
            if (currentPage >= (res?.pagination?.pagesTotal || 0)) {
                break;
            }
        }

        res.status(200).json({ videos: allVideos });
    } else {
        res.status(405).send("");
    }
}
