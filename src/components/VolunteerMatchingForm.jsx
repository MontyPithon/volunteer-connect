import React, { useState } from 'react';
import { volunteers } from './volunteers';
import { events } from './events';
import { getMatchingEvents } from './matchLogic';

const VolunteerMatchingForm = () => {
  const [selectedVolunteerId, setSelectedVolunteerId] = useState('');
  const [matches, setMatches] = useState([]);

  const handleVolunteerChange = e => {
    const volunteerId = parseInt(e.target.value);
    setSelectedVolunteerId(volunteerId);

    const volunteer = volunteers.find(v => v.id === volunteerId);
    const matchedEvents = getMatchingEvents(volunteer, events);
    setMatches(matchedEvents);
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Volunteer Matching Form</h2>

      <label htmlFor='volunteer'>Select Volunteer:</label>
      <select
        id='volunteer'
        onChange={handleVolunteerChange}
        value={selectedVolunteerId}
      >
        <option value=''>-- Select Volunteer --</option>
        {volunteers.map(v => (
          <option key={v.id} value={v.id}>
            {v.fullName}
          </option>
        ))}
      </select>

      {matches.length > 0 && (
        <div>
          <h3>Matched Events:</h3>
          <ul>
            {matches.map(event => (
              <li key={event.id}>
                <strong>{event.name}</strong>
                <br />
                {event.description}
                <br />
                <em>{event.location}</em> — {event.date} — Urgency:{' '}
                {event.urgency}
              </li>
            ))}
          </ul>
        </div>
      )}

      {selectedVolunteerId && matches.length === 0 && (
        <p>No matching events found for this volunteer.</p>
      )}
    </div>
  );
};

export default VolunteerMatchingForm;
