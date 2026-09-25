import React, { useState, useRef, useEffect } from 'react';
import { AgentStatus, LocalModelInfo } from '../types';
import { ProjectWorkspace, WORKSPACES } from '../data/mockWorkspace';
import { AgentMark } from './AgentMark';

interface NavigationProps {
  currentProject: ProjectWorkspace;
  onSelectProject: (project: ProjectWorkspace) => void;
  agentStatus: AgentStatus;
  statusLabel: string;
  stateDescription: string;
  modelInfo: LocalModelInfo;
  onOpenModelDrawer: () => void;
  onOpenHistory: () => void;
  onOpenMemory: () => void;
  onOpenRules: () => void;
  onOpenIntent: () => void;
  accentColor: string;
  onOpenAccentPicker: () => void;
  networkMode: 'LOCAL' | 'NETWORK_REQUEST';
}

export const Navigation: React.FC<NavigationProps> = ({
  currentProject,
  onSelectProject,
  agentStatus,
  statusLabel,
  stateDescription,
  modelInfo,
  onOpenModelDrawer,
  onOpenHistory,
  onOpenMemory,
  onOpenRules,
  onOpenIntent,
  accentColor,
  onOpenAccentPicker,
  networkMode,
}) => {
  const [projectMenuOpen, setProjectMenuOpen] = useState(false);
  const [newProjectModal, setNewProjectModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setProjectMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCreateProject = () => {
    if (!newProjectName.trim()) return;
    const newP: ProjectWorkspace = {
      id: newProjectName.toLowerCase().replace(/\s+/g, '-'),
      name: newProjectName.trim(),
      branch: 'main',
      rootPath: `~/projects/${newProjectName.toLowerCase().replace(/\s+/g, '-')}`,
      description: 'Local workspace',
      fileTree: ['package.json', 'src/index.ts', 'tsconfig.json'],
    };
    onSelectProject(newP);
    setNewProjectName('');
    setNewProjectModal(false);
    setProjectMenuOpen(false);
  };

  return (
    <header className="h-10 border-b border-[#1C1F23] bg-[#08090A] px-4 flex items-center justify-between text-xs tracking-wide select-none z-30 relative font-mono">
      {/* Left persistent trio: PROJECT, AGENT, STATE */}
      <div className="flex items-center space-x-6">
        {/* PROJECT */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setProjectMenuOpen(!projectMenuOpen)}
            className="flex items-center space-x-2 text-[#8A9099] hover:text-[#F2F3F5] transition-colors py-1 group"
          >
            <span className="text-[10px] uppercase text-[#555B64] group-hover:text-[#8A9099]">PROJECT</span>
            <span className="text-[#F2F3F5] font-medium">{currentProject.name}</span>
            <span className="text-[10px] text-[#555B64]">▾</span>
          </button>

          {/* Project Switcher Dropdown */}
          {projectMenuOpen && (
            <div className="absolute top-8 left-0 w-64 bg-[#0E1012] border border-[#1C1F23] rounded p-1 shadow-2xl z-50">
              <div className="px-2 py-1 text-[10px] uppercase tracking-wider text-[#555B64]">
                Projects
              </div>
              <div className="space-y-0.5">
                {WORKSPACES.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      onSelectProject(p);
                      setProjectMenuOpen(false);
                    }}
                    className={`w-full text-left px-2 py-1.5 rounded flex items-center justify-between transition-colors ${
                      p.id === currentProject.id
                        ? 'bg-[#1C1F23] text-[#F2F3F5]'
                        : 'text-[#8A9099] hover:bg-[#15181C] hover:text-[#F2F3F5]'
                    }`}
                  >
                    <div>
                      <div className="font-medium text-xs">{p.name}</div>
                      <div className="text-[10px] text-[#555B64] truncate">{p.description}</div>
                    </div>
                    {p.id === currentProject.id && (
                      <span className="text-[10px]" style={{ color: accentColor }}>✓</span>
                    )}
                  </button>
                ))}
              </div>

              <div className="border-t border-[#1C1F23] mt-1 pt-1">
                <button
                  onClick={() => {
                    setNewProjectModal(true);
                    setProjectMenuOpen(false);
                  }}
                  className="w-full text-left px-2 py-1 text-xs text-[#8A9099] hover:text-[#F2F3F5] hover:bg-[#15181C] rounded transition-colors"
                >
                  + Open Project...
                </button>
              </div>
            </div>
          )}
        </div>

        {/* AGENT */}
        <div className="flex items-center space-x-2">
          <span className="text-[10px] uppercase text-[#555B64]">AGENT</span>
          <AgentMark status={agentStatus} size="sm" accentColor={accentColor} />
          <span className="text-[#8A9099] capitalize">{statusLabel}</span>
        </div>

        {/* STATE */}
        <div className="flex items-center space-x-2">
          <span className="text-[10px] uppercase text-[#555B64]">STATE</span>
          <span className="text-[#8A9099]">{stateDescription}</span>
        </div>
      </div>

      {/* Right controls: Memory, Rules, History, Network boundary & Local Model */}
      <div className="flex items-center space-x-4">
        {/* Rules button */}
        <button
          onClick={onOpenRules}
          className="text-[#555B64] hover:text-[#8A9099] transition-colors text-[11px] px-1 py-0.5"
          title="Agent Rules (.agentrules)"
        >
          rules
        </button>

        {/* Memory button */}
        <button
          onClick={onOpenMemory}
          className="text-[#555B64] hover:text-[#8A9099] transition-colors text-[11px] px-1 py-0.5"
          title="Project Memory"
        >
          memory
        </button>

        {/* History button */}
        <button
          onClick={onOpenHistory}
          className="text-[#555B64] hover:text-[#8A9099] transition-colors text-[11px] px-1 py-0.5"
          title="Task History"
        >
          history
        </button>

        {/* Accent Color picker toggle */}
        <button
          onClick={onOpenAccentPicker}
          className="w-3 h-3 rounded-full border border-[#1C1F23] hover:scale-110 transition-transform"
          style={{ backgroundColor: accentColor }}
          title="Change Accent Color"
        />

        {/* Network boundary indicator */}
        <div className="flex items-center space-x-1.5 px-2 py-0.5 rounded border border-[#1C1F23] text-[10px]">
          {networkMode === 'LOCAL' ? (
            <>
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: accentColor }} />
              <span className="text-[#8A9099]">LOCAL ONLY</span>
            </>
          ) : (
            <>
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
              <span className="text-amber-400 font-bold">NETWORK REQ</span>
            </>
          )}
        </div>

        {/* Model Indicator (Top-right corner) */}
        <button
          onClick={onOpenModelDrawer}
          className="flex items-center space-x-1.5 text-[#F2F3F5] hover:text-white bg-[#0E1012] hover:bg-[#15181C] px-2 py-1 rounded border border-[#1C1F23] transition-colors"
          title="Local Model Inference Status"
        >
          <span className="font-semibold uppercase tracking-wider text-[11px]">
            {modelInfo.name}
          </span>
          <span className="text-[#555B64]">·</span>
          <span className="text-[10px] text-[#8A9099] uppercase">{modelInfo.provider}</span>
        </button>
      </div>

      {/* New Project Modal */}
      {newProjectModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center z-50">
          <div className="bg-[#0E1012] border border-[#1C1F23] rounded-md p-5 w-80 shadow-2xl">
            <h3 className="text-xs uppercase tracking-wider text-[#8A9099] mb-3">Open Local Project</h3>
            <input
              type="text"
              placeholder="e.g. backend-core"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreateProject()}
              autoFocus
              className="w-full bg-[#08090A] border border-[#1C1F23] rounded px-3 py-1.5 text-xs text-[#F2F3F5] outline-none focus:border-[#555B64] font-mono mb-4"
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setNewProjectModal(false)}
                className="px-3 py-1 rounded text-xs text-[#8A9099] hover:text-[#F2F3F5]"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateProject}
                className="px-3 py-1 rounded text-xs bg-[#1C1F23] text-[#F2F3F5] hover:bg-[#2D3139]"
              >
                Open
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
