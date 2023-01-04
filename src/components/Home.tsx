import Link from 'next/link';
import React from 'react';
import Image from 'next/image';

const HomePage: React.FC = () => {
  return (
    <div className="flex items-center flex-col max-w-xs sm:max-w-2xl pt-36 self-center mb-auto">
      <Image
        src="/import-tool-logo.svg"
        width={300}
        height={100}
        alt="logo"
        className="pb-8"
      />
      <h1 className="text-2xl font-semibold text-center">
        Video import tool
      </h1>
      <p className="text-gray-500 font-semibold py-2 text-center">
        Import your videos from vimeo or dropbox directly to api.video
      </p>
      <p className="text-sm text-center">
        We built this tool to help you quickly import your already hosted videos
        to the api.video platform.
      </p>
      <p className="text-sm text-center">
        {' '}
        Take advantage of our API with your existing content.
      </p>
      <div className="flex gap-4 pt-6 flex-wrap justify-center">
        <Link href={'/providers'} passHref>
          <button className="text-sm font-semibold w-44">
            Get started
          </button>
        </Link>
        <a
          href="https://github.com/apivideo/api.video-import-tool"
          target="_blank"
          rel="noreferrer"
        >
          <button className="w-44 flex items-center justify-center gap-2 border rounded-md bg-black text-white text-sm font-semibold">
            <Image src="/github.svg" height={14} width={14} alt="github" />
            View on Github
          </button>
        </a>
      </div>
      <p className="text-sm mt-8">Access <Link className="text-blue-500 underline" href={'/imports'}>previous imports</Link>.</p>
    </div>
  );
};

export default HomePage;
