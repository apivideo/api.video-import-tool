import DROPBOX from './dropbox';
import GCS from './gcs';
import MUX from './mux';
import S3 from './s3';
import VIMEO from './vimeo';
import ZOOM from './zoom';
import AZURE_MEDIA from './azureMediaServices';
import AZURE_STORAGE from './azureBlobStorage';

const Providers = {
    VIMEO,
    DROPBOX,
    ZOOM,
    GCS,
    S3,
    MUX,
    AZURE_MEDIA,
    AZURE_STORAGE
};

export default Providers;

export type ProviderName = keyof typeof Providers; 