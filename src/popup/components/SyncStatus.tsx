import React from 'react';
import type { SyncRecord, Difficulty } from '../../types';
import { formatRelativeTime } from '../../utils/helpers';

interface SyncStatusProps {
  records: SyncRecord[];
}

const SyncStatus: React.FC<SyncStatusProps> = ({ records }) => {
  const recentRecords = records.slice(0, 8);

  const getBadgeClass = (difficulty: Difficulty): string => {
    const map: Record<Difficulty, string> = {
      Easy: 'activity-item__badge--easy',
      Medium: 'activity-item__badge--medium',
      Hard: 'activity-item__badge--hard',
    };
    return map[difficulty];
  };

  if (recentRecords.length === 0) {
    return (
      <div className="sync-section">
        <div className="sync-section__header">
          <h3 className="sync-section__title">Recent Activity</h3>
        </div>
        <div className="activity-feed">
          <div className="activity-feed__empty">
            <span className="activity-feed__empty-icon">📋</span>
            No solutions synced yet.
            <br />
            Solve a problem on LeetCode to get started!
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="sync-section">
      <div className="sync-section__header">
        <h3 className="sync-section__title">Recent Activity</h3>
        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
          {records.length} sync{records.length !== 1 ? 's' : ''}
        </span>
      </div>
      <div className="activity-feed">
        {recentRecords.map((record, index) => (
          <div
            className="activity-item"
            key={`${record.problemNumber}-${record.timestamp}`}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <span className={`activity-item__badge ${getBadgeClass(record.difficulty)}`} />
            <div className="activity-item__content">
              <div className="activity-item__title">
                {record.problemNumber}. {record.problemTitle}
              </div>
              <div className="activity-item__meta">
                <span>{record.language}</span>
                <span>·</span>
                <span>{record.difficulty}</span>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
              <span className="activity-item__time">
                {formatRelativeTime(record.timestamp)}
              </span>
              {record.commitUrl && (
                <a
                  href={record.commitUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="activity-item__link"
                  title="View commit"
                >
                  🔗
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SyncStatus;
