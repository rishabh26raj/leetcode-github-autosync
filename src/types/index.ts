// ─── LeetCode Submission ─────────────────────────────────────────────────────

export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export interface LeetCodeSubmission {
  problemNumber: number;
  problemTitle: string;
  titleSlug: string;
  difficulty: Difficulty;
  language: string;
  code: string;
  timestamp: number;
  runtime?: string;
  memory?: string;
  description?: string;
}

// ─── GitHub ──────────────────────────────────────────────────────────────────

export interface GitHubUser {
  username: string;
  avatarUrl: string;
  profileUrl: string;
}

export interface GitHubFileContent {
  sha: string;
  content: string;
  encoding: string;
}

// ─── Sync Records ────────────────────────────────────────────────────────────

export interface SyncRecord {
  problemNumber: number;
  problemTitle: string;
  difficulty: Difficulty;
  language: string;
  commitUrl: string;
  timestamp: number;
  filePath: string;
}

// ─── Settings ────────────────────────────────────────────────────────────────

export interface ExtensionSettings {
  autoSync: boolean;
  repoVisibility: 'public' | 'private';
  repoName: string | null;
}

// ─── Storage ─────────────────────────────────────────────────────────────────

export interface StorageData {
  githubToken: string | null;
  githubUser: GitHubUser | null;
  settings: ExtensionSettings;
  syncRecords: SyncRecord[];
  syncedHashes: string[];
}

// ─── Messages ────────────────────────────────────────────────────────────────

export interface SubmissionAcceptedMessage {
  type: 'SUBMISSION_ACCEPTED';
  payload: LeetCodeSubmission;
}

export interface AuthTokenSetMessage {
  type: 'AUTH_TOKEN_SET';
  payload: { token: string };
}

export interface AuthDisconnectMessage {
  type: 'AUTH_DISCONNECT';
}

export interface SyncNowMessage {
  type: 'SYNC_NOW';
  payload: LeetCodeSubmission;
}

export interface GetStatusMessage {
  type: 'GET_STATUS';
}

export type ExtensionMessage =
  | SubmissionAcceptedMessage
  | AuthTokenSetMessage
  | AuthDisconnectMessage
  | SyncNowMessage
  | GetStatusMessage;

// ─── Message Responses ───────────────────────────────────────────────────────

export interface AuthResponse {
  success: boolean;
  user?: GitHubUser;
  error?: string;
}

export interface SyncResponse {
  success: boolean;
  commitUrl?: string;
  error?: string;
  isDuplicate?: boolean;
}

export interface StatusResponse {
  isAuthenticated: boolean;
  user: GitHubUser | null;
  repoName: string | null;
  syncRecords: SyncRecord[];
  settings: ExtensionSettings;
}
