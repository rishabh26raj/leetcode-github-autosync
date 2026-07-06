import type { GitHubFileContent } from '../types';
import { GITHUB_API_BASE } from '../utils/constants';
import { getToken } from '../utils/storage';
import { toBase64 } from '../utils/helpers';

/**
 * Get authorization headers for GitHub API requests.
 */
async function getHeaders(): Promise<Record<string, string>> {
  const token = await getToken();
  if (!token) throw new Error('Not authenticated. Please connect your GitHub account.');
  return {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github.v3+json',
    'Content-Type': 'application/json',
  };
}

/**
 * Get the authenticated user's username.
 */
export async function getUsername(): Promise<string> {
  const headers = await getHeaders();
  const response = await fetch(`${GITHUB_API_BASE}/user`, { headers });
  if (!response.ok) throw new Error(`Failed to get user: ${response.status}`);
  const data = await response.json();
  return data.login;
}

/**
 * Check if a repository exists.
 */
export async function repoExists(owner: string, repo: string): Promise<boolean> {
  const headers = await getHeaders();
  const response = await fetch(`${GITHUB_API_BASE}/repos/${owner}/${repo}`, { headers });
  return response.ok;
}

/**
 * Create a new repository for the authenticated user.
 */
export async function createRepo(
  name: string,
  isPrivate: boolean = false
): Promise<{ htmlUrl: string; fullName: string }> {
  const headers = await getHeaders();
  const response = await fetch(`${GITHUB_API_BASE}/user/repos`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      name,
      description: '🚀 My LeetCode solutions, auto-synced by LeetCode GitHub AutoSync',
      private: isPrivate,
      auto_init: true,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.json();
    throw new Error(`Failed to create repository: ${errorBody.message || response.status}`);
  }

  const data = await response.json();
  return {
    htmlUrl: data.html_url,
    fullName: data.full_name,
  };
}

/**
 * Get or create the LeetCode solutions repository.
 */
export async function getOrCreateRepo(
  username: string,
  isPrivate: boolean = false
): Promise<string> {
  const repoName = `${username}-leetcode`;
  const exists = await repoExists(username, repoName);
  if (!exists) {
    await createRepo(repoName, isPrivate);
  }
  return repoName;
}

/**
 * Get a file's content and SHA from the repository.
 * Returns null if the file doesn't exist.
 */
export async function getFileContent(
  owner: string,
  repo: string,
  path: string
): Promise<GitHubFileContent | null> {
  const headers = await getHeaders();
  const response = await fetch(
    `${GITHUB_API_BASE}/repos/${owner}/${repo}/contents/${path}`,
    { headers }
  );

  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`Failed to get file: ${response.status}`);

  const data = await response.json();
  return {
    sha: data.sha,
    content: data.content,
    encoding: data.encoding,
  };
}

/**
 * Create or update a file in the repository.
 * If sha is provided, it's an update; otherwise, it's a create.
 */
export async function createOrUpdateFile(
  owner: string,
  repo: string,
  path: string,
  content: string,
  commitMessage: string,
  sha?: string
): Promise<{ commitUrl: string; sha: string }> {
  const headers = await getHeaders();
  const body: Record<string, string> = {
    message: commitMessage,
    content: toBase64(content),
  };

  if (sha) {
    body.sha = sha;
  }

  const response = await fetch(
    `${GITHUB_API_BASE}/repos/${owner}/${repo}/contents/${path}`,
    {
      method: 'PUT',
      headers,
      body: JSON.stringify(body),
    }
  );

  if (!response.ok) {
    const errorBody = await response.json();
    throw new Error(`Failed to ${sha ? 'update' : 'create'} file: ${errorBody.message || response.status}`);
  }

  const data = await response.json();
  return {
    commitUrl: data.commit?.html_url || '',
    sha: data.content?.sha || '',
  };
}

/**
 * Update (or create) the repository's README with stats.
 */
export async function updateReadme(
  owner: string,
  repo: string,
  totalSolved: number,
  easySolved: number,
  mediumSolved: number,
  hardSolved: number
): Promise<void> {
  const readmeContent = `# 🚀 LeetCode Solutions

Auto-synced by [LeetCode GitHub AutoSync](https://github.com)

## 📊 Statistics

| Difficulty | Solved |
|:----------:|:------:|
| 🟢 Easy    | ${easySolved}   |
| 🟡 Medium  | ${mediumSolved}   |
| 🔴 Hard    | ${hardSolved}   |
| **Total**  | **${totalSolved}** |

---

*Last updated: ${new Date().toISOString().split('T')[0]}*
`;

  const existingReadme = await getFileContent(owner, repo, 'README.md');

  await createOrUpdateFile(
    owner,
    repo,
    'README.md',
    readmeContent,
    'Update README with latest stats',
    existingReadme?.sha
  );
}
