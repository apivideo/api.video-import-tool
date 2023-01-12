import DROPBOX from './dropbox';
import VIMEO from './vimeo';
import ZOOM from './zoom';

const Providers = {
    VIMEO,
    DROPBOX,
    ZOOM,
};

export default Providers;

export type ProviderName = keyof typeof Providers;