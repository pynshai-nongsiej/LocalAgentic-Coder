import React, { useState } from 'react';
import { PlanStep } from '../types';

interface AgentPlanProps {
  taskTitle: string;
  steps: PlanStep[];
  onUpdateStep: (stepId: string, updated: Partial<PlanStep>) => void;
  onRemoveStep: (stepId: string) => void;
  onAddStep: (step: PlanStep) => void;
  accentColor: string;
  isEditable?: boolean;
}

export const AgentPlan: React.FC<AgentPlanProps> = ({
  taskTitle,
  steps,
  onUpdateStep,
  onRemoveStep,
  onAddStep,
  accentColor,
  isEditable = true,
}) => {
  const [selectedStepId, setSelectedStepId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [instructionText, setInstructionText] = useState('');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isAddingInstruction, setIsAddingInstruction] = useState(false);
  const [newStepModal, setNewStepModal] = useState(false);
  const [newStepTitle, setNewStepTitle] = useState('');

  const selectedStep = steps.find((s) => s.id === selectedStepId);

  const handleStepClick = (step: PlanStep) => {
    if (selectedStepId === step.id) {
      setSelectedStepId(null);
      setIsEditingTitle(false);
      setIsAddingInstruction(false);
    } else {
      setSelectedStepId(step.id);
      setEditTitle(step.title);
      setInstructionText(step.instruction || '');
      setIsEditingTitle(false);
      setIsAddingInstruction(false);
    }
  };

  const handleSaveTitle = () => {
    if (selectedStepId && editTitle.trim()) {
      onUpdateStep(selectedStepId, { title: editTitle.trim() });
      setIsEditingTitle(false);
    }
  };

  const handleSaveInstruction = () => {
    if (selectedStepId) {
      onUpdateStep(selectedStepId, { instruction: instructionText.trim() });
      setIsAddingInstruction(false);
    }
  };

  const handleAddNewStep = () => {
    if (!newStepTitle.trim()) return;
    const num = (steps.length + 1).toString().padStart(2, '0');
    const newStep: PlanStep = {
      id: `step-${Date.now()}`,
      number: num,
      title: newStepTitle.trim(),
      description: 'User specified step',
      status: 'pending',
    };
    onAddStep(newStep);
    setNewStepTitle('');
    setNewStepModal(false);
  };

  return (
    <div className="w-full bg-[#0E1012] border border-[#1C1F23] rounded-md p-4 font-mono text-xs select-none">
      <div className="flex items-center justify-between border-b border-[#1C1F23] pb-2 mb-3">
        <div className="flex items-center space-x-2">
          <span className="text-[10px] uppercase tracking-wider text-[#555B64]">PLAN</span>
          <span className="text-[#8A9099] uppercase text-[11px] font-medium tracking-wider">
            {taskTitle}
          </span>
        </div>

        {isEditable && (
          <button
            onClick={() => setNewStepModal(true)}
            className="text-[10px] text-[#555B64] hover:text-[#F2F3F5] transition-colors"
          >
            + Add Step
          </button>
        )}
      </div>

      {/* Step list */}
      <div className="space-y-1">
        {steps.map((step) => {
          const isSelected = selectedStepId === step.id;

          const getStatusMark = () => {
            switch (step.status) {
              case 'completed':
                return <span className="font-bold" style={{ color: accentColor }}>✓</span>;
              case 'active':
                return <span className="animate-pulse" style={{ color: accentColor }}>◉</span>;
              case 'failed':
                return <span className="text-[#EF4444] font-bold">×</span>;
              case 'pending':
              default:
                return <span className="text-[#555B64]">○</span>;
            }
          };

          return (
            <div key={step.id} className="group">
              <div
                onClick={() => handleStepClick(step)}
                className={`flex items-start justify-between p-2 rounded cursor-pointer transition-colors ${
                  isSelected
                    ? 'bg-[#15181C] border border-[#2D3139]'
                    : 'hover:bg-[#15181C]/50 border border-transparent'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <span className="w-4 text-center mt-0.5">{getStatusMark()}</span>
                  <span className="text-[#555B64]">{step.number}</span>
                  <div>
                    <div
                      className={`text-xs ${
                        step.status === 'completed'
                          ? 'text-[#8A9099] line-through decoration-[#555B64]/50'
                          : step.status === 'active'
                          ? 'text-[#F2F3F5] font-medium'
                          : 'text-[#8A9099]'
                      }`}
                    >
                      {step.title}
                    </div>

                    {step.instruction && (
                      <div className="text-[11px] text-[#38BDF8] mt-0.5 flex items-center space-x-1">
                        <span>↳ instruction:</span>
                        <span>"{step.instruction}"</span>
                      </div>
                    )}

                    {step.evidence?.outputSummary && (
                      <div className="text-[10px] text-[#555B64] mt-0.5">
                        ↳ {step.evidence.outputSummary}
                      </div>
                    )}
                  </div>
                </div>

                <div className="text-[10px] text-[#555B64] opacity-0 group-hover:opacity-100 transition-opacity">
                  {isSelected ? 'close' : 'options'}
                </div>
              </div>

              {/* Contextual Step Editor */}
              {isSelected && (
                <div className="my-1.5 ml-7 p-3 bg-[#08090A] border border-[#1C1F23] rounded space-y-2">
                  <div className="text-[10px] uppercase text-[#555B64] tracking-wider">
                    Step Options: {step.number} {step.title}
                  </div>

                  {isEditingTitle ? (
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSaveTitle()}
                        className="flex-1 bg-[#0E1012] border border-[#1C1F23] rounded px-2 py-1 text-xs text-[#F2F3F5] outline-none"
                        autoFocus
                      />
                      <button
                        onClick={handleSaveTitle}
                        className="px-2 py-1 bg-[#1C1F23] text-[#F2F3F5] rounded text-[11px] hover:bg-[#2D3139]"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setIsEditingTitle(false)}
                        className="px-2 py-1 text-[#8A9099] rounded text-[11px]"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : isAddingInstruction ? (
                    <div className="space-y-1.5">
                      <input
                        type="text"
                        placeholder="e.g. Use existing session utilities in auth/session.ts"
                        value={instructionText}
                        onChange={(e) => setInstructionText(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSaveInstruction()}
                        className="w-full bg-[#0E1012] border border-[#1C1F23] rounded px-2 py-1 text-xs text-[#F2F3F5] outline-none"
                        autoFocus
                      />
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => setIsAddingInstruction(false)}
                          className="px-2 py-0.5 text-[#8A9099] text-[11px]"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleSaveInstruction}
                          className="px-2 py-0.5 bg-[#1C1F23] text-[#F2F3F5] rounded text-[11px] hover:bg-[#2D3139]"
                        >
                          Apply Instruction
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setIsEditingTitle(true)}
                        className="px-2 py-1 rounded border border-[#1C1F23] text-[#8A9099] hover:text-[#F2F3F5] hover:border-[#2D3139] text-[11px]"
                      >
                        Edit Title
                      </button>
                      <button
                        onClick={() => setIsAddingInstruction(true)}
                        className="px-2 py-1 rounded border border-[#1C1F23] text-[#8A9099] hover:text-[#F2F3F5] hover:border-[#2D3139] text-[11px]"
                      >
                        {step.instruction ? 'Modify Instruction' : 'Add Instruction'}
                      </button>
                      <button
                        onClick={() => {
                          onRemoveStep(step.id);
                          setSelectedStepId(null);
                        }}
                        className="px-2 py-1 rounded border border-[#EF4444]/30 text-[#EF4444] hover:bg-[#EF4444]/10 text-[11px]"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* New Step Modal */}
      {newStepModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#0E1012] border border-[#1C1F23] rounded-md p-4 w-96 font-mono shadow-2xl">
            <h3 className="text-xs uppercase tracking-wider text-[#8A9099] mb-2">Add Plan Step</h3>
            <input
              type="text"
              placeholder="e.g. Audit database indexes"
              value={newStepTitle}
              onChange={(e) => setNewStepTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddNewStep()}
              autoFocus
              className="w-full bg-[#08090A] border border-[#1C1F23] rounded px-3 py-1.5 text-xs text-[#F2F3F5] outline-none mb-3"
            />
            <div className="flex justify-end space-x-2 text-xs">
              <button
                onClick={() => setNewStepModal(false)}
                className="px-2.5 py-1 text-[#8A9099] hover:text-[#F2F3F5]"
              >
                Cancel
              </button>
              <button
                onClick={handleAddNewStep}
                className="px-3 py-1 bg-[#1C1F23] text-[#F2F3F5] rounded hover:bg-[#2D3139]"
              >
                Add Step
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
