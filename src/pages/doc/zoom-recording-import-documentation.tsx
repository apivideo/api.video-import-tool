import type { NextPage } from 'next';
import Image from 'next/image';

const VimeoAccessToken: NextPage = () => {
  return (
    <div className="mb-56">
      <Image
        className="mt-10 ml-60 mb-8"
        src="/api-video.svg"
        width={100}
        height={100}
        alt="logo"
      />
      <div className="mx-auto w-8/12 md:w-6/12">
        <h1 className="text-xl font-semibold mb-4">api.video&apos;s Zoom recordings import tool</h1>

        <h2 className="text-base font-semibold mb-4 mt-8">Introduction</h2>
        <p>Welcome to the documentation for the Zoom to api.video recording migration application. </p>
        <p className="mt-2">With this application, you can quickly and efficiently transfer your Zoom recordings to api.video, providing you with a secure and reliable platform to store and share your recodrings.</p>
        <p className="mt-2">This documentation will provide you with all the information you need to install and use the app. </p>


        <h2 className="text-base font-semibold mb-4 mt-8">Installing the application</h2>
        <p className="my-2"><u>Prerequisites</u></p>
        <ul className="list-disc ml-5 my-2">
          <li>Being admin of a Zoom account</li>
          <li>Having an api.video account: you need to have an api.video account. If you don&apos;t have one, you can create one for free on <a  className="text-blue-500 underline" href="https://dashboard.api.video">https://dashboard.api.video</a></li>
        </ul>

        <p className="my-2"><u>Installation steps</u></p>
        <p>Installing the application can be done in two ways:</p>
        <ul className="list-disc ml-5">
          <li>from the Zoom market place: <a  className="text-blue-500 underline" href="https://zoom.us/oauth/authorize?response_type=code&client_id=NWItzjLDRHOZErQncaO1fA&redirect_uri=https://import.api.video/zoom" target="_blank" rel="noopener noreferrer"><img src="https://marketplacecontent.zoom.us/zoom_marketplace/img/add_to_zoom.png" style={{ height: "32px", display: "inline" }} height="32" alt="Add to ZOOM" /></a></li>
          <li>by going on <a  className="text-blue-500 underline" href="https://import.api.video/zoom">https://import.api.video/zoom</a> and clicking on &quot;Sign in to Zoom&quot;</li>
        </ul>

        <p className="my-2"><u>Scopes</u></p>
        <p>By installing the application, you will be asked to grant the following permission: account:read:admin.</p>
        <p>This scope is required to be able to list and import your recordings.</p>

        <h2 className="text-base font-semibold mb-4 mt-8">Usage</h2>
        <p>Once the application is installed, you will be able to select the recording you would like to import to api.video.</p>
        <p>Once you have selected the recording, after clicking on &quot;Import&quot;, you will be redirected to a progress page where you will be able to see the progress of the import.</p>
        <p>Your recording will be quickly imported and you will be able to access it from the <a  className="text-blue-500 underline" href="https://dashboard.api.video">api.video dashboard</a>.</p>


        <h2 className="text-base font-semibold mb-4 mt-8">Application removal</h2>
        <p>To remove the &quot;api.video import tool&quot; application, you can follow these steps:</p>
        <ul className="list-disc ml-5">
          <li>Log in to your Zoom account and navigate to the Zoom App Marketplace.</li>
          <li>Click Manage &gt; Added Apps or search for the &quot;api.video import tool&quot; app. </li>
          <li>Click the &quot;Remove&quot; button.</li>
        </ul>

        <p className="my-4">If you want to delete your imported recordings, you can do so from the <a  className="text-blue-500 underline" href="https://dashboard.api.video">api.video dashboard</a>.</p>

        <h2 className="text-base font-semibold mb-4 mt-8">Troubleshooting</h2>
        <p>If you encounter any issue, feel free to contact us at <a  className="text-blue-500 underline" href="mailto:help@api.video">help@api.video</a>.</p>

      </div>
    </div>
  );
};

export default VimeoAccessToken;
