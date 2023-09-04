import { useState } from "react";
import { callValidateProviderCredentialsApi } from "../../service/ClientApiHelpers";

export interface S3LoginPopupProps {
  onCancel: () => void;
  onSuccess: (encryptedAccessToken: string) => void;
}

const AzureLoginPopup = (props: S3LoginPopupProps) => {
  const [sasUrl, setSasUrl] = useState<string>("");
  const [containerName, setContainerName] = useState<string>("");
  const [error, setError] = useState<string | undefined>(undefined);

  const onSubmit = async () => {
    if (!sasUrl) {
      setError("SAS URL is required");
      return;
    }
    
    const res = await callValidateProviderCredentialsApi({
      provider: "AZURE_STORAGE",
      clearAuthenticationContext: {
        clearPrivateData: JSON.stringify({
          sasUrl,
          containerName,
        }),
      },
    });
    if (res.error) {
      setError(res.error);
      return;
    }
    props.onSuccess(res.encryptedPrivateData!);
  };

  return (
    <div
      id="authentication-modal"
      tabIndex={-1}
      aria-hidden="true"
      className="bg-gray-300 bg-opacity-60 fixed justify-center items-center flex top-0 left-0 right-0 z-50  w-full p-4 overflow-x-hidden overflow-y-auto md:inset-0 h-modal md:h-full"
    >
      <div className="relative w-full h-full max-w-md md:h-auto">
        <div className="relative bg-white rounded-lg shadow">
          <button
            onClick={() => props.onCancel()}
            type="button"
            className="absolute top-3 right-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center"
            data-modal-hide="authentication-modal"
          >
            <svg
              aria-hidden="true"
              className="w-5 h-5"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fill-rule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clip-rule="evenodd"
              ></path>
            </svg>
            <span className="sr-only">Close modal</span>
          </button>
          <div className="px-6 py-6 lg:px-8">
            <h3 className="mb-4 text-xl font-medium text-gray-900">
              Sign in to Azure
            </h3>
            <div className="space-y-6">
             
              <div>
                <label
                  htmlFor="signature"
                  className="block mb-2 text-sm font-medium text-gray-900"
                >
                  SAS URL
                </label>
                <input
                  value={sasUrl}
                  onChange={(e) => setSasUrl(e.target.value)}
                  type="text"
                  name="signature"
                  id="signature"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5"
                  placeholder=""
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="signature"
                  className="block mb-2 text-sm font-medium text-gray-900"
                >
                  Container name (all containers if empty)
                </label>
                <input
                  value={containerName}
                  onChange={(e) => setContainerName(e.target.value)}
                  type="text"
                  name="signature"
                  id="signature"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5"
                  placeholder=""
                  required
                />
              </div>
              <p className="mt-2">
                <i>
                  An explanation on how to generate the SAS URL and Credentials JSON file can be found&nbsp;
                  <a
                    target="_blank"
                    href="/doc/azure-blob-storage-credentials"
                    className="text-blue-500 underline"
                  >
                    here
                  </a>
                  .
                </i>
              </p>
              {error && <div className="text-red-500">{error}</div>}
              <button
                onClick={() => onSubmit()}
                className="w-full text-white bg-s3 hover:bg-s3hover focus:ring-4 focus:outline-none focus:ring-s3hover font-medium rounded-lg text-sm px-5 py-2.5 text-center"
              >
                Login to your account
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AzureLoginPopup;
