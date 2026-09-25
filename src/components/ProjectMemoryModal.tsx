import React, { useState } from 'react';
import { ProjectMemory } from '../types';

interface ProjectMemoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  memory: ProjectMemory;
  onUpdateMemory: (memory: ProjectMemory) => void;
  accentColor: string;
}

export const ProjectMemoryModal: React.FC<ProjectMemoryModalProps> = ({
  isOpen,
  onClose,
  memory,
  onUpdateMemory,
  accentColor,
}) => {
  const [activeTab, setActiveTab] = useState<'architecture' | 'conventions' | 'preferences' | 'notes'>('architecture');
  const [newItemText, setNewItemText] = useState('');

  if (!isOpen) return null;

  const handleAddItem = () => {
    if (!newItemText.trim()) return;
    const currentList = memory[activeTab];
    const updated = {
      ...memory,
      [activeTab]: [...currentList, newItemText.trim()],
    };
    onUpdateMemory(updated);
    setNewItemText('');
  };

  const handleRemoveItem = (index: number) => {
    const currentList = memory[activeTab];
    const updated = {
      ...memory,
      [activeTab]: currentList.filter((_, i) => i !== index),
    };
    onUpdateMemory(updated);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center z-50 p-4 font-mono select-none">
      <div className="bg-[#0E1012] border border-[#1C1F23] rounded-md p-5 max-w-lg w-full shadow-2xl space-y-4 animate-fadeIn">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1C1F23] pb-3">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-[#555B64]">
              LOCAL PROJECT MEMORY
            </div>
            <div className="text-sm font-semibold text-[#F2F3F5] mt-0.5">
              Structured Architectural Facts
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#555B64] hover:text-[#F2F3F5] text-sm px-1"
          >
            ×
          </button>
        </div>

        {/* Tabs: Architecture, Conventions, Preferences, Notes */}
        <div className="flex items-center space-x-1 border-b border-[#1C1F23] pb-2 text-xs">
          {(['architecture', 'conventions', 'preferences', 'notes'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-2.5 py-1 rounded capitalize transition-colors text-[11px] ${
                activeTab === tab
                  ? 'bg-[#1C1F23] text-[#F2F3F5] font-semibold'
                  : 'text-[#8A9099] hover:text-[#F2F3F5]'
              }`}
              style={{
                color: activeTab === tab ? accentColor : undefined,
              }}
            >
              {tab} ({memory[tab].length})
            </button>
          ))}
        </div>

        {/* Items List */}
        <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
          {memory[activeTab].map((item, idx) => (
            <div
              key={idx}
              className="flex items-start justify-between p-2 rounded bg-[#08090A] border border-[#1C1F23] group"
            >
              <div className="flex items-start space-x-2 text-xs text-[#F2F3F5]">
                <span className="text-[#555B64] mt-0.5">•</span>
                <span className="leading-relaxed">{item}</span>
              </div>
              <button
                onClick={() => handleRemoveItem(idx)}
                className="text-[#555B64] hover:text-[#EF4444] text-xs px-1 opacity-0 group-hover:opacity-100 transition-opacity"
                title="Remove item"
              >
                ×
              </button>
            </div>
          ))}
        </div>

        {/* Add item input */}
        <div className="flex items-center space-x-2 pt-2 border-t border-[#1C1F23]">
          <input
            type="text"
            placeholder={`Add fact to ${activeTab}...`}
            value={newItemText}
            onChange={(e) => setNewItemText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddItem()}
            className="flex-1 bg-[#08090A] border border-[#1C1F23] rounded px-3 py-1.5 text-xs text-[#F2F3F5] outline-none"
          />
          <button
            onClick={handleAddItem}
            className="px-3 py-1.5 bg-[#1C1F23] hover:bg-[#2D3139] text-[#F2F3F5] rounded text-xs"
          >
            Add
          </button>
        </div>

        {/* Footer */}
        <div className="text-[10px] text-[#555B64] pt-1">
          All memories are stored locally in the project workspace without hidden telemetry.
        </div>
      </div>
    </div>
  );
};
