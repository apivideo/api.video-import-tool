import { ProviderProps } from "react";
import DropboxLogin from "./components/provider-login/DropboxLogin";
import VimeoLogin from "./components/provider-login/VimeoLogin";
import AbstractProviderService from "./service/providers/AbstractProviderService";
import DropboxProviderService from "./service/providers/DropboxProviderService";
import VimeoProviderService from "./service/providers/VimeoProviderService";
import VideoSource, { ProviderAuthenticationContext } from "./types/common";


export type ProviderName = keyof typeof Providers;

export interface ProviderLoginProps {
    onAccessTokenChanged: (accessToken: string | null) => void;
    errorMessage?: string;
}

export type OptionalBackendFeatures = "validateProviderCredentials" | "beforeVideoCreationHook";

export type MigrationProvider = {
    displayName: string;
    title: JSX.Element;
    intro?: JSX.Element;
    color: string;
    loginComponent: React.FC<ProviderLoginProps>;
    backendService: { new(authenticationContext?: ProviderAuthenticationContext): AbstractProviderService };
    backendFeatures: OptionalBackendFeatures[];
};

export const Providers: { [name: string]: MigrationProvider } = {
    VIMEO: {
        displayName: "Vimeo",
        intro: <><b>Note</b>: you need at least a <b>Pro</b> Vimeo plan to use this tool. <b>Basic</b> and <b>Plus</b> plans are not supported.</>,
        title: <>Welcome to the <span style={{ color: "rgb(0, 173, 239)" }}>Vimeo</span> to <span className="orange">api.video</span> migration tool</>,
        color: "rgb(0, 173, 239)",
        loginComponent: VimeoLogin,
        backendService: VimeoProviderService,
        backendFeatures: ["validateProviderCredentials"],
    },
    DROPBOX: {
        displayName: "Dropbox",
        title: <>Welcome to the <span style={{ color: "#0061fe" }}>Dropbox</span> to <span className="orange">api.video</span> migration tool</>,
        color: "#0061fe",
        loginComponent: DropboxLogin,
        backendService: DropboxProviderService,
        backendFeatures: ["beforeVideoCreationHook"],
    }
}  