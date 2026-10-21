import React from 'react';

interface Props {
  startingWeight: number;
  currentWeight: number;
  weightChange: number;
}

export const WeightStatsCard: React.FC<Props> = ({
  startingWeight,
  currentWeight,
  weightChange
}) => {
  const isLoss = weightChange < 0;
  const isGain = weightChange > 0;
  const arrow = isLoss ? '↓ ' : isGain ? '↑ ' : '• ';
  const formattedChange = arrow + (isGain ? `+${weightChange.toFixed(1)}` : `${weightChange.toFixed(1)}`) + ' kg';
  const changeClass = isLoss ? 'weight-change-neg' : isGain ? 'weight-change-pos' : '';

  return (
    <div className="dashboard-card">
      <h2>
        <span>Weight</span>
        <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Kilograms (kg)</span>
      </h2>
      <div className="weight-stats">
        <div className="stat">
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#64748b' }}>Starting</span>
          <strong id="weight-starting" style={{ fontSize: '20px', color: '#0f172a' }}>
            {startingWeight.toFixed(1)} kg
          </strong>
        </div>
        <div className="stat">
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#64748b' }}>Current</span>
          <strong id="weight-current" style={{ fontSize: '20px', color: '#2563eb' }}>
            {currentWeight.toFixed(1)} kg
          </strong>
        </div>
        <div className="stat">
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#64748b' }}>Net Change</span>
          <strong id="weight-change" className={changeClass} style={{ fontSize: '20px' }}>
            {formattedChange}
          </strong>
        </div>
      </div>
    </div>
  );
};
