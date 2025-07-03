import React, { useState } from 'react';
import { volunteers } from './volunteers';
import { volunteerHistory } from './volunteerHistoryData';

const VolunteerHistory = () => {
  const [selectedId, setSelectedId] = useState('');

  const handleSelect = (e) => {
    setSelectedId(e.target.value);
  };

  const history = volunteerHistory[selectedId] || [];

  return (
    <div style={{ padding: '20px' }}>
      <h2>Volunteer History</h2>

      <label>Select Volunteer:</label>
      <select value={selectedId} onChange={handleSelect}>
        <option value="">-- Select Volunteer --</option>
        {volunteers.map(v => (
          <option key={v.id} value={v.id}>{v.fullName}</option>
        ))}
      </select>

      {selectedId && (
        <>
          <h3>Participation History:</h3>
          {history.length === 0 ? (
            <p>No history available.</p>
          ) : (
            <table border="1" cellPadding="8" style={{ marginTop: '10px' }}>
              <thead>
                <tr>
                  <th>Event Name</th>
                  <th>Description</th>
                  <th>Location</th>
                  <th>Required Skills</th>
                  <th>Urgency</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {history.map((event, index) => (
                  <tr key={index}>
                    <td>{event.name}</td>
                    <td>{event.description}</td>
                    <td>{event.location}</td>
                    <td>{event.requiredSkills?.join(', ') || 'N/A'}</td>
                    <td>{event.urgency}</td>
                    <td>{event.date}</td>
                    <td>{event.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}
    </div>
  );
};

export default VolunteerHistory;
