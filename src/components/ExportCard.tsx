import React, { useState } from 'react';
import { exportUserCSV, exportUserPDF } from '../storage';

interface Props {
  userId: number;
  username: string;
}

export const ExportCard: React.FC<Props> = ({ userId, username }) => {
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleExportCSV = () => {
    try {
      exportUserCSV(userId, username);
      setFeedback('📄 CSV file downloaded!');
      setTimeout(() => setFeedback(null), 3000);
    } catch {
      setFeedback('⚠️ Failed to export CSV.');
    }
  };

  const handleExportPDF = () => {
    try {
      exportUserPDF(userId, username);
      setFeedback('🖨️ PDF report generated!');
      setTimeout(() => setFeedback(null), 3000);
    } catch {
      setFeedback('⚠️ Failed to export PDF.');
    }
  };

  return (
    <div className="dashboard-card">
      <h2>
        <span>Export & Reports</span>
        <span style={{ fontSize: '13px', color: '#8b5cf6', fontWeight: 700 }}>Data Backups</span>
      </h2>
      <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '10px', lineHeight: 1.5 }}>
        Download your comprehensive food log and nutritional intake reports in CSV or PDF formats.
      </p>
      <div className="export-actions">
        <button onClick={handleExportCSV}>📄 Export CSV</button>
        <button onClick={handleExportPDF}>🖨️ Export PDF</button>
      </div>
      {feedback && (
        <p className="status-msg" style={{ color: '#10b981', marginTop: '10px' }}>
          {feedback}
        </p>
      )}
    </div>
  );
};
