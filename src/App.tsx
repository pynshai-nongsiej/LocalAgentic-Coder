import React, { useState, useEffect, useRef } from 'react';
import {
  AgentStatus,
  AutonomyMode,
  ChangeGroup,
  ContextItem,
  LocalModelInfo,
  PermissionsState,
  PlanStep,
  ProjectMemory,
  TaskHistoryItem,
  TaskSnapshot,
  TimelineEvent,
  VerificationState,
} from './types';
import {
  AUTH_CHANGE_GROUPS,
  AUTH_VERIFICATION,
  INITIAL_AGENT_RULES,
  INITIAL_PROJECT_MEMORY,
  ProjectWorkspace,
  WORKSPACE_FILES,
  WORKSPACES,
} from './data/mockWorkspace';
import {
  formatTimestamp,
  generatePlanForPrompt,
  getAutoContext,
} from './utils/engine';

import { Navigation } from './components/Navigation';
import { AgentInputSurface } from './components/AgentInputSurface';
import { AgentStateBar } from './components/AgentStateBar';
import { AgentPlan } from './components/AgentPlan';
import { AgentTimeline } from './components/AgentTimeline';
import { ContextMap } from './components/ContextMap';
import { ExecutionSurface } from './components/ExecutionSurface';
import { ReviewMode } from './components/ReviewMode';
import { VerificationSurface } from './components/VerificationSurface';
import { CodeInspector } from './components/CodeInspector';
import { PermissionStrip } from './components/PermissionStrip';
import { PermissionModal, PermissionRequest } from './components/PermissionModal';
import { ModelDrawer } from './components/ModelDrawer';
import { ProjectMemoryModal } from './components/ProjectMemoryModal';
import { AgentRulesModal } from './components/AgentRulesModal';
import { TaskHistoryDrawer } from './components/TaskHistoryDrawer';
import { IntentPalette } from './components/IntentPalette';
import { AccentPicker } from './components/AccentPicker';
import { FailureRecoveryModal } from './components/FailureRecoveryModal';
import { PreviewModal } from './components/PreviewModal';

