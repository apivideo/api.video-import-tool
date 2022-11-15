import Video from '@api.video/nodejs-client/lib/model/Video';
import type { NextPage } from 'next';
import Link from 'next/link';
import { useState } from 'react';
import Authenticate from '../components/Authenticate';
import ImportProgress from '../components/ImportProgress';
import { ProviderName, Providers } from '../providers';

type Migration = {
    id: string;
    date: Date;
    videos: Video[];
}

const MigrationsHome: NextPage = () => {
    const [apiVideoApiKey, setApiVideoApiKey] = useState<string>();
    const [migrations, setMigrations] = useState<Migration[]>();
    const [selectedMigration, setSelectedMigration] = useState<Migration>();


    const getMigratedVideos = (apiKey: string) => {
        fetch("/api/apivideo/get-migrations", {
            method: "POST",
            body: JSON.stringify({
              apiKey
            })
          }).then(e => e.json())
            .then((res: {videos: Video[]}) => {
              const migratedVideosByMigration: {[id: string]: Video[]} = {};
              res.videos.forEach(v => {
                  
                const id = v?.metadata?.find(v => v.key === "x-apivideo-migration-id")?.value || "unknown";
                if(!migratedVideosByMigration[id]) {
                    migratedVideosByMigration[id] = [];
                }
                migratedVideosByMigration[id].push(v);
              });
              setMigrations(Object.keys(migratedVideosByMigration).map((migrationId): Migration => {
                return {
                    date: new Date(migratedVideosByMigration[migrationId][0].createdAt! as unknown as string),
                    id: migrationId,
                    videos: migratedVideosByMigration[migrationId]
                }
              }));
            })
    }

    return (
        <div className="container">
            <main className="main">
                <h1 className="title">Welcome to the <span className="orange">api.video</span> migration tool</h1>

                <div id="content">
                    {!migrations && <Authenticate
                        introMessage={<>From here you will be able to see the migrations you&apos;ve done using the migration tool.</>}
                        onSubmit={(authenticationContext) => {
                            setApiVideoApiKey(authenticationContext.apiVideoApiKey);
                            getMigratedVideos(authenticationContext.apiVideoApiKey);
                        }}
                    />}
                    {migrations && migrations.length === 0 &&
                    <p className="explanation">It seems that you have not made any migration yet. Click <Link href="/vimeo">here</Link> to migrate your Vimeo videos.</p>
                    }     
                    {migrations && migrations.length > 0 && !selectedMigration &&
                    <div>
                        <p className="explanation">We have found the following migrations:</p>
                        <ul className="migrationsList">
                        {migrations.map(m => 
                            <li key={m.id}>
                                <a 
                                    onClick={() => setSelectedMigration(m)}
                                    href="#">{m.videos[0].metadata?.find(a => a.key === "x-apivideo-migration-provider")?.value?.toUpperCase()} migration of {m.date.toLocaleDateString()} at {m.date.toLocaleTimeString()} ({m.videos.length} imported videos)</a>
                            </li>
                        )}
                        </ul>
                    </div>}
                    { selectedMigration?.videos && <ImportProgress
                        apiVideoApiKey={apiVideoApiKey!}
                        videos={selectedMigration.videos}
                    />}
                </div>
                { !selectedMigration?.videos && <p><Link href="/">Create a new migration</Link></p>}
                { selectedMigration?.videos && <p><a href="#" onClick={() => setSelectedMigration(undefined)}>Go back to the migrations list</a></p>}
            </main>
        </div>
    )
}

export default MigrationsHome
