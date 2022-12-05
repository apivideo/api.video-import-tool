import { ArrowDownRight, ArrowRight } from "react-feather";
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
    description?: string;
    title: JSX.Element;
    imgSrc: string;
    loginButton: {
        color: string,
        text: string | React.ReactNode
    },
    intro?: JSX.Element;
    loginComponent: React.FC<ProviderLoginProps>;
    backendService: { new(authenticationContext?: ProviderAuthenticationContext): AbstractProviderService };
    hasFeature: (feature: OptionalFeatureFlag) => boolean;
};

export const Providers: { [name: string]: MigrationProvider } = {
    VIMEO: {
        displayName: "Vimeo",
        description: "⚠️ Pro Vimeo plan required",
        intro: <><b>Note</b>: you need at least a <b>Pro</b> Vimeo plan to use this tool. <b>Basic</b> and <b>Plus</b> plans are not supported.</>,
        title: <>Welcome to the <span style={{ color: "rgb(0, 173, 239)" }}>Vimeo</span> to <span className="orange">api.video</span> migration tool</>,
        imgSrc: '/vimeo.svg',
        loginButton: {
            color: 'vimeo',
            text: 'Authorize access to Vimeo account'
        },
        loginComponent: VimeoLogin,
        backendService: VimeoProviderService,
        hasFeature: (feature: OptionalFeatureFlag) => [
            OptionalFeatureFlag.ProviderCredentialsBackendValidation
        ].indexOf(feature) !== -1,
    },
    DROPBOX: {
        displayName: "Dropbox",
        description: "Import from Dropbox",
        title: <>Welcome to the <span style={{ color: "#0061fe" }}>Dropbox</span> to <span className="orange">api.video</span> migration tool</>,
        imgSrc: '/dropbox.svg',
        loginButton: {
            color: 'black',
            text: <div className="flex justify-center items-center gap-2">Proceed to migration <ArrowRight size={14} strokeWidth={'.2rem'}/></div>
        },
        loginComponent: DropboxLogin,
        backendService: DropboxProviderService,
        hasFeature: (feature: OptionalFeatureFlag) => [
            OptionalFeatureFlag.GeneratePublicMp4UrlBeforeVideoCreation
        ].indexOf(feature) !== -1,
    },
}  