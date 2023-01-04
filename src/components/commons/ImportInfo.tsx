import React from 'react';
import { Providers } from '../../providers';
import { VideoWithStatus } from '../../service/ApiVideoService';
import { unparse } from 'papaparse';
import { useRouter } from 'next/router';
import { formatDate } from '../../utils/functions';
import { Import } from '../../types/common';

interface ImportInfoProps {
  imports: Import[];
  allowLink?: boolean;
  showDate?: boolean;
}

const ImportInfo: React.FC<ImportInfoProps> = (props) => {
  const router = useRouter();
  const generateExportVideoItem = (video: VideoWithStatus) => {
    const metadata: { [key: string]: string } = {};
    video.metadata?.forEach((m) => {
      if (m.key) metadata[m.key] = m.value || '';
    });
    return {
      [metadata['x-apivideo-import-provider'] + '_id']:
        metadata['x-apivideo-import-video-id'],
      apivideo_id: video.videoId,
      size: metadata['x-apivideo-import-video-size'],
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
    element.setAttribute('download', `api-video-import-report.${format}`);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
  };

  const handleRowClick = (importId: string) => {
    if (props.allowLink) {
      router.push(`imports/${importId}`);
    }
  };
  return (
    <table className="w-full mt-6">
      <thead className="border-b border-slate-300">
        <tr className="text-sm pb-2 font-semibold">
          <th className="lg:hidden font-semibold">Imports</th>
          <th className="hidden lg:table-cell font-semibold">Provider</th>
          <th className="hidden lg:table-cell font-semibold">Import-id</th>
          {props.showDate && (
            <th className="hidden lg:table-cell font-semibold">Date</th>
          )}
          <th className="hidden lg:table-cell font-semibold">Videos</th>
          <th className="hidden lg:table-cell font-semibold">Export report</th>
        </tr>
      </thead>

      <tbody>
        {props?.imports?.length &&
          props.imports.map((sImport: Import) => {
            return (
              <tr
                key={sImport.id}
                className={`border-b border-slate-300 flex flex-col lg:table-row text-sm align-top font-normal ${props.allowLink && 'cursor-pointer'
                  }`}
                onClick={() => handleRowClick(sImport.id)}
              >
                <td className="py-4 flex gap-2">
                  <img
                    src={Providers[sImport.providerName].imgSrc}
                    height={'16px'}
                    width={'16px'}
                  />
                  {sImport.providerName}
                </td>
                <td className="py-4">{sImport.id}</td>
                {props.showDate && (
                  <td className="py-4">{formatDate(sImport.date)}</td>
                )}
                <td className="py-4">{sImport.videos.length}</td>
                <td className="py-4">
                  {' '}
                  <a
                    href="#"
                    className="text-blue-500 underline"
                    onClick={() => download('csv', sImport.videos)}
                  >
                    csv
                  </a>
                  &nbsp;|&nbsp;
                  <a
                    href="#"
                    className="text-blue-500 underline"
                    onClick={() => download('json', sImport.videos)}
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

export default ImportInfo;
