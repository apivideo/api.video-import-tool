import Image from 'next/image';
import Link from 'next/link';
import Providers, { ProviderName } from '../providers';
import ImportCard from './commons/ImportCard';
interface ImportToolProps {
  providerName?: ProviderName;
}

const ProvidersPage: React.FC<ImportToolProps> = (props) => {
  const providers = Object.keys(Providers).map((providerName) => {
    const provider = Providers[providerName as ProviderName];
    return {
      link: `/${(providerName as string).toLowerCase()}`,
      name: providerName,
      ...provider,
    }
  });

  return (
    <ImportCard activeStep={1} paddingTop>
      <div className="flex flex-col justify-between">
        <div className="flex flex-row gap-4 pb-8 flex-wrap lg:flex-wrap w-full">
          {providers
            .filter((p) => p.hidden !== true)
            .map(({ displayName, link, name, imgSrc, description }) => (
              <Link href={link} key={name} className="w-1/3 sm:w-72 block">
                <div className="border border-slate-200 rounded-lg shadow flex gap-4 p-6">
                  <div className={"h-[40px] max-h-40px m-0 p-0"}>
                  <Image src={imgSrc} height={40} width={40} alt={displayName} />
                  </div>
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
            href="https://github.com/apivideo/api.video-import-tool"
            target="_blank"
            rel="noreferrer"
            className="text-blue-500 underline"
          >
            Github
          </a>
          .{' '}
        </p>
      </div>
    </ImportCard>
  );
};

export default ProvidersPage;
