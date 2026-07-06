import React from 'react';
import type { SyncRecord } from '../../types';

interface StatsCardProps {
  records: SyncRecord[];
}

const StatsCard: React.FC<StatsCardProps> = ({ records }) => {
  // Count unique problems by difficulty
  const uniqueProblems = new Map<number, SyncRecord>();
  records.forEach(r => {
    if (!uniqueProblems.has(r.problemNumber)) {
      uniqueProblems.set(r.problemNumber, r);
    }
  });

  const total = uniqueProblems.size;
  const easy = [...uniqueProblems.values()].filter(r => r.difficulty === 'Easy').length;
  const medium = [...uniqueProblems.values()].filter(r => r.difficulty === 'Medium').length;
  const hard = [...uniqueProblems.values()].filter(r => r.difficulty === 'Hard').length;

  return (
    <div className="stats-grid">
      <div className="stat-card stat-card--total">
        <div className="stat-card__value">{total}</div>
        <div className="stat-card__label">Total</div>
      </div>
      <div className="stat-card stat-card--easy">
        <div className="stat-card__value">{easy}</div>
        <div className="stat-card__label">Easy</div>
      </div>
      <div className="stat-card stat-card--medium">
        <div className="stat-card__value">{medium}</div>
        <div className="stat-card__label">Medium</div>
      </div>
      <div className="stat-card stat-card--hard">
        <div className="stat-card__value">{hard}</div>
        <div className="stat-card__label">Hard</div>
      </div>
    </div>
  );
};

export default StatsCard;
