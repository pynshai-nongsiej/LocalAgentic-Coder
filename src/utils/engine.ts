import {
  IntentType,
  PlanStep,
  TimelineEvent,
  ContextItem,
  ChangeGroup,
  VerificationState,
} from '../types';
import { AUTH_CHANGE_GROUPS, AUTH_VERIFICATION } from '../data/mockWorkspace';

export function classifyIntent(prompt: string): IntentType {
  const p = prompt.toLowerCase();
  if (p.includes('fix') || p.includes('bug') || p.includes('error') || p.includes('failing')) {
    return 'debugging';
  }
  if (p.includes('test') || p.includes('vitest') || p.includes('coverage') || p.includes('spec')) {
    return 'testing';
  }
  if (p.includes('refactor') || p.includes('clean') || p.includes('reorganize') || p.includes('modular')) {
    return 'refactoring';
  }
  if (p.includes('investigate') || p.includes('why') || p.includes('inspect') || p.includes('trace')) {
    return 'investigation';
  }
  if (p.includes('review') || p.includes('audit') || p.includes('security') || p.includes('challenge')) {
    return 'review';
  }
  if (p.includes('doc') || p.includes('readme') || p.includes('comment')) {
    return 'documentation';
  }
  if (p.includes('architect') || p.includes('design') || p.includes('schema') || p.includes('structure')) {
    return 'architecture';
  }
  if (p.includes('add') || p.includes('modify') || p.includes('update') || p.includes('change')) {
    return 'modification';
  }
  return 'creation';
}

export function generatePlanForPrompt(prompt: string, intent: IntentType): PlanStep[] {
  const p = prompt.toLowerCase();

  if (p.includes('auth') || p.includes('login') || p.includes('session')) {
    return [
      {
        id: 'step-1',
        number: '01',
        title: 'Inspect existing user model & DB schema',
        description: 'Check user/model.ts and db/sqlite.ts for existing user definitions and table layout.',
        status: 'pending',
        evidence: {
          files: ['user/model.ts', 'db/sqlite.ts'],
          outputSummary: 'Found User interface. Sessions table already defined in sqlite.ts.',
        },
      },
      {
        id: 'step-2',
        number: '02',
        title: 'Add session storage abstraction',
        description: 'Define 32-byte cryptographic token generator and database storage queries.',
        status: 'pending',
        evidence: {
          files: ['auth/service.ts'],
          outputSummary: 'Implemented createSession with 7-day TTL and crypto.randomBytes entropy.',
        },
      },
      {
        id: 'step-3',
        number: '03',
        title: 'Implement login and logout handlers',
        description: 'Expose POST /login and POST /logout with secure HTTP-only cookie support.',
        status: 'pending',
        evidence: {
          files: ['auth/routes.ts'],
          outputSummary: 'Bound routes to authenticateUser and revokeSession.',
        },
      },
      {
        id: 'step-4',
        number: '04',
        title: 'Add authentication middleware',
        description: 'Protect routes with Bearer token inspection and session validity check.',
        status: 'pending',
        evidence: {
          files: ['auth/middleware.ts'],
          outputSummary: 'Created requireAuth middleware yielding 401 on missing or expired tokens.',
        },
      },
      {
        id: 'step-5',
        number: '05',
        title: 'Update protected routes & configuration',
        description: 'Attach middleware to protected endpoints and define session config object.',
        status: 'pending',
        evidence: {
          files: ['auth/session.ts'],
          outputSummary: 'Exported defaultSessionConfig with environment-guarded secure flag.',
        },
      },
      {
        id: 'step-6',
        number: '06',
        title: 'Add unit and integration tests',
        description: 'Create test fixtures for authentication flow, token expiration, and revocation.',
        status: 'pending',
        evidence: {
          files: ['tests/auth.test.ts'],
          outputSummary: 'Written 4 Vitest test cases across isolated in-memory DB.',
        },
      },
      {
        id: 'step-7',
        number: '07',
        title: 'Run verification suite',
        description: 'Execute typecheck, linter, tests, and build check to ensure zero regressions.',
        status: 'pending',
        evidence: {
          outputSummary: 'All 5 verification checks passed cleanly in 4.13s.',
        },
      },
    ];
  }

  if (intent === 'debugging') {
    return [
      {
        id: 'step-1',
        number: '01',
        title: 'Inspect failing test logs and stack traces',
        description: 'Capture test runner output and pinpoint failing assertions.',
        status: 'pending',
      },
      {
        id: 'step-2',
        number: '02',
        title: 'Isolate root cause in target module',
        description: 'Analyze code paths leading to unexpected exception or assertion failure.',
        status: 'pending',
      },
      {
        id: 'step-3',
        number: '03',
        title: 'Apply targeted patch',
        description: 'Update logic to handle edge cases without altering surrounding API contracts.',
        status: 'pending',
      },
      {
        id: 'step-4',
        number: '04',
        title: 'Re-run affected tests',
        description: 'Verify fix passes tests and doesn’t introduce regressions.',
        status: 'pending',
      },
      {
        id: 'step-5',
        number: '05',
        title: 'Run full verification suite',
        description: 'Typecheck, formatting, and full workspace test suite.',
        status: 'pending',
      },
    ];
  }

  if (intent === 'refactoring') {
    return [
      {
        id: 'step-1',
        number: '01',
        title: 'Audit current module coupling and dependencies',
        description: 'Map internal function calls and state mutations.',
        status: 'pending',
      },
      {
        id: 'step-2',
        number: '02',
        title: 'Extract clean abstraction layer',
        description: 'Refactor into decoupled pure functions or service boundaries.',
        status: 'pending',
      },
      {
        id: 'step-3',
        number: '03',
        title: 'Update consumer call sites',
        description: 'Migrate existing handlers to new signature.',
        status: 'pending',
      },
      {
        id: 'step-4',
        number: '04',
        title: 'Verify test coverage and invariants',
        description: 'Ensure existing tests continue to pass without behavioral change.',
        status: 'pending',
      },
    ];
  }

  // Generic dynamic plan
  return [
    {
      id: 'step-1',
      number: '01',
      title: 'Analyze project context & requirements',
      description: `Evaluate objective: "${prompt.slice(0, 60)}" against project memory.`,
      status: 'pending',
    },
    {
      id: 'step-2',
      number: '02',
      title: 'Formulate implementation architecture',
      description: 'Select minimal set of target files and define state transitions.',
      status: 'pending',
    },
    {
      id: 'step-3',
      number: '03',
      title: 'Execute code modifications',
      description: 'Write type-safe implementation adhering to project conventions.',
      status: 'pending',
    },
    {
      id: 'step-4',
      number: '04',
      title: 'Validate with automated test suite',
      description: 'Run Vitest and verify behavior.',
      status: 'pending',
    },
    {
      id: 'step-5',
      number: '05',
      title: 'Perform end-to-end verification',
      description: 'Linter, strict typecheck, and build pipeline.',
      status: 'pending',
    },
  ];
}

