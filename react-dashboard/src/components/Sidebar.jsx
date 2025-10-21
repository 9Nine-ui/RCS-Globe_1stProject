// import React from 'react';
// import { Link, useLocation } from 'react-router-dom';

// function Sidebar() {
//   const location = useLocation(); // This hook gets the current URL
//   const pathname = location.pathname;

//   const navItems = [
//     { name: 'Dashboard', icon: '📊', path: '/' },
//     { name: 'Data Import', icon: '📥', path: '/import' },
//     { name: 'Settings', icon: '⚙️', path: '/settings' }, // This link won't go anywhere yet
//   ];

//   return (
//     <aside className="sidebar">
//       <nav>
//         <ul className="sidebar-nav">
//           {navItems.map((item) => (
//             <li key={item.name}>
//               {/* Use <Link> instead of <a> for client-side routing */}
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
//     </aside>
//   );
// }

// export default Sidebar;

import React from 'react';
import { Link, useLocation } from 'react-router-dom';

function Sidebar() {
  const location = useLocation(); 
  const pathname = location.pathname;

  const navItems = [
    { name: 'Dashboard', icon: '📊', path: '/' },
    { name: 'Data Import', icon: '📥', path: '/import' },
    { name: 'Settings', icon: '⚙️', path: '/settings' },
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

      {/* --- NEW: User Profile Section --- */}
      <div className="sidebar-profile">
        <div className="profile-avatar">
          {/* You can replace this with an <img> tag */}
          <span className="profile-initials">F</span>
        </div>
        <div className="profile-info">
          <span className="profile-name">Fernandez</span>
        </div>
        <span className="profile-dropdown-icon">expand_more</span>
      </div>
      {/* --- End of User Profile Section --- */}

    </aside>
  );
}

export default Sidebar;