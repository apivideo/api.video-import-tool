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
    videos: VideoWithStatus[];
}

export default function handler(
    req: NextApiRequest,
    res: NextApiResponse<GetStatusResponse | string>
) {
    if (req.method === "POST") {
        const body = JSON.parse(req.body) as GetStatusBody;

        const client = new ApiVideoClient({ apiKey: body.apiKey, applicationName: "vimeo-migration-tool", applicationVersion: packageJson.version });

        const promises: Promise<VideoWithStatus>[] = body.videos.map(v => client.videos.getStatus(v.videoId).then(status => ({
            ...v,
            status
        })));

        Promise.all(promises).then(v => res.status(200).json({ videos: v }));
    } else {
        res.status(405).send("");
    }
}
