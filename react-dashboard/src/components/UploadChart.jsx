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

// --- Mock Data for the Charts ---
const dayData = {
  labels: ['8am', '10am', '12pm', '2pm', '4pm', '6pm'],
  datasets: [
    {
      label: 'Uploads Today',
      data: [12, 19, 3, 5, 2, 3],
      backgroundColor: 'rgba(54, 162, 235, 0.6)',
      borderColor: 'rgba(54, 162, 235, 1)',
      borderWidth: 1,
    },
  ],
};

const weekData = {
  labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  datasets: [
    {
      label: 'Uploads This Week',
      data: [65, 59, 80, 81, 56, 55, 40],
      backgroundColor: 'rgba(75, 192, 192, 0.6)',
      borderColor: 'rgba(75, 192, 192, 1)',
      borderWidth: 1,
    },
  ],
};

const monthData = {
  labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
  datasets: [
    {
      label: 'Uploads This Month',
      data: [280, 310, 405, 350],
      backgroundColor: 'rgba(153, 102, 255, 0.6)',
      borderColor: 'rgba(153, 102, 255, 1)',
      borderWidth: 1,
    },
  ],
};

// --- Chart Options ---
const options = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top',
      display: false, // Hide the legend label (e.g., "Uploads This Week")
    },
  },
  scales: {
    y: {
      beginAtZero: true,
    },
  },
};

// --- The New Component ---
function UploadChart() {
  const [timeFilter, setTimeFilter] = useState('week'); // Default to 'week'

  const getChartData = () => {
    switch (timeFilter) {
      case 'day':
        return dayData;
      case 'week':
        return weekData;
      case 'month':
        return monthData;
      default:
        return weekData;
    }
  };

  return (
    <>
      <div className="upload-chart-header">
        <h2>Total Data Uploaded</h2>
        <div className="upload-chart-filters">
          <button
            className={timeFilter === 'day' ? 'active' : ''}
            onClick={() => setTimeFilter('day')}
          >
            Day
          </button>
          <button
            className={timeFilter === 'week' ? 'active' : ''}
            onClick={() => setTimeFilter('week')}
          >
            Week
          </button>
          <button
            className={timeFilter === 'month' ? 'active' : ''}
            onClick={() => setTimeFilter('month')}
          >
            Month
          </button>
        </div>
      </div>

      <div className="upload-chart-wrapper">
        <Bar options={options} data={getChartData()} />
      </div>
    </>
  );
}

export default UploadChart;