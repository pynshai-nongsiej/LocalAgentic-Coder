import React, { useState, useRef } from 'react';
import { AUTH_CHALLENGES, AUTH_FUNCTION_TRACE } from '../data/mockWorkspace';
import { ChallengeIssue, TraceNode } from '../types';

interface CodeInspectorProps {
  filePath: string;
  code: string;
  explanation?: string;
  onClose: () => void;
  accentColor: string;
}

export const CodeInspector: React.FC<CodeInspectorProps> = ({
  filePath,
  code,
  explanation = 'Agent changed this function. Reason: session persistence and type safety.',
  onClose,
  accentColor,
}) => {
  const [selectedText, setSelectedText] = useState('');
  const [selectionCoord, setSelectionCoord] = useState<{ x: number; y: number } | null>(null);
  const [activeInlineAction, setActiveInlineAction] = useState<'Explain' | 'Trace' | 'Challenge' | 'Fix' | 'Test' | 'Refactor' | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseUp = () => {
    const sel = window.getSelection();
    if (sel && sel.toString().trim().length > 0) {
      const text = sel.toString().trim();
      setSelectedText(text);

      const range = sel.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      const containerRect = containerRef.current?.getBoundingClientRect() || { top: 0, left: 0 };

      setSelectionCoord({
        x: Math.max(10, rect.left - containerRect.left + rect.width / 2 - 120),
        y: Math.max(10, rect.top - containerRect.top - 42),
      });
    } else {
      if (!activeInlineAction) {
        setSelectionCoord(null);
      }
    }
  };

  const lines = code.split('\n');

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 bg-[#08090A] z-40 flex flex-col font-mono text-xs select-text animate-fadeIn"
    >
      {/* Top Bar: File path and actions */}
      <div className="h-10 border-b border-[#1C1F23] bg-[#0E1012] px-4 flex items-center justify-between select-none">
        <div className="flex items-center space-x-3">
          <span className="text-[10px] uppercase tracking-wider text-[#555B64]">CODE INSPECTION</span>
          <span className="text-[#555B64]">/</span>
          <span className="text-[#F2F3F5] font-semibold">{filePath}</span>
        </div>

        <div className="flex items-center space-x-3 text-xs">
          <button
            onClick={() => setActiveInlineAction('Trace')}
            className="px-2 py-0.5 rounded border border-[#1C1F23] text-[#8A9099] hover:text-[#F2F3F5] text-[11px]"
          >
            Trace Callers
          </button>
          <button
            onClick={() => setActiveInlineAction('Challenge')}
            className="px-2 py-0.5 rounded border border-[#1C1F23] text-[#8A9099] hover:text-[#F2F3F5] text-[11px]"
          >
            Challenge Code
          </button>
          <button
            onClick={onClose}
            className="px-2.5 py-1 bg-[#1C1F23] hover:bg-[#2D3139] text-[#F2F3F5] rounded transition-colors text-[11px]"
          >
            Esc Close
          </button>
        </div>
      </div>

      {/* Main Editor Surface with line numbers */}
      <div
        onMouseUp={handleMouseUp}
        className="flex-1 overflow-auto p-4 flex font-mono text-xs leading-relaxed relative"
      >
        {/* Floating Inline Agent Action Bar */}
        {selectionCoord && (
          <div
            style={{ left: selectionCoord.x, top: selectionCoord.y }}
            className="absolute z-50 bg-[#0E1012] border border-[#2D3139] rounded shadow-2xl p-1 flex items-center space-x-1 select-none animate-fadeIn"
          >
            {(['Explain', 'Fix', 'Test', 'Refactor', 'Trace', 'Challenge'] as const).map((act) => (
              <button
                key={act}
                onClick={() => setActiveInlineAction(act)}
                className="px-1.5 py-0.5 rounded hover:bg-[#1C1F23] text-[#8A9099] hover:text-[#F2F3F5] text-[10px] transition-colors"
                style={{
                  color: activeInlineAction === act ? accentColor : undefined,
                }}
              >
                {act}
              </button>
            ))}
          </div>
        )}

        {/* Line numbers column */}
        <div className="select-none text-[#555B64] pr-4 text-right border-r border-[#1C1F23] space-y-0.5 font-mono">
          {lines.map((_, i) => (
            <div key={i} className="h-5">
              {i + 1}
            </div>
          ))}
        </div>

        {/* Code text lines */}
        <div className="pl-4 flex-1 space-y-0.5 font-mono text-[#F2F3F5] whitespace-pre">
          {lines.map((line, i) => (
            <div key={i} className="h-5 hover:bg-[#15181C]/40 px-1 rounded">
              {line || ' '}
            </div>
          ))}
        </div>
      </div>

      {/* Floating Action Modal / Overlay when an inline action is active */}
      {activeInlineAction && (
        <div className="border-t border-[#1C1F23] bg-[#0E1012] p-4 select-none animate-fadeIn">
          <div className="max-w-4xl mx-auto space-y-3">
            <div className="flex items-center justify-between border-b border-[#1C1F23] pb-2">
              <div className="flex items-center space-x-2">
                <span className="text-[10px] uppercase tracking-wider text-[#555B64]">
                  AGENT · {activeInlineAction.toUpperCase()}
                </span>
                {selectedText && (
                  <span className="text-[#8A9099] text-[11px] truncate max-w-sm">
                    "{selectedText}"
                  </span>
                )}
              </div>
              <button
                onClick={() => setActiveInlineAction(null)}
                className="text-[#555B64] hover:text-[#F2F3F5] text-xs px-1"
              >
                ×
              </button>
            </div>

            {/* TRACE Surface */}
            {activeInlineAction === 'Trace' && (
              <div className="space-y-2">
                <div className="text-[11px] text-[#8A9099]">
                  Call hierarchy and execution path across workspace:
                </div>
                <div className="flex flex-col space-y-1.5 bg-[#08090A] border border-[#1C1F23] p-3 rounded">
                  {AUTH_FUNCTION_TRACE.map((step, idx) => (
                    <div key={idx} className="flex items-center space-x-2 text-xs">
                      <span className="text-[#555B64] text-[10px] w-6">{idx + 1}</span>
                      <span className="text-[#F2F3F5] font-semibold">{step.name}</span>
                      <span className="text-[#555B64] text-[10px]">({step.file}:{step.line})</span>
                      <span className="text-[10px] uppercase px-1 py-0.2 rounded border border-[#1C1F23] text-[#8A9099]">
                        {step.role}
                      </span>
                      {idx < AUTH_FUNCTION_TRACE.length - 1 && (
                        <span className="text-[#555B64] ml-2">↓</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* EXPLAIN Surface */}
            {activeInlineAction === 'Explain' && (
              <div className="space-y-2">
                <div className="text-[11px] text-[#8A9099]">
                  Compact structural explanation:
                </div>
                <div className="bg-[#08090A] border border-[#1C1F23] p-3 rounded text-xs space-y-1 text-[#8A9099]">
                  <div>1. Validates input credentials against password hash.</div>
                  <div>2. Issues 32-byte cryptographically secure session token via crypto.randomBytes.</div>
                  <div>3. Persists session with 7-day TTL in SQLite with automated expiry checks.</div>
                  <div>4. Sets HTTP-only, SameSite=Lax cookie boundary and returns authenticated user object.</div>
                </div>
              </div>
            )}

            {/* CHALLENGE Surface */}
            {activeInlineAction === 'Challenge' && (
              <div className="space-y-2">
                <div className="text-[11px] text-[#8A9099]">
                  Architectural weaknesses and potential edge cases:
                </div>
                <div className="space-y-1.5">
                  {AUTH_CHALLENGES.map((ch) => (
                    <div
                      key={ch.id}
                      className="bg-[#08090A] border border-[#1C1F23] p-2.5 rounded text-xs flex flex-col space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[#F2F3F5] font-medium">{ch.title}</span>
                        <span
                          className={`text-[9px] uppercase px-1.5 py-0.5 rounded font-bold ${
                            ch.severity === 'high'
                              ? 'bg-[#EF4444]/20 text-[#EF4444]'
                              : ch.severity === 'medium'
                              ? 'bg-amber-400/20 text-amber-400'
                              : 'bg-blue-400/20 text-blue-400'
                          }`}
                        >
                          {ch.severity}
                        </span>
                      </div>
                      <div className="text-[#8A9099] text-[11px]">{ch.description}</div>
                      <div className="text-[10px] text-[#555B64] pt-0.5">
                        ↳ fix: {ch.fixSuggestion}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* FIX / TEST / REFACTOR Surface */}
            {(activeInlineAction === 'Fix' || activeInlineAction === 'Test' || activeInlineAction === 'Refactor') && (
              <div className="bg-[#08090A] border border-[#1C1F23] p-3 rounded space-y-2">
                <div className="text-[#8A9099] text-xs">
                  Proposed {activeInlineAction.toLowerCase()} operation:
                </div>
                <div className="font-mono text-[11px] text-[#34D399]">
                  + // Automated {activeInlineAction} patch generated for targeted lines
                  <br />
                  + export async function safe_{selectedText.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 20)}() ...
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Bottom Contextual Strip: Attached Agent Explanation */}
      <div className="h-10 border-t border-[#1C1F23] bg-[#0E1012] px-4 flex items-center justify-between select-none text-xs">
        <div className="flex items-center space-x-2 text-[#8A9099]">
          <span className="text-[10px] uppercase text-[#555B64]">AGENT NOTE:</span>
          <span className="text-[#F2F3F5]">{explanation}</span>
        </div>
        <div className="text-[10px] text-[#555B64]">
          Select any code to Explain · Fix · Test · Refactor · Trace · Challenge
        </div>
      </div>
    </div>
  );
};
