import React, { useState } from 'react';

interface AgentRulesModalProps {
  isOpen: boolean;
  onClose: () => void;
  rules: string[];
  onUpdateRules: (newRules: string[]) => void;
  accentColor: string;
}

export const AgentRulesModal: React.FC<AgentRulesModalProps> = ({
  isOpen,
  onClose,
  rules,
  onUpdateRules,
  accentColor,
}) => {
  const [newRule, setNewRule] = useState('');
  const [isRawMode, setIsRawMode] = useState(false);
  const [rawText, setRawText] = useState(rules.join('\n'));

  if (!isOpen) return null;

  const handleAddRule = () => {
    if (!newRule.trim()) return;
    const updated = [...rules, newRule.trim()];
    onUpdateRules(updated);
    setNewRule('');
    setRawText(updated.join('\n'));
  };

  const handleRemoveRule = (index: number) => {
    const updated = rules.filter((_, i) => i !== index);
    onUpdateRules(updated);
    setRawText(updated.join('\n'));
  };

  const handleSaveRaw = () => {
    const parsed = rawText
      .split('\n')
      .map((r) => r.trim())
      .filter(Boolean);
    onUpdateRules(parsed);
    setIsRawMode(false);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center z-50 p-4 font-mono select-none">
      <div className="bg-[#0E1012] border border-[#1C1F23] rounded-md p-5 max-w-lg w-full shadow-2xl space-y-4 animate-fadeIn">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1C1F23] pb-3">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-[#555B64]">
              WORKSPACE CONFIGURATION
            </div>
            <div className="text-sm font-semibold text-[#F2F3F5] mt-0.5 flex items-center space-x-2">
              <span>.agentrules</span>
              <span className="text-[10px] text-[#8A9099] font-normal">
                ({rules.length} active boundaries)
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                if (isRawMode) handleSaveRaw();
                else setIsRawMode(true);
              }}
              className="text-[11px] text-[#8A9099] hover:text-[#F2F3F5] px-2 py-0.5 border border-[#1C1F23] rounded"
            >
              {isRawMode ? 'Save Editor' : 'Edit as File'}
            </button>
            <button
              onClick={onClose}
              className="text-[#555B64] hover:text-[#F2F3F5] text-sm px-1"
            >
              ×
            </button>
          </div>
        </div>

        {isRawMode ? (
          <div>
            <textarea
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              rows={9}
              className="w-full bg-[#08090A] border border-[#1C1F23] rounded p-3 text-xs text-[#F2F3F5] outline-none font-mono resize-none leading-relaxed"
            />
          </div>
        ) : (
          <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
            {rules.map((rule, idx) => (
              <div
                key={idx}
                className="flex items-start justify-between p-2 rounded bg-[#08090A] border border-[#1C1F23] group text-xs"
              >
                <div className="flex items-start space-x-2.5">
                  <span className="text-[10px] text-[#555B64] mt-0.5">
                    {(idx + 1).toString().padStart(2, '0')}
                  </span>
                  <span className="text-[#F2F3F5] leading-relaxed">{rule}</span>
                </div>
                <button
                  onClick={() => handleRemoveRule(idx)}
                  className="text-[#555B64] hover:text-[#EF4444] text-xs px-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Remove rule"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        {!isRawMode && (
          <div className="flex items-center space-x-2 pt-2 border-t border-[#1C1F23]">
            <input
              type="text"
              placeholder="e.g. Always generate isolated Vitest tests for database modules"
              value={newRule}
              onChange={(e) => setNewRule(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddRule()}
              className="flex-1 bg-[#08090A] border border-[#1C1F23] rounded px-3 py-1.5 text-xs text-[#F2F3F5] outline-none"
            />
            <button
              onClick={handleAddRule}
              className="px-3 py-1.5 bg-[#1C1F23] hover:bg-[#2D3139] text-[#F2F3F5] rounded text-xs"
            >
              Add Rule
            </button>
          </div>
        )}

        <div className="text-[10px] text-[#555B64] pt-1">
          Active during all task planning, tool invocation, and verification passes.
        </div>
      </div>
    </div>
  );
};
