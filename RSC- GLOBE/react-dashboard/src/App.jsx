import React, { useState } from 'react';
import UploadChart from './components/UploadChart';

function App() {
  const [data, setData] = useState({ transport: 0, wireless: 0, wireline: 0 });

  const handleDataUpdate = () => {
    // You can fetch updated chart data from the backend here
    fetch('http://localhost:5000/data')
      .then(res => res.json())
      .then(updatedData => setData(updatedData));
  };

  return (
    <div className="App">
      <h1>Upload Excel File</h1>
      <UploadChart data={data} onDataUpdate={handleDataUpdate} />
    </div>
  );
}

export default App;
