import Image from "next/image";
import Link from "next/link";
import React from "react";
import Providers from "../providers";
import { joinStrings } from "../utils/functions";

const HomePage: React.FC = () => {
  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center flex-col max-w-xs sm:max-w-2xl pt-36 self-center">
        <Image
          src="/api-video.svg"
          width={100}
          height={100}
          alt="logo"
          className="pb-8"
        />
        <h1 className="text-6xl font-semibold text-center pb-6">Import Tool</h1>
        <p className="text-primary_blue text-lg py-2 text-center">
          We built this tool to help you quickly import your already hosted
          videos to api.video for a stress-free migration. Log in to your
          account to begin the import process and enjoy a smooth transition to
          api.video.
        </p>

        <div className="flex gap-4 pt-6 flex-wrap justify-center">
          <Link href="https://api.video/contact/">
            <button className="text-sm bg-white border text-black font-semibold w-44">
              Contact support
            </button>
          </Link>
          <Link href="https://dashboard.api.video/videos?from=import">
            <button className="text-sm bg-orange_gradient font-semibold w-44">
              Start Importing now
            </button>
          </Link>
        </div>
      </div>
      <Image
        src="/ImportTool_IMG.png"
        alt="Import Tool illustration"
        width={1400}
        height={400}
        quality={100}
        className="w-full h-auto mt-auto"
      />
    </div>
  );
};

export default HomePage;
