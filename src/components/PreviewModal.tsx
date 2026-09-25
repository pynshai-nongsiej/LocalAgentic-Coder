import React, { useState } from 'react';

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  accentColor: string;
}

const PREVIEWS = [
  {
    id: 'idle',
    title: '1. Radically Minimal Workspace (Idle Canvas)',
    description:
      'Near-black canvas (#08090A) with zero permanent sidebars or chat bubbles. Contains only the project identity, agent state, and the central command console.',
    src: '/preview_idle_screen.jpg',
  },
  {
    id: 'execution',
    title: '2. Autonomous Execution & Action Timeline',
    description:
      'The central input collapses into a thin state bar. The agent formulates an editable numbered plan alongside a chronological stream of concrete actions and terminal evidence.',
    src: '/preview_execution_flow.jpg',
  },
  {
    id: 'review',
    title: '3. Change Review & Code Inspection Mode',
    description:
      'Modifications organized by intention (AUTHENTICATION, TESTS, CONFIGURATION) with structured reasoning (WHY, WHAT, IMPACT, TESTED) and inline agent capabilities.',
    src: '/preview_code_review.jpg',
  },
];

export const PreviewModal: React.FC<PreviewModalProps> = ({
  isOpen,
  onClose,
  accentColor,
}) => {
  const [activeTab, setActiveTab] = useState(0);

  if (!isOpen) return null;

  const current = PREVIEWS[activeTab];

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center z-50 p-4 font-mono select-none animate-fadeIn">
      <div className="bg-[#0E1012] border border-[#1C1F23] rounded-md max-w-4xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="h-11 border-b border-[#1C1F23] px-4 flex items-center justify-between bg-[#08090A]">
          <div className="flex items-center space-x-2">
            <span className="text-[10px] uppercase tracking-wider text-[#555B64]">
              INTERFACE PREVIEWS
            </span>
            <span className="text-[#555B64]">/</span>
            <span className="text-xs text-[#F2F3F5] font-semibold">{current.title}</span>
          </div>

          <button
            onClick={onClose}
            className="text-[#555B64] hover:text-[#F2F3F5] text-sm px-1"
          >
            ×
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-[#1C1F23] bg-[#0E1012] px-4 py-2 space-x-2 text-xs">
          {PREVIEWS.map((p, idx) => (
            <button
              key={p.id}
              onClick={() => setActiveTab(idx)}
              className={`px-3 py-1 rounded text-xs transition-colors ${
                activeTab === idx
                  ? 'bg-[#1C1F23] text-[#F2F3F5] font-semibold'
                  : 'text-[#8A9099] hover:text-[#F2F3F5]'
              }`}
              style={{
                color: activeTab === idx ? accentColor : undefined,
              }}
            >
              {p.id.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Main Content Area */}
        <div className="p-4 overflow-y-auto space-y-3 bg-[#08090A]">
          <p className="text-xs text-[#8A9099] leading-relaxed">
            {current.description}
          </p>

          <div className="rounded border border-[#1C1F23] overflow-hidden bg-[#050607]">
            <img
              src={current.src}
              alt={current.title}
              referrerPolicy="no-referrer"
              className="w-full h-auto object-cover block"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="h-9 border-t border-[#1C1F23] px-4 flex items-center justify-between text-[11px] text-[#555B64] bg-[#08090A]">
          <span>Full documentation &amp; screenshots available in README.md</span>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveTab((prev) => (prev > 0 ? prev - 1 : PREVIEWS.length - 1))}
              className="hover:text-[#F2F3F5] px-1"
            >
              ← prev
            </button>
            <button
              onClick={() => setActiveTab((prev) => (prev < PREVIEWS.length - 1 ? prev + 1 : 0))}
              className="hover:text-[#F2F3F5] px-1"
            >
              next →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
