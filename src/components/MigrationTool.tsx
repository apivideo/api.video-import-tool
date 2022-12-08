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
  const [sourceVideos, setSourceVideos] = useState<VideoSource[]>();
  const [migrationId, _] = useState<string>(buildId(9));
  const [authenticationContext, setAuthenticationContext] =
    useState<AuthenticationContext>();
  const [getStarted, setGetStarted] = useState<boolean>(false);

  const provider = props.providerName
    ? Providers[props.providerName]
    : undefined;

  const providers = Object.keys(Providers).map((provider: ProviderName) => ({
    link: `/${(provider as string).toLowerCase()}`,
    displayName: Providers[provider].displayName,
    name: provider,
    imgSrc: Providers[provider].imgSrc,
    description: Providers[provider].description,
  }));

  return (
    <div className="flex min-h-screen flex-col">
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
        <div className="mb-auto mt-40">
          <div className="border border-slate-200 rounded-lg w-3/4 p-8 shadow max-w-5xl mx-auto relative">
            <Image
              className="absolute -top-36 pt-8"
              src="/api-video.svg"
              width={100}
              height={100}
              alt="logo"
            />
            <div>
              <div className="flex justify-between pb-4">
                <h1 className="text-left text-2xl font-semibold">
                  Video migration tool
                </h1>
                <a
                  href="https://github.com/apivideo/api.video-migration-tool"
                  target="_blank"
                  rel="noreferrer"
                >
                  <button className="flex items-center gap-2 border rounded-md bg-black text-white text-sm font-semibold py-1">
                    <Image
                      src="/github.svg"
                      height={14}
                      width={14}
                      alt="github"
                    />
                    View on Github
                  </button>
                </a>
              </div>

              <p className="text-sm">
                This tool helps you quickly import your already hosted videos
                to api.video and take advantage of our API with your existing
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
                  <div className="flex flex-row gap-4 pb-8">
                    {providers.map(
                      ({ displayName, link, name, imgSrc, description }) => (
                        <Link href={link} key={name}>
                          <div className="w-72 border border-slate-200 rounded-lg shadow flex gap-4 p-6">
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
                    We will be adding support for other platforms in the
                    future. If you would like to contribute, feel free to open
                    a pull request on{' '}
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
                  onSubmit={(videos, videoSources) => {
                    setImportedVideos(videos);
                    setSourceVideos(videoSources)
                    setStep(3);
                  }}
                />
              )}

              {step === 3 && (
                <ImportProgress
                  apiVideoApiKey={authenticationContext?.apiVideoApiKey!}
                  videos={importedVideos || []}
                  sourceVideos={sourceVideos || []}
                />
              )}
            </div>
          </div>
        </div>
      )}
      <div className="p-5">
        <p className="text-sm text-center md:text-left">
          If you have any questions or need help,{' '}
          <a
            href="https://twitter.com/api_video"
            className="text-blue-500 underline"
          >
            tweet
          </a>{' '}
          us or email us at{' '}
          <a href="mailto:help@api.video" className="text-blue-500 underline">
            help@api.video
          </a>
        </p>
      </div>
    </div>
  );
};

export default MigrationTool;
