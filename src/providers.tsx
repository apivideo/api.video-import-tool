import DropboxLogin from "./components/provider-login/DropboxLogin";
import VimeoLogin from "./components/provider-login/VimeoLogin";
import AbstractProviderService from "./service/providers/AbstractProviderService";
import DropboxProviderService from "./service/providers/DropboxProviderService";
import VimeoProviderService from "./service/providers/VimeoProviderService";
import { ProviderAuthenticationContext } from "./types/common";


export type ProviderName = keyof typeof Providers;

export interface ProviderLoginProps {
    onAccessTokenChanged: (accessToken: string | null) => void;
    errorMessage?: string;
}

export enum OptionalFeatureFlag {
    ProviderCredentialsBackendValidation,
    GeneratePublicMp4UrlBeforeVideoCreation,
    WaitForPublicMp4Availibility,
}

export type MigrationProvider = {
    displayName: string;
    title: JSX.Element;
    intro?: JSX.Element;
    color: string;
    loginComponent: React.FC<ProviderLoginProps>;
    backendService: { new(authenticationContext?: ProviderAuthenticationContext): AbstractProviderService };
    hasFeature: (feature: OptionalFeatureFlag) => boolean;
};

export const Providers: { [name: string]: MigrationProvider } = {
    VIMEO: {
        displayName: "Vimeo",
        intro: <><b>Note</b>: you need at least a <b>Pro</b> Vimeo plan to use this tool. <b>Basic</b> and <b>Plus</b> plans are not supported.</>,
        title: <>Welcome to the <span style={{ color: "rgb(0, 173, 239)" }}>Vimeo</span> to <span className="orange">api.video</span> migration tool</>,
        color: "rgb(0, 173, 239)",
        loginComponent: VimeoLogin,
        backendService: VimeoProviderService,
        hasFeature: (feature: OptionalFeatureFlag) => [
            OptionalFeatureFlag.ProviderCredentialsBackendValidation
        ].indexOf(feature) !== -1,
    },
    DROPBOX: {
        displayName: "Dropbox",
        title: <>Welcome to the <span style={{ color: "#0061fe" }}>Dropbox</span> to <span className="orange">api.video</span> migration tool</>,
        color: "#0061fe",
        loginComponent: DropboxLogin,
        backendService: DropboxProviderService,
        hasFeature: (feature: OptionalFeatureFlag) => [
            OptionalFeatureFlag.GeneratePublicMp4UrlBeforeVideoCreation
        ].indexOf(feature) !== -1,
    },
}  