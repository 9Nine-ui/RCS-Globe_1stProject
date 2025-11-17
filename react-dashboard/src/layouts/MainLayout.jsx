import React, { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar.jsx';

// This component is the main layout of your app
function MainLayout() {
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  return (
    <div className="dashboard-container">
      <header className="app-header">
        <div className="header-content">
          <div className="header-logo-section">
            <Link to="/dashboard">
              <img src="/globe.png" alt="Globe Telecom" className="header-logo" />
            </Link>
          </div>
          <div className="header-title-section">
            <h1 className="header-title">RCS Globe Dashboard</h1>
          </div>
          <div className="header-actions">
            <div className="header-user-dropdown-wrapper">
              <button 
                className="header-user-btn"
                onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
              >
                <svg className="header-user-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z" fill="currentColor"/>
                </svg>
                <svg className="header-dropdown-arrow" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M7 10L12 15L17 10H7Z" fill="currentColor"/>
                </svg>
              </button>
              {isUserDropdownOpen && (
                <div className="header-user-dropdown">
                  <Link to="/dashboard/users" className="header-dropdown-item" onClick={() => setIsUserDropdownOpen(false)}>
                    <svg className="dropdown-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z" fill="currentColor"/>
                    </svg>
                    Users
                  </Link>
                  <Link to="/" className="header-dropdown-item" onClick={() => setIsUserDropdownOpen(false)}>
                    <svg className="dropdown-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M17 7L15.59 8.41L18.17 11H8V13H18.17L15.59 15.59L17 17L22 12L17 7ZM4 5H12V3H4C2.9 3 2 3.9 2 5V19C2 20.1 2.9 21 4 21H12V19H4V5Z" fill="currentColor"/>
                    </svg>
                    Logout
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
      <div className="dashboard-body">
        <Sidebar />
        <main className="main-content">
          {/* <Outlet> is the placeholder where your "pages" will be rendered */}
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default MainLayout;