// import React, { useState } from 'react'; // <-- Import useState
// import { Link, useLocation } from 'react-router-dom';

// function Sidebar() {
//   const location = useLocation(); 
//   const pathname = location.pathname;
//   const [isDropdownOpen, setIsDropdownOpen] = useState(false); // <-- Add state

//   const navItems = [
//     { name: 'Dashboard', icon: '📊', path: '/dashboard' },
//     { name: 'Data Import', icon: '📥', path: '/dashboard/import' },
//   ];

//   return (
//     <aside className="sidebar">
      
//       {/* --- Navigation Links --- */}
//       <nav className="sidebar-nav-main">
//         <ul className="sidebar-nav">
//           {navItems.map((item) => (
//             <li key={item.name}>
//               <Link
//                 to={item.path}
//                 className={pathname === item.path ? 'active' : ''}
//               >
//                 <span className="icon">{item.icon}</span>
//                 {item.name}
//               </Link>
//             </li>
//           ))}
//         </ul>
//       </nav>

//       {/* --- User Profile Section Wrapper --- */}
//       <div className="sidebar-profile-container"> {/* New wrapper */}

//         {/* --- NEW: Profile Dropdown --- */}
//         {isDropdownOpen && (
//           <div className="profile-dropdown">
//             <Link to="#" className="profile-dropdown-item">
//               <span className="material-icons">person</span>
//               Profile
//             </Link>
//             <Link to="/" className="profile-dropdown-item logout">
//               <span className="material-icons">logout</span>
//               Logout
//             </Link>
//           </div>
//         )}
//         {/* --- End of Dropdown --- */}

//         {/* --- Profile Clickable Area --- */}
//         <div 
//           className="sidebar-profile" 
//           onClick={() => setIsDropdownOpen(!isDropdownOpen)} // Toggle on click
//         >
//           <div className="profile-avatar">
//             <span className="profile-initials">F</span>
//           </div>
//           <div className="profile-info">
//             <span className="profile-name">Fernandez</span>
//           </div>
//           {/* Icon now rotates */}
//           <span className={`profile-dropdown-icon ${isDropdownOpen ? 'open' : ''}`}>
//             expand_more
//           </span>
//         </div>
//       </div>
//     </aside>
//   );
// }

// export default Sidebar;


import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

function Sidebar() {
  const location = useLocation(); 
  const pathname = location.pathname;
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // State

  const navItems = [
    { name: 'Dashboard', icon: '📊', path: '/dashboard' },
    { name: 'Data Import', icon: '📥', path: '/dashboard/import' },
    { name: 'Users', icon: '👤', path: '/dashboard/users' }, // <-- ADD THIS LINE
  ];

  return (
    <aside className="sidebar">
      
      {/* --- Navigation Links --- */}
      <nav className="sidebar-nav-main">
        <ul className="sidebar-nav">
          {navItems.map((item) => (
            <li key={item.name}>
              <Link
                to={item.path}
                className={pathname === item.path ? 'active' : ''}
              >
                <span className="icon">{item.icon}</span>
                {item.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* --- User Profile Section Wrapper --- */}
      <div className="sidebar-profile-container">

        {/* --- Profile Clickable Area --- */}
        <div 
          className="sidebar-profile" 
          onClick={() => setIsDropdownOpen(!isDropdownOpen)} // Toggle on click
        >
          <div className="profile-avatar">
            <span className="profile-initials">T</span>
          </div>
          <div className="profile-info">
            <span className="profile-name">Tester</span>
          </div>
          {/* Icon now rotates */}
          <span className={`profile-dropdown-icon ${isDropdownOpen ? 'open' : ''}`}>
            expand_more
          </span>
        </div>

        {/* --- Profile Dropdown (Now placed *after* the bar) --- */}
        <div className={`profile-dropdown ${isDropdownOpen ? 'open' : ''}`}> 
          <Link to="#" className="profile-dropdown-item">
            {/* Using Google Icons, which are built-in */}
            <span className="material-icons">person</span>
            Profile
          </Link>
          <Link to="/" className="profile-dropdown-item logout">
            <span className="material-icons">logout</span>
            Logout
          </Link>
        </div>
        {/* --- End of Dropdown --- */}
        
      </div>
    </aside>
  );
}

export default Sidebar;