import React, { useState } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const options = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: 'top' },
  },
  scales: { y: { beginAtZero: true } },
};

function UploadChart({ data = { transport: 0, wireless: 0, wireline: 0 }, onDataUpdate }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const API_BASE = (import.meta.env && import.meta.env.VITE_API_BASE_URL) || 'http://localhost:5001';

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    setFile(f);
    setError(null);
  };

  const handleUpload = async () => {
    if (!file) return setError('Select a file first');
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch(`${API_BASE}/upload`, { method: 'POST', body: fd });
      if (!res.ok) throw new Error('Upload failed');
      const body = await res.json();
      setFile(null);
      if (onDataUpdate) onDataUpdate();
    } catch (err) {
      setError(err.message);
    } finally { setUploading(false); }
  };

  const chartData = {
    labels: ['Transport', 'Wireless', 'Wireline'],
    datasets: [{ label: 'Items', data: [data.transport || 0, data.wireless || 0, data.wireline || 0], backgroundColor: ['#3b82f6','#06b6d4','#8b5cf6'] }]
  };

  return (
    <div className="upload-chart-container">
      <div className="upload-controls">
  <input type="file" accept=".xlsx,.xls,.csv,.txt,.json" onChange={handleFileChange} />
        <button onClick={handleUpload} disabled={!file || uploading}>{uploading ? 'Uploading...' : 'Upload'}</button>
        {error && <div className="error">{error}</div>}
      </div>
      <div className="upload-chart-wrapper">
        <Bar options={options} data={chartData} />
      </div>
    </div>
  );
}

export default UploadChart;