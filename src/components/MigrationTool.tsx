import Video from '@api.video/nodejs-client/lib/model/Video';
import Link from 'next/link';
import { useState } from 'react';
import Authenticate from '../components/Authenticate';
import ImportProgress from '../components/ImportProgress';
import Stepper from '../components/stepper/Stepper';
import VideoSourceSelector from '../components/VideoSourceSelector';
import { ProviderName, Providers } from '../providers';
import VideoSource, { AuthenticationContext } from '../types/common';
import Image from 'next/image';
import Footer from './commons/Footer';
import MigrationCard from './commons/MigrationCard';
interface MigrationToolProps {
  providerName?: ProviderName;
}

const buildId = (length: number) => {
  let result = '';
  let characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let charactersLength = characters.length;

  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

const MigrationTool: React.FC<MigrationToolProps> = (props) => {
  const [step, setStep] = useState<number>(props.providerName ? 1 : 0);
  const [importedVideos, setImportedVideos] = useState<Video[]>();
  const [migrationId, _] = useState<string>(buildId(9));
  const [authenticationContext, setAuthenticationContext] =
    useState<AuthenticationContext>();
  const [getStarted, setGetStarted] = useState<boolean>(false);

  const providers = Object.keys(Providers).map((provider: ProviderName) => ({
    link: `/${(provider as string).toLowerCase()}`,
    displayName: Providers[provider].displayName,
    name: provider,
    imgSrc: Providers[provider].imgSrc,
    description: Providers[provider].description,
  }));

  return (
    <>
      {!getStarted && step === 0 ? (
        <div className="flex items-center flex-col max-w-xs sm:max-w-2xl pt-36 self-center mb-auto">
          <Image
            src="/migration-logo.svg"
            width={300}
            height={100}
            alt="logo"
            className="pb-8"
          />
          <h1 className="text-2xl font-semibold text-center">
            Video migration tool
          </h1>
          <p className="text-gray-500 font-semibold py-2 text-center">
            Import your videos from vimeo or dropbox directly to api.video
          </p>
          <p className="text-sm text-center">
            We built this tool to help you quickly import your already hosted
            videos to the api.video platform.
          </p>
          <p className="text-sm text-center">
            {' '}
            Take advantage of our API with your existing content.
          </p>
          <div className="flex gap-4 pt-6 flex-wrap justify-center">
            <button
              onClick={() => setGetStarted(true)}
              className="text-sm font-semibold w-44"
            >
              Get started
            </button>
            <a
              href="https://github.com/apivideo/api.video-migration-tool"
              target="_blank"
              rel="noreferrer"
            >
              <button className="w-44 flex items-center justify-center gap-2 border rounded-md bg-black text-white text-sm font-semibold">
                <Image src="/github.svg" height={14} width={14} alt="github" />
                View on Github
              </button>
            </a>
          </div>
        </div>
      ) : (
        <MigrationCard>
          <div>
            <p className="text-sm">
              This tool helps you quickly import your already hosted videos to
              api.video and take advantage of our API with your existing
              content.
            </p>
            <Stepper
              activeStep={step}
              steps={[
                'Select source',
                'Authentication',
                'Video Selection',
                'Import Progress',
              ]}
            ></Stepper>
          </div>
          <div className="h-px w-full bg-slate-300"></div>
          <div className="pt-10">
            {step === 0 && (
              <div className="flex flex-col justify-between">
                <div className="flex flex-row gap-4 pb-8 flex-wrap lg:flex-nowrap w-full">
                  {providers.map(
                    ({ displayName, link, name, imgSrc, description }) => (
                      <Link href={link} key={name} className="w-full sm:w-72">
                        <div className="border border-slate-200 rounded-lg shadow flex gap-4 p-6">
                          <Image
                            src={imgSrc}
                            height={40}
                            width={40}
                            alt={displayName}
                          />
                          <div>
                            <p className="text-sm font-semibold">
                              {displayName}
                            </p>
                            <p className="text-xs text-slate-500">
                              {description}
                            </p>
                          </div>
                        </div>
                      </Link>
                    )
                  )}
                </div>
                <p className="text-sm">
                  We will be adding support for other platforms in the future.
                  If you would like to contribute, feel free to open a pull
                  request on{' '}
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
            )}

            {step === 1 && (
              <Authenticate
                providerName={props.providerName}
                onSubmit={async (
                  authenticationContext: AuthenticationContext
                ) => {
                  setAuthenticationContext(authenticationContext);
                  setStep(2);
                }}
              />
            )}

            {step === 2 && (
              <VideoSourceSelector
                migrationId={migrationId}
                providerName={props.providerName!}
                authenticationContext={authenticationContext!}
                onSubmit={(videos) => {
                  setImportedVideos(videos);
                  setStep(3);
                }}
              />
            )}

            {step === 3 && (
              <ImportProgress
                apiVideoApiKey={authenticationContext?.apiVideoApiKey!}
                videos={importedVideos || []}
                migrationId={migrationId}
                providerName={props.providerName!}
              />
            )}
          </div>
        </MigrationCard>
      )}
    </>
  );
};

export default MigrationTool;
