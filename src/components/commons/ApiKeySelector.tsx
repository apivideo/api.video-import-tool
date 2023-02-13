import { useAuth0 } from "@auth0/auth0-react";
import { useEffect, useState } from "react";
import { Check } from "react-feather";
import { ProjectWithApiKeys } from "../../pages/api/apivideo/keys";
import { callGetApiVideoApiKeysApi } from "../../service/ClientApiHelpers";
import { getItem, removeItem, setItem } from "../../utils/functions/localStorageHelper";


export type ApiKeySelectorMode = "apiKey" | "auth0";

interface ApiKeySelectorProps {
    mode: ApiKeySelectorMode;
    errorMessage: string | null;
    onApiKeyChange: (apiKey: string) => void;
    apiKey: string | null;
}

const ApiKeySelector: React.FC<ApiKeySelectorProps> = (props) => {
    const [currentUrl, setCurrentUrl] = useState<string>();

    const [keys, setKeys] = useState<ProjectWithApiKeys[]>();
    const { isAuthenticated, loginWithPopup, logout, getAccessTokenSilently, loginWithRedirect } = useAuth0();
    const { mode, apiKey, onApiKeyChange, errorMessage } = props;


    useEffect(() => {
        setCurrentUrl(window.location.href);
    }, []);


    useEffect(() => {
        const item = getItem('APIVIDEO');
        if (item) {
            setKeys(item.apiKeys || []);
            if(item.apiKey) {
                onApiKeyChange(item.apiKey);
            }
        }
    }, [])


    useEffect(() => {
        const getApiVideoApiKeys = async () => {
            const token = await getAccessTokenSilently();
            const keys = await callGetApiVideoApiKeysApi(token);
            
            setKeys(keys);

            const flattenKeys = keys
                .map(a => a.keys).map(a => [a.production || [], a.sandbox || []])
                .flatMap(a => a)
                .flatMap(a => a);
            
                let apiKey;
            if (flattenKeys.length > 0) {
                onApiKeyChange(flattenKeys[0].key);
                apiKey = flattenKeys[0].key;
            }

            setItem('APIVIDEO', { apiKey, apiKeys: keys })
        };

        if (isAuthenticated && !keys) {
            getApiVideoApiKeys();
        }
    }, [isAuthenticated, getAccessTokenSilently, keys]);

    return mode === 'apiKey'
        ? <>
            <label htmlFor="apiVideoApiKey">Enter your api.video API key</label>
            <div className={'mb-4'}>

                <input
                    className={`h-10 ${errorMessage
                        ? 'outline outline-red-500 outline-2'
                        : 'outline outline-slate-300 rounded-lg shadow outline-1'
                        }`}
                    id="apiVideoApiKey"
                    type={'password'}
                    value={apiKey || ""}
                    onChange={(v) => {
                        setItem('APIVIDEO', { apiKey: v.target.value, apiKeys: keys! })
                        onApiKeyChange(v.target.value);
                    }}
                ></input>

                {errorMessage && (
                    <p className="text-sm text-red-600 pt-2">
                        {errorMessage}&nbsp;
                    </p>
                )}
            </div>
        </>
        : <>
            <label htmlFor="apiVideoApiKey">Authorize access to api.video</label>
            <div className={'mb-4'}>
                <button disabled={isAuthenticated || !!keys} className="bg-orange text-sm font-semibold w-full" onClick={() => loginWithRedirect({
                    redirectUri: currentUrl,
                })}>{(isAuthenticated || keys)
                    ? keys
                        ? <div className="flex justify-center items-center gap-2"><Check size={20} strokeWidth={'.2rem'} /> Successfully signed into api.video</div>
                        : <><span className="icon loading"></span> please wait...</>
                    : <>Sign in to api.video</>}</button>
                    {(isAuthenticated || keys) && <p  className="text-right"><a onClick={() => {
                        logout({ returnTo: currentUrl });
                        removeItem('APIVIDEO')
                        setKeys(undefined);
                        onApiKeyChange('');
                    }} className="text-orange underline" href="#">Revoke api.video access</a></p> }
                {keys && <>
                    <label htmlFor="apiVideoApiKey" className="mb-4 mt-0 block">Select your api.video API key</label>

                    <select
                        value={apiKey || undefined}
                        onChange={(v) => {
                            setItem('APIVIDEO', { apiKey: v.target.value, apiKeys: keys! });
                            onApiKeyChange(v.target.value);
                        }}
                        className="border border-gray-300 text-gray-900 text-sm  block w-full p-2.5"
                    >
                        {(keys || []).map((key, i) => {
                            const name = key.name;
                            return <optgroup key={i} label={name}>{([
                                ...(key?.keys?.sandbox || []).map((p: any) => <option key={p.key} value={p.key}>{p.name} (sandbox)</option>),
                                ...(key?.keys?.production || []).map((p: any) => <option key={p.key} value={p.key}>{p.projectName} - {p.name} (production)</option>),
                            ])}</optgroup>
                        })}

                    </select>
                </>
                }

                {errorMessage && (
                    <p className="text-sm text-red-600 pt-2">
                        {errorMessage}&nbsp;
                    </p>
                )}
            </div>
        </>

};

export default ApiKeySelector;