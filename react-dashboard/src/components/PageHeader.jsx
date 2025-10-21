// import React from 'react';

// function PageHeader() {
//   return (
//     <div className="page-header">
      
//       {/* --- NEW: Search and Filter elements --- */}
//       <div className="search-and-filter">
//         <div className="search-bar">
//           <span className="search-icon">🔍</span>
//           <input type="text" placeholder="Type here to search..." />
//         </div>
//         <button className="filter-button">
//           <span className="filter-icon">tune</span> {/* This is the Google Material Icon name */}
//           Filter
//         </button>
//       </div>
//       {/* -------------------------------------- */}

//       <div className="header-right">
//         <span className="user-icon">👤</span>
//         <span>Testing</span>
//       </div>
//     </div>
//   );
// }

// export default PageHeader;
import React from 'react';

function PageHeader() {
  return (
    <div className="page-header">
      
      <div className="search-and-filter">
        <div className="search-bar">
          <span className="search-icon">🔍</span>
          <input type="text" placeholder="Type here to search..." />
        </div>
        <button className="filter-button">
          <span className="filter-icon">tune</span> {/* This is the Google Material Icon name */}
          Filter
        </button>
        
        {/* --- NEW EXPORT BUTTON --- */}
        <button className="export-button">
          <span className="export-icon">file_download</span> {/* Material Icon for 'download' */}
          Export
        </button>
        {/* --- END NEW BUTTON --- */}

      </div>
    </div>
  );
}

export default PageHeader;