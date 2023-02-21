import { arrayContains, formatDate, formatSize } from "../../utils/functions";
import { ImportProvider, OptionalFeatureFlag } from "../types";
import S3Login from "./LoginComponent";

const S3Provider: ImportProvider = {
  displayName: 'Amazon S3',
  description: 'Import from Amazon S3',
  imgSrc: '/s3.svg',
  hidden: true,
  loginComponent: S3Login,
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
  }
};

export default S3Provider; 