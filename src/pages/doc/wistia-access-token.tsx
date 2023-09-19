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
          Guide: Generate a Wistia Access Token
        </h1>
        <p className="text-md mb-2">
          To enable the Video Import Tool access to the videos in your Wistia projects, you must provide it with the necessary access token.
        </p>

        <h2 className="text-2xl font-semibold my-8">
          Obtaining the access token
        </h2>

        <p>
          Navigate to your Wistia account and click on &quot;Account&quot; &gt; &quot;Settings&quot; &gt; &quot;API Access&quot;, and click on the &quot;New Token&quot; link:
        </p>
        <DocImg src="/wistia-new-token.png" maxWidth={800} />

        <p>Give a name to your token (e.g. &quot;Video Import Tool&quot;), check the &quot;Read all project and video data&quot; permission, and click on &quot;Create token&quot;:</p>
        <DocImg src="/wistia-token-details.png" maxWidth={800} />

        <p>
          Click on the &quot;Copy&quot; button to copy the access token to your clipboard:
        </p>
        <DocImg src="/wistia-copy-token.png" maxWidth={800} />
        <p>
          Finally, paste the token into the &quot;Wistia access token&quot; field of the Import Tool.
        </p>
        <p className="my-6">That&apos;s it, you&apos;re done!</p>
      </div>
    </div>
  );
};

export default VimeoAccessToken;
