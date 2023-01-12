import type { NextPage } from 'next';
import Image from 'next/image';

const VimeoAccessToken: NextPage = () => {
  return (
    <div>
      <Image
        className="mt-10 ml-60 mb-8"
        src="/api-video.svg"
        width={100}
        height={100}
        alt="logo"
      />
      <div className="mx-auto w-8/12 md:w-6/12">
        <h1 className="text-xl font-semibold mb-4">
          Using the Zoom recordings import tool
        </h1>

        <h2 className="text-base font-semibold mb-4 mt-8">
            Installing the application
          </h2>

        <div className="text-sm">
          <p>
            Installing the application can be done in two ways:
            </p>
            <ul className="list-disc ml-5">
            <li>by installing the app from the Zoom market place: <a href="https://zoom.us/oauth/authorize?response_type=code&client_id=NWItzjLDRHOZErQncaO1fA&redirect_uri=https://import.api.video/zoom" target="_blank" rel="noopener noreferrer"><img src="https://marketplacecontent.zoom.us/zoom_marketplace/img/add_to_zoom.png" style={{height: "32px", display: "inline"}} height="32" alt="Add to ZOOM" /></a></li>
            <li>by going on <a href="https://import.api.video/zoom">https://import.api.video/zoom</a> and clicking on &quot;Sign in to Zoom&quot;</li>            
            </ul>
          
        </div>

        <h2 className="text-base font-semibold mb-4 mt-8">
            Using the application
          </h2>
          <p>Once the application is installer, you will be able to select the recording you would like to import to api.video</p>
          <p>Once you have selected the recording, after clicking on &quot;Import&quot;, you will be redirected import progress page</p>
          <p>Your recording will be quickly imported and you will be able to access it from the <a href="https://dashboard.api.video">api.video dashboard</a></p>
      </div>
    </div>
  );
};

export default VimeoAccessToken;
