import ApiVideoClient from '@api.video/nodejs-client';
import Video from '@api.video/nodejs-client/lib/model/Video';
import type { NextApiRequest, NextApiResponse } from 'next'
import VideoSource from '../../../types/videoSource';
import packageJson from '../../../../package.json';

interface CreateVideoBody {
    apiKey: string;
    migrationId: string;
    provider: string;
    videoSource: VideoSource;
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<Video | string>
) {
    if (req.method === "POST") {
        const body = JSON.parse(req.body) as CreateVideoBody;

        const client = new ApiVideoClient({ apiKey: body.apiKey, applicationName: "vimeo-migration-tool", applicationVersion: packageJson.version });

        try {
            const video = await client.videos.create({
                title: body.videoSource.name,
                source: body.videoSource.url,
                metadata: [
                    { key: "x-apivideo-is-migration", value: "1" },
                    { key: "x-apivideo-migration-provider", value: body.provider },
                    { key: "x-apivideo-migration-id", value: body.migrationId },
                    { key: "x-apivideo-migration-video-id", value: body.videoSource.id },
                    { key: "x-apivideo-migration-video-size", value: `${body.videoSource.size}` },
                ]
            });

            res.status(200).json(video);
        } catch (e: any) {
            console.error("Video creation failed", e);
            res.status(500).json("Video creation failed");
        }
    } else {
        res.status(405).send("");
    }
}
