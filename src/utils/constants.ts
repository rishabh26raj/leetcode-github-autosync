// ─── API URLs ────────────────────────────────────────────────────────────────

export const GITHUB_API_BASE = 'https://api.github.com';
export const LEETCODE_BASE = 'https://leetcode.com';
export const LEETCODE_GRAPHQL = 'https://leetcode.com/graphql';

// ─── Storage Keys ────────────────────────────────────────────────────────────

export const STORAGE_KEYS = {
  GITHUB_TOKEN: 'githubToken',
  GITHUB_USER: 'githubUser',
  SETTINGS: 'settings',
  SYNC_RECORDS: 'syncRecords',
  SYNCED_HASHES: 'syncedHashes',
} as const;

// ─── Default Settings ────────────────────────────────────────────────────────

export const DEFAULT_SETTINGS = {
  autoSync: true,
  repoVisibility: 'public' as const,
  repoName: null,
};

// ─── Language → File Extension Mapping ───────────────────────────────────────

export const LANGUAGE_EXTENSIONS: Record<string, string> = {
  'python': '.py',
  'python3': '.py',
  'java': '.java',
  'cpp': '.cpp',
  'c++': '.cpp',
  'c': '.c',
  'javascript': '.js',
  'typescript': '.ts',
  'go': '.go',
  'golang': '.go',
  'rust': '.rs',
  'swift': '.swift',
  'kotlin': '.kt',
  'scala': '.scala',
  'ruby': '.rb',
  'php': '.php',
  'csharp': '.cs',
  'c#': '.cs',
  'dart': '.dart',
  'elixir': '.ex',
  'erlang': '.erl',
  'haskell': '.hs',
  'lua': '.lua',
  'perl': '.pl',
  'r': '.r',
  'racket': '.rkt',
  'sql': '.sql',
  'mysql': '.sql',
  'mssql': '.sql',
  'oraclesql': '.sql',
  'bash': '.sh',
  'shell': '.sh',
  'objective-c': '.m',
  'objectivec': '.m',
};

// ─── Commit Message Templates ────────────────────────────────────────────────

export const COMMIT_MESSAGE_TEMPLATE = 'Add: {number}. {title} ({difficulty}) [{language}]';
export const UPDATE_COMMIT_MESSAGE_TEMPLATE = 'Update: {number}. {title} ({difficulty}) [{language}]';

// ─── Extension Constants ─────────────────────────────────────────────────────

export const POPUP_WIDTH = 400;
export const POPUP_HEIGHT = 540;
export const MAX_SYNC_RECORDS = 50;
