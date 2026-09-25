import React, { useState, useEffect } from 'react';

interface IntentPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onExecuteIntent: (intentString: string) => void;
  accentColor: string;
}

const INTENT_PRESETS = [
  { label: 'find all authentication paths', type: 'investigation' },
  { label: 'show untested code in auth service', type: 'testing' },
  { label: 'explain this architecture and database schema', type: 'architecture' },
  { label: 'fix failing authentication tests', type: 'debugging' },
  { label: 'review current changes for race conditions', type: 'review' },
  { label: 'run the backend verification suite', type: 'verification' },
  { label: 'create migration for session tokens table', type: 'creation' },
  { label: 'refactor database layer into functional helpers', type: 'refactoring' },
];

export const IntentPalette: React.FC<IntentPaletteProps> = ({
  isOpen,
  onClose,
  onExecuteIntent,
  accentColor,
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        // Toggle or open
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filtered = query.trim()
    ? INTENT_PRESETS.filter((item) =>
        item.label.toLowerCase().includes(query.toLowerCase())
      )
    : INTENT_PRESETS;

  const handleSubmit = (text: string) => {
    if (!text.trim()) return;
    onExecuteIntent(text.trim());
    onClose();
    setQuery('');
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-start justify-center pt-24 z-50 p-4 font-mono select-none animate-fadeIn">
      <div className="bg-[#0E1012] border border-[#2D3139] rounded-md max-w-xl w-full shadow-2xl overflow-hidden">
        {/* Input line */}
        <div className="flex items-center px-4 py-3 border-b border-[#1C1F23]">
          <span className="text-[#555B64] mr-3 text-xs">⌘K</span>
          <input
            type="text"
            placeholder="What should happen? (e.g. fix failing tests, explain architecture...)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                if (filtered.length > 0 && !query) {
                  handleSubmit(filtered[0].label);
                } else {
                  handleSubmit(query);
                }
              }
            }}
            autoFocus
            className="flex-1 bg-transparent border-0 outline-none text-sm text-[#F2F3F5] placeholder-[#555B64] font-mono"
          />
          <button
            onClick={onClose}
            className="text-[10px] text-[#555B64] hover:text-[#8A9099] border border-[#1C1F23] px-1.5 py-0.5 rounded"
          >
            ESC
          </button>
        </div>

        {/* Suggestions list */}
        <div className="p-2 space-y-0.5 max-h-72 overflow-y-auto">
          {filtered.map((item, idx) => (
            <button
              key={idx}
              onClick={() => handleSubmit(item.label)}
              className="w-full text-left px-3 py-2 rounded flex items-center justify-between text-xs text-[#8A9099] hover:text-[#F2F3F5] hover:bg-[#15181C] group transition-colors"
            >
              <div className="flex items-center space-x-2">
                <span className="text-[#555B64] text-[10px] uppercase border border-[#1C1F23] px-1 rounded">
                  {item.type}
                </span>
                <span className="text-[#F2F3F5]">{item.label}</span>
              </div>
              <span className="text-[10px] opacity-0 group-hover:opacity-100 text-[#555B64]">
                ↵ execute
              </span>
            </button>
          ))}

          {query.trim() && !filtered.some((f) => f.label.toLowerCase() === query.toLowerCase()) && (
            <button
              onClick={() => handleSubmit(query)}
              className="w-full text-left px-3 py-2 rounded flex items-center justify-between text-xs text-[#F2F3F5] bg-[#15181C] hover:bg-[#1C1F23] transition-colors"
            >
              <div className="flex items-center space-x-2">
                <span className="text-[10px] uppercase border border-[#1C1F23] px-1 rounded text-cyan-400">
                  custom intent
                </span>
                <span>"{query}"</span>
              </div>
              <span className="text-[10px] text-[#555B64]">↵ plan</span>
            </button>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 bg-[#08090A] border-t border-[#1C1F23] flex items-center justify-between text-[10px] text-[#555B64]">
          <span>Autonomous agent interprets objective and formulates verified plan</span>
          <span>Esc to close</span>
        </div>
      </div>
    </div>
  );
};
