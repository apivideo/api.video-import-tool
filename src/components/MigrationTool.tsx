import Video from '@api.video/nodejs-client/lib/model/Video'
import Link from 'next/link'
import { useState } from 'react'
import Authenticate from '../components/Authenticate'
import ImportProgress from '../components/ImportProgress'
import Stepper from '../components/stepper/Stepper'
import VideoSourceSelector from '../components/VideoSourceSelector'
import { ProviderName, Providers } from '../providers'
import { AuthenticationContext } from '../types/common'

interface MigrationToolProps {
  providerName?: ProviderName;
}

const buildId = (length: number) => {
  let result = '';
  let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let charactersLength = characters.length;

  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() *
      charactersLength));
  }
  return result;
}

const MigrationTool: React.FC<MigrationToolProps> = (props) => {
  const [step, setStep] = useState<number>(props.providerName ? 1 : 0);
  const [importedVideos, setImportedVideos] = useState<Video[]>();
  const [migrationId, _] = useState<string>(buildId(9));
  const [authenticationContext, setAuthenticationContext] = useState<AuthenticationContext>();

  const provider = props.providerName ? Providers[props.providerName] : undefined;

  const providers = Object.keys(Providers)
    .map((provider: ProviderName) => ({
      link: `/${(provider as string).toLowerCase()}`,
      displayName: Providers[provider].displayName,
      name: provider,
      color: Providers[provider].color
    }));

  return (
    <div className="container">
      <main className="main">
        <h1 className="title">{provider ? provider.title : "Video migration tool"}</h1>
        <Stepper activeStep={step} steps={["Select source", "Authentication", "Video Selection", "Import Progress"]}></Stepper>

        <div id="content">
          {step === 0 && <div style={{ display: "flex", flexDirection: "row" }}>
            {providers.map(({ displayName, link, name, color }) => <div style={{ flex: 1, textAlign: "center" }} key={name}>
              <Link style={{ flex: 1, margin: "0 10px", backgroundColor: color, color: "white", borderRadius: 6, padding: "10px 0", textDecoration: "none" }} href={link} >{displayName}</Link>
            </div>)}
          </div>}

          {step === 1 && <Authenticate
            providerName={props.providerName}
            onSubmit={async (authenticationContext: AuthenticationContext) => {
              setAuthenticationContext(authenticationContext);
              setStep(2);
            }}
          />}

          {step === 2 && <VideoSourceSelector
            migrationId={migrationId}
            providerName={props.providerName!}
            authenticationContext={authenticationContext!}
            onSubmit={(videos) => {
              setImportedVideos(videos);
              setStep(3);
            }}
          />}

          {step === 3 && <ImportProgress
            apiVideoApiKey={authenticationContext?.apiVideoApiKey!}
            videos={importedVideos || []}
          />}
        </div>
        {step === 0 && <p><Link href="/migrations">Your previous migrations</Link></p>}
      </main>
    </div>
  )
}

export default MigrationTool
