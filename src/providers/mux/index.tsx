import { arrayContains, formatDate, formatDuration } from "../../utils/functions";
import { ImportProvider, OptionalFeatureFlag } from "../types";
import MuxLogin from "./LoginComponent";

const MuxProvider: ImportProvider = {
    displayName: 'MUX',
    description: 'Import from MUX',
    imgSrc: '/mux.svg',
    hidden: true,
    loginComponent: MuxLogin,
    hasFeature: (feature: OptionalFeatureFlag) => arrayContains([
      OptionalFeatureFlag.ProviderCredentialsBackendValidation, 
      OptionalFeatureFlag.GeneratePublicMp4UrlBeforeVideoCreation,
      OptionalFeatureFlag.WaitForPublicMp4Availibility
    ], feature),
    providerErrorMessage: (
      <p>
        Make sure you have correctly set the scopes of your{' '}
        <a
          className="text-blue-500 underline"
          href="https://import.api.video/doc/generate-a-mux-access-token"
          target="_blank"
          rel="noreferrer"
        >
          access token
        </a>
        .
      </p>
    ),
    authenticationScopes: undefined,
    videoTableSettings: {
      showThumnail: false,
      columns: [{
        title: 'Creation date',
        attributeName: 'date',
        sortFunction: (a: any, b: any, order: number) => order * (a.date as string).localeCompare(b.date),
        formatter: (v) => formatDate(new Date(v)),
      }, {
        title: 'Duration',
        attributeName: 'duration',
        sortFunction: (a: any, b: any, order: number) => order * (a.size - b.size),
        formatter: (v) => formatDuration(v),
      }]
    },
  };

  export default MuxProvider;