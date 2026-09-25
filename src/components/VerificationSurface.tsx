import React from 'react';
import { VerificationState } from '../types';

interface VerificationSurfaceProps {
  verification: VerificationState;
  onSelectFile?: (filePath: string) => void;
  accentColor: string;
}

export const VerificationSurface: React.FC<VerificationSurfaceProps> = ({
  verification,
  onSelectFile,
  accentColor,
}) => {
  const items = [
    { key: 'formatting', label: 'Formatting (Prettier)', data: verification.formatting },
    { key: 'typecheck', label: 'Type checking (tsc strict)', data: verification.typecheck },
    { key: 'unitTests', label: 'Unit tests (Vitest)', data: verification.unitTests },
    { key: 'integrationTests', label: 'Integration tests (HTTP / SQLite)', data: verification.integrationTests },
    { key: 'build', label: 'Build pipeline (Vite production bundle)', data: verification.build },
  ];

  const passedCount = items.filter((i) => i.data.passed).length;
  const totalCount = items.length;

  return (
    <div className="w-full bg-[#0E1012] border border-[#1C1F23] rounded-md p-4 font-mono text-xs select-none space-y-3">
      <div className="flex items-center justify-between border-b border-[#1C1F23] pb-2">
        <div className="flex items-center space-x-2">
          <span className="text-[10px] uppercase tracking-wider text-[#555B64]">VERIFICATION</span>
          <span className="text-[#8A9099] font-medium">
            {passedCount} / {totalCount} passed
          </span>
        </div>

        {verification.allPassed ? (
          <span className="text-[10px] font-semibold" style={{ color: accentColor }}>
            ✓ ALL CHECKS PASSED
          </span>
        ) : (
          <span className="text-[10px] font-semibold text-[#EF4444]">
            × VERIFICATION FAILED
          </span>
        )}
      </div>

      <div className="space-y-1.5">
        {items.map((item) => (
          <div
            key={item.key}
            className={`p-2 rounded border transition-colors ${
              item.data.passed
                ? 'bg-[#08090A] border-[#1C1F23]/60'
                : 'bg-[#EF4444]/5 border-[#EF4444]/30'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <span className={item.data.passed ? 'font-bold' : 'text-[#EF4444] font-bold'} style={{ color: item.data.passed ? accentColor : undefined }}>
                  {item.data.passed ? '✓' : '×'}
                </span>
                <span className={`text-xs ${item.data.passed ? 'text-[#F2F3F5]' : 'text-[#EF4444] font-medium'}`}>
                  {item.label}
                </span>
              </div>

              <span className="text-[10px] text-[#555B64] tabular-nums">
                {item.data.duration}
              </span>
            </div>

            {/* If there are failures list */}
            {!item.data.passed && item.data.failures && item.data.failures.length > 0 && (
              <div className="mt-2 ml-5 space-y-1">
                <div className="text-[10px] uppercase tracking-wider text-[#EF4444]">
                  {item.data.failures.length} failures:
                </div>
                {item.data.failures.map((f, idx) => (
                  <div key={idx} className="flex items-center justify-between text-[11px] text-[#8A9099] bg-[#0E1012] p-1.5 rounded border border-[#1C1F23]">
                    <span className="font-mono">{f}</span>
                    {onSelectFile && (
                      <button
                        onClick={() => onSelectFile(f)}
                        className="text-[10px] text-[#38BDF8] hover:underline"
                      >
                        Inspect →
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
