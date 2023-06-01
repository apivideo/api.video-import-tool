import Link from "next/link";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { getItem } from "../utils/functions/localStorageHelper";
import ImportCard from "./commons/ImportCard";
import ImportInfo from "./commons/ImportInfo";
import VideoImportTable from "./commons/VideoImportTable";
import { useGlobalContext } from "./context/Global";

const ImportProgress: React.FC = () => {
  const [apiVideoApiKey, setApiVideoApiKey] = useState("");
  const router = useRouter();
  const { videos, importId, providerName } = useGlobalContext();

  useEffect(() => {
    const item = getItem("APIVIDEO");
    const apiKey = item?.encryptedKey || "";
    setApiVideoApiKey(apiKey);
    if (!importId) {
      const impId = router.query.importId;
      router.push(`/imports/${impId}`);
    }
  }, [router, importId]);

  return (
    <ImportCard activeStep={4} paddingTop>
      <div className="text-sm flex flex-col gap-4">
        <h1>Videos imported with success</h1>
        <p>
          Your videos have been created. You can close this tab at any moment,
          even if the encoding hasn’t ended yet.
        </p>
        {router.pathname !== "/imports" && (
          <p>
            You’ll be able to see this report again by visiting the{" "}
            <Link href="/imports" className="text-blue-500 underline">
              my imports
            </Link>{" "}
            page.
          </p>
        )}
      </div>
      {videos?.length && importId && apiVideoApiKey && (
        <>
          <ImportInfo
            imports={[
              {
                id: importId,
                providerName: providerName,
                videos: videos,
                date: new Date(),
              },
            ]}
          />
          <VideoImportTable
            videos={videos}
            apiVideoEncryptedKey={apiVideoApiKey}
          />
        </>
      )}
    </ImportCard>
  );
};

export default ImportProgress;
