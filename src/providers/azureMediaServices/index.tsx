import { arrayContains, formatDate, formatSize } from "../../utils/functions";
import { ImportProvider, OptionalFeatureFlag } from "../types";
import GcsLogin from "./LoginComponent";

const GcsProvider: ImportProvider = {
  displayName: 'Azure Media Services',
  description: 'Import from Azure Media Services',
  imgSrc: '/azure-media-service.jpeg',
  hidden: false,
  loginComponent: GcsLogin,
  hasFeature: (feature: OptionalFeatureFlag) => arrayContains([OptionalFeatureFlag.ProviderCredentialsBackendValidation], feature),
  videoTableSettings: {
    showThumnail: false,
    columns: [{
      title: 'Size',
      attributeName: 'size',
      sortFunction: (a: any, b: any, order: number) => order * (a.size - b.size),
      formatter: (v) => formatSize(v),
    },
    {
      title: 'Creation date',
      attributeName: 'creationDate',
      sortFunction: (a: any, b: any, order: number) => order * (new Date(a.creationDate).getTime() - new Date(b.creationDate).getTime()),
      formatter: (v) => new Date(v).toLocaleDateString(),
    }]
  },
};

export default GcsProvider; 