export function getAutoContext(prompt: string): ContextItem[] {
  const p = prompt.toLowerCase();
  const items: ContextItem[] = [];

  if (p.includes('auth') || p.includes('login') || p.includes('session') || p.includes('user')) {
    items.push(
      {
        id: 'ctx-1',
        type: 'file',
        name: 'auth/service.ts',
        path: 'auth/service.ts',
        relevanceReason: 'Primary credential verification and session lifecycle handlers',
        autoDetected: true,
      },
      {
        id: 'ctx-2',
        type: 'file',
        name: 'auth/routes.ts',
        path: 'auth/routes.ts',
        relevanceReason: 'HTTP route controllers for /login and /logout',
        autoDetected: true,
      },
      {
        id: 'ctx-3',
        type: 'file',
        name: 'user/model.ts',
        path: 'user/model.ts',
        relevanceReason: 'User schema and Session type definitions',
        autoDetected: true,
      },
      {
        id: 'ctx-4',
        type: 'file',
        name: 'tests/auth.test.ts',
        path: 'tests/auth.test.ts',
        relevanceReason: 'Existing test specs for auth behavior',
        autoDetected: true,
      }
    );
  } else {
    items.push(
      {
        id: 'ctx-1',
        type: 'file',
        name: 'db/sqlite.ts',
        path: 'db/sqlite.ts',
        relevanceReason: 'Database connection instance and query primitives',
        autoDetected: true,
      },
      {
        id: 'ctx-2',
        type: 'file',
        name: 'package.json',
        path: 'package.json',
        relevanceReason: 'Dependencies and scripts configuration',
        autoDetected: true,
      }
    );
  }
  return items;
}

export function formatTimestamp(date: Date = new Date()): string {
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}
