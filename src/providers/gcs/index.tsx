import { arrayContains, formatDate, formatSize } from "../../utils/functions";
import { ImportProvider, OptionalFeatureFlag } from "../types";
import GcsLogin from "./LoginComponent";

const GcsProvider: ImportProvider = {
  displayName: 'Google Cloud Storage',
  description: 'Import from GCS',
  imgSrc: '/gcs.svg',
  hidden: false,
  loginComponent: GcsLogin,
  hasFeature: (feature: OptionalFeatureFlag) => arrayContains([OptionalFeatureFlag.ProviderCredentialsBackendValidation], feature),
  videoTableSettings: {
    showThumnail: false,
    columns: [{
      title: 'Creation date',
      attributeName: 'date',
      sortFunction: (a: any, b: any, order: number) => order * (a.date as string).localeCompare(b.date),
      formatter: (v) => formatDate(new Date(v)),
    }, {
      title: 'Size',
      attributeName: 'size',
      sortFunction: (a: any, b: any, order: number) => order * (a.size - b.size),
      formatter: (v) => formatSize(v),
    }]
  },
};

export default GcsProvider; 