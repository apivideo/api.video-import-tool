import Video from '@api.video/nodejs-client/lib/model/Video';
import React, { useContext, useState } from 'react';
import { ProviderName } from '../../../providers';

interface IGlobalContextProps {
    migrationId: string;
    providerName: ProviderName;
    providerAccessToken: string;
    videos: Video[];
    setProviderAccessToken: (accessToken: string) => void
    setMigrationId: (migrationId: string) => void;
    setProviderName: (providerName: ProviderName) => void;
    setVideos: (videos: Video[]) => void
}

export const GlobalContext = React.createContext<IGlobalContextProps>({
    migrationId: '',
    providerName: '',
    providerAccessToken: '',
    videos: [],
    setProviderAccessToken: () => { },
    setMigrationId: () => { },
    setProviderName: () => { },
    setVideos: () => { },
});

export const GlobalContextProvider = (props: { children: React.ReactNode }) => {
    const [migrationId, setMigrationId] = useState<string>('');
    const [providerName, setProviderName] = useState<ProviderName>('');
    const [videos, setVideos] = useState<Video[]>([]);
    const [providerAccessToken, setProviderAccessToken] = useState<string>('')

    return (
        <GlobalContext.Provider
            value={{
                migrationId,
                providerName,
                providerAccessToken,
                videos,
                setProviderAccessToken,
                setMigrationId,
                setProviderName,
                setVideos
            }}
        >
            {props.children}
        </GlobalContext.Provider>
    );
};

export const useGlobalContext = () => useContext(GlobalContext);