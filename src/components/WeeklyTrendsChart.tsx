import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { FoodEntry, WeightEntry } from '../types';
import { formatShortDate } from '../storage';
import { useTheme } from '../context/ThemeContext';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface Props {
  foodEntries: FoodEntry[];
  weightEntries: WeightEntry[];
  userId: number;
}

export const WeeklyTrendsChart: React.FC<Props> = ({ foodEntries, weightEntries, userId }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Generate the past 7 days
  const dates: string[] = [];
  const labels: string[] = [];
  const now = new Date();

  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const dateStr = `${y}-${m}-${day}`;
    dates.push(dateStr);
    labels.push(formatShortDate(dateStr));
  }

  // Calculate calories and protein per day for this user
  const userFood = foodEntries.filter(e => e.userId === userId);
  const userWeight = weightEntries.filter(e => e.userId === userId);

  const caloriesData = dates.map(dateStr => {
    const dayEntries = userFood.filter(e => e.entryDate === dateStr);
    return dayEntries.reduce((sum, e) => sum + e.calories, 0);
  });

  const proteinData = dates.map(dateStr => {
    const dayEntries = userFood.filter(e => e.entryDate === dateStr);
    return Math.round(dayEntries.reduce((sum, e) => sum + e.protein, 0) * 10) / 10;
  });

  // For weight, find the entry for each date, or extrapolate from previous
  let lastKnownWeight: number | null = null;
  const weightData = dates.map(dateStr => {
    const entry = userWeight.find(w => w.entryDate === dateStr);
    if (entry) {
      lastKnownWeight = entry.weight;
      return entry.weight;
    }
    return lastKnownWeight;
  });

  const data = {
    labels,
    datasets: [
      {
        label: 'Calories 🍎',
        data: caloriesData,
        borderColor: '#FF9800',
        backgroundColor: isDark ? 'rgba(255, 152, 0, 0.25)' : 'rgba(255,152,0,0.18)',
        fill: true,
        tension: 0.4,
        yAxisID: 'y'
      },
      {
        label: 'Protein 💪',
        data: proteinData,
        borderColor: '#3b82f6',
        backgroundColor: isDark ? 'rgba(59, 130, 246, 0.25)' : 'rgba(33,150,243,0.18)',
        fill: true,
        tension: 0.4,
        yAxisID: 'y'
      },
      {
        label: 'Weight ⚖️',
        data: weightData,
        borderColor: '#10b981',
        backgroundColor: isDark ? 'rgba(16, 185, 129, 0.25)' : 'rgba(76,175,80,0.18)',
        fill: false,
        tension: 0.4,
        yAxisID: 'y1'
      }
    ]
  };

  const textColor = isDark ? '#cbd5e1' : '#475569';
  const gridColor = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)';

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: true,
        text: 'Weekly Trends Overview 📊',
        font: { size: 16, weight: 'bold' as const },
        color: isDark ? '#f8fafc' : '#0f172a'
      },
      legend: {
        labels: {
          color: textColor,
          font: { size: 12 }
        }
      }
    },
    scales: {
      x: {
        grid: { color: gridColor },
        ticks: { color: textColor }
      },
      y: {
        title: { display: true, text: 'Calories / Protein', color: textColor },
        grid: { color: gridColor },
        ticks: { color: textColor },
        beginAtZero: true
      },
      y1: {
        position: 'right' as const,
        title: { display: true, text: 'Weight (kg)', color: textColor },
        grid: { drawOnChartArea: false },
        ticks: { color: textColor }
      }
    }
  };

  return (
    <div className="dashboard-card">
      <h2>Weekly Trends</h2>
      <div style={{ height: '240px', width: '100%', position: 'relative' }}>
        <Line data={data} options={options} />
      </div>
    </div>
  );
};
