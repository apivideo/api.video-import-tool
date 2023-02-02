import { formatDate, formatDuration, formatSize } from "../../utils/functions";
import { ImportProvider, OptionalFeatureFlag } from "../types";
import ZoomProviderService from "./BackendService";
import ZoomLogin from "./LoginComponent";

const ZoomProvider: ImportProvider = {
  displayName: 'Zoom',
  description: '⚠️ Admin Zoom user only',
  imgSrc: '/zoom.svg',
  hidden: true,
  loginComponent: ZoomLogin,
  backendService: ZoomProviderService,
  hasFeature: (feature: OptionalFeatureFlag) => false,
  authenticationScopes: [{
    name: 'account:read:admin',
    description: 'If you\'re an admin of a Zoom account, meeting or webinar recordings of the account.',
  }, {
    name: 'recording:read:admin',
    description: 'All the meeting or webinar recordings of your own Zooom user',
  }],
  videoTableSettings: {
    showThumnail: false,
    columns: [{
      title: 'Meeting date',
      attributeName: 'date',
      sortFunction: (a: any, b: any, order: number) => order * (a.date as string).localeCompare(b.date),
      formatter: (v) => formatDate(new Date(v)),
    }, {
      title: 'Size',
      attributeName: 'size',
      sortFunction: (a: any, b: any, order: number) => order * (a.size - b.size),
      formatter: (v) => formatSize(v),
    }, {
      title: 'Duration',
      attributeName: 'duration',
      sortFunction: (a: any, b: any, order: number) => order * (a.duration - b.duration),
      formatter: (v) => formatDuration(v),
    }]
  },
  apiVideoAuthenticationMode: "auth0"
};

export default ZoomProvider; 