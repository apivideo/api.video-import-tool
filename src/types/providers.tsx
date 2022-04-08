import { ProviderLoginProps } from "../components/providers/common";
import VimeoLogin from "../components/providers/VimeoLogin";
import ZoomLogin from "../components/providers/ZoomLogin";

export type MigrationProvider = {
    key: string;
    title: JSX.Element;
    intro?: JSX.Element;
    loginComponent?:  React.FC<ProviderLoginProps>;
};

export const Providers: {[name: string]: MigrationProvider} = {
    VIMEO: {
        key: "vimeo",
        intro: <><b>Note</b>: you need at least a <b>Pro</b> Vimeo plan to use this tool. <b>Basic</b> and <b>Plus</b> plans are not supported.</>,
        title: <>Welcome to the <span style={{color: "rgb(0, 173, 239)"}}>Vimeo</span> to <span className="orange">api.video</span> migration tool</>,
        loginComponent: VimeoLogin
    },
    ZOOM: {
        key: "zoom",
        title: <>Welcome to the <span style={{color: "#0c63ce"}}>Zoom recordings</span> to <span className="orange">api.video</span> migration tool</>,
        loginComponent: ZoomLogin
    },
    EMPTY: {
        key: 'empty',
        intro: <>From here you will be able to see the migrations you&apos;ve done using the migration tool.</>,
        title: <>Welcome to the <span className="orange">api.video</span> migration tool</>,
    }
} 