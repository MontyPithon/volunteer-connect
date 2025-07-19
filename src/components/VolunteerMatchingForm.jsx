import React, { useState } from 'react';
import { volunteers } from './volunteers';

const VolunteerMatchingForm = () => {
  const [selectedVolunteerId, setSelectedVolunteerId] = useState('');
  const [matches, setMatches] = useState([]);
  const [error, setError] = useState('');

  const handleVolunteerChange = async (e) => {
    const volunteerId = parseInt(e.target.value, 10);
    setSelectedVolunteerId(volunteerId);
    setMatches([]);
    setError('');

    const volunteer = volunteers.find(v => v.id === volunteerId);
    if (!volunteer) return;

    try {
      const response = await fetch('http://localhost:5000/api/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(volunteer)
      });

      if (!response.ok) throw new Error('Failed to fetch matches');
      const data = await response.json();
      setMatches(data.matches);
    } catch (err) {
      setError('Error fetching matched events.');
    }
  };

  return (
    <div className="min-h-screen flex items-start justify-center bg-gray-50 py-8 px-4">
      <div className="max-w-4xl w-full space-y-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold">Volunteer Matching Form</h2>
          <p className="text-sm text-gray-600">
            Match volunteers with events based on their skills and availability
          </p>
        </div>

        <div className="bg-white p-6 shadow rounded border">
          <label htmlFor="volunteer" className="block text-sm font-medium mb-2">
            Select Volunteer
          </label>
          <select
            id="volunteer"
            className="w-full border px-3 py-2 rounded mb-4"
            value={selectedVolunteerId}
            onChange={handleVolunteerChange}
          >
            <option value="">-- Select a Volunteer --</option>
            {volunteers.map(v => (
              <option key={v.id} value={v.id}>{v.fullName}</option>
            ))}
          </select>

          {error && <p className="text-red-600 mb-4">{error}</p>}

          <div>
            <h3 className="font-semibold mb-2">Matched Events:</h3>
            {matches.length === 0
              ? <p>No matches found.</p>
              : (
                <ul className="list-disc list-inside">
                  {matches.map(ev => (
                    <li key={ev.id}>
                      <strong>{ev.name}</strong> — {ev.date} ({ev.location})
                    </li>
                  ))}
                </ul>
              )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VolunteerMatchingForm;
