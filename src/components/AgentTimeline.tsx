import React, { useState } from 'react';
import { TimelineEvent, ToolType } from '../types';

interface AgentTimelineProps {
  events: TimelineEvent[];
  accentColor: string;
  onSelectFile?: (filePath: string) => void;
}

export const AgentTimeline: React.FC<AgentTimelineProps> = ({
  events,
  accentColor,
  onSelectFile,
}) => {
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null);

  const getToolBadge = (type: ToolType) => {
    switch (type) {
      case 'READ':
        return <span className="text-[#38BDF8] font-bold">READ</span>;
      case 'WRITE':
        return <span className="font-bold" style={{ color: accentColor }}>WRITE</span>;
      case 'SEARCH':
        return <span className="text-[#FBBF24] font-bold">SEARCH</span>;
      case 'EXECUTE':
        return <span className="text-[#A78BFA] font-bold">EXEC</span>;
      case 'TEST':
        return <span className="text-[#34D399] font-bold">TEST</span>;
      case 'BUILD':
        return <span className="text-[#60A5FA] font-bold">BUILD</span>;
      case 'GIT':
        return <span className="text-[#F472B6] font-bold">GIT</span>;
      case 'LINTER':
        return <span className="text-[#818CF8] font-bold">LINT</span>;
      case 'PLAN':
        return <span className="text-[#8A9099] font-bold">PLAN</span>;
      case 'VERIFY':
        return <span className="text-[#34D399] font-bold">VERIFY</span>;
      default:
        return <span className="text-[#555B64] font-bold">{type}</span>;
    }
  };

  return (
    <div className="w-full bg-[#0E1012] border border-[#1C1F23] rounded-md p-4 font-mono text-xs select-none">
      <div className="flex items-center justify-between border-b border-[#1C1F23] pb-2 mb-3">
        <span className="text-[10px] uppercase tracking-wider text-[#555B64]">TIMELINE</span>
        <span className="text-[10px] text-[#555B64]">{events.length} actions</span>
      </div>

      <div className="space-y-1.5 max-h-[380px] overflow-y-auto pr-1">
        {events.map((event) => {
          const isExpanded = expandedEventId === event.id;
          const hasExpandableContent = !!(event.rawOutput || event.detail || event.diff);

          return (
            <div key={event.id} className="group">
              <div
                onClick={() => {
                  if (hasExpandableContent) {
                    setExpandedEventId(isExpanded ? null : event.id);
                  }
                }}
                className={`flex items-baseline justify-between p-1.5 rounded transition-colors ${
                  isExpanded
                    ? 'bg-[#15181C]'
                    : hasExpandableContent
                    ? 'hover:bg-[#15181C]/50 cursor-pointer'
                    : ''
                }`}
              >
                {/* Left: Timestamp + Tool Badge + Label */}
                <div className="flex items-baseline space-x-3 overflow-hidden">
                  <span className="text-[11px] text-[#555B64] tabular-nums shrink-0">
                    {event.timestamp}
                  </span>

                  <span className="text-[10px] w-12 shrink-0">
                    {getToolBadge(event.type)}
                  </span>

                  <span className="text-xs text-[#F2F3F5] truncate">
                    {event.label}
                  </span>

                  {event.file && onSelectFile && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectFile(event.file!);
                      }}
                      className="text-[10px] text-[#8A9099] hover:text-[#F2F3F5] underline underline-offset-2 ml-1"
                    >
                      view
                    </button>
                  )}
                </div>

                {/* Right: Duration or diff count or expandable arrow */}
                <div className="flex items-center space-x-2 shrink-0 ml-2">
                  {event.diff && (
                    <span className="text-[10px] text-[#555B64] space-x-1">
                      <span className="text-[#34D399]">+{event.diff.added}</span>
                      <span className="text-[#EF4444]">-{event.diff.removed}</span>
                    </span>
                  )}

                  {event.duration && (
                    <span className="text-[10px] text-[#555B64]">{event.duration}</span>
                  )}

                  {hasExpandableContent && (
                    <span className="text-[10px] text-[#555B64]">
                      {isExpanded ? '▴' : '▾'}
                    </span>
                  )}
                </div>
              </div>

              {/* Expanded details / Raw terminal output / evidence */}
              {isExpanded && (
                <div className="my-1 ml-18 mr-2 p-2.5 bg-[#08090A] border border-[#1C1F23] rounded font-mono text-[11px] space-y-1.5 animate-fadeIn">
                  {event.detail && (
                    <div className="text-[#8A9099]">{event.detail}</div>
                  )}

                  {event.rawOutput && (
                    <div className="bg-[#050607] border border-[#1C1F23] p-2 rounded max-h-48 overflow-y-auto text-[#A0A6B1] whitespace-pre font-mono text-[10px] leading-relaxed">
                      {event.rawOutput}
                    </div>
                  )}

                  {event.file && onSelectFile && (
                    <div className="pt-1 flex justify-end">
                      <button
                        onClick={() => onSelectFile(event.file!)}
                        className="px-2 py-0.5 rounded border border-[#1C1F23] text-[10px] text-[#8A9099] hover:text-[#F2F3F5]"
                      >
                        Inspect Code →
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
