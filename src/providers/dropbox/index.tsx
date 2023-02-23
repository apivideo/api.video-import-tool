import { arrayContains, formatSize } from "../../utils/functions";
import { ImportProvider, OptionalFeatureFlag } from "../types";
import DropboxProviderService from "./BackendService";
import DropboxLogin from "./LoginComponent";

const DropboxProvider: ImportProvider = {
  displayName: 'Dropbox',
  description: 'Import from Dropbox',
  imgSrc: '/dropbox.svg',
  loginComponent: DropboxLogin,
  backendService: DropboxProviderService,
  hasFeature: (feature: OptionalFeatureFlag) => arrayContains([OptionalFeatureFlag.GeneratePublicMp4UrlBeforeVideoCreation], feature),
  authenticationScopes: [{
    name: 'files.content.read',
    description: 'View content of your Dropbox files and folders',
  }, {
    name: 'files.metadata.read',
    description: 'View information about your Dropbox files and folders',
  }],
  videoTableSettings: {
    showThumnail: true,
    columns: [{
      title: 'Size',
      attributeName: 'size',
      sortFunction: (a: any, b: any, order: number) => order * (a.size - b.size),
      formatter: (v) => formatSize(v),
    }]
  },
};

  export default DropboxProvider;