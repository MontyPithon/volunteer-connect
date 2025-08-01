import React, { useEffect, useState } from 'react';
import { fetchHistory } from '../services/historyService';

export default function VolunteerHistory({ volunteerId }) {
  const [records, setRecords] = useState([]);

  useEffect(() => {
    fetchHistory(volunteerId).then(setRecords).catch(console.error);
  }, [volunteerId]);

  return (
    <div>
      <h2>Volunteer History</h2>
      <table>
        <thead>
          <tr><th>Event</th><th>Date</th><th>Status</th><th>Notes</th></tr>
        </thead>
        <tbody>
          {records.map(r => (
            <tr key={r.id}>
              <td>{r.EventDetail.name}</td>
              <td>{new Date(r.timestamp).toLocaleString()}</td>
              <td>{r.State.name}</td>
              <td>{r.notes}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
