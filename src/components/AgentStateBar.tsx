import React from 'react';
import { AgentStatus, AutonomyMode, TaskSnapshot } from '../types';
import { AgentMark } from './AgentMark';

interface AgentStateBarProps {
  taskTitle: string;
  agentStatus: AgentStatus;
  currentStage: 'Planning' | 'Inspecting project' | 'Implementing' | 'Testing' | 'Verifying' | 'Complete';
  autonomyMode: AutonomyMode;
  onChangeAutonomy: (mode: AutonomyMode) => void;
  onStop: () => void;
  onToggleContextMap: () => void;
  isContextMapOpen: boolean;
  onRestoreSnapshot?: (snapshot: TaskSnapshot) => void;
  currentSnapshot?: TaskSnapshot | null;
  accentColor: string;
  activeFile?: string;
  filesModifiedCount?: number;
}

export const AgentStateBar: React.FC<AgentStateBarProps> = ({
  taskTitle,
  agentStatus,
  currentStage,
  autonomyMode,
  onChangeAutonomy,
  onStop,
  onToggleContextMap,
  isContextMapOpen,
  onRestoreSnapshot,
  currentSnapshot,
  accentColor,
  activeFile,
  filesModifiedCount = 0,
}) => {
  const stages: Array<'Planning' | 'Inspecting project' | 'Implementing' | 'Testing' | 'Verifying' | 'Complete'> = [
    'Planning',
    'Inspecting project',
    'Implementing',
    'Testing',
    'Verifying',
  ];

  const getStageIndex = (s: string) => {
    switch (s) {
      case 'Planning':
        return 0;
      case 'Inspecting project':
        return 1;
      case 'Implementing':
        return 2;
      case 'Testing':
        return 3;
      case 'Verifying':
      case 'Complete':
        return 4;
      default:
        return 0;
    }
  };

  const currentIdx = getStageIndex(currentStage);

  return (
    <div className="w-full bg-[#0E1012] border-b border-[#1C1F23] px-4 py-2.5 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs font-mono select-none">
      {/* Left side: Task Title, Status Mark & Stage */}
      <div className="flex items-center space-x-4">
        {/* Task title and Mark */}
        <div className="flex items-center space-x-2">
          <AgentMark status={agentStatus} size="sm" accentColor={accentColor} />
          <span className="font-semibold text-[#F2F3F5] text-sm truncate max-w-xs md:max-w-md">
            {taskTitle}
          </span>
        </div>

        {/* Micro Stage Pipeline */}
        <div className="hidden lg:flex items-center space-x-2 text-[11px] text-[#555B64]">
          {stages.map((stg, idx) => {
            const isDone = idx < currentIdx;
            const isCurrent = idx === currentIdx;
            return (
              <React.Fragment key={stg}>
                <span
                  className={`transition-colors ${
                    isCurrent
                      ? 'font-medium'
                      : isDone
                      ? 'text-[#8A9099]'
                      : 'text-[#555B64]'
                  }`}
                  style={{ color: isCurrent ? accentColor : undefined }}
                >
                  {isDone ? `✓ ${stg}` : isCurrent ? `◉ ${stg}` : `○ ${stg}`}
                </span>
                {idx < stages.length - 1 && <span className="text-[#1C1F23]">→</span>}
              </React.Fragment>
            );
          })}
        </div>

        {/* Active file indicator if implementing */}
        {activeFile && (
          <div className="hidden xl:flex items-center space-x-1.5 text-[11px] text-[#8A9099] border-l border-[#1C1F23] pl-3">
            <span className="text-[#555B64]">active:</span>
            <span className="text-[#F2F3F5]">{activeFile}</span>
          </div>
        )}
      </div>

      {/* Right side: Autonomy Dial, Context Map, Snapshot, Stop button */}
      <div className="flex items-center space-x-3 self-end md:self-auto">
        {/* Context Map Toggle */}
        <button
          onClick={onToggleContextMap}
          className={`px-2 py-1 rounded text-[11px] border transition-colors ${
            isContextMapOpen
              ? 'border-[#2D3139] bg-[#1C1F23] text-[#F2F3F5]'
              : 'border-[#1C1F23] text-[#8A9099] hover:text-[#F2F3F5]'
          }`}
          title="Context map answering: Why is agent touching these files?"
        >
          Context Map
        </button>

        {/* Task Snapshot button */}
        {currentSnapshot && onRestoreSnapshot && (
          <button
            onClick={() => onRestoreSnapshot(currentSnapshot)}
            className="hidden sm:inline-flex items-center space-x-1 px-2 py-1 rounded text-[11px] border border-[#1C1F23] text-[#8A9099] hover:text-[#EF4444] transition-colors"
            title={`Restore snapshot: ${currentSnapshot.description}`}
          >
            <span>↺ Snapshot</span>
          </button>
        )}

        {/* Autonomy Dial */}
        <div className="flex items-center border border-[#1C1F23] rounded p-0.5 bg-[#08090A]">
          {(['ASK', 'GUIDED', 'AUTO', 'FULL'] as AutonomyMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => onChangeAutonomy(mode)}
              className={`px-2 py-0.5 text-[10px] uppercase tracking-wider rounded transition-colors ${
                autonomyMode === mode
                  ? 'bg-[#1C1F23] text-[#F2F3F5] font-semibold'
                  : 'text-[#555B64] hover:text-[#8A9099]'
              }`}
              style={{
                color: autonomyMode === mode ? accentColor : undefined,
              }}
              title={
                mode === 'ASK'
                  ? 'Proposes every action'
                  : mode === 'GUIDED'
                  ? 'Modifies files, asks for destructive operations'
                  : mode === 'AUTO'
                  ? 'Executes normal tasks independently'
                  : 'Executes entire task autonomously'
              }
            >
              {mode}
            </button>
          ))}
        </div>

        {/* Permanent Emergency Stop Control */}
        {agentStatus !== 'complete' && agentStatus !== 'blocked' && (
          <button
            onClick={onStop}
            className="flex items-center space-x-1.5 px-2.5 py-1 bg-[#1C1F23] hover:bg-[#EF4444]/20 border border-[#EF4444]/40 text-[#EF4444] rounded text-[11px] font-bold tracking-wider transition-colors"
            title="Terminate execution immediately"
          >
            <span>■</span>
            <span>STOP</span>
          </button>
        )}
      </div>
    </div>
  );
};
