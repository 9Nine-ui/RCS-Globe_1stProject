// import React from 'react';
// import ReactDOM from 'react-dom/client';
// import { createBrowserRouter, RouterProvider } from 'react-router-dom';

// import './App.css'; 

// // 1. Import your new layout and pages
// import MainLayout from './layouts/MainLayout.jsx';
// import DashboardPage from './pages/DashboardPage.jsx';
// import DataImportPage from './pages/DataImportPage.jsx';
// import DataGridPage from './pages/DataGridPage.jsx'; // <-- IMPORT THE NEW PAGE

// // 2. Define your routes
// const router = createBrowserRouter([
//   {
//     path: '/',
//     element: <MainLayout />,
//     children: [
//       {
//         path: '/',
//         element: <DashboardPage />,
//       },
//       {
//         path: '/import',
//         element: <DataImportPage />,
//       },
//       {
//         path: '/data/:category', // <-- ADD THIS NEW DYNAMIC ROUTE
//         element: <DataGridPage />,
//       },
//     ],
//   },
// ]);

// // 3. Provide the router to your app
// ReactDOM.createRoot(document.getElementById('root')).render(
//   <React.StrictMode>
//     <RouterProvider router={router} />
//   </React.StrictMode>
// );

import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import './App.css'; 

// 1. Import your pages and layout
import MainLayout from './layouts/MainLayout.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import DataImportPage from './pages/DataImportPage.jsx';
import DataGridPage from './pages/DataGridPage.jsx';
import LoginPage from './pages/LoginPage.jsx'; // <-- IMPORT THE NEW LOGIN PAGE
import UsersPage from './pages/UsersPage.jsx';
import AddUserPage from './pages/AddUserPage.jsx'; // <-- IMPORT THE NEW PAGE
import ArchivePage from './pages/ArchivePage.jsx'; // <-- IMPORT THE ARCHIVE PAGE

// 2. Define your new routes
const router = createBrowserRouter([
  {
    path: '/', // The root path '/' will now be the Login Page
    element: <LoginPage />,
  },
  {
    path: '/dashboard', // Your main app will now live under '/dashboard'
    element: <MainLayout />,
    children: [
      {
        path: '', // The '/' path relative to '/dashboard'
        element: <DashboardPage />,
      },
      {
        path: 'import', // Will be /dashboard/import
        element: <DataImportPage />,
      },
      {
        path: 'data/:category', // Will be /dashboard/data/...
        element: <DataGridPage />,
      },
      { 
        path: 'users', 
        element: <UsersPage />, // <-- USE THE IMPORTED PAGE
      },
      { path: 'users/add', 
        element: <AddUserPage /> 
      },
      {
        path: 'archive',
        element: <ArchivePage />,
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