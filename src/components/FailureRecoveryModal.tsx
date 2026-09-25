import React from 'react';

interface FailureRecoveryModalProps {
  isOpen: boolean;
  title: string;
  cause: string;
  actionTaken: string;
  onInspect: () => void;
  onFixAutomatically: () => void;
  onStop: () => void;
  accentColor: string;
}

export const FailureRecoveryModal: React.FC<FailureRecoveryModalProps> = ({
  isOpen,
  title,
  cause,
  actionTaken,
  onInspect,
  onFixAutomatically,
  onStop,
  accentColor,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center z-50 p-4 font-mono select-none">
      <div className="bg-[#0E1012] border border-[#EF4444]/40 rounded-md p-6 max-w-lg w-full shadow-2xl space-y-5 animate-fadeIn">
        {/* Header */}
        <div className="flex items-center space-x-2 text-[#EF4444]">
          <span className="font-bold text-lg">×</span>
          <span className="text-xs uppercase tracking-wider font-semibold">
            IMPLEMENTATION BLOCKED
          </span>
        </div>

        {/* Message */}
        <div className="text-sm text-[#F2F3F5] font-medium leading-snug">
          {title}
        </div>

        {/* Structured CAUSE and ACTION */}
        <div className="space-y-3 bg-[#08090A] border border-[#1C1F23] rounded p-3 text-xs">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-[#555B64] mb-1">
              CAUSE
            </div>
            <div className="text-[#F2F3F5] font-mono leading-relaxed">
              {cause}
            </div>
          </div>

          <div className="border-t border-[#1C1F23] pt-2">
            <div className="text-[10px] uppercase tracking-wider text-[#555B64] mb-1">
              ACTION
            </div>
            <div className="text-[#8A9099] leading-relaxed">
              {actionTaken}
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-end space-x-2 pt-2 text-xs">
          <button
            onClick={onStop}
            className="px-3 py-1.5 rounded border border-[#1C1F23] text-[#8A9099] hover:text-[#EF4444] transition-colors"
          >
            Stop
          </button>
          <button
            onClick={onInspect}
            className="px-3 py-1.5 rounded border border-[#1C1F23] text-[#F2F3F5] hover:bg-[#15181C] transition-colors"
          >
            Inspect
          </button>
          <button
            onClick={onFixAutomatically}
            className="px-4 py-1.5 rounded font-semibold text-[#08090A] transition-all hover:brightness-110"
            style={{ backgroundColor: accentColor }}
          >
            Fix Automatically
          </button>
        </div>
      </div>
    </div>
  );
};
