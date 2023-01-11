import DROPBOX from './dropbox';
import VIMEO from './vimeo';

const Providers = {
    VIMEO,
    DROPBOX,
};

export default Providers;

export type ProviderName = keyof typeof Providers;