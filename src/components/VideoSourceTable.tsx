import React from 'react';
import { VideoSourceTableColumn, VideoSourceTableSettings } from '../providers/types';
import VideoSource from '../types/common';
import { beautifyVideoName } from '../utils/functions';
import Thumbnail from './commons/Thumbnail';

interface VideoSourceExtended extends VideoSource {
  alreadyImported: boolean;
}

interface VideoSourceTableProps {
  videoSources: VideoSourceExtended[];
  onSortClick: (column?: VideoSourceTableColumn) => void;
  selection?: {
    toggleSelection: (id: string) => void;
    multiSelectionToggle: () => void;
    selectedIds: string[];
  }
  isCollapsed: boolean;
  videoSourceTableSettings: VideoSourceTableSettings;
}

const VideoSourceTable: React.FC<VideoSourceTableProps> = ({ videoSources, onSortClick, selection, isCollapsed, videoSourceTableSettings: settings }) => {



  return (
    <table className={`w-full mb-8 ${isCollapsed ? 'collapse' : 'visible'}`}>
      <thead className="border-b">
        <tr className="text-sm font-semibold pb-2">
          {selection
            ? <th colSpan={2}>
              <div className="flex gap-2 items-center">
                <input
                  className="h-4 w-4 cursor-pointer"
                  type="checkbox"
                  checked={
                    !(
                      videoSources
                        .filter((v) => !v.alreadyImported)
                        .filter((v) => selection.selectedIds.indexOf(v.id) === -1)
                        .length > 0
                    )
                  }
                  onChange={() => selection.multiSelectionToggle()}
                />
                <a
                  href="#"
                  className="hidden md:block"
                  onClick={() => onSortClick()}
                >
                  Video
                </a>
                <a
                  href="#"
                  className="block md:hidden"
                  onClick={() => onSortClick()}
                >
                  Select all
                </a>
              </div>
            </th>
            : <th>
              <a
                href="#"
                className="hidden md:block"
                onClick={() => onSortClick()}
              >
                Video
              </a>
            </th>}


          {settings.columns.map((column) =>
            <th className="hidden md:table-cell" key={column.attributeName}>
              <a href="#" onClick={() => onSortClick(column)}>
                {column.title}  
              </a>
            </th>
          )}
        </tr>
      </thead>

      <tbody>
        {videoSources
          .map((videoSource) => (
            <tr
              className={"text-sm align-top font-semibold border-b border-slate-300 last:border-0" + (selection ? " cursor-pointer" : "")}
              key={`${videoSource.id}`}
              onClick={selection ? () => selection.toggleSelection(videoSource.id) : undefined}
            >
              {selection && <td className="w-6 pt-2.5">
                <input
                  type="checkbox"
                  className="h-4 w-4 cursor-pointer"
                  checked={selection.selectedIds.indexOf(videoSource.id) !== -1}
                  onChange={(a) => selection.toggleSelection(videoSource.id)}
                />
              </td>}
              <td className="py-2.5">
                <div className="flex flex-col md:flex-row gap-2">
                  {settings.showThumnail && <Thumbnail
                    className="h-[75px] w-[100px] object-contain bg-black"
                    width={100}
                    height={75}
                    src={videoSource.thumbnail}
                    alt={videoSource.name}
                  />}

                  {beautifyVideoName(videoSource.name)}

                  {settings.columns.map((column) =>
                    <span className="block md:hidden" key={column.attributeName}>
                      {column.formatter ? column.formatter((videoSource as any)[column.attributeName]) : (videoSource as any)[column.attributeName]}
                    </span>
                  )}
                </div>
              </td>

              {settings.columns.map((column) =>
                <td className="py-2.5 hidden md:table-cell" key={column.attributeName}>
                  {column.formatter ? column.formatter((videoSource as any)[column.attributeName]) : (videoSource as any)[column.attributeName]}
                </td>
              )}
            </tr>
          )
          )
        }
      </tbody>
    </table>
  )
}


export default VideoSourceTable;
