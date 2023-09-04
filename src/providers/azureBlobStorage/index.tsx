import { arrayContains, formatSize } from "../../utils/functions";
import { ImportProvider, OptionalFeatureFlag } from "../types";
import GcsLogin from "./LoginComponent";

const AzureStorageProvider: ImportProvider = {
  displayName: 'Azure Blob Storage',
  description: 'Import from Azure',
  imgSrc: '/storage-blob-storage.svg',
  hidden: false,
  loginComponent: GcsLogin,
  hasFeature: (feature: OptionalFeatureFlag) => arrayContains([OptionalFeatureFlag.ProviderCredentialsBackendValidation], feature),
  videoTableSettings: {
    showThumnail: false,
    columns: [
    {
      title: 'Container',
      attributeName: 'folder',
      sortFunction: (a: string, b: string, order: number) => a.localeCompare(b) * order,
      formatter: (v) => v,
    },{
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

export default AzureStorageProvider; 