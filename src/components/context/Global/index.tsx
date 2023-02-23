import Video from '@api.video/nodejs-client/lib/model/Video';
import React, { useContext, useState } from 'react';
import { ProviderName } from '../../../providers';
import { EncryptedProviderAuthenticationData } from '../../../providers/types';


interface IGlobalContextProps {
    importId: string;
    providerName: ProviderName;
    providerAuthenticationData: EncryptedProviderAuthenticationData;
    videos: Video[];
    setProviderAuthenticationData: (authenticationData: EncryptedProviderAuthenticationData) => void
    setImportId: (importId: string) => void;
    setProviderName: (providerName: ProviderName) => void;
    setVideos: (videos: Video[]) => void
}

export const GlobalContext = React.createContext<IGlobalContextProps>({
    importId: '',
    providerName: '' as ProviderName,
    providerAuthenticationData: {} as EncryptedProviderAuthenticationData,
    videos: [],
    setProviderAuthenticationData: () => { },
    setImportId: () => { },
    setProviderName: () => { },
    setVideos: () => { },
});

export const GlobalContextProvider = (props: { children: React.ReactNode }) => {
    const [importId, setImportId] = useState<string>('');
    const [providerName, setProviderName] = useState<ProviderName>('' as ProviderName);
    const [videos, setVideos] = useState<Video[]>([]);
    const [providerAuthenticationData, setProviderAuthenticationData] = useState<EncryptedProviderAuthenticationData>({} as EncryptedProviderAuthenticationData);

    return (
        <GlobalContext.Provider
            value={{
                importId,
                providerName,
                providerAuthenticationData,
                videos,
                setProviderAuthenticationData,
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