import React, { useState, useEffect } from 'react';
import { volunteers } from './volunteers';

const VolunteerHistory = () => {
  const [selectedId, setSelectedId] = useState('');
  const [history, setHistory] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!selectedId) return;

    const fetchHistory = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/history/${selectedId}`);
        if (!res.ok) throw new Error('Not found');
        const data = await res.json();
        setHistory(data.history);
        setError('');
      } catch {
        setHistory([]);
        setError('No history found.');
      }
    };

    fetchHistory();
  }, [selectedId]);

  return (
    <div className="min-h-screen flex items-start justify-center bg-gray-50 py-8 px-4">
      <div className="max-w-7xl w-full space-y-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold">Volunteer History</h2>
          <p className="text-sm text-gray-600">
            View participation history and event details for volunteers
          </p>
        </div>

        <div className="bg-white p-6 shadow rounded border">
          <label className="block text-sm font-medium mb-2">
            Select Volunteer
          </label>
          <select
            className="w-full border px-3 py-2 rounded mb-4"
            value={selectedId}
            onChange={e => setSelectedId(e.target.value)}
          >
            <option value="">-- Select Volunteer --</option>
            {volunteers.map(v => (
              <option key={v.id} value={v.id}>{v.fullName}</option>
            ))}
          </select>

          {error && <p className="text-red-600 mb-4">{error}</p>}

          {history.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium">Event</th>
                  <th className="px-6 py-3 text-left text-xs font-medium">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {history.map((h, i) => (
                  <tr key={i}>
                    <td className="px-6 py-4">{h.name}</td>
                    <td className="px-6 py-4">{h.date}</td>
                    <td className="px-6 py-4">{h.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            !error && selectedId && <p>No history available.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default VolunteerHistory;
