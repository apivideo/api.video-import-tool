import Video from '@api.video/nodejs-client/lib/model/Video'
import Link from 'next/link'
import { useState } from 'react'
import Authenticate from '../components/Authenticate'
import ImportProgress from '../components/ImportProgress'
import Stepper from '../components/stepper/Stepper'
import VideoSourceSelector from '../components/VideoSourceSelector'
import { MigrationProvider } from '../types/providers'
import VideoSource from '../types/videoSource'

interface MigrationToolProps {
  provider: MigrationProvider;
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
  const [step, setStep] = useState<number>(0);
  const [apiVideoApiKey, setApiVideoApiKey] = useState<string>();
  const [importableVideos, setImportableVideos] = useState<VideoSource[]>();
  const [importedVideos, setImportedVideos] = useState<Video[]>();
  const [migrationId, _] = useState<string>(buildId(9));


  return (
    <div className="container">
      <main className="main">
        <h1 className="title">{props.provider.title}</h1>

        <Stepper activeStep={step} steps={["Authentication", "Videos selection", "Import progress"]}></Stepper>

        <div id="content">
          {step === 0 && <Authenticate
            provider={props.provider}
            onSubmit={(apiKey, videos) => {
              setImportableVideos(videos);
              setApiVideoApiKey(apiKey);
              setStep(1);
            }}
          />}

          {step === 1 && <VideoSourceSelector
            migrationId={migrationId}
            providerName={props.provider.key}
            videoSources={importableVideos!}
            apiVideoApiKey={apiVideoApiKey!}
            onSubmit={(videos) => {
              setImportedVideos(videos);
              setStep(2);
            }}
          />}

          {step === 2 && <ImportProgress
            apiVideoApiKey={apiVideoApiKey!}
            videos={importedVideos || []}
          />}
        </div>
        {step === 0 && <p><Link href="/migrations">Your previous migrations</Link></p>}
      </main>
    </div>
  )
}

export default MigrationTool
