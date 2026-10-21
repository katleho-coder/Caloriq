import React, { useState } from 'react';

interface Props {
  onSaveWeight: (weight: number) => void;
}

export const UpdateWeightCard: React.FC<Props> = ({ onSaveWeight }) => {
  const [weightInput, setWeightInput] = useState('');
  const [weightStatus, setWeightStatus] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(weightInput);
    if (isNaN(val) || val <= 0 || val > 400) {
      setWeightStatus('⚠️ Please enter a valid weight.');
      return;
    }

    onSaveWeight(val);
    setWeightStatus('✅ Weight updated successfully!');
    setWeightInput('');
    setTimeout(() => {
      setWeightStatus(null);
    }, 3500);
  };

  return (
    <div className="dashboard-card">
      <h2>
        <span>Update Weight</span>
        <span style={{ fontSize: '13px', color: '#10b981', fontWeight: 700 }}>Log Today</span>
      </h2>
      <form id="weight-form" onSubmit={handleSubmit}>
        <label htmlFor="weight-input" style={{ fontSize: '14px', color: 'var(--text-muted)', fontWeight: 500 }}>
          Enter current weight (kg):
        </label>
        <input
          type="number"
          id="weight-input"
          step="0.1"
          placeholder="e.g. 78.5"
          value={weightInput}
          onChange={e => setWeightInput(e.target.value)}
          required
        />
        <button type="submit">Save Weight</button>
      </form>
      {weightStatus && (
        <p id="weight-status" className="status-msg">
          {weightStatus}
        </p>
      )}
    </div>
  );
};
