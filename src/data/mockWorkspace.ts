import {
  ChangeGroup,
  FileChange,
  PlanStep,
  ProjectMemory,
  TimelineEvent,
  VerificationState,
  TraceNode,
  ChallengeIssue,
} from '../types';

export interface ProjectWorkspace {
  id: string;
  name: string;
  branch: string;
  rootPath: string;
  description: string;
  fileTree: string[];
}

export const WORKSPACES: ProjectWorkspace[] = [
  {
    id: 'my-app',
    name: 'my-app',
    branch: 'main',
    rootPath: '~/projects/my-app',
    description: 'Local services core with SQLite and Express',
    fileTree: [
      'auth/service.ts',
      'auth/routes.ts',
      'auth/session.ts',
      'auth/middleware.ts',
      'user/model.ts',
      'db/sqlite.ts',
      'tests/auth.test.ts',
      'tests/session.test.ts',
      'package.json',
      'tsconfig.json',
      '.agentrules',
    ],
  },
  {
    id: 'analytics-engine',
    name: 'analytics-engine',
    branch: 'feat/aggregations',
    rootPath: '~/projects/analytics-engine',
    description: 'High-throughput time-series analytics worker',
    fileTree: [
      'src/worker.ts',
      'src/pipeline.ts',
      'src/metrics.ts',
      'tests/metrics.test.ts',
      'Cargo.toml',
    ],
  },
  {
    id: 'payment-gateway',
    name: 'payment-gateway',
    branch: 'main',
    rootPath: '~/projects/payment-gateway',
    description: 'Idempotent ledger integration service',
    fileTree: [
      'ledger/transaction.ts',
      'ledger/reconcile.ts',
      'api/webhook.ts',
      'tests/reconcile.test.ts',
    ],
  },
];

export const INITIAL_PROJECT_MEMORY: ProjectMemory = {
  architecture: [
    'Express backend with modular route controllers',
    'SQLite database using better-sqlite3 with WAL mode enabled',
    'Session storage via cryptographically random 32-byte tokens in memory-backed table',
  ],
  conventions: [
    'TypeScript strict mode enabled across all source modules',
    'Vitest for test suites with isolated in-memory DB fixtures',
    'ESLint flat configuration with zero warnings tolerated',
    'Explicit return types on all exported service handlers',
  ],
  preferences: [
    'No heavy ORM; direct typed SQL queries with parameter bindings',
    'Functional services and pure utility functions over OOP classes',
    'Fail early with explicit error types rather than catching silently',
  ],
  notes: [
    'Project migrated from raw cookie parser to Bearer token header on 2026-08-14',
    'Database migrations are sequentially numbered in db/migrations/',
  ],
};

export const INITIAL_AGENT_RULES = [
  'Always use TypeScript strict mode without "any" or loose assertions.',
  'Never modify generated files (e.g. dist/, coverage/, build/).',
  'Run tests after backend and auth changes before declaring completion.',
  'Do not install external dependencies without explicit user confirmation.',
  'Never access external networks unless explicitly escalated in permission strip.',
  'Preserve existing database schemas unless a new migration file is created.',
];

