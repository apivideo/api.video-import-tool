import React from 'react';
import { Providers } from '../../providers';
import { VideoWithStatus } from '../../service/ApiVideoService';
import { unparse } from 'papaparse';
import { useRouter } from 'next/router';
import { formatDate } from '../../utils/functions';
import { Migration } from '../../types/common';

interface MigrationInfoProps {
  migrations: Migration[];
  allowLink?: boolean;
  showDate?: boolean;
}

const MigrationInfo: React.FC<MigrationInfoProps> = (props) => {
  const router = useRouter();
  const generateExportVideoItem = (video: VideoWithStatus) => {
    const metadata: { [key: string]: string } = {};
    video.metadata?.forEach((m) => {
      if (m.key) metadata[m.key] = m.value || '';
    });
    return {
      [metadata['x-apivideo-migration-provider'] + '_id']:
        metadata['x-apivideo-migration-video-id'],
      apivideo_id: video.videoId,
      size: metadata['x-apivideo-migration-video-size'],
      name: video.title,
      apivideo_url: video.assets?.player,
    };
  };

  const download = (format: 'json' | 'csv', videos: VideoWithStatus[]) => {
    const mimeType = format === 'json' ? 'application/json' : 'text/csv';
    const stringify = format === 'json' ? JSON.stringify : unparse;

    var element = document.createElement('a');
    element.setAttribute(
      'href',
      `data:${mimeType};charset=utf-8,` +
        encodeURIComponent(
          stringify(videos.map((v) => generateExportVideoItem(v)))
        )
    );
    element.setAttribute('download', `api-video-migration-report.${format}`);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
  };

  const handleRowClick = (migrationId: string) => {
    if (props.allowLink) {
      router.push(`migrations/${migrationId}`);
    }
  };
  return (
    <table className="w-full mt-6">
      <thead className="border-b border-slate-300">
        <tr className="text-sm pb-2 font-semibold">
          <th className="lg:hidden font-semibold">Migrations</th>
          <th className="hidden lg:table-cell font-semibold">Provider</th>
          <th className="hidden lg:table-cell font-semibold">Migration-id</th>
          {props.showDate && (
            <th className="hidden lg:table-cell font-semibold">Date</th>
          )}
          <th className="hidden lg:table-cell font-semibold">Videos</th>
          <th className="hidden lg:table-cell font-semibold">Export report</th>
        </tr>
      </thead>

      <tbody>
        {props?.migrations?.length &&
          props.migrations.map((migration: Migration) => {
            return (
              <tr
                key={migration.id}
                className={`border-b border-slate-300 flex flex-col lg:table-row text-sm align-top font-normal ${
                  props.allowLink && 'cursor-pointer'
                }`}
                onClick={() => handleRowClick(migration.id)}
              >
                <td className="py-4 flex gap-2">
                  <img
                    src={Providers[migration.providerName].imgSrc}
                    height={'16px'}
                    width={'16px'}
                  />
                  {migration.providerName}
                </td>
                <td className="py-4">{migration.id}</td>
                {props.showDate && (
                  <td className="py-4">{formatDate(migration.date)}</td>
                )}
                <td className="py-4">{migration.videos.length}</td>
                <td className="py-4">
                  {' '}
                  <a
                    href="#"
                    className="text-blue-500 underline"
                    onClick={() => download('csv', migration.videos)}
                  >
                    csv
                  </a>
                  &nbsp;|&nbsp;
                  <a
                    href="#"
                    className="text-blue-500 underline"
                    onClick={() => download('json', migration.videos)}
                  >
                    json
                  </a>
                </td>
              </tr>
            );
          })}
      </tbody>
    </table>
  );
};

export default MigrationInfo;
