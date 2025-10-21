// --- 1. Data for Import List (Used in DashboardContent) ---
export const importData = [
  { name: 'File Name', date: '2023-10-26', status: '...', statusClass: '' },
  { name: 'RSC_data_Q4.xxx', date: '', status: 'Completed', statusClass: 'status-completed' },
  { name: 'Network_logs_Oct.csv', date: '', status: 'Completed', statusClass: 'status-completed' },
  { name: 'Q3 Financials.xxx', date: '', status: 'Failed (Error: Column mismatch)', statusClass: 'status-failed' },
];

// --- 2. Data for Dashboard Summary Cards (Used in DashboardContent) ---
export const overviewSummaryData = [
  { 
    title: 'wireless', 
    value: '850,000', 
    stats: { trend: 'positive', arrow: '↑', percentage: '+15%' },
    path: '/data/wireless' // Path to navigate to
  },
  { 
    title: 'transport', 
    value: '320,000', 
    stats: { trend: 'neutral', arrow: '↔', percentage: '-0%' },
    path: '/data/transport'
  },
  { 
    title: 'wireline', 
    value: '680,000', 
    stats: { trend: 'negative', arrow: '↓', percentage: '-5%' },
    path: '/data/wireline'
  },
  { 
    title: 'total no. of data', 
    value: '1,850,000', 
    stats: { trend: 'positive', arrow: '↑', percentage: '+3%' },
    path: '/data/total'
  }
];

// --- 3. Data for Data Grid Page Tabs (Used in DataGridPage) ---
export const dashboardTabs = [
  { id: 'wireless', name: 'Wireless' },
  { id: 'transport', name: 'Transport' },
  { id: 'wireline', name: 'Wireline' },
  { id: 'total', name: 'Total no of data' },
];

// --- 4. Function for Data Grid Page (Currently NOT USED, but good to keep) ---
export const getSummaryData = (activeTab) => {
  if (activeTab === 'wireless') {
    return [
      { title: 'wireless connections', value: '850,000', stats: { trend: 'positive', arrow: '↑', percentage: '+15%' } },
      { title: 'data usage (TB)', value: '1,200', stats: { trend: 'positive', arrow: '↑', percentage: '+22%' } },
    ];
  }
  // ... other cases
  return [];
};