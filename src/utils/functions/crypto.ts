import crypto from 'crypto';
import { ProjectWithApiKeys, ProjectWithEncryptedApiKeys } from '../../pages/api/apivideo/keys';
import { EncryptedOauthAccessToken, OauthAccessToken } from '../../service/OAuthHelpers';
import { EncryptedProviderAuthenticationContext, ProviderAuthenticationContext } from '../../types/common';

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


export const encryptAccessToken = (accessToken: OauthAccessToken): EncryptedOauthAccessToken => ({
    //@ts-ignore
    encrypted_access_token: accessToken.access_token ? encrypt(accessToken.access_token) : undefined,
    expires_in: accessToken.expires_in,
    token_type: accessToken.token_type
});

export const decryptAccessToken = (accessToken: EncryptedOauthAccessToken): OauthAccessToken => ({
    access_token: decrypt(accessToken.encrypted_access_token),
    expires_in: accessToken.expires_in,
    token_type: accessToken.token_type
});

export const encryptProviderAuthenticationContext = (providerAuthenticationContext: ProviderAuthenticationContext): EncryptedProviderAuthenticationContext => ({
    encryptedAccessToken: encrypt(providerAuthenticationContext.accessToken),
    additionnalData: providerAuthenticationContext.additionnalData
});

export const decryptProviderAuthenticationContext = (providerAuthenticationContext: EncryptedProviderAuthenticationContext): ProviderAuthenticationContext => ({
    //@ts-ignore
    accessToken: providerAuthenticationContext.encryptedAccessToken ? decrypt(providerAuthenticationContext.encryptedAccessToken) : undefined,
    additionnalData: providerAuthenticationContext.additionnalData
});

export const encryptProjectWithApiKeys = (project: ProjectWithApiKeys): ProjectWithEncryptedApiKeys => ({
    name: project.name,
    keys: {
        production: project.keys.production.map(key => ({
            name: key.name,
            encryptedKey: encrypt(key.key || ""),
            projectId: key.projectId,
            projectName: key.projectName
        })),
        sandbox: project.keys.sandbox.map(key => ({
            name: key.name,
            encryptedKey: encrypt(key.key || ""),
            projectId: key.projectId,
            projectName: key.projectName
        }))
    }
});

export const decryptProjectWithEncryptedApiKeys = (project: ProjectWithEncryptedApiKeys): ProjectWithApiKeys => ({
    name: project.name,
    keys: {
        production: project.keys.production.map(key => ({
            name: key.name,
            key: decrypt(key.encryptedKey),
            projectId: key.projectId,
            projectName: key.projectName
        })),
        sandbox: project.keys.sandbox.map(key => ({
            name: key.name,
            key: decrypt(key.encryptedKey),
            projectId: key.projectId,
            projectName: key.projectName
        }))
    }
});

export const getVideoSourceProxyUrlDefault = (url: string, filename: string, accessToken: string) => {
    const params: VideoSourceProxyParams = {
        url,
        headers: {
            Authorization: `Bearer ${accessToken}`
        },
        method: "GET",
        filename: filename.replaceAll("/", "_")
    }
    return getVideoSourceProxyUrl("default", params);
}

export const getVideoSourceProxyUrl = (type: string, params: any) => {
    
    return `https://video-source-proxy.herokuapp.com/?type=${type}&data=${encrypt(JSON.stringify(params))}`;
}