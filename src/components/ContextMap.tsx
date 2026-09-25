import React from 'react';
import { ContextItem } from '../types';

interface ContextMapProps {
  taskTitle: string;
  contextItems: ContextItem[];
  onSelectFile?: (filePath: string) => void;
  onClose: () => void;
  accentColor: string;
}

export const ContextMap: React.FC<ContextMapProps> = ({
  taskTitle,
  contextItems,
  onSelectFile,
  onClose,
  accentColor,
}) => {
  return (
    <div className="w-full bg-[#0E1012] border border-[#1C1F23] rounded-md p-4 font-mono text-xs select-none">
      <div className="flex items-center justify-between border-b border-[#1C1F23] pb-2 mb-3">
        <div className="flex items-center space-x-2">
          <span className="text-[10px] uppercase tracking-wider text-[#555B64]">CONTEXT MAP</span>
          <span className="text-[10px] text-[#8A9099]">"Why is the agent touching these files?"</span>
        </div>
        <button
          onClick={onClose}
          className="text-[#555B64] hover:text-[#F2F3F5] text-xs px-1"
        >
          ×
        </button>
      </div>

      {/* Tree Visualization */}
      <div className="py-2 pl-2">
        <div className="flex items-center space-x-2 font-semibold text-[#F2F3F5] mb-2">
          <span style={{ color: accentColor }}>REQUEST</span>
          <span className="text-[#555B64] text-[11px]">({taskTitle})</span>
        </div>

        <div className="space-y-2 border-l border-[#1C1F23] ml-3 pl-4">
          {contextItems.map((item, idx) => {
            const isLast = idx === contextItems.length - 1;
            return (
              <div key={item.id} className="relative group">
                <div className="flex items-baseline space-x-2">
                  <span className="text-[#555B64] font-mono text-xs">
                    {isLast ? '└──' : '├──'}
                  </span>

                  <button
                    onClick={() => onSelectFile && onSelectFile(item.path)}
                    className="font-medium text-[#F2F3F5] hover:underline underline-offset-2 text-xs"
                  >
                    {item.path}
                  </button>

                  <span className="text-[10px] text-[#555B64] uppercase border border-[#1C1F23] px-1 rounded">
                    {item.type}
                  </span>

                  {item.autoDetected && (
                    <span className="text-[9px] text-[#8A9099] bg-[#15181C] px-1 py-0.2 rounded">
                      auto-identified
                    </span>
                  )}
                </div>

                {item.relevanceReason && (
                  <div className="ml-7 mt-0.5 text-[11px] text-[#8A9099]">
                    ↳ {item.relevanceReason}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Automatic context summary footer */}
      <div className="mt-3 pt-2 border-t border-[#1C1F23] flex items-center justify-between text-[11px] text-[#555B64]">
        <span>Provided to local model: {contextItems.length} active resources</span>
        <span>Zero external cloud transmission</span>
      </div>
    </div>
  );
};
