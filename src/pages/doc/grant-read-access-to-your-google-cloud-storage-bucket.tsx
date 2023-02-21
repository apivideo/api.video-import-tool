import type { NextPage } from 'next';
import Image from 'next/image';
import Link from 'next/link';

const VimeoAccessToken: NextPage = () => {
    return (
        <div className="mb-56">
            <Link href="/">
            <Image
                className="mt-10 ml-60 mb-8"
                src="/api-video.svg"
                width={100}
                height={100}
                alt="logo"
            />
            </Link>
            <div className="mx-auto w-8/12 md:w-6/12">
                <h1 className="text-xl font-semibold mb-4">Granting the Import tool read access to your Google Cloud Storage bucket</h1>

                <p className="my-3">Granting read privileges to a Google Cloud Storage bucket is a straightforward process. Here is a step-by-step guide to help you grant read privileges to an external service account:</p>

                <ul className="list-disc ml-5 my-3">
                    <li>Go to the <a className="text-blue-500 underline" href="https://console.cloud.google.com/" target="_blank" rel="noreferrer">Google Cloud Console</a>, log in to your account and select the project you want to use.</li>
                    <li>Navigate to the Cloud Storage &gt; Buckets.</li>

                    <Image className='rounded-3xl border-gray-100 border m-12 pt-5 pl-5 shadow-2xl ' src="/google-cloud-storage-bucket-menu.png" width={450} height={638} alt="vimeo-1" priority />

                    <li>Click on the name of the bucket you want to grant access to.</li>

                    <Image className='rounded-3xl border-gray-100 border m-12 pt-5 pl-5 shadow-2xl ' src="/google-cloud-storage-bucket-name.png" width={849} height={172} alt="vimeo-1" priority />
                    
                    <li>Click on the &quot;Permissions&quot; tab.</li>
                    <li>Click on the &quot;Grant access&quot; button to add a new member to the bucket.</li>

                    <Image className='rounded-3xl border-gray-100 border m-12 pt-5 pl-5 shadow-2xl ' src="/google-cloud-storage-bucket-grand-access.png" width={849} height={399} alt="vimeo-1" priority />
                    

                    <li>In the &quot;Grant access&quot; dialog box, enter <strong>storage-service-account@video-import-tool.iam.gserviceaccount.com</strong> in the &quot;New principals&quot; input field. In the &quot;Select a role&quot; dropdown menu, select &quot;Storage Object Viewer&quot;.</li>

                    <Image className='rounded-3xl border-gray-100 border m-12 pt-5 pl-5 shadow-2xl ' src="/google-cloud-storage-bucket-account.png" width={558} height={694} alt="vimeo-1" priority />
                    
                    <li>Click &quot;Save&quot; to save the changes.</li>
                </ul>

                <p className="my-3">That&apos;s it! The Import tool service account now has read access to the specified Google Cloud Storage bucket. You can now import videos from this bucket.</p>

            </div>
        </div>
    );
};

export default VimeoAccessToken;
