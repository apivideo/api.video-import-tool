import React from 'react';
import { ProviderName } from '../../providers';
import { uppercaseFirstLetter } from '../../utils/functions';

interface AuthDisclaimerProps {
  providerName: ProviderName;
}

enum ProviderNames {
  VIMEO = 'VIMEO',
  DROPBOX = 'DROPBOX',
}

const AuthDisclaimer: React.FC<AuthDisclaimerProps> = (props) => {
  const providerDisplayName = props?.providerName.toString().toLowerCase();

  return (
    <div className="flex flex-col gap-4">
      <p>
        {`Authorize access to your ${uppercaseFirstLetter(
          providerDisplayName
        )} account to access the videos you would
        like to import to api.video.`}
      </p>
      <div className="flex flex-col">
        <p>
          This application will access the following data from your account:
        </p>
        {props.providerName === ProviderNames.DROPBOX && (
          <ul className="list-disc ml-5">
            <li>
              files.content.read: View content of your Dropbox files and folders
            </li>
            <li>
              files.metadata.read: View information about your Dropbox files and
              folders
            </li>
          </ul>
        )}
        {props.providerName === ProviderNames.VIMEO && (
          <ul className="list-disc ml-5">
            <li>private: Access private member data.</li>
            <li>
              video_files: Access video files belonging to members with Vimeo
              Pro membership or higher.
            </li>
          </ul>
        )}
      </div>

      <p>
        {`No sensitive data from your ${uppercaseFirstLetter(
          providerDisplayName
        )} account will be sent to
    api.video.`}
      </p>
    </div>
  );
};

export default AuthDisclaimer;
