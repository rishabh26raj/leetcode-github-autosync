import type { StorageData, ExtensionSettings, SyncRecord, GitHubUser } from '../types';
import { STORAGE_KEYS, DEFAULT_SETTINGS, MAX_SYNC_RECORDS } from './constants';

/**
 * Type-safe wrapper around chrome.storage.local.
 */
const storage = {
  async get<T>(key: string): Promise<T | null> {
    const result = await chrome.storage.local.get(key);
    return (result[key] as T) ?? null;
  },

  async set<T>(key: string, value: T): Promise<void> {
    await chrome.storage.local.set({ [key]: value });
  },

  async remove(key: string): Promise<void> {
    await chrome.storage.local.remove(key);
  },

  async clear(): Promise<void> {
    await chrome.storage.local.clear();
  },
};

// ─── Token ───────────────────────────────────────────────────────────────────

export async function getToken(): Promise<string | null> {
  return storage.get<string>(STORAGE_KEYS.GITHUB_TOKEN);
}

export async function setToken(token: string): Promise<void> {
  return storage.set(STORAGE_KEYS.GITHUB_TOKEN, token);
}

export async function removeToken(): Promise<void> {
  return storage.remove(STORAGE_KEYS.GITHUB_TOKEN);
}

// ─── GitHub User ─────────────────────────────────────────────────────────────

export async function getGitHubUser(): Promise<GitHubUser | null> {
  return storage.get<GitHubUser>(STORAGE_KEYS.GITHUB_USER);
}

export async function setGitHubUser(user: GitHubUser): Promise<void> {
  return storage.set(STORAGE_KEYS.GITHUB_USER, user);
}

export async function removeGitHubUser(): Promise<void> {
  return storage.remove(STORAGE_KEYS.GITHUB_USER);
}

// ─── Settings ────────────────────────────────────────────────────────────────

export async function getSettings(): Promise<ExtensionSettings> {
  const settings = await storage.get<ExtensionSettings>(STORAGE_KEYS.SETTINGS);
  return settings ?? { ...DEFAULT_SETTINGS };
}

export async function updateSettings(partial: Partial<ExtensionSettings>): Promise<ExtensionSettings> {
  const current = await getSettings();
  const updated = { ...current, ...partial };
  await storage.set(STORAGE_KEYS.SETTINGS, updated);
  return updated;
}

// ─── Sync Records ────────────────────────────────────────────────────────────

export async function getSyncRecords(): Promise<SyncRecord[]> {
  const records = await storage.get<SyncRecord[]>(STORAGE_KEYS.SYNC_RECORDS);
  return records ?? [];
}

export async function addSyncRecord(record: SyncRecord): Promise<void> {
  const records = await getSyncRecords();
  records.unshift(record);
  // Keep only the most recent records
  if (records.length > MAX_SYNC_RECORDS) {
    records.length = MAX_SYNC_RECORDS;
  }
  await storage.set(STORAGE_KEYS.SYNC_RECORDS, records);
}

// ─── Deduplication Hashes ────────────────────────────────────────────────────

export async function getSyncedHashes(): Promise<string[]> {
  const hashes = await storage.get<string[]>(STORAGE_KEYS.SYNCED_HASHES);
  return hashes ?? [];
}

export async function addSyncedHash(hash: string): Promise<void> {
  const hashes = await getSyncedHashes();
  if (!hashes.includes(hash)) {
    hashes.push(hash);
    await storage.set(STORAGE_KEYS.SYNCED_HASHES, hashes);
  }
}

export async function isAlreadySynced(hash: string): Promise<boolean> {
  const hashes = await getSyncedHashes();
  return hashes.includes(hash);
}

// ─── Full State ──────────────────────────────────────────────────────────────

export async function getFullState(): Promise<StorageData> {
  const [githubToken, githubUser, settings, syncRecords, syncedHashes] = await Promise.all([
    getToken(),
    getGitHubUser(),
    getSettings(),
    getSyncRecords(),
    getSyncedHashes(),
  ]);
  return {
    githubToken,
    githubUser,
    settings,
    syncRecords,
    syncedHashes,
  };
}

export async function clearAllData(): Promise<void> {
  await storage.clear();
}

export default storage;
