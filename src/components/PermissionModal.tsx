import React from 'react';

export interface PermissionRequest {
  id: string;
  tool: string;
  command: string;
  boundary: string;
  reason: string;
  destructive?: boolean;
}

interface PermissionModalProps {
  request: PermissionRequest | null;
  onAllowOnce: () => void;
  onAllowSession: () => void;
  onDeny: () => void;
  accentColor: string;
}

export const PermissionModal: React.FC<PermissionModalProps> = ({
  request,
  onAllowOnce,
  onAllowSession,
  onDeny,
  accentColor,
}) => {
  if (!request) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center z-50 p-4 font-mono select-none">
      <div className="bg-[#0E1012] border border-[#1C1F23] rounded-md p-5 max-w-md w-full shadow-2xl space-y-4 animate-fadeIn">
        {/* Tool Header */}
        <div className="flex items-center justify-between border-b border-[#1C1F23] pb-2">
          <div className="text-[10px] uppercase tracking-wider text-[#555B64]">
            PERMISSION REQUEST · {request.tool}
          </div>
          <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded font-bold bg-amber-400/20 text-amber-400">
            {request.boundary}
          </span>
        </div>

        {/* Command / Action */}
        <div className="bg-[#08090A] border border-[#1C1F23] p-3 rounded space-y-2 text-xs">
          <div className="text-[10px] uppercase text-[#555B64]">EXECUTION INTENT</div>
          <div className="font-mono text-[#F2F3F5] font-medium break-all">
            {request.command}
          </div>
          {request.reason && (
            <div className="text-[11px] text-[#8A9099] pt-1 border-t border-[#1C1F23]/60">
              <span className="text-[#555B64]">Reason: </span>
              {request.reason}
            </div>
          )}
        </div>

        <div className="text-[11px] text-[#8A9099] leading-relaxed">
          The agent cannot silently perform operations outside current workspace boundaries.
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end space-x-2 pt-2 text-xs">
          <button
            onClick={onDeny}
            className="px-3 py-1.5 rounded border border-[#EF4444]/30 text-[#EF4444] hover:bg-[#EF4444]/10 transition-colors"
          >
            Deny
          </button>
          {!request.destructive && (
            <button
              onClick={onAllowSession}
              className="px-3 py-1.5 rounded border border-[#1C1F23] text-[#8A9099] hover:text-[#F2F3F5] hover:bg-[#15181C] transition-colors"
            >
              Allow Session
            </button>
          )}
          <button
            onClick={onAllowOnce}
            className="px-4 py-1.5 rounded font-semibold text-[#08090A] transition-all hover:brightness-110"
            style={{ backgroundColor: accentColor }}
          >
            {request.destructive ? 'Allow' : 'Allow Once'}
          </button>
        </div>
      </div>
    </div>
  );
};
