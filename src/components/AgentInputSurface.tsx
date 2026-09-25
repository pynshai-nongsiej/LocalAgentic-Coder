import React, { useState, useEffect } from 'react';
import { ContextItem, IntentType } from '../types';
import { AgentMark } from './AgentMark';
import { classifyIntent } from '../utils/engine';

interface AgentInputSurfaceProps {
  onSubmit: (prompt: string, context: ContextItem[]) => void;
  accentColor: string;
  onOpenIntent: () => void;
  defaultBranch?: string;
}

const PLACEHOLDERS = [
  'Build authentication with SQLite and session-based login',
  'Fix the failing authentication tests',
  'Refactor the database layer to use transactions',
  'Add dark mode to the dashboard',
  'Investigate why the build is failing',
  'Review this project for security issues',
];

export const AgentInputSurface: React.FC<AgentInputSurfaceProps> = ({
  onSubmit,
  accentColor,
  onOpenIntent,
  defaultBranch = 'main',
}) => {
  const [prompt, setPrompt] = useState('');
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [contextItems, setContextItems] = useState<ContextItem[]>([]);
  const [contextPickerOpen, setContextPickerOpen] = useState(false);
  const [contextType, setContextType] = useState<ContextItem['type']>('file');
  const [contextInput, setContextInput] = useState('');

  // Rotate placeholders gently
  useEffect(() => {
    const timer = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % PLACEHOLDERS.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const intent: IntentType = prompt.trim() ? classifyIntent(prompt) : 'creation';

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!prompt.trim()) return;
    onSubmit(prompt.trim(), contextItems);
  };

  const addContext = (type: ContextItem['type'], name: string) => {
    if (!name.trim()) return;
    const newItem: ContextItem = {
      id: `ctx-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      type,
      name: name.trim(),
      path: name.trim(),
      relevanceReason: `Attached ${type} context`,
    };
    setContextItems((prev) => [...prev, newItem]);
    setContextInput('');
    setContextPickerOpen(false);
  };

  const removeContext = (id: string) => {
    setContextItems((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 relative select-none">
      {/* Center container */}
      <div className="w-full max-w-xl flex flex-col items-center space-y-6">
        {/* Subtle geometric mark */}
        <div className="mb-2">
          <AgentMark status="idle" size="lg" accentColor={accentColor} />
        </div>

        {/* Primary prompt heading */}
        <h1 className="text-xl md:text-2xl font-normal tracking-tight text-[#F2F3F5] text-center font-sans">
          What are we building?
        </h1>

        {/* Command Console Card */}
        <div className="w-full bg-[#0E1012] border border-[#1C1F23] rounded-md shadow-2xl p-3 relative group focus-within:border-[#2D3139] transition-colors">
          <form onSubmit={handleSubmit} className="flex flex-col">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
              rows={3}
              placeholder={PLACEHOLDERS[placeholderIndex]}
              className="w-full bg-transparent border-0 resize-none outline-none text-sm md:text-base text-[#F2F3F5] placeholder-[#555B64] font-mono leading-relaxed"
              autoFocus
            />

            {/* Bottom utility bar inside input */}
            <div className="flex items-center justify-between pt-2 border-t border-[#1C1F23]/60 mt-2 text-xs font-mono">
              <div className="flex items-center space-x-2">
                {prompt.trim() ? (
                  <span
                    className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded border border-[#1C1F23] text-[#8A9099]"
                    style={{ borderColor: accentColor + '40', color: accentColor }}
                  >
                    {intent}
                  </span>
                ) : (
                  <span className="text-[10px] text-[#555B64]">READY</span>
                )}
              </div>

              <div className="flex items-center space-x-2 text-[11px] text-[#555B64]">
                <button
                  type="button"
                  onClick={onOpenIntent}
                  className="hover:text-[#8A9099] transition-colors"
                >
                  <kbd className="px-1 py-0.5 border border-[#1C1F23] rounded bg-[#08090A] text-[10px]">⌘K</kbd>
                </button>
                <span className="text-[#1C1F23]">|</span>
                <button
                  type="submit"
                  disabled={!prompt.trim()}
                  className="px-2.5 py-1 rounded text-xs font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{
                    backgroundColor: prompt.trim() ? accentColor : '#1C1F23',
                    color: prompt.trim() ? '#08090A' : '#555B64',
                  }}
                >
                  Plan &amp; Run ↵
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Context Composer Strip */}
        <div className="w-full flex flex-col items-center space-y-2 font-mono">
          {/* Action strip to attach context */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 text-xs text-[#8A9099]">
            <span className="text-[11px] text-[#555B64] mr-1">Context:</span>
            {[
              { label: '+ file', type: 'file' as const },
              { label: '+ folder', type: 'folder' as const },
              { label: '+ selection', type: 'selection' as const },
              { label: '+ terminal', type: 'terminal' as const },
              { label: '+ git diff', type: 'git_diff' as const },
              { label: '+ issue', type: 'issue' as const },
            ].map((btn) => (
              <button
                key={btn.label}
                type="button"
                onClick={() => {
                  setContextType(btn.type);
                  setContextPickerOpen(true);
                  if (btn.type === 'git_diff') {
                    addContext('git_diff', 'working-tree-diff');
                  } else if (btn.type === 'terminal') {
                    addContext('terminal', 'npm test (last output)');
                  }
                }}
                className="px-2 py-0.5 rounded border border-[#1C1F23] hover:border-[#2D3139] hover:text-[#F2F3F5] text-[11px] transition-colors bg-[#08090A]"
              >
                {btn.label}
              </button>
            ))}
          </div>

          {/* Context items preview chips */}
          {contextItems.length > 0 && (
            <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1">
              {contextItems.map((item) => (
                <span
                  key={item.id}
                  className="inline-flex items-center space-x-1 px-2 py-0.5 rounded border border-[#1C1F23] bg-[#0E1012] text-[11px] text-[#F2F3F5]"
                >
                  <span className="text-[10px] text-[#555B64] uppercase">{item.type}</span>
                  <span>{item.name}</span>
                  <button
                    onClick={() => removeContext(item.id)}
                    className="text-[#555B64] hover:text-[#EF4444] ml-1"
                    title="Remove"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Preset quick pills for prompt inspiration */}
        <div className="w-full flex flex-wrap items-center justify-center gap-1.5 pt-1">
          {PLACEHOLDERS.slice(0, 3).map((sample) => (
            <button
              key={sample}
              onClick={() => setPrompt(sample)}
              className="text-[11px] text-[#555B64] hover:text-[#8A9099] border border-[#1C1F23]/60 hover:border-[#1C1F23] px-2 py-0.5 rounded transition-colors truncate max-w-xs font-mono"
            >
              {sample}
            </button>
          ))}
        </div>

        {/* Bottom status line */}
        <div className="text-[11px] text-[#555B64] tracking-wide font-mono pt-4 select-none">
          local · ready · {defaultBranch}
        </div>
      </div>

      {/* Context Item Prompt Modal */}
      {contextPickerOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-[#0E1012] border border-[#1C1F23] rounded-md p-4 w-96 font-mono shadow-2xl">
            <h3 className="text-xs uppercase tracking-wider text-[#8A9099] mb-2">
              Attach {contextType}
            </h3>
            <input
              type="text"
              placeholder={
                contextType === 'file'
                  ? 'e.g. auth/service.ts'
                  : contextType === 'folder'
                  ? 'e.g. auth/'
                  : contextType === 'selection'
                  ? 'e.g. authenticateUser function'
                  : 'e.g. issue-42'
              }
              value={contextInput}
              onChange={(e) => setContextInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') addContext(contextType, contextInput);
                if (e.key === 'Escape') setContextPickerOpen(false);
              }}
              autoFocus
              className="w-full bg-[#08090A] border border-[#1C1F23] rounded px-3 py-1.5 text-xs text-[#F2F3F5] outline-none focus:border-[#555B64] mb-3"
            />
            <div className="flex justify-end space-x-2 text-xs">
              <button
                onClick={() => setContextPickerOpen(false)}
                className="px-2.5 py-1 text-[#8A9099] hover:text-[#F2F3F5]"
              >
                Cancel
              </button>
              <button
                onClick={() => addContext(contextType, contextInput)}
                className="px-3 py-1 bg-[#1C1F23] text-[#F2F3F5] rounded hover:bg-[#2D3139]"
              >
                Attach
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
