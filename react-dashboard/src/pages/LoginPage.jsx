import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function LoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    
    // Simple role assignment based on username
    // In a real app, this would come from your backend authentication
    // Admin users: admin@globetelecom.com
    // Regular users: everyone else
    const isAdmin = username.toLowerCase().includes('admin');
    const userRole = isAdmin ? 'Admin' : 'User';
    
    // Store user role in localStorage
    localStorage.setItem('userRole', userRole);
    localStorage.setItem('username', username);
    
    navigate('/dashboard');
  };

  return (
    <div className="login-container">
      <div className="login-box">
        
        {/* --- 2. Add the Image Component Here --- */}
        <img src="/globe.png" alt="App Logo" className="login-logo" />
        {/* --------------------------------------- */}

        <h2>RSC GLOBE</h2>
        <p>Please log in to access your dashboard.</p>
        
        <form className="login-form" onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input 
              type="text" 
              id="username" 
              name="username" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required 
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input 
              type="password" 
              id="password" 
              name="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>
          <button type="submit" className="btn btn-primary login-btn">
            Login
          </button>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;