import { arrayContains, formatDuration, formatSize } from "../../utils/functions";
import { ImportProvider, OptionalFeatureFlag } from "../types";
import VimeoLogin from "./LoginComponent";

const VimeoProvider: ImportProvider = {
    displayName: 'Wistia',
    description: 'Import from Wistia',
    imgSrc: '/wistia-logo.png',
    loginComponent: VimeoLogin,
    hasFeature: (feature: OptionalFeatureFlag) => arrayContains([OptionalFeatureFlag.ProviderCredentialsBackendValidation], feature),
    providerErrorMessage: (
      <p>
        Make sure you have correctly set the scopes of your{' '}
        <a
          className="text-blue-500 underline"
          href="https://import.api.video/doc/generate-a-vimeo-access-token"
          target="_blank"
          rel="noreferrer"
        >
          access token
        </a>
        .
      </p>
    ),
    authenticationScopes: [{
      name: 'read',
      description: 'Read all project and video data',
    }],
    videoTableSettings: {
      showThumnail: true,
      columns: [{
        title: 'Size',
        attributeName: 'size',
        sortFunction: (a: any, b: any, order: number) => order * (a.size - b.size),
        formatter: (v) => formatSize(v),
      }, {
        title: 'Duration',
        attributeName: 'duration',
        sortFunction: (a: any, b: any, order: number) => order * (a.size - b.size),
        formatter: (v) => formatDuration(v),
      }]
    },
  };

  export default VimeoProvider;