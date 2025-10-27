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