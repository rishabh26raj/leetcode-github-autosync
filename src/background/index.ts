import type {
  ExtensionMessage,
  AuthResponse,
  SyncResponse,
  StatusResponse,
  LeetCodeSubmission,
  SyncRecord,
} from '../types';
import { authenticate, disconnect } from './auth';
import { getOrCreateRepo, getFileContent, createOrUpdateFile, updateReadme } from './github-api';
import {
  getGitHubUser,
  getSettings,
  getSyncRecords,
  addSyncRecord,
  isAlreadySynced,
  addSyncedHash,
} from '../utils/storage';
import { generateFilePath, generateCommitMessage, generateFileHeader, hashCode, generateProblemReadme } from '../utils/helpers';

/**
 * Handle syncing a submission to GitHub.
 */
async function handleSync(submission: LeetCodeSubmission): Promise<SyncResponse> {
  try {
    // 1. Check authentication
    const user = await getGitHubUser();
    if (!user) {
      return { success: false, error: 'Not authenticated. Please connect your GitHub account.' };
    }

    // 2. Check for duplicates
    const codeHash = await hashCode(submission.code);
    const problemKey = `${submission.problemNumber}-${submission.language}`;
    const dedupeHash = `${problemKey}:${codeHash}`;

    if (await isAlreadySynced(dedupeHash)) {
      return { success: true, isDuplicate: true };
    }

    // 3. Get or create repo
    const settings = await getSettings();
    const repoName = await getOrCreateRepo(
      user.username,
      settings.repoVisibility === 'private'
    );

    // 4. Generate file path and content
    const filePath = generateFilePath(submission);
    const fileHeader = generateFileHeader(submission);
    const fileContent = fileHeader + submission.code;

    // 5. Check if file already exists (for update vs create)
    const existing = await getFileContent(user.username, repoName, filePath);
    const isUpdate = existing !== null;
    const commitMessage = generateCommitMessage(submission, isUpdate);

    // 6. Create or update the file
    const result = await createOrUpdateFile(
      user.username,
      repoName,
      filePath,
      fileContent,
      commitMessage,
      existing?.sha
    );

    // 6b. Create/update problem README with description
    if (submission.description) {
      try {
        const folderPath = filePath.substring(0, filePath.lastIndexOf('/'));
        const readmePath = `${folderPath}/README.md`;
        const problemReadme = generateProblemReadme(submission);
        const existingReadme = await getFileContent(user.username, repoName, readmePath);
        await createOrUpdateFile(
          user.username,
          repoName,
          readmePath,
          problemReadme,
          `Add problem description for ${submission.problemNumber}. ${submission.problemTitle}`,
          existingReadme?.sha
        );
        console.log('Problem README created/updated');
      } catch {
        console.warn('Failed to create problem README, continuing...');
      }
    }

    // 7. Record the sync
    const syncRecord: SyncRecord = {
      problemNumber: submission.problemNumber,
      problemTitle: submission.problemTitle,
      difficulty: submission.difficulty,
      language: submission.language,
      commitUrl: result.commitUrl,
      timestamp: Date.now(),
      filePath,
    };

    await addSyncRecord(syncRecord);
    await addSyncedHash(dedupeHash);

    // 8. Update README with stats
    try {
      const records = await getSyncRecords();
      const uniqueProblems = new Set(records.map(r => r.problemNumber));
      const easyCount = new Set(records.filter(r => r.difficulty === 'Easy').map(r => r.problemNumber)).size;
      const mediumCount = new Set(records.filter(r => r.difficulty === 'Medium').map(r => r.problemNumber)).size;
      const hardCount = new Set(records.filter(r => r.difficulty === 'Hard').map(r => r.problemNumber)).size;

      await updateReadme(
        user.username,
        repoName,
        uniqueProblems.size,
        easyCount,
        mediumCount,
        hardCount
      );
    } catch {
      // README update is non-critical; don't fail the whole sync
      console.warn('Failed to update README, continuing...');
    }

    return { success: true, commitUrl: result.commitUrl };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error during sync';
    console.error('Sync error:', message);
    return { success: false, error: message };
  }
}

/**
 * Handle getting the current extension status.
 */
async function handleGetStatus(): Promise<StatusResponse> {
  const [user, settings, syncRecords] = await Promise.all([
    getGitHubUser(),
    getSettings(),
    getSyncRecords(),
  ]);

  return {
    isAuthenticated: user !== null,
    user,
    repoName: user ? `${user.username}-leetcode` : null,
    syncRecords,
    settings,
  };
}

// ─── Message Listener ────────────────────────────────────────────────────────

chrome.runtime.onMessage.addListener(
  (message: ExtensionMessage, _sender, sendResponse: (response: unknown) => void) => {
    const handleMessage = async () => {
      switch (message.type) {
        case 'SUBMISSION_ACCEPTED': {
          const settings = await getSettings();
          if (!settings.autoSync) {
            sendResponse({ success: false, error: 'Auto-sync is disabled' });
            return;
          }
          const result = await handleSync(message.payload);
          sendResponse(result);
          break;
        }

        case 'AUTH_TOKEN_SET': {
          try {
            const user = await authenticate(message.payload.token);
            const response: AuthResponse = { success: true, user };
            sendResponse(response);
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Authentication failed';
            const response: AuthResponse = { success: false, error: errorMessage };
            sendResponse(response);
          }
          break;
        }

        case 'AUTH_DISCONNECT': {
          await disconnect();
          sendResponse({ success: true });
          break;
        }

        case 'SYNC_NOW': {
          const result = await handleSync(message.payload);
          sendResponse(result);
          break;
        }

        case 'GET_STATUS': {
          const status = await handleGetStatus();
          sendResponse(status);
          break;
        }

        default:
          sendResponse({ success: false, error: 'Unknown message type' });
      }
    };

    handleMessage();
    return true; // Keep the message channel open for async response
  }
);

// ─── Install Handler ─────────────────────────────────────────────────────────

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('LeetCode GitHub AutoSync installed successfully!');
  }
});
