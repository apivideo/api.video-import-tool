import React from 'react';
import { ProviderName } from '../../providers';
import { AuthenticationScope } from '../../providers/types';
import { uppercaseFirstLetter } from '../../utils/functions';

interface AuthDisclaimerProps {
  providerName: ProviderName;
  authenticationScopes?: AuthenticationScope[];
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
      {props.authenticationScopes && (
        <div className="flex flex-col">
          <p>
            This application will access the following data from your account:
          </p>
          <ul className="list-disc ml-5">
            {props.authenticationScopes.map((scope) => (
              <li key={scope.name}>{scope.name}: {scope.description}</li>
            ))}
          </ul>
        </div>
      )}

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