export default function App() {
  // Global Project & Theme State
  const [currentProject, setCurrentProject] = useState<ProjectWorkspace>(WORKSPACES[0]);
  const [accentColor, setAccentColor] = useState<string>('#B8FF3D');
  const [isAccentPickerOpen, setIsAccentPickerOpen] = useState(false);
  const [isModelDrawerOpen, setIsModelDrawerOpen] = useState(false);
  const [isMemoryOpen, setIsMemoryOpen] = useState(false);
  const [isRulesOpen, setIsRulesOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isIntentOpen, setIsIntentOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [isPermissionStripVisible, setIsPermissionStripVisible] = useState(true);
  const [networkMode, setNetworkMode] = useState<'LOCAL' | 'NETWORK_REQUEST'>('LOCAL');

  // Permissions State
  const [permissions, setPermissions] = useState<PermissionsState>({
    files: 'WRITE',
    terminal: 'EXECUTE',
    network: 'BLOCKED',
    git: 'WRITE',
    database: 'LOCAL',
    browser: 'LOCAL',
  });
  const [permissionRequest, setPermissionRequest] = useState<PermissionRequest | null>(null);

  // Model Info State
  const [modelInfo, setModelInfo] = useState<LocalModelInfo>({
    name: 'Qwen3 8B',
    provider: 'Ollama',
    contextWindow: '32k',
    device: 'Apple M3 Max (Metal GPU)',
    status: 'READY',
    temperature: 0.1,
    speed: '48 tok/s',
    activeContextTokens: 4120,
  });

  // Project Memory & Rules
  const [memory, setMemory] = useState<ProjectMemory>(INITIAL_PROJECT_MEMORY);
  const [agentRules, setAgentRules] = useState<string[]>(INITIAL_AGENT_RULES);

  // Agent Execution State
  const [agentStatus, setAgentStatus] = useState<AgentStatus>('idle');
  const [taskTitle, setTaskTitle] = useState('');
  const [currentStage, setCurrentStage] = useState<
    'Planning' | 'Inspecting project' | 'Implementing' | 'Testing' | 'Verifying' | 'Complete'
  >('Planning');
  const [autonomyMode, setAutonomyMode] = useState<AutonomyMode>('AUTO');
  const [planSteps, setPlanSteps] = useState<PlanStep[]>([]);
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);
  const [contextItems, setContextItems] = useState<ContextItem[]>([]);
  const [isContextMapOpen, setIsContextMapOpen] = useState(false);

  // Code Modifications & Review
  const [activeFile, setActiveFile] = useState<string>('');
  const [addedLines, setAddedLines] = useState<number>(0);
  const [removedLines, setRemovedLines] = useState<number>(0);
  const [statusText, setStatusText] = useState<string>('');
  const [changeGroups, setChangeGroups] = useState<ChangeGroup[]>([]);
  const [verification, setVerification] = useState<VerificationState>(AUTH_VERIFICATION);
  const [isReviewMode, setIsReviewMode] = useState<boolean>(false);

  // Code Inspector Modal State
  const [inspectingFile, setInspectingFile] = useState<string | null>(null);

  // Snapshot & Undo System
  const [currentSnapshot, setCurrentSnapshot] = useState<TaskSnapshot | null>(null);
  const [taskHistory, setTaskHistory] = useState<TaskHistoryItem[]>([
    {
      id: 'task-prev-1',
      title: 'Database refactor',
      timestamp: '12:08',
      status: 'completed',
      duration: '1m 45s',
      filesChanged: 3,
      added: 74,
      removed: 18,
      plan: [],
      events: [],
      changeGroups: [],
    },
    {
      id: 'task-prev-2',
      title: 'Fix build pipeline',
      timestamp: '10:41',
      status: 'stopped',
      duration: '42s',
      filesChanged: 1,
      added: 8,
      removed: 2,
      plan: [],
      events: [],
      changeGroups: [],
    },
  ]);

  // Failure Recovery State
  const [failureModalOpen, setFailureModalOpen] = useState(false);
  const [failureDetails, setFailureDetails] = useState({
    title: 'The database migration failed.',
    cause: 'Column already exists: table "sessions" constraint primary_key',
    actionTaken: 'Migration transaction rolled back. No working tree files corrupted.',
  });

  // Timer Ref for simulation
  const executionTimerRef = useRef<NodeJS.Timeout[]>([]);

  const clearExecutionTimers = () => {
    executionTimerRef.current.forEach((t) => clearTimeout(t));
    executionTimerRef.current = [];
  };

  // Keyboard shortcut listener for ⌘K and Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsIntentOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        if (inspectingFile) setInspectingFile(null);
        if (isIntentOpen) setIsIntentOpen(false);
        if (isModelDrawerOpen) setIsModelDrawerOpen(false);
        if (isMemoryOpen) setIsMemoryOpen(false);
        if (isRulesOpen) setIsRulesOpen(false);
        if (isHistoryOpen) setIsHistoryOpen(false);
        if (isAccentPickerOpen) setIsAccentPickerOpen(false);
        if (isContextMapOpen) setIsContextMapOpen(false);
        if (isPreviewModalOpen) setIsPreviewModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    inspectingFile,
    isIntentOpen,
    isModelDrawerOpen,
    isMemoryOpen,
    isRulesOpen,
    isHistoryOpen,
    isAccentPickerOpen,
    isContextMapOpen,
    isPreviewModalOpen,
  ]);

  // Start Agent Task Execution
  const handleStartTask = (prompt: string, attachedContext: ContextItem[] = []) => {
    clearExecutionTimers();
    setIsReviewMode(false);
    setFailureModalOpen(false);

    // 1. Create Task Snapshot before task starts
    const snapshot: TaskSnapshot = {
      id: `snap-${Date.now()}`,
      taskTitle: prompt,
      timestamp: formatTimestamp(),
      description: `Before ${prompt.slice(0, 40)}`,
      filesSnapshot: { ...WORKSPACE_FILES },
    };
    setCurrentSnapshot(snapshot);

    // 2. Setup state
    setTaskTitle(prompt);
    setAgentStatus('planning');
    setCurrentStage('Planning');

    const generatedSteps = generatePlanForPrompt(prompt, 'creation');
    setPlanSteps(generatedSteps);

    const autoCtx = getAutoContext(prompt);
    const combinedContext = [...attachedContext, ...autoCtx.filter((ac) => !attachedContext.some((c) => c.path === ac.path))];
    setContextItems(combinedContext);

    // Initial timeline events
    const startTime = new Date();
    const e1: TimelineEvent = {
      id: 'ev-1',
      timestamp: formatTimestamp(startTime),
      type: 'PLAN',
      label: `Task objective: "${prompt.slice(0, 60)}"`,
      detail: `Autonomy mode: ${autonomyMode}. Local model: ${modelInfo.name} (${modelInfo.provider}).`,
    };
    const e2: TimelineEvent = {
      id: 'ev-2',
      timestamp: formatTimestamp(new Date(startTime.getTime() + 1000)),
      type: 'INSPECT',
      label: 'Inspecting workspace context',
      detail: `Loaded ${combinedContext.length} contextual resources without network transport.`,
    };

    setTimelineEvents([e1, e2]);

    // Check if prompt triggers a permission simulation or failure demo
    if (prompt.toLowerCase().includes('bcrypt') || prompt.toLowerCase().includes('external')) {
      // Permission request demo
      setPermissionRequest({
        id: 'perm-req-1',
        tool: 'TERMINAL',
        command: 'npm install bcrypt',
        boundary: 'NETWORK ACCESS REQUIRED',
        reason: 'Requested native cryptographic dependency download.',
      });
      setAgentStatus('waiting');
      return;
    }

    if (prompt.toLowerCase().includes('fail') && prompt.toLowerCase().includes('test')) {
      // Failure recovery demo
      const tFail = setTimeout(() => {
        setAgentStatus('blocked');
        setCurrentStage('Testing');
        setFailureDetails({
          title: 'Authentication session tests failed.',
          cause: 'AssertionError: expected null to deeply equal session token',
          actionTaken: 'Execution paused. Ready for automated fix or interactive code inspection.',
        });
        setFailureModalOpen(true);
      }, 3500);
      executionTimerRef.current.push(tFail);
    }

    // Schedule progressive autonomous execution
    runSimulatedExecution(prompt, generatedSteps);
  };

  const runSimulatedExecution = (prompt: string, steps: PlanStep[]) => {
    // Step 1: Inspecting project
    const t1 = setTimeout(() => {
      setAgentStatus('executing');
      setCurrentStage('Inspecting project');
      setPlanSteps((prev) =>
        prev.map((s, idx) => (idx === 0 ? { ...s, status: 'active' } : s))
      );
      setTimelineEvents((prev) => [
        ...prev,
        {
          id: `ev-${Date.now()}-1`,
          timestamp: formatTimestamp(),
          type: 'READ',
          label: 'READ user/model.ts',
          file: 'user/model.ts',
          detail: 'Examined User interface and session types.',
          duration: '0.12s',
        },
        {
          id: `ev-${Date.now()}-2`,
          timestamp: formatTimestamp(),
          type: 'SEARCH',
          label: 'SEARCH "session" → 17 matches across 4 files',
          duration: '0.04s',
        },
      ]);
    }, 1200);

    // Step 2: Implementation begins
    const t2 = setTimeout(() => {
      setCurrentStage('Implementing');
      setActiveFile('auth/service.ts');
      setAddedLines(42);
      setRemovedLines(8);
      setStatusText('Writing cryptographic token generator...');

      setPlanSteps((prev) =>
        prev.map((s, idx) =>
          idx === 0
            ? { ...s, status: 'completed' }
            : idx === 1
            ? { ...s, status: 'active' }
            : s
        )
      );

      setTimelineEvents((prev) => [
        ...prev,
        {
          id: `ev-${Date.now()}-3`,
          timestamp: formatTimestamp(),
          type: 'WRITE',
          label: 'WRITE auth/service.ts (+42 -8)',
          file: 'auth/service.ts',
          detail: 'Added createSession, validateSession with 32-byte crypto entropy.',
          diff: { added: 42, removed: 8 },
          duration: '0.34s',
        },
      ]);
    }, 2800);

    // Step 3: Middleware & Routes
    const t3 = setTimeout(() => {
      setActiveFile('auth/middleware.ts');
      setAddedLines(68);
      setRemovedLines(8);
      setStatusText('Implementing requireAuth middleware...');

      setPlanSteps((prev) =>
        prev.map((s, idx) =>
          idx <= 1
            ? { ...s, status: 'completed' }
            : idx === 2
            ? { ...s, status: 'active' }
            : s
        )
      );

      setTimelineEvents((prev) => [
        ...prev,
        {
          id: `ev-${Date.now()}-4`,
          timestamp: formatTimestamp(),
          type: 'WRITE',
          label: 'WRITE auth/middleware.ts (+26 -0)',
          file: 'auth/middleware.ts',
          detail: 'Guards routes against unauthenticated requests.',
          diff: { added: 26, removed: 0 },
          duration: '0.22s',
        },
        {
          id: `ev-${Date.now()}-5`,
          timestamp: formatTimestamp(),
          type: 'WRITE',
          label: 'WRITE auth/routes.ts (+48 -14)',
          file: 'auth/routes.ts',
          diff: { added: 48, removed: 14 },
          duration: '0.28s',
        },
      ]);
    }, 4500);

    // Step 4: Testing & Verification
    const t4 = setTimeout(() => {
      setCurrentStage('Testing');
      setActiveFile('tests/auth.test.ts');
      setStatusText('Running test suite...');

      setPlanSteps((prev) =>
        prev.map((s, idx) =>
          idx <= 4
            ? { ...s, status: 'completed' }
            : idx === 5
            ? { ...s, status: 'active' }
            : s
        )
      );

      setTimelineEvents((prev) => [
        ...prev,
        {
          id: `ev-${Date.now()}-6`,
          timestamp: formatTimestamp(),
          type: 'TEST',
          label: 'EXECUTE vitest run',
          rawOutput: `✓ tests/auth.test.ts (4 tests) 1.24s\n  ✓ authenticates valid credentials\n  ✓ creates and validates session\n  ✓ revokes session properly\n  ✓ handles expired session rejection\n\nTest Files  1 passed (1)\n     Tests  4 passed (4)\n  Start at  ${formatTimestamp()}\n  Duration  1.24s`,
          duration: '1.24s',
        },
      ]);
    }, 6200);

    // Step 5: Verification & Completion
    const t5 = setTimeout(() => {
      setCurrentStage('Verifying');
      setStatusText('Verifying build and types...');

      setPlanSteps((prev) =>
        prev.map((s) => ({ ...s, status: 'completed' }))
      );

      setTimelineEvents((prev) => [
        ...prev,
        {
          id: `ev-${Date.now()}-7`,
          timestamp: formatTimestamp(),
          type: 'LINTER',
          label: 'LINTER: ESLint passed (0 errors, 0 warnings)',
          duration: '0.45s',
        },
        {
          id: `ev-${Date.now()}-8`,
          timestamp: formatTimestamp(),
          type: 'BUILD',
          label: 'BUILD: Production bundle verified (142 KB)',
          duration: '0.48s',
        },
        {
          id: `ev-${Date.now()}-9`,
          timestamp: formatTimestamp(),
          type: 'VERIFY',
          label: 'VERIFICATION: 5/5 passed (Formatting, Types, Unit, Integration, Build)',
          duration: '2.8s',
        },
      ]);

      setChangeGroups(AUTH_CHANGE_GROUPS);
      setVerification(AUTH_VERIFICATION);
      setAgentStatus('complete');
      setCurrentStage('Complete');
      setStatusText('');

      // Add to task history
      const historyRecord: TaskHistoryItem = {
        id: `task-${Date.now()}`,
        title: prompt,
        timestamp: formatTimestamp(),
        status: 'completed',
        duration: '7.8s',
        filesChanged: 6,
        added: 284,
        removed: 36,
        plan: steps,
        events: timelineEvents,
        changeGroups: AUTH_CHANGE_GROUPS,
      };
      setTaskHistory((prev) => [historyRecord, ...prev]);
    }, 7800);

    executionTimerRef.current.push(t1, t2, t3, t4, t5);
  };

  // Stop Agent Control (■ STOP)
  const handleStopAgent = () => {
    clearExecutionTimers();
    setAgentStatus('blocked');
    setTimelineEvents((prev) => [
      ...prev,
      {
        id: `ev-${Date.now()}-stop`,
        timestamp: formatTimestamp(),
        type: 'STATUS',
        label: '■ Execution terminated by user command',
        detail: 'Working tree preserved. You can inspect changes or restore task snapshot.',
      },
    ]);
  };

  // Restore Task Snapshot
  const handleRestoreSnapshot = (snapshot: TaskSnapshot) => {
    clearExecutionTimers();
    setAgentStatus('idle');
    setTaskTitle('');
    setActiveFile('');
    setAddedLines(0);
    setRemovedLines(0);
    setChangeGroups([]);
    setIsReviewMode(false);
    setCurrentSnapshot(null);
    setTimelineEvents((prev) => [
      ...prev,
      {
        id: `ev-${Date.now()}-revert`,
        timestamp: formatTimestamp(),
        type: 'GIT',
        label: `Snapshot restored: ${snapshot.description}`,
      },
    ]);
  };

  // Toggle Workspace Permission
  const handleTogglePermission = (key: keyof PermissionsState) => {
    setPermissions((prev) => {
      const cur = prev[key];
      let nextVal = cur;
      if (key === 'network') {
        nextVal = cur === 'BLOCKED' ? 'ALLOWED' : 'BLOCKED';
        setNetworkMode(nextVal === 'ALLOWED' ? 'NETWORK_REQUEST' : 'LOCAL');
      } else if (key === 'terminal') {
        nextVal = cur === 'EXECUTE' ? 'PROMPT' : cur === 'PROMPT' ? 'BLOCKED' : 'EXECUTE';
      } else if (key === 'files') {
        nextVal = cur === 'WRITE' ? 'READ' : cur === 'READ' ? 'BLOCKED' : 'WRITE';
      } else if (key === 'database') {
        nextVal = cur === 'LOCAL' ? 'MOCK' : cur === 'MOCK' ? 'BLOCKED' : 'LOCAL';
      } else {
        nextVal = cur === 'WRITE' || cur === 'LOCAL' ? 'BLOCKED' : 'LOCAL';
      }
      return { ...prev, [key]: nextVal };
    });
  };

  // Permission Prompt Handlers
  const handleAllowOnce = () => {
    setPermissionRequest(null);
    setAgentStatus('executing');
    setTimelineEvents((prev) => [
      ...prev,
      {
        id: `ev-perm-${Date.now()}`,
        timestamp: formatTimestamp(),
        type: 'EXECUTE',
        label: 'Allowed once: npm install bcrypt',
        duration: '1.2s',
      },
    ]);
  };

  const handleAllowSession = () => {
    setPermissions((prev) => ({ ...prev, network: 'ALLOWED' }));
    setNetworkMode('NETWORK_REQUEST');
    setPermissionRequest(null);
    setAgentStatus('executing');
  };

  const handleDeny = () => {
    setPermissionRequest(null);
    setAgentStatus('blocked');
    setTimelineEvents((prev) => [
      ...prev,
      {
        id: `ev-perm-${Date.now()}`,
        timestamp: formatTimestamp(),
        type: 'STATUS',
        label: 'Denied permission: network operation aborted',
      },
    ]);
  };

  // Failure Recovery Handlers
  const handleFixAutomatically = () => {
    setFailureModalOpen(false);
    setAgentStatus('executing');
    setTimelineEvents((prev) => [
      ...prev,
      {
        id: `ev-fix-${Date.now()}`,
        timestamp: formatTimestamp(),
        type: 'WRITE',
        label: 'Self-healing patch applied to auth/service.ts:28',
        detail: 'Replaced direct deletion with safe conditional existence check.',
      },
    ]);
    setTimeout(() => {
      setAgentStatus('complete');
      setCurrentStage('Complete');
      setChangeGroups(AUTH_CHANGE_GROUPS);
    }, 1200);
  };

  // Select File to Inspect in CodeInspector
  const handleInspectFile = (filePath: string) => {
    setInspectingFile(filePath);
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-[#08090A] text-[#F2F3F5] font-sans antialiased overflow-hidden select-none">
      {/* 1. Global Navigation */}
      <Navigation
        currentProject={currentProject}
        onSelectProject={(p) => {
          setCurrentProject(p);
          setAgentStatus('idle');
          setTaskTitle('');
          setChangeGroups([]);
          setIsReviewMode(false);
        }}
        agentStatus={agentStatus}
        statusLabel={
          agentStatus === 'idle'
            ? 'ready'
            : agentStatus === 'complete'
            ? 'completed'
            : currentStage.toLowerCase()
        }
        stateDescription={
          agentStatus === 'idle'
            ? 'clean workspace'
            : agentStatus === 'complete'
            ? '6 changes ready'
            : `${currentStage} · ${activeFile || 'local'}`
        }
        modelInfo={modelInfo}
        onOpenModelDrawer={() => setIsModelDrawerOpen(true)}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenMemory={() => setIsMemoryOpen(true)}
        onOpenRules={() => setIsRulesOpen(true)}
        onOpenIntent={() => setIsIntentOpen(true)}
        onOpenPreviews={() => setIsPreviewModalOpen(true)}
        accentColor={accentColor}
        onOpenAccentPicker={() => setIsAccentPickerOpen(true)}
        networkMode={networkMode}
      />

      {/* 2. Optional Permission Strip (toggleable) */}
      {isPermissionStripVisible && (
        <PermissionStrip
          permissions={permissions}
          onTogglePermission={handleTogglePermission}
          accentColor={accentColor}
        />
      )}

      {/* 3. Main Body Container */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* State A: Idle - Minimalistic Empty Center Surface */}
        {agentStatus === 'idle' && (
          <AgentInputSurface
            onSubmit={handleStartTask}
            accentColor={accentColor}
            onOpenIntent={() => setIsIntentOpen(true)}
            defaultBranch={currentProject.branch}
          />
        )}

        {/* State B: Working / Executing / Review Mode */}
        {agentStatus !== 'idle' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Collapsed Agent State Bar */}
            <AgentStateBar
              taskTitle={taskTitle}
              agentStatus={agentStatus}
              currentStage={currentStage}
              autonomyMode={autonomyMode}
              onChangeAutonomy={setAutonomyMode}
              onStop={handleStopAgent}
              onToggleContextMap={() => setIsContextMapOpen(!isContextMapOpen)}
              isContextMapOpen={isContextMapOpen}
              onRestoreSnapshot={handleRestoreSnapshot}
              currentSnapshot={currentSnapshot}
              accentColor={accentColor}
              activeFile={activeFile}
              filesModifiedCount={changeGroups.reduce((acc, g) => acc + g.fileCount, 0)}
            />

            {/* Context Map Accordion/Overlay if toggled */}
            {isContextMapOpen && (
              <div className="p-4 border-b border-[#1C1F23] bg-[#08090A]">
                <ContextMap
                  taskTitle={taskTitle}
                  contextItems={contextItems}
                  onSelectFile={handleInspectFile}
                  onClose={() => setIsContextMapOpen(false)}
                  accentColor={accentColor}
                />
              </div>
            )}

            {/* Scrollable Working Workspace */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-5 max-w-6xl w-full mx-auto">
              {/* Review Mode Screen if completed or clicked */}
              {isReviewMode || (agentStatus === 'complete' && changeGroups.length > 0) ? (
                <ReviewMode
                  changeGroups={changeGroups}
                  verification={verification}
                  onApply={() => {
                    setIsReviewMode(false);
                    setAgentStatus('idle');
                    setTaskTitle('');
                    setChangeGroups([]);
                  }}
                  onContinue={() => {
                    setIsReviewMode(false);
                  }}
                  onInspectFileInEditor={handleInspectFile}
                  accentColor={accentColor}
                />
              ) : (
                <>
                  {/* Execution Surface: Live Diff & Active File status */}
                  {activeFile && (
                    <ExecutionSurface
                      activeFile={activeFile}
                      addedLines={addedLines}
                      removedLines={removedLines}
                      statusText={statusText}
                      changeGroups={
                        changeGroups.length > 0 ? changeGroups : AUTH_CHANGE_GROUPS
                      }
                      onSelectFile={handleInspectFile}
                      accentColor={accentColor}
                    />
                  )}

                  {/* Split Grid: Agent Plan (Left) and Agent Action Timeline (Right) */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Left: Editable Agent Plan */}
                    <AgentPlan
                      taskTitle={taskTitle}
                      steps={planSteps}
                      onUpdateStep={(id, updated) => {
                        setPlanSteps((prev) =>
                          prev.map((s) => (s.id === id ? { ...s, ...updated } : s))
                        );
                      }}
                      onRemoveStep={(id) => {
                        setPlanSteps((prev) => prev.filter((s) => s.id !== id));
                      }}
                      onAddStep={(step) => {
                        setPlanSteps((prev) => [...prev, step]);
                      }}
                      accentColor={accentColor}
                      isEditable={agentStatus !== 'complete'}
                    />

                    {/* Right: Agent Action Timeline */}
                    <AgentTimeline
                      events={timelineEvents}
                      accentColor={accentColor}
                      onSelectFile={handleInspectFile}
                    />
                  </div>

                  {/* Verification Surface */}
                  {currentStage === 'Testing' || currentStage === 'Verifying' || agentStatus === 'complete' ? (
                    <VerificationSurface
                      verification={verification}
                      onSelectFile={handleInspectFile}
                      accentColor={accentColor}
                    />
                  ) : null}
                </>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Code Inspection Mode (Agent + Editor Hybrid) */}
      {inspectingFile && (
        <CodeInspector
          filePath={inspectingFile}
          code={WORKSPACE_FILES[inspectingFile] || `// Source code for ${inspectingFile}\n// Content loaded from local workspace\n`}
          onClose={() => setInspectingFile(null)}
          accentColor={accentColor}
        />
      )}

      {/* Permission Escalation Modal */}
      <PermissionModal
        request={permissionRequest}
        onAllowOnce={handleAllowOnce}
        onAllowSession={handleAllowSession}
        onDeny={handleDeny}
        accentColor={accentColor}
      />

      {/* Failure Recovery Modal */}
      <FailureRecoveryModal
        isOpen={failureModalOpen}
        title={failureDetails.title}
        cause={failureDetails.cause}
        actionTaken={failureDetails.actionTaken}
        onInspect={() => {
          setFailureModalOpen(false);
          handleInspectFile('auth/service.ts');
        }}
        onFixAutomatically={handleFixAutomatically}
        onStop={() => {
          setFailureModalOpen(false);
          handleStopAgent();
        }}
        accentColor={accentColor}
      />

      {/* Local Model Status Drawer */}
      <ModelDrawer
        isOpen={isModelDrawerOpen}
        onClose={() => setIsModelDrawerOpen(false)}
        modelInfo={modelInfo}
        onSelectModel={(m) => {
          setModelInfo((prev) => ({ ...prev, ...m }));
          setIsModelDrawerOpen(false);
        }}
        accentColor={accentColor}
      />

      {/* Project Memory Modal */}
      <ProjectMemoryModal
        isOpen={isMemoryOpen}
        onClose={() => setIsMemoryOpen(false)}
        memory={memory}
        onUpdateMemory={setMemory}
        accentColor={accentColor}
      />

      {/* Agent Rules Modal */}
      <AgentRulesModal
        isOpen={isRulesOpen}
        onClose={() => setIsRulesOpen(false)}
        rules={agentRules}
        onUpdateRules={setAgentRules}
        accentColor={accentColor}
      />

      {/* Task History Drawer */}
      <TaskHistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        tasks={taskHistory}
        onSelectTask={(task) => {
          setTaskTitle(task.title);
          setPlanSteps(task.plan.length > 0 ? task.plan : generatePlanForPrompt(task.title, 'creation'));
          setTimelineEvents(task.events.length > 0 ? task.events : []);
          setChangeGroups(task.changeGroups.length > 0 ? task.changeGroups : AUTH_CHANGE_GROUPS);
          setAgentStatus(task.status === 'completed' ? 'complete' : 'blocked');
          setIsReviewMode(true);
        }}
        onRestoreSnapshot={(taskId) => {
          if (currentSnapshot) {
            handleRestoreSnapshot(currentSnapshot);
          }
        }}
        accentColor={accentColor}
      />

      {/* Global Intent Palette (⌘K) */}
      <IntentPalette
        isOpen={isIntentOpen}
        onClose={() => setIsIntentOpen(false)}
        onExecuteIntent={(intentStr) => handleStartTask(intentStr)}
        accentColor={accentColor}
      />

      {/* Accent Color Picker */}
      <AccentPicker
        isOpen={isAccentPickerOpen}
        onClose={() => setIsAccentPickerOpen(false)}
        currentAccent={accentColor}
        onChangeAccent={setAccentColor}
      />

      {/* Interface Preview Gallery */}
      <PreviewModal
        isOpen={isPreviewModalOpen}
        onClose={() => setIsPreviewModalOpen(false)}
        accentColor={accentColor}
      />
    </div>
  );
}
