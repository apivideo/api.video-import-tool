import { ProjectWithEncryptedApiKeys } from "../../pages/api/apivideo/keys";

const PREFIX = "api-video-import-tool-";

type SessionStorageEntries = {
    GCS: {
        encryptedAccessToken?: string;
        bucket?: string;
    };
    ZOOM: {
        encryptedAccessToken: string;
    };
    DROPBOX: {
        encryptedAccessToken: string;
    };
    VIMEO: {
        accessToken: string;
    };
    MUX: {
        encryptedAccessToken: string;
    };
    APIVIDEO: {
        encryptedKey?: string;
        apiKeys: ProjectWithEncryptedApiKeys[];
    };
    S3: {
        encryptedAccessToken: string;
        bucket?: string;
        buckets?: string[];
    };

};



type SessionStorageEntryNames = keyof SessionStorageEntries

const getKey = (name: SessionStorageEntryNames) => {
    return `${PREFIX}${name.toLowerCase()}`;
}

export const setItem = <T extends SessionStorageEntryNames>(
    name: T,
    value: SessionStorageEntries[T],
    ttl?: number
) => {
    const existingEntry = sessionStorage.getItem(getKey(name));
    
    let expirity = undefined;

    if(existingEntry) {
        expirity = JSON.parse(existingEntry).expiry;
    } else if(ttl) {
        expirity = Date.now() + ttl;
    }
    
    const entry = {
        value: value,
        expiry: expirity ? expirity : null,
    };

    sessionStorage.setItem(getKey(name), JSON.stringify(entry));
}

export const getItem = <T extends SessionStorageEntryNames>(name: T, expirityMarginMinutes: number = 30): SessionStorageEntries[T] | null => {
    const entry = sessionStorage.getItem(getKey(name));
    if (!entry) {
        return null;
    }
    const parsedEntry = JSON.parse(entry);
    if (parsedEntry.expiry && Date.now() > (parsedEntry.expiry - expirityMarginMinutes * 60 * 1000)) {
        sessionStorage.removeItem(getKey(name));
        return null;
    }
    return parsedEntry.value;
}

export const removeItem = (name: SessionStorageEntryNames) => {
    sessionStorage.removeItem(getKey(name));
}
 