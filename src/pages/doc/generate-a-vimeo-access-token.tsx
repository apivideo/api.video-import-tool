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
          How to generate a Vimeo access token
        </h1>

        <div className="text-sm">
          <p>
            To work, the Vimeo import tool needs you to provide it with a
            Vimeo access token. This access token is used to retrieve the list
            of your videos, and to access the video source files.
          </p>
          <p>The generation of an access token is done in two quick steps:</p>
          <ul className="list-disc ml-5">
            <li>the creation of a Vimeo application</li>
            <li>the creation of an access token for this application</li>
          </ul>

          <h2 className="text-base font-semibold mb-4 mt-8">
            Step 1/2 - Creation of a Vimeo application
          </h2>
          <p>
            To create an application, go to your{' '}
            <a
              href="https://developer.vimeo.com/apps"
              rel="noreferrer"
              target="_blank"
              className="underline"
            >
              Vimeo applications list
            </a>
            , and click on Create an app
          </p>
          <Image src="/vimeo-1.svg" width={1030} height={140} alt="gcs-1"  priority />

          <h2 className="text-base font-semibold mb-4 mt-4">
            Step 2/2 - Generate access token
          </h2>
          <p>
            Once your app has been created, you&apos;ll be redirected to the
            application settings page.
          </p>
          <p>From here, you&apos;ll be able to generate a new access token.</p>
          <p>
            In the Generate an access token section, select Authenticated (you),
            check the Private and Video Files check boxes, and then click on
            Generate.
          </p>

          <Image
            src="/vimeo-2.svg"
            width={1030}
            height={140}
            alt="vimeo-2"
            className="py-4"
          />

          <p>
            Just bellow, a new item will appear with the Token value
            (8011xxxx...xxx in the screenshoot above), this is the one
            you&apos;ll have to copy/paste in the import tool.
          </p>

          <Image
            src="/vimeo-3.svg"
            width={1030}
            height={140}
            alt="vimeo-3"
            className="py-4"
          />
        </div>
      </div>
    </div>
  );
};

export default VimeoAccessToken;

