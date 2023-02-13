import type { NextApiRequest, NextApiResponse } from 'next';
import Providers, { ProviderName } from '../../providers';


type Data = {
    bucket: string

}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<string>
) {
    if (req.method === "GET") {
        const { provider, data } = req.query;

        const providerName = (provider as string).toUpperCase() as ProviderName;
        const providerService = new Providers[providerName].backendService();
        providerService.videoDownloadProxy(data as string, res);
    } else {
        res.status(405).send("");
    }
}
