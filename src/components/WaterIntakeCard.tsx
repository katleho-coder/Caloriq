import React, { useState } from 'react';
import { WaterEntry } from '../types';

interface Props {
  waterEntry: WaterEntry;
  onUpdateWater: (glasses: number, goal?: number) => void;
}

export const WaterIntakeCard: React.FC<Props> = ({ waterEntry, onUpdateWater }) => {
  const [editingGoal, setEditingGoal] = useState(false);
  const [tempGoal, setTempGoal] = useState<number>(waterEntry.goal || 8);

  const glasses = waterEntry.glasses;
  const goal = waterEntry.goal || 8;
  const percent = Math.min(Math.round((glasses / goal) * 100), 100);
  const totalMl = glasses * 250;
  const goalMl = goal * 250;
  const isGoalReached = glasses >= goal;

  const handleAddGlasses = (count: number) => {
    onUpdateWater(Math.max(0, glasses + count));
  };

  const handleGlassClick = (glassIndex: number) => {
    // If clicking on the currently selected glass, toggle it off by 1
    if (glasses === glassIndex + 1) {
      onUpdateWater(glassIndex);
    } else {
      onUpdateWater(glassIndex + 1);
    }
  };

  const handleSaveGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (tempGoal > 0 && tempGoal <= 30) {
      onUpdateWater(glasses, tempGoal);
      setEditingGoal(false);
    }
  };

  return (
    <div className="dashboard-card water-card">
      <h2>
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>💧</span> Water Intake
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            type="button"
            className="btn-goal-edit"
            onClick={() => setEditingGoal(!editingGoal)}
            title="Edit daily hydration goal"
          >
            {editingGoal ? '✕ Close' : `🎯 Goal: ${goal} glasses`}
          </button>
        </div>
      </h2>

      {/* Goal Setting Inline Popover */}
      {editingGoal && (
        <form className="water-goal-form" onSubmit={handleSaveGoal}>
          <label htmlFor="water-goal-input">Daily Target (glasses):</label>
          <div className="water-goal-inputs">
            <input
              id="water-goal-input"
              type="number"
              min="1"
              max="24"
              value={tempGoal}
              onChange={e => setTempGoal(Number(e.target.value) || 8)}
            />
            <div className="preset-goals">
              {[6, 8, 10, 12].map(preset => (
                <button
                  key={preset}
                  type="button"
                  className={`preset-btn ${tempGoal === preset ? 'active' : ''}`}
                  onClick={() => setTempGoal(preset)}
                >
                  {preset}
                </button>
              ))}
            </div>
            <button type="submit" className="btn-save-goal">Save</button>
          </div>
        </form>
      )}

      {/* Main Hydration Stats */}
      <div className="main-stat water-main-stat">
        <strong id="water-consumed" style={{ background: 'linear-gradient(135deg, #06b6d4 0%, #2563eb 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          {glasses} <span style={{ fontSize: '24px', fontWeight: 600, color: 'var(--text-muted)', WebkitTextFillColor: 'var(--text-muted)' }}>/ {goal}</span>
        </strong>
        <span>glasses ({totalMl.toLocaleString()} ml / {goalMl.toLocaleString()} ml)</span>
      </div>

      {/* Progress Indicator */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
        <span style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--text-main)' }}>
          Hydration Progress
        </span>
        <span
          style={{
            fontSize: '12px',
            fontWeight: 700,
            padding: '3px 10px',
            borderRadius: '12px',
            backgroundColor: isGoalReached ? 'rgba(16, 185, 129, 0.15)' : 'rgba(6, 182, 212, 0.15)',
            color: isGoalReached ? '#10b981' : '#0284c7'
          }}
        >
          {isGoalReached ? '🎉 Goal Achieved!' : `${percent}%`}
        </span>
      </div>

      <div className="progress water-progress-track">
        <div
          className="progress-fill water-progress-fill"
          style={{ width: `${percent}%` }}
        >
          {percent > 12 && `${percent}%`}
        </div>
      </div>

      {/* Interactive Glass Icons Visualizer */}
      <div className="water-glasses-grid">
        {Array.from({ length: Math.min(goal, 12) }).map((_, idx) => {
          const isFilled = idx < glasses;
          return (
            <button
              key={idx}
              type="button"
              className={`water-glass-btn ${isFilled ? 'filled' : 'empty'}`}
              onClick={() => handleGlassClick(idx)}
              title={`Glass ${idx + 1} (250ml) - Click to toggle`}
              aria-label={`Glass ${idx + 1}`}
            >
              <div className="glass-inner">
                <span className="glass-emoji">{isFilled ? '💧' : '🥛'}</span>
                <span className="glass-number">{idx + 1}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Quick Action Buttons */}
      <div className="water-actions">
        <button
          type="button"
          className="btn-water-add"
          onClick={() => handleAddGlasses(1)}
        >
          <span>+ 1 Glass (250ml)</span>
        </button>

        <button
          type="button"
          className="btn-water-add-bottle"
          onClick={() => handleAddGlasses(2)}
        >
          <span>+ 2 Glasses (500ml)</span>
        </button>

        <button
          type="button"
          className="btn-secondary"
          style={{ padding: '10px 14px' }}
          onClick={() => handleAddGlasses(-1)}
          disabled={glasses <= 0}
          title="Undo 1 glass"
        >
          - 1
        </button>

        <button
          type="button"
          className="btn-secondary"
          style={{ padding: '10px 14px' }}
          onClick={() => onUpdateWater(0)}
          disabled={glasses <= 0}
          title="Reset today's water"
        >
          ↺ Reset
        </button>
      </div>

      {/* Motivational Hydration Tip */}
      <div className="water-tip">
        <span style={{ fontSize: '16px' }}>💡</span>
        <span>
          {glasses === 0
            ? 'Start your day with a glass of water to wake up your body and metabolism!'
            : isGoalReached
            ? 'Awesome job! You reached your daily hydration target. Keep it up!'
            : `${goal - glasses} more glass${goal - glasses === 1 ? '' : 'es'} (${(goal - glasses) * 250} ml) to hit today\'s hydration goal.`}
        </span>
      </div>
    </div>
  );
};
