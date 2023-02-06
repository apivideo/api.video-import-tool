export type OauthAccessToken = {
    access_token: string;
    expires_in: number;
    token_type: string;
}

export type RevokeAccessTokenResponse = {
    success: boolean;
}

export const getOauthAccessTokenCall = async (tokenApiUrl: string, clientId: string, clientSecret: string, redirectUrl: string, code: string): Promise<OauthAccessToken> => {
    const headers = new Headers();
    headers.append("Authorization", `Basic ${btoa(clientId + ":" + clientSecret)}`);
    headers.append("Content-Type", "application/x-www-form-urlencoded");

    const res = await fetch(tokenApiUrl, {
        method: "POST",
        body: `code=${code}&grant_type=authorization_code&redirect_uri=${redirectUrl}`,
        headers
    });

    return res.json();
}

export const revokeOauthAccessTokenCall = async (tokenApiUrl: string, clientId: string, clientSecret: string, accessToken: string): Promise<RevokeAccessTokenResponse> => {
    const headers = new Headers();
    headers.append("Authorization", `Basic ${btoa(clientId + ":" + clientSecret)}`);
    headers.append("Content-Type", "application/x-www-form-urlencoded");

    const res = await fetch(tokenApiUrl, {
        method: "POST",
        body: `token=${accessToken}`,
        headers
    });

    return {
        success: (await res.json()).status === "success"
    }
}