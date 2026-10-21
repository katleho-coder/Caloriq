import React from 'react';

interface Props {
  caloriesConsumed: number;
  calorieTarget: number;
  proteinConsumed: number;
  proteinTarget: number;
}

export const GoalsCard: React.FC<Props> = ({
  caloriesConsumed,
  calorieTarget,
  proteinConsumed,
  proteinTarget
}) => {
  const caloriePercent = calorieTarget > 0 ? Math.min(Math.round((caloriesConsumed / calorieTarget) * 100), 100) : 0;
  const proteinPercent = proteinTarget > 0 ? Math.min(Math.round((proteinConsumed / proteinTarget) * 100), 100) : 0;

  return (
    <div className="dashboard-card">
      <h2>
        <span>Goals</span>
        <span style={{ fontSize: '13px', color: '#10b981', fontWeight: 700 }}>Daily Targets</span>
      </h2>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
        <p style={{ fontWeight: 700, fontSize: '14.5px', color: 'var(--text-main)' }}>
          🍎 Calories
        </p>
        <span style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--text-muted)' }}>
          {caloriesConsumed} / {calorieTarget} kcal ({caloriePercent}%)
        </span>
      </div>
      <div className="progress">
        <div
          id="calorieBar"
          className="progress-fill"
          style={{ width: `${caloriePercent}%` }}
        >
          {caloriePercent > 12 && `${caloriePercent}%`}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px', marginTop: '14px' }}>
        <p style={{ fontWeight: 700, fontSize: '14.5px', color: 'var(--text-main)' }}>
          💪 Protein
        </p>
        <span style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--text-muted)' }}>
          {proteinConsumed} / {proteinTarget} g ({proteinPercent}%)
        </span>
      </div>
      <div className="progress">
        <div
          id="proteinBar"
          className="progress-fill"
          style={{ width: `${proteinPercent}%` }}
        >
          {proteinPercent > 12 && `${proteinPercent}%`}
        </div>
      </div>
    </div>
  );
};
