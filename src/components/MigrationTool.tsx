import Video from '@api.video/nodejs-client/lib/model/Video'
import type { NextPage } from 'next'
import { useState } from 'react'
import Authenticate from '../components/Authenticate'
import ImportProgress from '../components/ImportProgress'
import Stepper from '../components/stepper/Stepper'
import VideoSourceSelector from '../components/VideoSourceSelector'
import VimeoLogin from '../components/providers/VimeoLogin'
import VideoSource from '../types/videoSource'
import { MigrationProvider } from '../types/providers'

interface MigrationToolProps {
  provider: MigrationProvider;
}

const MigrationTool: React.FC<MigrationToolProps> = (props) => {
  const [step, setStep] = useState<number>(0);
  const [apiVideoApiKey, setApiVideoApiKey] = useState<string>();
  const [importableVideos, setImportableVideos] = useState<VideoSource[]>();
  const [importedVideos, setImportedVideos] = useState<Video[]>();

  const capitalize = (str: string) => {
    return str.substring(0, 1).toLocaleUpperCase() + str.substring(1).toLocaleLowerCase();
  }

  const getTitle = () => {
    if(props.provider === "VIMEO") return <>Welcome to the <span style={{color: "rgb(0, 173, 239)"}}>Vimeo</span> to <span className="orange">api.video</span> migration tool</>
    if(props.provider === "ZOOM") return <>Welcome to the <span style={{color: "#0c63ce"}}>Zoom recordings</span> to <span className="orange">api.video</span> migration tool</>
    return "";
  }

  return (
    <div className="container">
      <main className="main">
        <h1 className="title">{getTitle()}</h1>


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
      </main>
    </div>
  )
}

export default MigrationTool
