import DROPBOX from './dropbox';
import GCS from './gcs';
import VIMEO from './vimeo';
import ZOOM from './zoom';

const Providers = {
    VIMEO,
    DROPBOX,
    ZOOM,
    GCS,
};

export default Providers;

export type ProviderName = keyof typeof Providers;