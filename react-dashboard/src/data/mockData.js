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
    path: '/data/total' // <-- THIS IS THE URL PATH
  }
];

// --- 3. Data for Data Grid Page Tabs (Used in DataGridPage) ---
export const dashboardTabs = [
  { id: 'wireless', name: 'Wireless' },
  { id: 'transport', name: 'Transport' },
  { id: 'wireline', name: 'Wireline' },
  { id: 'data', name: 'All Data' },
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

// --- ADD THIS NEW DATA FOR THE DATA GRID PAGE ---

export const wirelessGridData = [
  { id: 'W-1001', name: 'Tower A Maintenance', status: 'Completed', value: 5000 },
  { id: 'W-1002', name: 'Signal Boost', status: 'In Progress', value: 12000 },
  { id: 'W-1003', name: 'New Install', status: 'Pending', value: 75000 },
  { id: 'W-1004', name: 'Router-045', status: 'Completed', value: 850 },
  { id: 'W-1005', name: 'Router-046', status: 'Completed', value: 850 },
];

export const transportGridData = [
  { id: 'T-2001', name: 'Fiber Optic Line (Segment 4)', status: 'Completed', value: 150000 },
  { id: 'T-2002', name: 'Network Switch 08', status: 'Failed', value: 4500 },
  { id: 'T-2003', name: 'Backbone Upgrade', status: 'In Progress', value: 320000 },
];

export const wirelineGridData = [
  { id: 'L-3001', name: 'Customer Install (A-45)', status: 'Completed', value: 300 },
  { id: 'L-3002', name: 'Customer Install (A-46)', status: 'Completed', value: 300 },
  { id: 'L-3003', name: 'Line Repair (B-12)', status: 'Pending', value: 900 },
];

export const totalGridData = [
  ...wirelessGridData,
  ...transportGridData,
  ...wirelineGridData,
];

// --- ADD THIS NEW PREVIEW DATA FOR THE DASHBOARD PAGE ---

export const wirelessPreviewData = [
  { id: 'W-1001', name: 'Tower A Maintenance', status: 'Completed', value: 5000 },
  { id: 'W-1002', name: 'Signal Boost', status: 'In Progress', value: 12000 },
  { id: 'W-1003', name: 'New Install', status: 'Pending', value: 75000 },
];

export const transportPreviewData = [
  { id: 'T-2001', name: 'Fiber Optic Line (Segment 4)', status: 'Completed', value: 150000 },
  { id: 'T-2002', name: 'Network Switch 08', status: 'Failed', value: 4500 },
];

export const wirelinePreviewData = [
  { id: 'L-3001', name: 'Customer Install (A-45)', status: 'Completed', value: 300 },
  { id: 'L-3002', name: 'Customer Install (A-46)', status: 'Completed', value: 300 },
  { id: 'L-3003', name: 'Line Repair (B-12)', status: 'Pending', value: 900 },
];

export const totalPreviewData = [
  { id: 'W-1001', name: 'Tower A Maintenance', status: 'Completed', value: 5000 },
  { id: 'T-2001', name: 'Fiber Optic Line (Segment 4)', status: 'Completed', value: 150000 },
  { id: 'L-3001', name: 'Customer Install (A-45)', status: 'Completed', value: 300 },
];