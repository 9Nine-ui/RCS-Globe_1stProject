import React, { useState, useRef } from 'react';
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
  const inputRef = useRef(null);

  // safer access for Vite env
  const API_BASE = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL) || 'http://localhost:5001';

  const handleFileChange = (e) => {
    const f = e.target.files && e.target.files[0];
    setFile(f || null);
    setError(null);
  };

  const handleUpload = async () => {
    if (!file) return setError('Select a file first');
    setUploading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append('file', file);

      const res = await fetch(`${API_BASE}/upload`, { method: 'POST', body: fd });
      // parse response robustly
      const ct = res.headers.get('content-type') || '';
      let body;
      if (ct.includes('application/json')) {
        body = await res.json();
      } else {
        body = await res.text();
      }

      if (!res.ok) {
        // try to extract message
        const msg = (body && (body.message || body.error)) || body || 'Upload failed';
        throw new Error(typeof msg === 'string' ? msg : JSON.stringify(msg));
      }

      // reset file input so user can re-upload same file if needed
      setFile(null);
      if (inputRef.current) inputRef.current.value = '';

      // notify parent (pass response body if useful)
      if (onDataUpdate) onDataUpdate(body);

    } catch (err) {
      setError(err?.message || String(err));
    } finally {
      setUploading(false);
    }
  };

  const chartData = {
    labels: ['Transport', 'Wireless', 'Wireline'],
    datasets: [{ label: 'Items', data: [data.transport || 0, data.wireless || 0, data.wireline || 0], backgroundColor: ['#3b82f6','#06b6d4','#8b5cf6'] }]
  };

  return (
    <div className="upload-chart-container">
      <div className="upload-controls">
        <input
          ref={inputRef}
          type="file"
          accept=".xlsx,.xls,.csv,.txt,.json"
          onChange={handleFileChange}
        />
        <button onClick={handleUpload} disabled={!file || uploading}>
          {uploading ? 'Uploading...' : 'Upload'}
        </button>
        {error && <div className="error">{error}</div>}
      </div>
      <div className="upload-chart-wrapper">
        <Bar options={options} data={chartData} />
      </div>
    </div>
  );
}

export default UploadChart;