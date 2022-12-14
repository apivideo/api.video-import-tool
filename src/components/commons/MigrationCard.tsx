import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Stepper from '../stepper/Stepper';

interface MigrationCardProps {
  children: React.ReactNode;
  activeStep?: number
  stepLink?: string
  hideDescription?: boolean
  paddingTop?: boolean
}

const MigrationCard: React.FC<MigrationCardProps> = ({ children, activeStep, stepLink = '', hideDescription, paddingTop }) => {
  return (
    <div className="mb-8 md:mb-auto mt-24 md:mt-40">
      <div className="border border-slate-200 rounded-lg w-full md:w-3/4 p-8 shadow max-w-5xl mx-auto relative">
        <Link href={'/'}>
          <Image
            className="absolute -top-10 md:-top-36 md:pt-8"
            src="/api-video.svg"
            width={100}
            height={100}
            alt="logo"
          />
        </Link>
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
        <div>
          {hideDescription ? null : <p className="text-sm">
            This tool helps you quickly import your already hosted videos to
            api.video and take advantage of our API with your existing
            content.
          </p>}
          {activeStep && <><Stepper
            activeStep={activeStep}
            stepLink={stepLink}
            steps={[
              'Select source',
              'Authentication',
              'Video Selection',
              'Import Progress',
            ]}
          ></Stepper>
            <div className="h-px w-full bg-slate-300"></div>
          </>}

        </div>

        <div className={`${paddingTop && 'pt-10'}`}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default MigrationCard;
