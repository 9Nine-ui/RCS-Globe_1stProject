import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar.jsx';

// This component is the main layout of your app
function MainLayout() {
  return (
    <div className="dashboard-container">
      <Sidebar />
      <main className="main-content">
        {/* <Outlet> is the placeholder where your "pages" will be rendered */}
        <Outlet />
      </main>
    </div>
  );
}

export default MainLayout;