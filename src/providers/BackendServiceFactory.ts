import { ProviderName } from ".";
import { ClearProviderAuthenticationContext, EncryptedProviderAuthenticationContext } from "../types/common";
import AbstractProviderService from "./AbstractProviderService";
import DropboxBackendService from "./dropbox/BackendService";
import GcsBackendService from "./gcs/BackendService";
import MuxBackendService from "./mux/BackendService";
import S3BackendService from "./s3/BackendService";
import VimeoBackendService from "./vimeo/BackendService";
import ZoomBackendService from "./zoom/BackendService";
import AzureBackendService from "./azureMediaServices/BackendService";
import AzureStorageBackendService from "./azureBlobStorage/BackendService";
import WistiaBackendService from "./wistia/BackendService";

const backendServices : { [key in ProviderName]: {new(clearAuthenticationContext?: ClearProviderAuthenticationContext,
    encryptedAuthenticationContext?: EncryptedProviderAuthenticationContext): AbstractProviderService;} } = {
    VIMEO: VimeoBackendService,
    DROPBOX: DropboxBackendService,
    GCS: GcsBackendService,
    S3: S3BackendService,
    ZOOM: ZoomBackendService,
    MUX: MuxBackendService,
    AZURE_MEDIA: AzureBackendService,
    AZURE_STORAGE: AzureStorageBackendService,
    WISTIA: WistiaBackendService
};

export const getProviderBackendService = (providerName: ProviderName) => backendServices[providerName];

