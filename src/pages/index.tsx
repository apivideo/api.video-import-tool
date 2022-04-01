import Video from '@api.video/nodejs-client/lib/model/Video'
import type { NextPage } from 'next'
import { useState } from 'react'
import ImportProgress from '../components/ImportProgress'
import Stepper from '../components/stepper/Stepper'
import VideoSourceSelector from '../components/VideoSourceSelector'
import VimeoLogin from '../components/VimeoLogin'
import VideoSource from '../types/videoSource'

const Home: NextPage = () => {
  const [step, setStep] = useState<number>(0);
  const [apiVideoApiKey, setApiVideoApiKey] = useState<string>();
  const [importableVideos, setImportableVideos] = useState<VideoSource[]>();
  const [importedVideos, setImportedVideos] = useState<Video[]>();

  return (
    <div className="container">
      <main className="main">
        <h1 className="title">
          Welcome to the Vimeo to <span className="orange">api.video</span> migration tool
        </h1>


        <Stepper activeStep={step} steps={["Authentication", "Videos selection", "Import progress"]}></Stepper>

        <div id="content">
          {step === 0 && <VimeoLogin
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

export default Home
