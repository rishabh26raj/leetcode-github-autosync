import React, { useState } from 'react';
import type { GitHubUser, AuthResponse } from '../../types';

interface GitHubConnectProps {
  user: GitHubUser | null;
  repoName: string | null;
  onConnect: (user: GitHubUser) => void;
}

const GitHubConnect: React.FC<GitHubConnectProps> = ({ user, repoName, onConnect }) => {
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConnect = async () => {
    if (!token.trim()) {
      setError('Please enter your GitHub Personal Access Token');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response: AuthResponse = await chrome.runtime.sendMessage({
        type: 'AUTH_TOKEN_SET',
        payload: { token: token.trim() },
      });

      if (response.success && response.user) {
        onConnect(response.user);
        setToken('');
      } else {
        setError(response.error || 'Failed to authenticate');
      }
    } catch (err) {
      setError('Failed to connect. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleConnect();
  };

  // Connected state
  if (user) {
    return (
      <div className="connect-card connect-card--connected">
        <div className="connect-card__header">
          <img
            src={user.avatarUrl}
            alt={user.username}
            className="connect-card__avatar"
          />
          <div className="connect-card__info">
            <div className="connect-card__username">{user.username}</div>
            <div className="connect-card__status">
              <span className="connect-card__status-dot" />
              Connected
            </div>
          </div>
        </div>
        {repoName && (
          <div className="connect-card__repo">
            <span className="connect-card__repo-icon">📁</span>
            <a
              href={`https://github.com/${user.username}/${repoName}`}
              target="_blank"
              rel="noopener noreferrer"
              className="connect-card__repo-link"
            >
              {user.username}/{repoName}
            </a>
          </div>
        )}
      </div>
    );
  }

  // Disconnected state
  return (
    <div className="connect-card">
      <div className="connect-card__prompt">
        <span className="connect-card__prompt-icon">🔗</span>
        <div className="connect-card__prompt-title">Connect GitHub</div>
        <div className="connect-card__prompt-desc">
          Link your account to start syncing solutions
        </div>
      </div>

      <div className="token-input">
        <input
          id="github-token-input"
          type="password"
          className="token-input__field"
          placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading}
        />
        <div className="token-input__help">
          Need a token?{' '}
          <a
            href="https://github.com/settings/tokens/new?scopes=repo&description=LeetCode+AutoSync"
            target="_blank"
            rel="noopener noreferrer"
          >
            Create one here →
          </a>
        </div>

        {error && (
          <div className="message message--error">
            ⚠️ {error}
          </div>
        )}

        <button
          className={`btn btn--primary btn--full ${loading ? 'btn--loading' : ''}`}
          onClick={handleConnect}
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="btn__spinner" />
              Connecting...
            </>
          ) : (
            '🔐 Connect with Token'
          )}
        </button>
      </div>
    </div>
  );
};

export default GitHubConnect;
