import React, { useState } from 'react';
import type { ExtensionSettings, GitHubUser } from '../../types';

interface SettingsProps {
  user: GitHubUser | null;
  settings: ExtensionSettings;
  onSettingsChange: (settings: Partial<ExtensionSettings>) => void;
  onDisconnect: () => void;
  onClearData: () => void;
}

const Settings: React.FC<SettingsProps> = ({
  user,
  settings,
  onSettingsChange,
  onDisconnect,
  onClearData,
}) => {
  const [confirmDisconnect, setConfirmDisconnect] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);

  const handleAutoSyncToggle = () => {
    onSettingsChange({ autoSync: !settings.autoSync });
  };

  const handleVisibilityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onSettingsChange({
      repoVisibility: e.target.value as 'public' | 'private',
    });
  };

  const handleDisconnect = () => {
    if (confirmDisconnect) {
      onDisconnect();
      setConfirmDisconnect(false);
    } else {
      setConfirmDisconnect(true);
      setTimeout(() => setConfirmDisconnect(false), 3000);
    }
  };

  const handleClearData = () => {
    if (confirmClear) {
      onClearData();
      setConfirmClear(false);
    } else {
      setConfirmClear(true);
      setTimeout(() => setConfirmClear(false), 3000);
    }
  };

  return (
    <div className="settings">
      {/* Sync Settings */}
      <div className="settings__group">
        <h3 className="settings__group-title">⚙️ Sync Settings</h3>

        <div className="settings__row">
          <div className="settings__label">
            <span className="settings__label-text">Auto Sync</span>
            <span className="settings__label-desc">
              Automatically sync accepted submissions
            </span>
          </div>
          <label className="toggle" htmlFor="auto-sync-toggle">
            <input
              id="auto-sync-toggle"
              type="checkbox"
              className="toggle__input"
              checked={settings.autoSync}
              onChange={handleAutoSyncToggle}
            />
            <span className="toggle__slider" />
          </label>
        </div>

        <hr className="divider" />

        <div className="settings__row">
          <div className="settings__label">
            <span className="settings__label-text">Repository Visibility</span>
            <span className="settings__label-desc">
              For newly created repositories
            </span>
          </div>
          <select
            id="repo-visibility-select"
            className="select"
            value={settings.repoVisibility}
            onChange={handleVisibilityChange}
          >
            <option value="public">Public</option>
            <option value="private">Private</option>
          </select>
        </div>
      </div>

      {/* Account Settings */}
      <div className="settings__group">
        <h3 className="settings__group-title">👤 Account</h3>

        {user ? (
          <>
            <div className="settings__row">
              <div className="settings__label">
                <span className="settings__label-text">Connected as</span>
                <span className="settings__label-desc">{user.username}</span>
              </div>
              <img
                src={user.avatarUrl}
                alt={user.username}
                style={{ width: 28, height: 28, borderRadius: '50%' }}
              />
            </div>

            <hr className="divider" />

            <button
              className={`btn btn--danger btn--full btn--sm`}
              onClick={handleDisconnect}
            >
              {confirmDisconnect ? '⚠️ Click again to confirm' : '🔓 Disconnect GitHub'}
            </button>
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '8px 0', color: 'var(--text-muted)', fontSize: '12px' }}>
            No account connected
          </div>
        )}
      </div>

      {/* Danger Zone */}
      <div className="settings__group">
        <h3 className="settings__group-title">🗑️ Data</h3>

        <button
          className="btn btn--ghost btn--full btn--sm"
          onClick={handleClearData}
        >
          {confirmClear ? '⚠️ Click again to clear ALL data' : '🧹 Clear Sync History'}
        </button>
      </div>

      {/* Info */}
      <div className="footer">
        <div className="footer__text">
          LeetCode GitHub AutoSync v1.0.0
        </div>
        <div className="footer__version">
          Built with ⚡ React + TypeScript + Vite
        </div>
      </div>
    </div>
  );
};

export default Settings;
