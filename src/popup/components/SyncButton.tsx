import React from 'react';

interface SyncButtonProps {
  isAuthenticated: boolean;
}

const SyncButton: React.FC<SyncButtonProps> = ({ isAuthenticated }) => {
  return (
    <div>
      <button
        className="btn btn--success btn--full"
        disabled={!isAuthenticated}
        style={{ cursor: isAuthenticated ? 'default' : 'not-allowed', opacity: isAuthenticated ? 1 : 0.5 }}
      >
        {isAuthenticated ? '⚡ Auto-Sync Active' : '⚡ Connect GitHub to Enable'}
      </button>
      {isAuthenticated && (
        <div className="message message--success" style={{ marginTop: '8px' }}>
          ✅ Solutions will auto-sync when you get an "Accepted" verdict on LeetCode
        </div>
      )}
    </div>
  );
};

export default SyncButton;
