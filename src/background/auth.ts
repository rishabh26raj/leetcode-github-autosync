import type { GitHubUser } from '../types';
import { GITHUB_API_BASE } from '../utils/constants';
import { setToken, setGitHubUser, removeToken, removeGitHubUser, getToken } from '../utils/storage';

/**
 * Validate a GitHub Personal Access Token and fetch user info.
 */
export async function validateToken(token: string): Promise<GitHubUser> {
  const response = await fetch(`${GITHUB_API_BASE}/user`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github.v3+json',
    },
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      response.status === 401
        ? 'Invalid token. Please check your GitHub Personal Access Token.'
        : `GitHub API error (${response.status}): ${errorBody}`
    );
  }

  const data = await response.json();
  return {
    username: data.login,
    avatarUrl: data.avatar_url,
    profileUrl: data.html_url,
  };
}

/**
 * Authenticate with a PAT: validate, store token and user info.
 */
export async function authenticate(token: string): Promise<GitHubUser> {
  const user = await validateToken(token);
  await setToken(token);
  await setGitHubUser(user);
  return user;
}

/**
 * Disconnect: remove stored token and user info.
 */
export async function disconnect(): Promise<void> {
  await removeToken();
  await removeGitHubUser();
}

/**
 * Check if the user is currently authenticated.
 */
export async function isAuthenticated(): Promise<boolean> {
  const token = await getToken();
  return token !== null;
}
