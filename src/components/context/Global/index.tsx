import Video from '@api.video/nodejs-client/lib/model/Video';
import React, { useContext, useState } from 'react';
import { ProviderName } from '../../../providers';

interface IGlobalContextProps {
    importId: string;
    providerName: ProviderName;
    providerAccessToken: string;
    videos: Video[];
    setProviderAccessToken: (accessToken: string) => void
    setImportId: (importId: string) => void;
    setProviderName: (providerName: ProviderName) => void;
    setVideos: (videos: Video[]) => void
}

export const GlobalContext = React.createContext<IGlobalContextProps>({
    importId: '',
    providerName: '',
    providerAccessToken: '',
    videos: [],
    setProviderAccessToken: () => { },
    setImportId: () => { },
    setProviderName: () => { },
    setVideos: () => { },
});

export const GlobalContextProvider = (props: { children: React.ReactNode }) => {
    const [importId, setImportId] = useState<string>('');
    const [providerName, setProviderName] = useState<ProviderName>('');
    const [videos, setVideos] = useState<Video[]>([]);
    const [providerAccessToken, setProviderAccessToken] = useState<string>('')

    return (
        <GlobalContext.Provider
            value={{
                importId,
                providerName,
                providerAccessToken,
                videos,
                setProviderAccessToken,
                setImportId,
                setProviderName,
                setVideos
            }}
        >
            {props.children}
        </GlobalContext.Provider>
    );
};

export const useGlobalContext = () => useContext(GlobalContext);