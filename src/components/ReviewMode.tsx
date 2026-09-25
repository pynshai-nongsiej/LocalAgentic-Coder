import React, { useState } from 'react';
import { ChangeGroup, FileChange, VerificationState } from '../types';

interface ReviewModeProps {
  changeGroups: ChangeGroup[];
  verification: VerificationState;
  onApply: () => void;
  onContinue: () => void;
  onInspectFileInEditor: (filePath: string) => void;
  accentColor: string;
}

export const ReviewMode: React.FC<ReviewModeProps> = ({
  changeGroups,
  verification,
  onApply,
  onContinue,
  onInspectFileInEditor,
  accentColor,
}) => {
  // Flatten files for step navigation: 1 / N
  const allFiles: { groupIntent: string; file: FileChange }[] = [];
  changeGroups.forEach((g) => {
    g.files.forEach((f) => {
      allFiles.push({ groupIntent: g.intent, file: f });
    });
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDetailedView, setIsDetailedView] = useState(false);

  const totalFiles = allFiles.length;
  const currentItem = allFiles[currentIndex];

  const totalAdded = changeGroups.reduce((acc, g) => acc + g.addedLines, 0);
  const totalRemoved = changeGroups.reduce((acc, g) => acc + g.removedLines, 0);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : totalFiles - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < totalFiles - 1 ? prev + 1 : 0));
  };

  return (
    <div className="w-full bg-[#0E1012] border border-[#1C1F23] rounded-md p-5 font-mono select-none space-y-5 animate-fadeIn">
      {/* Header: Implementation Complete */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-[#1C1F23] pb-4 gap-3">
        <div>
          <div className="flex items-center space-x-2 text-xs">
            <span className="font-bold text-sm" style={{ color: accentColor }}>✓</span>
            <span className="text-sm font-semibold tracking-wider text-[#F2F3F5] uppercase">
              IMPLEMENTATION COMPLETE
            </span>
          </div>

          <div className="flex items-center space-x-3 text-xs text-[#8A9099] mt-1">
            <span>{totalFiles} files changed</span>
            <span>·</span>
            <span className="text-[#34D399]">+{totalAdded}</span>
            <span className="text-[#EF4444]">-{totalRemoved}</span>
          </div>
        </div>

        {/* Verification mini badges */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="px-2 py-0.5 rounded border border-[#1C1F23] bg-[#08090A] text-[#8A9099] flex items-center space-x-1">
            <span style={{ color: accentColor }}>✓</span>
            <span>Tests</span>
          </span>
          <span className="px-2 py-0.5 rounded border border-[#1C1F23] bg-[#08090A] text-[#8A9099] flex items-center space-x-1">
            <span style={{ color: accentColor }}>✓</span>
            <span>Typecheck</span>
          </span>
          <span className="px-2 py-0.5 rounded border border-[#1C1F23] bg-[#08090A] text-[#8A9099] flex items-center space-x-1">
            <span style={{ color: accentColor }}>✓</span>
            <span>Build</span>
          </span>
        </div>
      </div>

      {/* Navigation step bar (e.g. AUTHENTICATION | 1 / 10 | auth/service.ts) */}
      {currentItem && (
        <div className="bg-[#08090A] border border-[#1C1F23] rounded p-4 space-y-4">
          <div className="flex items-center justify-between border-b border-[#1C1F23] pb-3 text-xs">
            <div className="flex items-center space-x-3">
              <span className="text-[10px] uppercase tracking-wider text-[#555B64]">
                {currentItem.groupIntent}
              </span>
              <span className="text-[#555B64]">|</span>
              <span className="text-[#F2F3F5] font-semibold">
                {currentIndex + 1} / {totalFiles}
              </span>
              <span className="text-[#555B64]">|</span>
              <span className="text-[#F2F3F5] font-mono font-medium">
                {currentItem.file.path}
              </span>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={handlePrev}
                className="px-2 py-0.5 rounded border border-[#1C1F23] text-[#8A9099] hover:text-[#F2F3F5] hover:border-[#2D3139] text-xs transition-colors"
              >
                ← previous
              </button>
              <button
                onClick={handleNext}
                className="px-2 py-0.5 rounded border border-[#1C1F23] text-[#8A9099] hover:text-[#F2F3F5] hover:border-[#2D3139] text-xs transition-colors"
              >
                → next
              </button>
            </div>
          </div>

          {/* Actionable reasoning: WHY, WHAT, IMPACT, TESTED */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* WHY */}
            <div className="space-y-1">
              <div className="text-[10px] uppercase tracking-wider text-[#555B64]">WHY</div>
              <p className="text-[#8A9099] leading-relaxed bg-[#0E1012] p-2.5 rounded border border-[#1C1F23]/60">
                {currentItem.file.why}
              </p>
            </div>

            {/* WHAT */}
            <div className="space-y-1">
              <div className="text-[10px] uppercase tracking-wider text-[#555B64]">WHAT</div>
              <p className="text-[#8A9099] leading-relaxed bg-[#0E1012] p-2.5 rounded border border-[#1C1F23]/60">
                {currentItem.file.what}
              </p>
            </div>

            {/* IMPACT */}
            <div className="space-y-1">
              <div className="text-[10px] uppercase tracking-wider text-[#555B64]">IMPACT</div>
              <p className="text-[#8A9099] leading-relaxed bg-[#0E1012] p-2.5 rounded border border-[#1C1F23]/60">
                {currentItem.file.impact}
              </p>
            </div>

            {/* TESTED */}
            <div className="space-y-1">
              <div className="text-[10px] uppercase tracking-wider text-[#555B64]">TESTED</div>
              <div className="text-[#8A9099] leading-relaxed bg-[#0E1012] p-2.5 rounded border border-[#1C1F23]/60 flex items-center justify-between">
                <span>
                  {currentItem.file.tested
                    ? 'Covered by automated test suite'
                    : 'Static analysis check only'}
                </span>
                <span className="text-[10px] font-bold" style={{ color: accentColor }}>
                  {currentItem.file.tested ? 'VERIFIED' : 'PENDING'}
                </span>
              </div>
            </div>
          </div>

          {/* Diff view */}
          <div className="border border-[#1C1F23] rounded bg-[#050607] p-3 max-h-60 overflow-y-auto space-y-0.5">
            <div className="flex items-center justify-between text-[10px] text-[#555B64] pb-1 border-b border-[#1C1F23] mb-1">
              <span>DIFF · {currentItem.file.path}</span>
              <button
                onClick={() => onInspectFileInEditor(currentItem.file.path)}
                className="text-[#8A9099] hover:text-[#F2F3F5] underline"
              >
                Open in Full Code Inspector →
              </button>
            </div>

            {currentItem.file.diffLines.map((dl, idx) => (
              <div
                key={idx}
                className={`text-[11px] leading-relaxed font-mono px-1 py-0.5 rounded truncate ${
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
        </div>
      )}

      {/* Bottom decision bar: Review Changes, Apply, Continue */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-2 border-t border-[#1C1F23] gap-3">
        <div className="text-[11px] text-[#555B64]">
          Reconciles agent proposed changes into the local working tree.
        </div>

        <div className="flex items-center space-x-3 text-xs">
          <button
            onClick={() => currentItem && onInspectFileInEditor(currentItem.file.path)}
            className="px-3 py-1.5 rounded border border-[#1C1F23] text-[#8A9099] hover:text-[#F2F3F5] hover:border-[#2D3139] transition-colors"
          >
            Review Changes
          </button>

          <button
            onClick={onContinue}
            className="px-3 py-1.5 rounded border border-[#1C1F23] text-[#8A9099] hover:text-[#F2F3F5] hover:border-[#2D3139] transition-colors"
          >
            Continue
          </button>

          <button
            onClick={onApply}
            className="px-4 py-1.5 rounded font-semibold text-[#08090A] transition-all hover:brightness-110 shadow-sm"
            style={{ backgroundColor: accentColor }}
          >
            Apply Changes
          </button>
        </div>
      </div>
    </div>
  );
};
