

import React from 'react';
import { useNavigate } from 'react-router-dom';

// --- Mock Data for Users ---
const mockUsers = [
  { id: 1, firstName: 'Juan', lastName: 'Dela Cruz', email: 'juan.delacruz@company.com', role: 'Admin' },
  { id: 2, firstName: 'Maria', lastName: 'Santos', email: 'maria.santos@company.com', role: 'User' },
  { id: 3, firstName: 'Pedro', lastName: 'Reyes', email: 'pedro.reyes@company.com', role: 'User' },
];

function UsersPage() {
  const navigate = useNavigate();

  const handleAddUser = () => {
    navigate('/dashboard/users/add'); 
  };

  return (
    <div className="users-page-layout">
      {/* --- MODIFIED: Header now only contains the title --- */}
      <header className="page-header users-page-header">
         <h2>User Management</h2>
         {/* Button removed from here */}
      </header>

      <section className="content-panel">
        {/* --- MODIFIED: New container for heading and button --- */}
        <div className="current-users-header">
          <h3>Current Users</h3>
          <button className="btn btn-primary add-user-btn" onClick={handleAddUser}>
           Add User
          </button>
        </div>
        {/* --- End of modification --- */}
        
        <div className="users-table-container">
          <table>
            <thead>
              <tr>
                <th>First Name</th>
                <th>Last Name</th>
                <th>Email Address</th>
                <th>Role</th> 
              </tr>
            </thead>
            <tbody>
              {mockUsers.map((user) => (
                <tr key={user.id}>
                  <td>{user.firstName}</td>
                  <td>{user.lastName}</td>
                  <td>{user.email}</td>
                  <td>{user.role}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default UsersPage;