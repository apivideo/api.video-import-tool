import { formatDate, formatSize } from "../../utils/functions";
import { ImportProvider, OptionalFeatureFlag } from "../types";
import GcsProviderService from "./BackendService";
import GcsLogin from "./LoginComponent";

const GcsProvider: ImportProvider = {
  displayName: 'Google Cloud Storage',
  description: 'Import from GCS',
  imgSrc: '/gcs.svg',
  hidden: true,
  loginComponent: GcsLogin,
  backendService: GcsProviderService,
  hasFeature: (feature: OptionalFeatureFlag) => false,
  authenticationScopes: [{
    name: 'cloudplatformprojects.readonly',
    description: 'View the list of projects you have access to'
  }, {
    name: 'devstorage.read_only',
    description: 'View your data in Google Cloud Storage'
  }],
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