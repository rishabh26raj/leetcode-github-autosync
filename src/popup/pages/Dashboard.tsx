import React from 'react';
import type { GitHubUser, SyncRecord } from '../../types';
import GitHubConnect from '../components/GitHubConnect';
import StatsCard from '../components/StatsCard';
import SyncStatus from '../components/SyncStatus';
import SyncButton from '../components/SyncButton';

interface DashboardProps {
  user: GitHubUser | null;
  repoName: string | null;
  syncRecords: SyncRecord[];
  onConnect: (user: GitHubUser) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, repoName, syncRecords, onConnect }) => {
  const isAuthenticated = user !== null;

  return (
    <>
      <GitHubConnect user={user} repoName={repoName} onConnect={onConnect} />

      {isAuthenticated && (
        <>
          <StatsCard records={syncRecords} />
          <SyncButton isAuthenticated={isAuthenticated} />
          <SyncStatus records={syncRecords} />
        </>
      )}
    </>
  );
};

export default Dashboard;
