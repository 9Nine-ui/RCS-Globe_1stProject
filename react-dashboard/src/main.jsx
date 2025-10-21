import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import './App.css'; 

// 1. Import your new layout and pages
import MainLayout from './layouts/MainLayout.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import DataImportPage from './pages/DataImportPage.jsx';
import DataGridPage from './pages/DataGridPage.jsx'; // <-- IMPORT THE NEW PAGE

// 2. Define your routes
const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        path: '/',
        element: <DashboardPage />,
      },
      {
        path: '/import',
        element: <DataImportPage />,
      },
      {
        path: '/data/:category', // <-- ADD THIS NEW DYNAMIC ROUTE
        element: <DataGridPage />,
      },
    ],
  },
]);

// 3. Provide the router to your app
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);