import React, { useEffect, useState } from 'react';
import api from '../api';

export default function DebugDrivers() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const test = async () => {
      try {
        console.log('Calling /api/driver/all...');
        const response = await api.get('/api/driver/all');
        console.log('Full response:', response);
        console.log('Response data:', response.data);
        setData(response.data);
      } catch (err) {
        console.error('Error:', err);
        setError(err.message);
      }
    };
    test();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Driver API Debug</h1>
      {error && <div className="bg-red-100 p-4 rounded mb-4">Error: {error}</div>}
      {data && (
        <div className="bg-gray-100 p-4 rounded">
          <pre>{JSON.stringify(data, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
