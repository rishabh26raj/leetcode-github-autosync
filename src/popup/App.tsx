import React, { useState, useEffect, useCallback } from 'react';
import type { GitHubUser, SyncRecord, ExtensionSettings, StatusResponse } from '../types';
import { DEFAULT_SETTINGS } from '../utils/constants';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';
import './styles/popup.css';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<'dashboard' | 'settings'>('dashboard');
  const [user, setUser] = useState<GitHubUser | null>(null);
  const [repoName, setRepoName] = useState<string | null>(null);
  const [syncRecords, setSyncRecords] = useState<SyncRecord[]>([]);
  const [settings, setSettings] = useState<ExtensionSettings>({ ...DEFAULT_SETTINGS });
  const [loading, setLoading] = useState(true);

  // Fetch status from background on mount
  const fetchStatus = useCallback(async () => {
    try {
      const response: StatusResponse = await chrome.runtime.sendMessage({
        type: 'GET_STATUS',
      });

      setUser(response.user);
      setRepoName(response.repoName);
      setSyncRecords(response.syncRecords);
      setSettings(response.settings);
    } catch (error) {
      console.error('Failed to fetch status:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  // Listen for storage changes to update in real-time
  useEffect(() => {
    const handleStorageChange = () => {
      fetchStatus();
    };

    chrome.storage.onChanged.addListener(handleStorageChange);
    return () => chrome.storage.onChanged.removeListener(handleStorageChange);
  }, [fetchStatus]);

  const handleConnect = (connectedUser: GitHubUser) => {
    setUser(connectedUser);
    setRepoName(`${connectedUser.username}-leetcode`);
  };

  const handleSettingsChange = async (partial: Partial<ExtensionSettings>) => {
    const updated = { ...settings, ...partial };
    setSettings(updated);

    // Persist to chrome storage
    await chrome.storage.local.set({ settings: updated });
  };

  const handleDisconnect = async () => {
    await chrome.runtime.sendMessage({ type: 'AUTH_DISCONNECT' });
    setUser(null);
    setRepoName(null);
    setCurrentPage('dashboard');
  };

  const handleClearData = async () => {
    setSyncRecords([]);
    await chrome.storage.local.set({ syncRecords: [], syncedHashes: [] });
  };

  if (loading) {
    return (
      <div className="app-container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div className="btn__spinner" style={{
            width: 28,
            height: 28,
            borderWidth: 3,
            margin: '0 auto 12px',
          }} />
          <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
            Loading...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <Header currentPage={currentPage} onNavigate={setCurrentPage} />

      {currentPage === 'dashboard' ? (
        <Dashboard
          user={user}
          repoName={repoName}
          syncRecords={syncRecords}
          onConnect={handleConnect}
        />
      ) : (
        <Settings
          user={user}
          settings={settings}
          onSettingsChange={handleSettingsChange}
          onDisconnect={handleDisconnect}
          onClearData={handleClearData}
        />
      )}
    </div>
  );
};

export default App;
