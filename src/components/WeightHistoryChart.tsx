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
import { WeightEntry } from '../types';
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
  weightEntries: WeightEntry[];
  userId: number;
}

export const WeightHistoryChart: React.FC<Props> = ({ weightEntries, userId }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const userEntries = weightEntries
    .filter(e => e.userId === userId)
    .sort((a, b) => a.entryDate.localeCompare(b.entryDate));

  const dates = userEntries.map(e => formatShortDate(e.entryDate));
  const weights = userEntries.map(e => e.weight);

  const data = {
    labels: dates.length > 0 ? dates : ['No entries'],
    datasets: [
      {
        label: 'Weight (kg)',
        data: weights.length > 0 ? weights : [0],
        borderColor: '#10b981',
        backgroundColor: isDark ? 'rgba(16, 185, 129, 0.25)' : 'rgba(16, 185, 129, 0.15)',
        fill: true,
        tension: 0.4,
        pointStyle: 'circle',
        pointRadius: 5,
        pointBackgroundColor: isDark ? '#34d399' : '#059669',
        pointBorderColor: isDark ? '#0f172a' : '#ffffff',
        pointBorderWidth: 2
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
        text: 'Your Weight Journey 📈',
        font: { size: 16, weight: 'bold' as const },
        color: isDark ? '#f8fafc' : '#0f172a'
      },
      legend: {
        labels: { color: textColor, font: { size: 12 } }
      }
    },
    scales: {
      x: {
        title: { display: true, text: 'Date', color: textColor },
        grid: { color: gridColor },
        ticks: { color: textColor }
      },
      y: {
        title: { display: true, text: 'Weight (kg)', color: textColor },
        grid: { color: gridColor },
        ticks: { color: textColor },
        beginAtZero: false
      }
    }
  };

  return (
    <div className="dashboard-card">
      <h2>Weight History</h2>
      <div style={{ height: '240px', width: '100%', position: 'relative' }}>
        <Line data={data} options={options} />
      </div>
    </div>
  );
};
