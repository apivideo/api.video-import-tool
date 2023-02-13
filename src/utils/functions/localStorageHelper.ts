import { ProjectWithApiKeys } from "../../pages/api/apivideo/keys";
import { ProjectBucket } from "../../providers/gcs/BackendService";

const PREFIX = "api-video-import-tool-";

type SessionStorageEntries = {
    GCS: {
        accessToken: string;
        buckets?: ProjectBucket[]; 
        bucket?: string;
    };
    ZOOM: {
        accessToken: string;
    };
    DROPBOX: {
        accessToken: string;
    };
    APIVIDEO: {
        apiKey?: string;
        apiKeys: ProjectWithApiKeys[];
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
    const expirity = !!existingEntry ? JSON.parse(existingEntry).expiry : ttl;
    console.log({existingEntry, ttl, expirity});
    const entry = {
        value: value,
        expiry: expirity ? Date.now() + expirity : null,
    };

    sessionStorage.setItem(getKey(name), JSON.stringify(entry));
}

export const getItem = <T extends SessionStorageEntryNames>(name: T): SessionStorageEntries[T] | null => {
    const entry = sessionStorage.getItem(getKey(name));
    if (!entry) {
        return null;
    }
    const parsedEntry = JSON.parse(entry);
    if (parsedEntry.expiry && Date.now() > parsedEntry.expiry) {
        sessionStorage.removeItem(getKey(name));
        return null;
    }
    return parsedEntry.value;
}

export const removeItem = (name: SessionStorageEntryNames) => {
    sessionStorage.removeItem(getKey(name));
}
