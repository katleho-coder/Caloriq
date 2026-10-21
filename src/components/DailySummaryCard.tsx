import React from 'react';

interface Props {
  calories: number;
  protein: number;
  currentWeight: number | null;
}

export const DailySummaryCard: React.FC<Props> = ({ calories, protein, currentWeight }) => {
  return (
    <div className="dashboard-card">
      <h2>
        <span>Daily Summary</span>
        <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>Live Overview</span>
      </h2>

      <div className="stat">
        <span id="summary-calories" style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-main)' }}>
          🍎 Calories
        </span>
        <strong style={{ color: '#10b981', fontSize: '18px' }}>{calories} kcal</strong>
      </div>

      <div className="stat">
        <span id="summary-protein" style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-main)' }}>
          💪 Protein
        </span>
        <strong style={{ color: '#3b82f6', fontSize: '18px' }}>{protein} g</strong>
      </div>

      <div className="stat">
        <span id="summary-weight" style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-main)' }}>
          ⚖️ Weight
        </span>
        <strong style={{ color: '#7c3aed', fontSize: '18px' }}>
          {currentWeight !== null ? `${currentWeight} kg` : '--'}
        </strong>
      </div>
    </div>
  );
};
