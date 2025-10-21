// import React from 'react';
// import DashboardContent from '../components/DashboardContent.jsx';

// // This is the main dashboard page
// function DashboardPage() {
//   return (
//     <>
//       {/* --- This is the simple header from your original design --- */}
//       <header className="header">
//         <span>Testing</span>
//       </header>

//       {/* --- This renders your cards, chart, and upload panels --- */}
//       <DashboardContent />
//     </>
//   );
// }

// export default DashboardPage;

import React, { useState } from 'react';
import DashboardContent from '../components/DashboardContent.jsx';

// This is the main dashboard page
function DashboardPage() {
  // NEW: Add state to track the active preview.
  // We'll set 'wireless' as the default.
  const [activePreview, setActivePreview] = useState('wireless');

  return (
    <>

      {/* --- NEW: Pass the state and setter function to the content --- */}
      <DashboardContent 
        activePreview={activePreview} 
        onCardClick={setActivePreview} 
      />
    </>
  );
}

export default DashboardPage;