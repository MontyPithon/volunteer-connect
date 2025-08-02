import React, { useState, useEffect, useContext } from 'react';
import { fetchHistory } from '../services/historyService';
import { AuthContext } from '../context/AuthContext';

const VolunteerHistory = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser } = useContext(AuthContext);

  useEffect(() => {
    if (currentUser) {
      setLoading(true);
      setError(null);
      fetchHistory(currentUser.id)
        .then(data => {
          console.log('Fetched history data:', data);
          const historyArray = data.history || [];
          console.log('History array:', historyArray);
          setRecords(historyArray);
          setLoading(false);
        })
        .catch(err => {
          console.error('Error fetching history:', err);
          setError("Failed to load volunteer history: " + err.message);
          setLoading(false);
        });
    }
  }, [currentUser]);

  if (loading) return <div>Loading history...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  const historyRecords = Array.isArray(records) ? records : [];

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-6">My Volunteer History</h2>
      
      {historyRecords.length === 0 ? (
        <p>You haven't participated in any events yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-2 px-4 border-b text-left">Event Name</th>
                <th className="py-2 px-4 border-b text-left">Event Date</th>
                <th className="py-2 px-4 border-b text-left">Status</th>
                <th className="py-2 px-4 border-b text-left">Feedback</th>
              </tr>
            </thead>
            <tbody>
              {historyRecords.map(r => (
                <tr key={r.history_id} className="hover:bg-gray-50">
                  <td className="py-2 px-4 border-b">{r.event_name || 'Unknown Event'}</td>
                  <td className="py-2 px-4 border-b">{r.event_date ? new Date(r.event_date).toLocaleDateString() : 'No date'}</td>
                  <td className="py-2 px-4 border-b">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      r.status === 'Attended' ? 'bg-green-100 text-green-800' :
                      r.status === 'Confirmed' ? 'bg-blue-100 text-blue-800' :
                      r.status === 'Assigned' ? 'bg-yellow-100 text-yellow-800' :
                      r.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="py-2 px-4 border-b">{r.feedback || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default VolunteerHistory;
