import React from 'react';
import { LocalModelInfo } from '../types';

interface ModelDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  modelInfo: LocalModelInfo;
  onSelectModel: (model: Partial<LocalModelInfo>) => void;
  accentColor: string;
}

export const AVAILABLE_MODELS: LocalModelInfo[] = [
  {
    name: 'Qwen3 8B',
    provider: 'Ollama',
    contextWindow: '32k',
    device: 'Apple M3 Max (Metal)',
    status: 'READY',
    temperature: 0.1,
    speed: '48 tok/s',
    activeContextTokens: 4120,
  },
  {
    name: 'DeepSeek Coder 7B',
    provider: 'vLLM',
    contextWindow: '64k',
    device: 'NVIDIA RTX 4090 (CUDA)',
    status: 'READY',
    temperature: 0.05,
    speed: '62 tok/s',
    activeContextTokens: 2840,
  },
  {
    name: 'Llama 3 8B Instruct',
    provider: 'llama.cpp',
    contextWindow: '32k',
    device: 'Local GPU (Vulkan)',
    status: 'READY',
    temperature: 0.2,
    speed: '44 tok/s',
    activeContextTokens: 3100,
  },
  {
    name: 'Qwen 2.5 Coder 32B',
    provider: 'Ollama',
    contextWindow: '128k',
    device: 'Multi-GPU (Quantized 4-bit)',
    status: 'READY',
    temperature: 0.1,
    speed: '28 tok/s',
    activeContextTokens: 8900,
  },
];

export const ModelDrawer: React.FC<ModelDrawerProps> = ({
  isOpen,
  onClose,
  modelInfo,
  onSelectModel,
  accentColor,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex justify-end font-mono select-none animate-fadeIn">
      <div className="w-full max-w-sm bg-[#0E1012] border-l border-[#1C1F23] h-full p-5 flex flex-col justify-between overflow-y-auto">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#1C1F23] pb-3">
            <div>
              <div className="text-[10px] uppercase tracking-wider text-[#555B64]">
                LOCAL INFERENCE ENGINE
              </div>
              <div className="text-sm font-semibold text-[#F2F3F5] flex items-center space-x-2 mt-0.5">
                <span>{modelInfo.name}</span>
                <span className="text-[9px] px-1 py-0.2 rounded font-bold uppercase bg-[#1C1F23] text-[#8A9099]">
                  LOCAL
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-[#555B64] hover:text-[#F2F3F5] text-sm px-1"
            >
              ×
            </button>
          </div>

          {/* Model Spec Grid */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-[#08090A] border border-[#1C1F23] p-2.5 rounded">
              <div className="text-[10px] uppercase text-[#555B64]">MODEL</div>
              <div className="text-[#F2F3F5] font-medium mt-0.5">{modelInfo.name}</div>
            </div>

            <div className="bg-[#08090A] border border-[#1C1F23] p-2.5 rounded">
              <div className="text-[10px] uppercase text-[#555B64]">PROVIDER</div>
              <div className="text-[#F2F3F5] font-medium mt-0.5">{modelInfo.provider}</div>
            </div>

            <div className="bg-[#08090A] border border-[#1C1F23] p-2.5 rounded">
              <div className="text-[10px] uppercase text-[#555B64]">CONTEXT</div>
              <div className="text-[#F2F3F5] font-medium mt-0.5">{modelInfo.contextWindow}</div>
            </div>

            <div className="bg-[#08090A] border border-[#1C1F23] p-2.5 rounded">
              <div className="text-[10px] uppercase text-[#555B64]">DEVICE</div>
              <div className="text-[#F2F3F5] font-medium mt-0.5 truncate" title={modelInfo.device}>
                {modelInfo.device}
              </div>
            </div>

            <div className="bg-[#08090A] border border-[#1C1F23] p-2.5 rounded">
              <div className="text-[10px] uppercase text-[#555B64]">STATUS</div>
              <div className="font-semibold mt-0.5" style={{ color: accentColor }}>
                {modelInfo.status}
              </div>
            </div>

            <div className="bg-[#08090A] border border-[#1C1F23] p-2.5 rounded">
              <div className="text-[10px] uppercase text-[#555B64]">SPEED</div>
              <div className="text-[#F2F3F5] font-medium mt-0.5">{modelInfo.speed}</div>
            </div>
          </div>

          {/* Context Tokens Usage */}
          <div className="bg-[#08090A] border border-[#1C1F23] p-3 rounded text-xs space-y-1.5">
            <div className="flex items-center justify-between text-[10px] text-[#555B64]">
              <span>ACTIVE CONTEXT WINDOW</span>
              <span>{modelInfo.activeContextTokens} / 32,768 tokens</span>
            </div>
            <div className="w-full bg-[#1C1F23] h-1.5 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${(modelInfo.activeContextTokens / 32768) * 100}%`,
                  backgroundColor: accentColor,
                }}
              />
            </div>
            <div className="text-[10px] text-[#8A9099]">
              Inference is executed strictly on localhost. No tokens or codebase files leave this machine.
            </div>
          </div>

          {/* Switch Local Model */}
          <div className="space-y-2">
            <div className="text-[10px] uppercase tracking-wider text-[#555B64]">
              SWITCH LOCAL RUNTIME
            </div>
            <div className="space-y-1">
              {AVAILABLE_MODELS.map((m) => (
                <button
                  key={m.name}
                  onClick={() => onSelectModel(m)}
                  className={`w-full text-left p-2.5 rounded border transition-colors flex items-center justify-between text-xs ${
                    m.name === modelInfo.name
                      ? 'border-[#2D3139] bg-[#15181C] text-[#F2F3F5]'
                      : 'border-[#1C1F23] bg-[#08090A] text-[#8A9099] hover:text-[#F2F3F5] hover:bg-[#15181C]/50'
                  }`}
                >
                  <div>
                    <div className="font-medium">{m.name}</div>
                    <div className="text-[10px] text-[#555B64]">
                      {m.provider} · {m.contextWindow} · {m.speed}
                    </div>
                  </div>
                  {m.name === modelInfo.name && (
                    <span className="text-[11px]" style={{ color: accentColor }}>✓</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-[#1C1F23] pt-3 text-[10px] text-[#555B64] text-center">
          100% Offline-Capable · Zero Telemetry
        </div>
      </div>
    </div>
  );
};