export const WORKSPACE_FILES: Record<string, string> = {
  'auth/service.ts': `import { query, run } from '../db/sqlite';
import { User, Session } from '../user/model';
import crypto from 'node:crypto';

export async function authenticateUser(email: string, passHash: string): Promise<User | null> {
  const row = query<User>('SELECT id, email, role, created_at FROM users WHERE email = ? AND password_hash = ?', [email, passHash]);
  return row[0] ?? null;
}

export async function createSession(userId: string): Promise<Session> {
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7); // 7 days

  run('INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)', [
    token,
    userId,
    expiresAt.toISOString(),
  ]);

  return { token, userId, expiresAt };
}

export async function validateSession(token: string): Promise<User | null> {
  const session = query<{ user_id: string; expires_at: string }>(
    'SELECT user_id, expires_at FROM sessions WHERE token = ?',
    [token]
  )[0];

  if (!session) return null;
  if (new Date(session.expires_at) < new Date()) {
    run('DELETE FROM sessions WHERE token = ?', [token]);
    return null;
  }

  const user = query<User>('SELECT id, email, role, created_at FROM users WHERE id = ?', [session.user_id])[0];
  return user ?? null;
}

export async function revokeSession(token: string): Promise<void> {
  run('DELETE FROM sessions WHERE token = ?', [token]);
}
`,

  'auth/routes.ts': `import { Router, Request, Response } from 'express';
import { authenticateUser, createSession, revokeSession } from './service';
import { requireAuth } from './middleware';

export const authRouter = Router();

authRouter.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Missing credentials' });
  }

  const user = await authenticateUser(email, password);
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const session = await createSession(user.id);
  res.cookie('session_token', session.token, {
    httpOnly: true,
    sameSite: 'lax',
    expires: session.expiresAt,
  });

  return res.json({ user, token: session.token });
});

authRouter.post('/logout', requireAuth, async (req: Request, res: Response) => {
  const token = req.headers.authorization?.replace('Bearer ', '') || req.cookies?.session_token;
  if (token) {
    await revokeSession(token);
  }
  res.clearCookie('session_token');
  return res.status(204).end();
});
`,

  'auth/middleware.ts': `import { Request, Response, NextFunction } from 'express';
import { validateSession } from './service';

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ')
    ? authHeader.slice(7)
    : req.cookies?.session_token;

  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const user = await validateSession(token);
  if (!user) {
    return res.status(401).json({ error: 'Session expired or invalid' });
  }

  (req as any).user = user;
  next();
}
`,

  'auth/session.ts': `export interface SessionConfig {
  ttlSeconds: number;
  cookieName: string;
  secure: boolean;
}

export const defaultSessionConfig: SessionConfig = {
  ttlSeconds: 604800, // 7 days
  cookieName: 'session_token',
  secure: process.env.NODE_ENV === 'production',
};
`,

  'user/model.ts': `export interface User {
  id: string;
  email: string;
  role: 'admin' | 'member';
  created_at: string;
}

export interface Session {
  token: string;
  userId: string;
  expiresAt: Date;
}
`,

  'db/sqlite.ts': `import Database from 'better-sqlite3';

export const db = new Database(':memory:');
db.pragma('journal_mode = WAL');

db.exec(\`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT DEFAULT 'member',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS sessions (
    token TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at DATETIME NOT NULL
  );
\`);

export function query<T>(sql: string, params: any[] = []): T[] {
  return db.prepare(sql).all(...params) as T[];
}

export function run(sql: string, params: any[] = []) {
  return db.prepare(sql).run(...params);
}
`,

  'tests/auth.test.ts': `import { describe, it, expect, beforeEach } from 'vitest';
import { authenticateUser, createSession, validateSession, revokeSession } from '../auth/service';
import { run } from '../db/sqlite';

describe('Auth Service', () => {
  beforeEach(() => {
    run('DELETE FROM sessions');
    run('DELETE FROM users');
    run("INSERT INTO users (id, email, password_hash) VALUES ('u1', 'dev@local.host', 'hashed_pw')");
  });

  it('authenticates valid credentials', async () => {
    const user = await authenticateUser('dev@local.host', 'hashed_pw');
    expect(user).not.toBeNull();
    expect(user?.email).toBe('dev@local.host');
  });

  it('creates and validates session', async () => {
    const session = await createSession('u1');
    expect(session.token).toHaveLength(64);

    const validated = await validateSession(session.token);
    expect(validated?.id).toBe('u1');
  });

  it('revokes session properly', async () => {
    const session = await createSession('u1');
    await revokeSession(session.token);
    const validated = await validateSession(session.token);
    expect(validated).toBeNull();
  });
});
`,
};

// Trace tree for authenticateUser
export const AUTH_FUNCTION_TRACE: TraceNode[] = [
  { name: 'POST /auth/login', file: 'auth/routes.ts', line: 8, role: 'Route Handler' },
  { name: 'authenticateUser()', file: 'auth/service.ts', line: 5, role: 'Credential Validator' },
  { name: 'db.query("SELECT ... FROM users")', file: 'db/sqlite.ts', line: 22, role: 'Storage Execution' },
  { name: 'createSession()', file: 'auth/service.ts', line: 10, role: 'Token Issuer' },
  { name: 'crypto.randomBytes(32)', file: 'node:crypto', line: 11, role: 'Entropy Source' },
  { name: 'res.cookie("session_token")', file: 'auth/routes.ts', line: 20, role: 'HTTP Response Boundary' },
];

export const AUTH_CHALLENGES: ChallengeIssue[] = [
  {
    id: 'ch-1',
    title: 'Potential race condition on concurrent session renewal',
    file: 'auth/service.ts',
    line: 28,
    severity: 'medium',
    description: 'Simultaneous queries with an expiring token can trigger multiple deletion statements without row-level locking.',
    fixSuggestion: 'Wrap expired session check and delete in a single atomic transaction block.',
  },
  {
    id: 'ch-2',
    title: 'Plaintext string comparison instead of timing-safe eq',
    file: 'auth/service.ts',
    line: 6,
    severity: 'high',
    description: 'Password hash matching relies on SQL string comparison instead of crypto.timingSafeEqual.',
    fixSuggestion: 'Retrieve user record by email only and compare password_hash via crypto.timingSafeEqual.',
  },
  {
    id: 'ch-3',
    title: 'Missing expiration header on session revocation response',
    file: 'auth/routes.ts',
    line: 35,
    severity: 'low',
    description: 'Logout clears the cookie value without explicitly overriding Max-Age=0 in older client caches.',
    fixSuggestion: 'Pass maxAge: 0 to res.clearCookie options.',
  },
];

