import React, { useState } from 'react';
import { ChangeGroup, FileChange } from '../types';

interface ExecutionSurfaceProps {
  activeFile: string;
  addedLines: number;
  removedLines: number;
  statusText: string;
  changeGroups: ChangeGroup[];
  onSelectFile: (filePath: string) => void;
  accentColor: string;
}

export const ExecutionSurface: React.FC<ExecutionSurfaceProps> = ({
  activeFile,
  addedLines,
  removedLines,
  statusText,
  changeGroups,
  onSelectFile,
  accentColor,
}) => {
  const [selectedGroupIntent, setSelectedGroupIntent] = useState<string | null>(null);

  // Find active file change object if present in groups
  let activeFileChange: FileChange | undefined;
  for (const group of changeGroups) {
    const f = group.files.find((file) => file.path === activeFile);
    if (f) {
      activeFileChange = f;
      break;
    }
  }

  // Active diff preview lines
  const previewDiffLines = activeFileChange?.diffLines || [
    { type: 'normal', content: '// syncing modifications' },
    { type: 'add', content: '+ // live patch streaming to working tree' },
  ];

  return (
    <div className="w-full bg-[#0E1012] border border-[#1C1F23] rounded-md p-4 font-mono select-none space-y-4">
      {/* Active file execution banner */}
      <div className="border-b border-[#1C1F23] pb-3 flex flex-col md:flex-row md:items-center justify-between gap-2">
        <div>
          <div className="text-[10px] uppercase tracking-wider text-[#555B64] mb-0.5">
            IMPLEMENTING
          </div>
          <div className="text-sm font-semibold text-[#F2F3F5] flex items-center space-x-2">
            <span>{activeFile}</span>
            <button
              onClick={() => onSelectFile(activeFile)}
              className="text-[10px] text-[#8A9099] hover:text-[#F2F3F5] underline underline-offset-2"
            >
              [ Inspect ]
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-4 text-xs">
          <div className="flex items-center space-x-2">
            <span className="text-[#34D399] font-medium">+{addedLines}</span>
            <span className="text-[#EF4444] font-medium">-{removedLines}</span>
          </div>

          <div className="flex items-center space-x-1.5 text-[#8A9099] text-[11px]">
            <span className="w-1.5 h-1.5 rounded-full animate-ping" style={{ backgroundColor: accentColor }} />
            <span>{statusText || 'Writing...'}</span>
          </div>
        </div>
      </div>

      {/* Live diff surface */}
      <div className="bg-[#08090A] border border-[#1C1F23] rounded p-2.5 max-h-52 overflow-y-auto font-mono text-xs space-y-0.5">
        <div className="text-[10px] text-[#555B64] mb-1">LIVE DIFF · {activeFile}</div>
        {previewDiffLines.slice(0, 10).map((dl, idx) => (
          <div
            key={idx}
            className={`px-1 py-0.5 rounded text-[11px] font-mono leading-relaxed truncate ${
              dl.type === 'add'
                ? 'bg-[#34D399]/10 text-[#34D399]'
                : dl.type === 'remove'
                ? 'bg-[#EF4444]/10 text-[#EF4444]'
                : 'text-[#8A9099]'
            }`}
          >
            {dl.content}
          </div>
        ))}
      </div>

      {/* Change Groups by Intention */}
      <div>
        <div className="text-[10px] uppercase tracking-wider text-[#555B64] mb-2">
          CHANGE GROUPS (BY INTENTION)
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {changeGroups.map((group) => {
            const isSelected = selectedGroupIntent === group.intent;
            return (
              <div
                key={group.intent}
                onClick={() =>
                  setSelectedGroupIntent(isSelected ? null : group.intent)
                }
                className={`p-2.5 rounded border transition-colors cursor-pointer ${
                  isSelected
                    ? 'border-[#2D3139] bg-[#15181C]'
                    : 'border-[#1C1F23] bg-[#08090A] hover:bg-[#15181C]/60'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-[#F2F3F5] tracking-wide">
                    {group.intent}
                  </span>
                  <span className="text-[10px] text-[#555B64]">
                    {group.fileCount} {group.fileCount === 1 ? 'file' : 'files'}
                  </span>
                </div>

                <div className="flex items-center space-x-2 text-[11px]">
                  <span className="text-[#34D399]">+{group.addedLines}</span>
                  <span className="text-[#EF4444]">-{group.removedLines}</span>
                </div>

                {/* Sub-files preview */}
                <div className="mt-1.5 space-y-0.5 border-t border-[#1C1F23] pt-1">
                  {group.files.map((f) => (
                    <div
                      key={f.path}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectFile(f.path);
                      }}
                      className="text-[10px] text-[#8A9099] hover:text-[#F2F3F5] truncate flex items-center justify-between group/file"
                    >
                      <span className="truncate">{f.path}</span>
                      <span className="opacity-0 group-hover/file:opacity-100 text-[#555B64]">→</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
