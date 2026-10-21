import React from 'react';

interface Props {
  consumed: number;
}

export const ProteinCard: React.FC<Props> = ({ consumed }) => {
  return (
    <div className="dashboard-card">
      <h2>
        <span>Protein</span>
        <span style={{ fontSize: '13px', color: '#3b82f6', fontWeight: 700 }}>Muscle & Recovery</span>
      </h2>
      <div className="main-stat">
        <strong id="protein-consumed" style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          {consumed}
        </strong>
        <span>grams consumed</span>
      </div>
    </div>
  );
};
