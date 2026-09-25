import React from 'react';
import { PermissionsState } from '../types';

interface PermissionStripProps {
  permissions: PermissionsState;
  onTogglePermission: (key: keyof PermissionsState) => void;
  accentColor: string;
}

export const PermissionStrip: React.FC<PermissionStripProps> = ({
  permissions,
  onTogglePermission,
  accentColor,
}) => {
  const items: { key: keyof PermissionsState; label: string; value: string }[] = [
    { key: 'files', label: 'FILES', value: permissions.files },
    { key: 'terminal', label: 'TERMINAL', value: permissions.terminal },
    { key: 'network', label: 'NETWORK', value: permissions.network },
    { key: 'git', label: 'GIT', value: permissions.git },
    { key: 'database', label: 'DATABASE', value: permissions.database },
    { key: 'browser', label: 'BROWSER', value: permissions.browser },
  ];

  const getColor = (value: string) => {
    if (value === 'BLOCKED') return 'text-[#EF4444] border-[#EF4444]/30';
    if (value === 'WRITE' || value === 'EXECUTE' || value === 'LOCAL')
      return 'text-[#F2F3F5] border-[#1C1F23]';
    return 'text-amber-400 border-amber-400/30';
  };

  return (
    <div className="w-full bg-[#08090A] border-b border-[#1C1F23] px-4 py-1.5 flex flex-wrap items-center justify-between gap-2 font-mono text-[11px] select-none">
      <div className="flex items-center space-x-2">
        <span className="text-[10px] uppercase text-[#555B64] tracking-wider">
          WORKSPACE PERMISSIONS
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {items.map((item) => (
          <button
            key={item.key}
            onClick={() => onTogglePermission(item.key)}
            className={`px-2 py-0.5 rounded border bg-[#0E1012] flex items-center space-x-1.5 hover:bg-[#15181C] transition-colors ${getColor(
              item.value
            )}`}
            title={`Toggle permission for ${item.label}`}
          >
            <span className="text-[9px] text-[#555B64]">{item.label}</span>
            <span className="font-semibold text-[10px]">{item.value}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
