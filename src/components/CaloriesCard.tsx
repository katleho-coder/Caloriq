import React from 'react';

interface Props {
  target: number;
  consumed: number;
  remaining: number;
}

export const CaloriesCard: React.FC<Props> = ({ target, consumed, remaining }) => {
  const isOver = remaining < 0;

  return (
    <div className="dashboard-card">
      <h2>
        <span>Today's Calories</span>
        <span
          style={{
            fontSize: '12px',
            padding: '4px 10px',
            borderRadius: '20px',
            backgroundColor: isOver ? 'rgba(244, 63, 94, 0.15)' : 'rgba(16, 185, 129, 0.15)',
            color: isOver ? '#f43f5e' : '#10b981',
            fontWeight: 700
          }}
        >
          {isOver ? '⚠️ Over Target' : '🎯 On Track'}
        </span>
      </h2>

      <div className="main-stat">
        <strong id="calories-target">{target}</strong>
        <span>Target kcal</span>
      </div>

      <div className="stat">
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span>🔥</span> Consumed
        </span>
        <strong id="calories-consumed" style={{ color: '#10b981' }}>
          {consumed} kcal
        </strong>
      </div>

      <div className="stat">
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span>⏳</span> Remaining
        </span>
        <strong
          id="calories-remaining"
          style={{ color: isOver ? '#f43f5e' : 'var(--text-main)' }}
        >
          {remaining} kcal
        </strong>
      </div>
    </div>
  );
};
