import React from 'react';
import { TaskHistoryItem } from '../types';

interface TaskHistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: TaskHistoryItem[];
  onSelectTask: (task: TaskHistoryItem) => void;
  onRestoreSnapshot?: (taskId: string) => void;
  accentColor: string;
}

export const TaskHistoryDrawer: React.FC<TaskHistoryDrawerProps> = ({
  isOpen,
  onClose,
  tasks,
  onSelectTask,
  onRestoreSnapshot,
  accentColor,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex justify-end font-mono select-none animate-fadeIn">
      <div className="w-full max-w-sm bg-[#0E1012] border-l border-[#1C1F23] h-full p-5 flex flex-col justify-between overflow-y-auto">
        <div className="space-y-5">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#1C1F23] pb-3">
            <div>
              <div className="text-[10px] uppercase tracking-wider text-[#555B64]">
                TASK HISTORY
              </div>
              <div className="text-sm font-semibold text-[#F2F3F5] mt-0.5">
                Workspace Sessions
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-[#555B64] hover:text-[#F2F3F5] text-sm px-1"
            >
              ×
            </button>
          </div>

          {/* Timeline List */}
          <div className="space-y-4">
            <div className="text-[10px] uppercase tracking-wider text-[#555B64]">
              TODAY
            </div>

            <div className="space-y-2">
              {tasks.length === 0 ? (
                <div className="text-xs text-[#555B64] py-4 text-center">
                  No previous tasks recorded yet.
                </div>
              ) : (
                tasks.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => {
                      onSelectTask(t);
                      onClose();
                    }}
                    className="p-3 rounded border border-[#1C1F23] bg-[#08090A] hover:bg-[#15181C] hover:border-[#2D3139] cursor-pointer transition-colors space-y-1.5"
                  >
                    <div className="flex items-start justify-between">
                      <div className="text-xs font-semibold text-[#F2F3F5]">
                        {t.title}
                      </div>
                      <span className="text-[10px] text-[#555B64] tabular-nums">
                        {t.timestamp}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px]">
                      <div className="flex items-center space-x-2">
                        <span
                          className="font-bold"
                          style={{
                            color:
                              t.status === 'completed'
                                ? accentColor
                                : t.status === 'stopped'
                                ? '#EF4444'
                                : '#F59E0B',
                          }}
                        >
                          {t.status === 'completed' ? '✓' : '×'} {t.status}
                        </span>
                        <span className="text-[#555B64]">·</span>
                        <span className="text-[#8A9099]">{t.duration}</span>
                      </div>

                      <div className="text-[10px] text-[#555B64]">
                        {t.filesChanged} {t.filesChanged === 1 ? 'file' : 'files'}
                      </div>
                    </div>

                    {onRestoreSnapshot && (
                      <div className="pt-1.5 border-t border-[#1C1F23]/60 flex items-center justify-between text-[10px]">
                        <span className="text-[#555B64]">Snapshot cached</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onRestoreSnapshot(t.id);
                          }}
                          className="text-[#8A9099] hover:text-[#EF4444] transition-colors"
                        >
                          ↺ Restore Snapshot
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-[#1C1F23] pt-3 text-[10px] text-[#555B64] text-center">
          Local Task Snapshots &amp; Timelines Stored in Workspace Cache
        </div>
      </div>
    </div>
  );
};
