import ApiVideoClient from '@api.video/nodejs-client';
import Video from '@api.video/nodejs-client/lib/model/Video';
import type { NextApiRequest, NextApiResponse } from 'next'
import VideoSource from '../../../types/videoSource';
import packageJson from '../../../../package.json';

interface CreateVideoBody {
    apiKey: string;
    videoSources: VideoSource[]
}

interface CreateVideoResponse {
    videos: Video[];
}

export default function handler(
    req: NextApiRequest,
    res: NextApiResponse<CreateVideoResponse | string>
) {
    if (req.method === "POST") {
        const body = JSON.parse(req.body) as CreateVideoBody;

        const client = new ApiVideoClient({ apiKey: body.apiKey, applicationName: "vimeo-migration-tool", applicationVersion: packageJson.version });
        
        const promises: Promise<Video>[] = body.videoSources.map(v => client.videos.create({
            title: v.name,
            source: v.url,
            metadata: [
                { key: "x-apivideo-vimeo-import", value: "1" },
            ]
        }));

        Promise.all(promises).then(v => res.status(200).json({ videos: v }));
    } else {
        res.status(405).send("");
    }
}
