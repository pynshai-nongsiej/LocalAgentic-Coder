export type AgentStatus =
  | 'idle'
  | 'thinking'
  | 'planning'
  | 'executing'
  | 'waiting'
  | 'blocked'
  | 'complete';

export type AutonomyMode = 'ASK' | 'GUIDED' | 'AUTO' | 'FULL';

export type IntentType =
  | 'creation'
  | 'modification'
  | 'debugging'
  | 'investigation'
  | 'refactoring'
  | 'testing'
  | 'documentation'
  | 'architecture'
  | 'review';

export interface PlanStep {
  id: string;
  number: string;
  title: string;
  description: string;
  status: 'pending' | 'active' | 'completed' | 'failed';
  instruction?: string;
  evidence?: {
    files?: string[];
    outputSummary?: string;
    details?: string;
  };
}

export type ToolType =
  | 'READ'
  | 'WRITE'
  | 'SEARCH'
  | 'EXECUTE'
  | 'TEST'
  | 'BUILD'
  | 'GIT'
  | 'LINTER'
  | 'PLAN'
  | 'INSPECT'
  | 'VERIFY'
  | 'STATUS';

export interface TimelineEvent {
  id: string;
  timestamp: string;
  type: ToolType;
  label: string;
  detail?: string;
  rawOutput?: string;
  duration?: string;
  status?: 'success' | 'failure' | 'in_progress';
  file?: string;
  diff?: {
    added: number;
    removed: number;
    patch?: string;
  };
}

export interface ContextItem {
  id: string;
  type: 'file' | 'folder' | 'selection' | 'terminal' | 'git_diff' | 'issue';
  name: string;
  path: string;
  preview?: string;
  relevanceReason?: string;
  autoDetected?: boolean;
}

export interface DiffLine {
  type: 'add' | 'remove' | 'normal';
  content: string;
  oldLineNumber?: number;
  newLineNumber?: number;
}

export interface FileChange {
  path: string;
  status: 'modified' | 'added' | 'deleted';
  added: number;
  removed: number;
  why: string;
  what: string;
  impact: string;
  tested: boolean;
  originalContent: string;
  modifiedContent: string;
  diffLines: DiffLine[];
}

export interface ChangeGroup {
  intent: string;
  fileCount: number;
  addedLines: number;
  removedLines: number;
  files: FileChange[];
}

export interface VerificationItem {
  passed: boolean;
  label: string;
  duration: string;
  detail?: string;
  failures?: string[];
}

export interface VerificationState {
  formatting: VerificationItem;
  typecheck: VerificationItem;
  unitTests: VerificationItem;
  integrationTests: VerificationItem;
  build: VerificationItem;
  allPassed: boolean;
}

export interface PermissionsState {
  files: 'WRITE' | 'READ' | 'BLOCKED';
  terminal: 'EXECUTE' | 'PROMPT' | 'BLOCKED';
  network: 'BLOCKED' | 'ALLOWED' | 'PROMPT';
  git: 'WRITE' | 'READ' | 'BLOCKED';
  database: 'LOCAL' | 'MOCK' | 'BLOCKED';
  browser: 'LOCAL' | 'BLOCKED';
}

export interface TaskSnapshot {
  id: string;
  taskTitle: string;
  timestamp: string;
  description: string;
  filesSnapshot: Record<string, string>;
}

export interface TaskHistoryItem {
  id: string;
  title: string;
  timestamp: string;
  status: 'completed' | 'stopped' | 'failed';
  duration: string;
  filesChanged: number;
  added: number;
  removed: number;
  plan: PlanStep[];
  events: TimelineEvent[];
  changeGroups: ChangeGroup[];
}

export interface ProjectMemory {
  architecture: string[];
  conventions: string[];
  preferences: string[];
  notes: string[];
}

export interface LocalModelInfo {
  name: string;
  provider: string;
  contextWindow: string;
  device: string;
  status: 'READY' | 'LOADING' | 'BUSY';
  temperature: number;
  speed: string;
  activeContextTokens: number;
}

export interface TraceNode {
  name: string;
  file: string;
  line: number;
  role: string;
}

export interface ChallengeIssue {
  id: string;
  title: string;
  file: string;
  line: number;
  severity: 'low' | 'medium' | 'high';
  description: string;
  fixSuggestion: string;
}
