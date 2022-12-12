import React from 'react';
import Image from 'next/image';

interface MigrationCardProps {
  children: React.ReactNode;
}

const MigrationCard: React.FC<MigrationCardProps> = ({ children }) => {
  return (
    <div className="mb-8 md:mb-auto mt-24 md:mt-40">
      <div className="border border-slate-200 rounded-lg w-full md:w-3/4 p-8 shadow max-w-5xl mx-auto relative">
        <Image
          className="absolute -top-10 md:-top-36 md:pt-8"
          src="/api-video.svg"
          width={100}
          height={100}
          alt="logo"
        />
        <div>
          <div className="flex flex-col gap-2 md:flex-row justify-between pb-4">
            <h1 className="text-left text-2xl font-semibold">
              Video migration tool
            </h1>
            <a
              href="https://github.com/apivideo/api.video-migration-tool"
              target="_blank"
              rel="noreferrer"
            >
              <button className="flex items-center gap-2 border rounded-md bg-black text-white text-sm font-semibold py-1">
                <Image src="/github.svg" height={14} width={14} alt="github" />
                View on Github
              </button>
            </a>
          </div>
        </div>

        {children}
      </div>
    </div>
  );
};

export default MigrationCard;
