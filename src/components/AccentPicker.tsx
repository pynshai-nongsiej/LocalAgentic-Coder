import React, { useState } from 'react';

interface AccentPickerProps {
  isOpen: boolean;
  onClose: () => void;
  currentAccent: string;
  onChangeAccent: (color: string) => void;
}

const ACCENT_PRESETS = [
  { name: 'Electric Lime', hex: '#B8FF3D' },
  { name: 'Cyber Cyan', hex: '#38BDF8' },
  { name: 'Neon Amber', hex: '#F59E0B' },
  { name: 'Hyper Violet', hex: '#A855F7' },
  { name: 'Radical Crimson', hex: '#F43F5E' },
  { name: 'Monochrome', hex: '#E2E8F0' },
];

export const AccentPicker: React.FC<AccentPickerProps> = ({
  isOpen,
  onClose,
  currentAccent,
  onChangeAccent,
}) => {
  const [customHex, setCustomHex] = useState(currentAccent);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 font-mono select-none animate-fadeIn">
      <div className="bg-[#0E1012] border border-[#1C1F23] rounded-md p-5 max-w-xs w-full shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-[#1C1F23] pb-2">
          <div className="text-[10px] uppercase tracking-wider text-[#555B64]">
            AGENT ACCENT COLOR
          </div>
          <button onClick={onClose} className="text-[#555B64] hover:text-[#F2F3F5] text-xs">
            ×
          </button>
        </div>

        <p className="text-[11px] text-[#8A9099] leading-relaxed">
          Represents active agent compute, evidence confirmation, and execution state.
        </p>

        {/* Preset swatches */}
        <div className="grid grid-cols-3 gap-2">
          {ACCENT_PRESETS.map((p) => (
            <button
              key={p.hex}
              onClick={() => {
                onChangeAccent(p.hex);
                setCustomHex(p.hex);
              }}
              className={`p-2 rounded border flex flex-col items-center space-y-1.5 transition-colors ${
                currentAccent.toLowerCase() === p.hex.toLowerCase()
                  ? 'border-[#F2F3F5] bg-[#15181C]'
                  : 'border-[#1C1F23] hover:border-[#2D3139]'
              }`}
            >
              <div
                className="w-5 h-5 rounded-full border border-black/40 shadow-xs"
                style={{ backgroundColor: p.hex }}
              />
              <span className="text-[10px] text-[#8A9099] truncate">{p.name}</span>
            </button>
          ))}
        </div>

        {/* Custom hex */}
        <div className="pt-2 border-t border-[#1C1F23] flex items-center space-x-2">
          <div className="w-4 h-4 rounded-full border border-[#1C1F23]" style={{ backgroundColor: customHex }} />
          <input
            type="text"
            value={customHex}
            onChange={(e) => setCustomHex(e.target.value)}
            className="flex-1 bg-[#08090A] border border-[#1C1F23] rounded px-2 py-1 text-xs text-[#F2F3F5] outline-none"
            placeholder="#B8FF3D"
          />
          <button
            onClick={() => {
              if (customHex.trim()) onChangeAccent(customHex.trim());
              onClose();
            }}
            className="px-2.5 py-1 bg-[#1C1F23] text-[#F2F3F5] rounded text-xs hover:bg-[#2D3139]"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
};
