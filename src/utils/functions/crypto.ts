import crypto from 'crypto';

const key = process.env.IMPORT_TOOL_AES_256_CBC_KEY as string;

type VideoSourceProxyParams = {
    url: string
    headers: {
        [key: string]: string
    };
    method: "GET" | "POST";
    filename: string;
}

export const encrypt = (data: string) => {
    const iv = crypto.randomBytes(16);
    const ivStr = iv.toString('base64url');

    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key, 'base64url'), iv);

    cipher.setAutoPadding(true);
    const payloadJson = data;
    const encrypted = cipher.update(payloadJson, "utf8", "base64url") + cipher.final('base64url');

    return `${encrypted}.${ivStr}`;
}

export const decrypt = (data: string) => {
    const [encrypted, ivStr] = data.split('.');
    const iv = Buffer.from(ivStr, 'base64url');

    let decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key, 'base64url'), iv);
    decipher.setAutoPadding(true);
    return decipher.update(encrypted, "base64url", "utf8") + decipher.final('utf8');;
}

export const getVideoSourceProxyUrl = (url: string, filename: string, accessToken: string) => {
    const params: VideoSourceProxyParams = {
        url,
        headers: {
            Authorization: `Bearer ${accessToken}`
        },
        method: "GET",
        filename: filename.replaceAll("/", "_")
    }
    return `https://video-source-proxy.herokuapp.com/?data=${encrypt(JSON.stringify(params))}`;
}