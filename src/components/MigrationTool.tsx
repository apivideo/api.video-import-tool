import Video from '@api.video/nodejs-client/lib/model/Video';
import Link from 'next/link';
import { useState } from 'react';
import Authenticate from '../components/Authenticate';
import ImportProgress from '../components/ImportProgress';
import Stepper from '../components/stepper/Stepper';
import VideoSourceSelector from '../components/VideoSourceSelector';
import { ProviderName, Providers } from '../providers';
import { AuthenticationContext } from '../types/common';
import Image from 'next/image'
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

  const provider = props.providerName
    ? Providers[props.providerName]
    : undefined;

  const providers = Object.keys(Providers).map((provider: ProviderName) => ({
    link: `/${(provider as string).toLowerCase()}`,
    displayName: Providers[provider].displayName,
    name: provider,
    color: Providers[provider].color,
  }));

  return (
    <div className="py-36">
      <main className="border border-slate-200 rounded-lg w-fit p-8">
        <div>
          <div className="flex justify-between pb-4">
            <h1 className="text-left text-2xl font-semibold">
              {provider ? provider.title : 'Video migration tool'}
            </h1>
            <button className="flex items-center gap-2 border rounded-md bg-black text-white text-sm font-semibold py-1">
            <Image src="/github.svg" height={14} width={14} alt='github' />
              View on Github
            </button>
          </div>

          <p className="text-sm">
            This tool helps you quickly import your already hosted videos to
            api.video and take advantage of our API with your existing content.
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
        <div id="content">
          {step === 0 && (
            <div style={{ display: 'flex', flexDirection: 'row' }}>
              {providers.map(({ displayName, link, name, color }) => (
                <div style={{ flex: 1, textAlign: 'center' }} key={name}>
                  <Link
                    style={{
                      flex: 1,
                      margin: '0 10px',
                      backgroundColor: color,
                      color: 'white',
                      borderRadius: 6,
                      padding: '10px 0',
                      textDecoration: 'none',
                    }}
                    href={link}
                  >
                    {displayName}
                  </Link>
                </div>
              ))}
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
            />
          )}
        </div>
        {step === 0 && (
          <p>
            <Link href="/migrations">Your previous migrations</Link>
          </p>
        )}
      </main>
    </div>
  );
};

export default MigrationTool;
