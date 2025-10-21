// import { useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
// import './App.css'

// function App() {
//   const [count, setCount] = useState(0)

//   return (
//     <>
//       <div>
//         <a href="https://vite.dev" target="_blank">
//           <img src={viteLogo} className="logo" alt="Vite logo" />
//         </a>
//         <a href="https://react.dev" target="_blank">
//           <img src={reactLogo} className="logo react" alt="React logo" />
//         </a>
//       </div>
//       <h1>Vite + React</h1>
//       <div className="card">
//         <button onClick={() => setCount((count) => count + 1)}>
//           count is {count}
//         </button>
//         <p>
//           Edit <code>src/App.jsx</code> and save to test HMR
//         </p>
//       </div>
//       <p className="read-the-docs">
//         Click on the Vite and React logos to learn more
//       </p>
//     </>
//   )
// }

// export default App
import React, { useState } from 'react';

// --- Data for Cards ---
// In a real app, this data would come from an API
const summaryData = [
    {
        title: 'wireless',
        value: '850,000',
        stats: { trend: 'positive', arrow: '↑', percentage: '+15%' }
    },
    {
        title: 'transport',
        value: '320,000',
        stats: { trend: 'neutral', arrow: '↔', percentage: '-0%' }
    },
    {
        title: 'wireline',
        value: '680,000',
        stats: { trend: 'negative', arrow: '↓', percentage: '-5%' }
    },
    {
        title: 'total no. of data',
        value: '1,850,000',
        stats: { trend: 'positive', arrow: '↑', percentage: '+3%' }
    }
];

// --- Data for Import List ---
const importData = [
    { name: 'File Name', date: '2023-10-26', status: '...', statusClass: '' },
    { name: 'RSC_data_Q4.xxx', date: '', status: 'Completed', statusClass: 'status-completed' },
    { name: 'Network_logs_Oct.csv', date: '', status: 'Completed', statusClass: 'status-completed' },
    { name: 'Q3 Financials.xxx', date: '', status: 'Failed (Error: Column mismatch)', statusClass: 'status-failed' },
];


// ==== Reusable Card Component ====
function Card({ title, value, stats, onClick }) {
    return (
        <div
            className="card"
            onClick={onClick} // Click handler
            role="button"     // Accessibility
            tabIndex="0"      // Accessibility
            // Keyboard accessibility (Enter/Space)
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onClick()}
        >
            <h3>{title}</h3>
            <p className="value">{value}</p>
            <div className={`stats ${stats.trend}`}>
                <span className="arrow">{stats.arrow}</span>
                <span className="percentage">{stats.percentage}</span>
            </div>
        </div>
    );
}

// ==== Sidebar Component ====
function Sidebar() {
    // 'useState' manages which tab is currently active
    const [activeItem, setActiveItem] = useState('Dashboard');

    const navItems = [
        { name: 'Dashboard', icon: '📊' },
        { name: 'Data Import', icon: '📥' },
        { name: 'Reports', icon: '📈' },
        { name: 'Settings', icon: '⚙️' }
    ];

    return (
        <aside className="sidebar">
            <nav>
                <ul className="sidebar-nav">
                    {navItems.map((item) => (
                        <li key={item.name}>
                            <a
                                href="#"
                                className={activeItem === item.name ? 'active' : ''}
                                onClick={() => setActiveItem(item.name)}
                            >
                                <span className="icon">{item.icon}</span>
                                {item.name}
                            </a>
                        </li>
                    ))}
                </ul>
            </nav>
        </aside>
    );
}

// ==== Main Content Component ====
function MainContent() {
    
    // This function handles what happens when a card is clicked
    const handleCardClick = (title) => {
        // For now, just show an alert
        alert(`You clicked on: ${title}`);
        
        // In a real app, you would do something else, like:
        // - Filter the main chart based on the title
        // - Navigate to a detailed page, e.g., router.push(`/details/${title}`)
    };

    return (
        <main className="main-content">
            {/* --- Header --- */}
            <header className="header">
                <span>Testing</span>
            </header>

            {/* --- Summary Cards --- */}
            <section className="summary-cards">
                {summaryData.map((data) => (
                    <Card
                        key={data.title}
                        title={data.title}
                        value={data.value}
                        stats={data.stats}
                        // Pass the handler function to the Card component
                        onClick={() => handleCardClick(data.title)}
                    />
                ))}
            </section>

            {/* --- Main Chart --- */}
            <section className="chart-container">
                <h2>Preview of Data Inside the Category</h2>
                {/* This is a placeholder div. You would use a library like Chart.js here. */}
                <div className="chart-placeholder"></div>
            </section>

            {/* --- Bottom Row Content --- */}
            <section className="bottom-content">
                
                {/* Excel Upload Panel */}
                <div className="content-panel excel-upload">
                    <h2>Excel Integration & Upload</h2>
                    <p>Effortlessly upload and manage your Excel files.</p>
                    <div className="upload-buttons">
                        <button className="btn btn-primary">Upload New Excel File</button>
                        <button className="btn btn-secondary">Download Template</button>
                        <button className="btn btn-secondary">Connect to OneDrive</button>
                    </div>
                    <div className="previous-uploads">
                        <h3>Previous Uploads:</h3>
                        <div className="previous-uploads-list">
                            Q4_Regional_Traffic_Data.xlsx &nbsp; | &nbsp; Uploaded Traffic Report.xxx &nbsp; | &nbsp; 2023-19-20
                        </div>
                    </div>
                </div>

                {/* Recent Import List */}
                <div className="content-panel import-list">
                    <h2>Recent Import List of Data</h2>
                    <table>
                        <thead>
                            <tr>
                                <th>File Name</th>
                                <th>Date</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {importData.map((item, index) => (
                                <tr key={index}>
                                    <td>{item.name}</td>
                                    <td>{item.date}</td>
                                    <td className={`status ${item.statusClass}`}>{item.status}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

            </section>
        </main>
    );
}

// ==== Main App Component ====
// This is the main component that holds everything together.
function App() {
    return (
        <div className="dashboard-container">
            <Sidebar />
            <MainContent />
        </div>
    );
}

export default App;