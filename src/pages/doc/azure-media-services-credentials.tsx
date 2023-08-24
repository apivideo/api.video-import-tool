import type { NextPage } from "next";
import Image from "next/image";

const DocImg = ({
  src,
  maxWidth,
  className,
}: {
  src: string;
  maxWidth: number;
  className?: string;
}) => {
  return (
    <Image
      src={src}
      width={maxWidth}
      height={500}
      alt={"azure-1"}
      className={`max-w-[${maxWidth}px] shadow-3xl rounded-2xl p-4 ml-0 m-10 ${className}`}
      priority
    />
  );
};

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
        <h1 className="text-3xl font-semibold mb-4">
          Guide: Importing Videos from Azure Media Services
        </h1>
        <p className="text-md mb-2">
          To enable the Video Import Tool access to your Azure Media Services
          account, you must supply it with a JSON file containing your
          credentials and provide the necessary Shared Access Signature (SAS)
          URL.
        </p>
        <h2 className="text-2xl font-semibold my-8">
          Step 1/2: Obtaining the Credentials JSON File
        </h2>
        <div className="text-md">
          <p>
            Start by navigating to your Azure Media Service, then select the
            directory you wish to migrate:
          </p>
          <DocImg src="/azure-media-doc-1.jpg" maxWidth={1030} />

          <p>Next, click on &quot;API access&quot; from the left sidebar:</p>
          <DocImg src="/azure-media-doc-2.jpg" maxWidth={400} />

          <p>
            Select an existing AAD app or create a new one, followed by
            generating its secret:
          </p>
          <DocImg src="/azure-media-doc-3.png" maxWidth={700} />

          <p>After that, open the JSON pane and copy the content:</p>
          <DocImg src="/azure-media-doc-4.png" maxWidth={700} />

          <p>
            Finally, paste this content into the &quot;Credentials JSON
            File&quot; field on the Import Tool.
          </p>

          <h2 className="text-2xl font-semibold my-8">
            Step 2/2: Obtaining the SAS URL
          </h2>

          <p>
            Navigate to your storage account and click on &quot;Shared Access
            Signature&quot;:
          </p>
          <DocImg src="/azure-media-doc-5.png" maxWidth={400} />

          <p>Enable the required parameters:</p>
          <DocImg src="/azure-media-doc-6.png" maxWidth={900} />

          <p>
            Ensure that you generate the Shared Access Signature. Once you have
            the links, copy the Blob Service SAS URL. </p>
          <DocImg src="/azure-media-doc-7.png" maxWidth={400} />
          <p>Finally, paste is the URL into the &quot;SAS URL&quot; field of the Import Tool.</p>
          <p className="my-6">That&apos;s it, you&apos;re done!</p>
        </div>
      </div>
    </div>
  );
};

export default VimeoAccessToken;
