import Link from 'next/link';
import { ProviderName, Providers } from '../providers';
import Image from 'next/image';
import MigrationCard from './commons/MigrationCard';
interface MigrationToolProps {
  providerName?: ProviderName;
}

const ProvidersPage: React.FC<MigrationToolProps> = (props) => {
  const providers = Object.keys(Providers).map((provider: ProviderName) => ({
    link: `/${(provider as string).toLowerCase()}`,
    displayName: Providers[provider].displayName,
    name: provider,
    imgSrc: Providers[provider].imgSrc,
    description: Providers[provider].description,
  }));

  return (
    <MigrationCard activeStep={1} paddingTop>
      <div className="flex flex-col justify-between">
        <div className="flex flex-row gap-4 pb-8 flex-wrap lg:flex-nowrap w-full">
          {providers.map(({ displayName, link, name, imgSrc, description }) => (
            <Link href={link} key={name} className="w-full sm:w-72">
              <div className="border border-slate-200 rounded-lg shadow flex gap-4 p-6">
                <Image src={imgSrc} height={40} width={40} alt={displayName} />
                <div>
                  <p className="text-sm font-semibold">{displayName}</p>
                  <p className="text-xs text-slate-500">{description}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
        <p className="text-sm">
          We will be adding support for other platforms in the future. If you
          would like to contribute, feel free to open a pull request on{' '}
          <a
            href="https://github.com/apivideo/api.video-migration-tool"
            target="_blank"
            rel="noreferrer"
            className="text-blue-500 underline"
          >
            Github
          </a>
          .{' '}
        </p>
      </div>
    </MigrationCard>
  );
};

export default ProvidersPage;
