export type OauthAccessToken = {
    access_token: string;
    expires_in: number;
    token_type: string;
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