// Pre-defined realistic test run verification
export const AUTH_VERIFICATION: VerificationState = {
  formatting: { passed: true, label: 'Prettier format check', duration: '0.14s' },
  typecheck: { passed: true, label: 'TypeScript strict mode (tsc --noEmit)', duration: '0.82s' },
  unitTests: { passed: true, label: 'Vitest unit tests (14 passed)', duration: '1.24s' },
  integrationTests: { passed: true, label: 'HTTP integration tests (28 passed)', duration: '1.45s' },
  build: { passed: true, label: 'Vite production build', duration: '0.48s' },
  allPassed: true,
};

export const AUTH_CHANGE_GROUPS: ChangeGroup[] = [
  {
    intent: 'AUTHENTICATION',
    fileCount: 4,
    addedLines: 184,
    removedLines: 32,
    files: [
      {
        path: 'auth/service.ts',
        status: 'modified',
        added: 42,
        removed: 8,
        why: 'The existing login route directly queries the user table and lacked session persistence. I reused the existing database abstraction instead of introducing another ORM.',
        what: 'Added authenticateUser, createSession, validateSession, and revokeSession with 32-byte cryptographic entropy.',
        impact: 'Provides secure stateful sessions stored directly in the local SQLite database with automatic expiration cleanup.',
        tested: true,
        originalContent: `export async function authenticateUser(email: string) {\n  return db.query('SELECT * FROM users WHERE email = ?', [email]);\n}`,
        modifiedContent: WORKSPACE_FILES['auth/service.ts'],
        diffLines: [
          { type: 'normal', content: "import { query, run } from '../db/sqlite';", oldLineNumber: 1, newLineNumber: 1 },
          { type: 'remove', content: '- export async function authenticateUser(email: string) {', oldLineNumber: 2 },
          { type: 'remove', content: "-   return db.query('SELECT * FROM users WHERE email = ?', [email]);", oldLineNumber: 3 },
          { type: 'remove', content: '- }', oldLineNumber: 4 },
          { type: 'add', content: '+ export async function authenticateUser(email: string, passHash: string): Promise<User | null> {', newLineNumber: 5 },
          { type: 'add', content: "+   const row = query<User>('SELECT id, email, role, created_at FROM users WHERE email = ? AND password_hash = ?', [email, passHash]);", newLineNumber: 6 },
          { type: 'add', content: '+   return row[0] ?? null;', newLineNumber: 7 },
          { type: 'add', content: '+ }', newLineNumber: 8 },
          { type: 'add', content: '+ ', newLineNumber: 9 },
          { type: 'add', content: '+ export async function createSession(userId: string): Promise<Session> {', newLineNumber: 10 },
          { type: 'add', content: "+   const token = crypto.randomBytes(32).toString('hex');", newLineNumber: 11 },
          { type: 'add', content: '+   const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7);', newLineNumber: 12 },
          { type: 'add', content: "+   run('INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)', [token, userId, expiresAt.toISOString()]);", newLineNumber: 13 },
          { type: 'add', content: '+   return { token, userId, expiresAt };', newLineNumber: 14 },
          { type: 'add', content: '+ }', newLineNumber: 15 },
        ],
      },
      {
        path: 'auth/middleware.ts',
        status: 'added',
        added: 26,
        removed: 0,
        why: 'Route protection requires a lightweight middleware that extracts Bearer headers or fallback cookies.',
        what: 'Implemented requireAuth middleware verifying session tokens against SQLite with 401 response guard.',
        impact: 'Secures private routes across the entire Express router hierarchy.',
        tested: true,
        originalContent: '',
        modifiedContent: WORKSPACE_FILES['auth/middleware.ts'],
        diffLines: [
          { type: 'add', content: "+ import { Request, Response, NextFunction } from 'express';", newLineNumber: 1 },
          { type: 'add', content: "+ import { validateSession } from './service';", newLineNumber: 2 },
          { type: 'add', content: '+ export async function requireAuth(req: Request, res: Response, next: NextFunction) {', newLineNumber: 3 },
          { type: 'add', content: '+   const token = req.headers.authorization?.slice(7) || req.cookies?.session_token;', newLineNumber: 4 },
          { type: 'add', content: '+   if (!token) return res.status(401).json({ error: "Authentication required" });', newLineNumber: 5 },
          { type: 'add', content: '+   const user = await validateSession(token);', newLineNumber: 6 },
          { type: 'add', content: '+   if (!user) return res.status(401).json({ error: "Session expired" });', newLineNumber: 7 },
          { type: 'add', content: '+   (req as any).user = user; next();', newLineNumber: 8 },
          { type: 'add', content: '+ }', newLineNumber: 9 },
        ],
      },
      {
        path: 'auth/routes.ts',
        status: 'modified',
        added: 48,
        removed: 14,
        why: 'Login endpoint needed to establish sessions and set secure HTTP-only cookies.',
        what: 'Added POST /login and POST /logout handlers wired directly to authentication service.',
        impact: 'Exposes production-ready login & logout endpoints compliant with CORS and cookie standards.',
        tested: true,
        originalContent: '// routes placeholder',
        modifiedContent: WORKSPACE_FILES['auth/routes.ts'],
        diffLines: [
          { type: 'add', content: "+ authRouter.post('/login', async (req: Request, res: Response) => {", newLineNumber: 8 },
          { type: 'add', content: '+   const { email, password } = req.body;', newLineNumber: 9 },
          { type: 'add', content: '+   const user = await authenticateUser(email, password);', newLineNumber: 12 },
          { type: 'add', content: '+   const session = await createSession(user.id);', newLineNumber: 15 },
          { type: 'add', content: "+   res.cookie('session_token', session.token, { httpOnly: true });", newLineNumber: 16 },
          { type: 'add', content: '+   return res.json({ user, token: session.token });', newLineNumber: 17 },
          { type: 'add', content: '+ });', newLineNumber: 18 },
        ],
      },
      {
        path: 'user/model.ts',
        status: 'modified',
        added: 12,
        removed: 2,
        why: 'Needed Session interface and user roles definition.',
        what: 'Extended User interface with role enum and defined Session interface.',
        impact: 'Strict type safety across the database and route boundaries.',
        tested: true,
        originalContent: 'export interface User { id: string; email: string; }',
        modifiedContent: WORKSPACE_FILES['user/model.ts'],
        diffLines: [
          { type: 'normal', content: 'export interface User {', oldLineNumber: 1, newLineNumber: 1 },
          { type: 'normal', content: '  id: string;', oldLineNumber: 2, newLineNumber: 2 },
          { type: 'normal', content: '  email: string;', oldLineNumber: 3, newLineNumber: 3 },
          { type: 'add', content: "  role: 'admin' | 'member';", newLineNumber: 4 },
          { type: 'add', content: '  created_at: string;', newLineNumber: 5 },
          { type: 'normal', content: '}', oldLineNumber: 4, newLineNumber: 6 },
          { type: 'add', content: 'export interface Session {', newLineNumber: 7 },
          { type: 'add', content: '  token: string;', newLineNumber: 8 },
          { type: 'add', content: '  userId: string;', newLineNumber: 9 },
          { type: 'add', content: '  expiresAt: Date;', newLineNumber: 10 },
          { type: 'add', content: '}', newLineNumber: 11 },
        ],
      },
    ],
  },
  {
    intent: 'TESTS',
    fileCount: 2,
    addedLines: 92,
    removedLines: 4,
    files: [
      {
        path: 'tests/auth.test.ts',
        status: 'modified',
        added: 58,
        removed: 4,
        why: 'Unit verification of session lifecycle, expiration, and credential checking.',
        what: 'Added 4 Vitest test cases validating login, session verification, expiration, and revocation.',
        impact: 'Guarantees zero regressions in authentication logic under test suite.',
        tested: true,
        originalContent: '// tests placeholder',
        modifiedContent: WORKSPACE_FILES['tests/auth.test.ts'],
        diffLines: [
          { type: 'add', content: "+ it('authenticates valid credentials', async () => {", newLineNumber: 12 },
          { type: 'add', content: "+   const user = await authenticateUser('dev@local.host', 'hashed_pw');", newLineNumber: 13 },
          { type: 'add', content: '+   expect(user).not.toBeNull();', newLineNumber: 14 },
          { type: 'add', content: '+ });', newLineNumber: 15 },
        ],
      },
    ],
  },
  {
    intent: 'CONFIGURATION',
    fileCount: 1,
    addedLines: 8,
    removedLines: 0,
    files: [
      {
        path: 'auth/session.ts',
        status: 'added',
        added: 8,
        removed: 0,
        why: 'Centralize session lifetime constants and cookie parameters.',
        what: 'Created session configuration object with 7-day TTL and production secure flag.',
        impact: 'Clean configuration decoupling without magic numbers in handlers.',
        tested: true,
        originalContent: '',
        modifiedContent: WORKSPACE_FILES['auth/session.ts'],
        diffLines: [
          { type: 'add', content: '+ export const defaultSessionConfig = {', newLineNumber: 1 },
          { type: 'add', content: '+   ttlSeconds: 604800, // 7 days', newLineNumber: 2 },
          { type: 'add', content: "+   cookieName: 'session_token',", newLineNumber: 3 },
          { type: 'add', content: '+ };', newLineNumber: 4 },
        ],
      },
    ],
  },
];
