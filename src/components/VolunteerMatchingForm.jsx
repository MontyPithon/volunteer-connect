import React, { useState, useEffect } from 'react';

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  // YYYY-MM-DD
  return date.toISOString().split('T')[0];
};

const VolunteerMatchingForm = () => {
  const [selectedEventId, setSelectedEventId] = useState('');
  const [events, setEvents] = useState([]);
  const [matches, setMatches] = useState([]);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch events when component mounts
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/events');
        if (!response.ok) throw new Error('Failed to fetch events');
        const data = await response.json();
        setEvents(data.events || []);
      } catch (err) {
        console.error('Error fetching events:', err);
        setError('Error loading events: ' + err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const handleEventChange = async (e) => {
    const eventId = e.target.value;
    setSelectedEventId(eventId);
    setMatches([]);
    setError('');
    setSuccessMessage('');

    if (!eventId) return;

    try {
      const response = await fetch(`http://localhost:5000/api/match/event/${eventId}`);
      if (!response.ok) throw new Error('Failed to fetch matches for event');
      const data = await response.json();
      setMatches(data.matches || []);
    } catch (err) {
      setError('Error fetching matched volunteers: ' + err.message);
    }
  };

  const handleAssignVolunteer = async (volunteerId) => {
    if (!selectedEventId) {
      setError('Please select an event first');
      return;
    }

    setIsAssigning(true);
    setError('');
    setSuccessMessage('');

    try {
      const response = await fetch('http://localhost:5000/api/match/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          volunteerId: volunteerId,
          eventId: selectedEventId
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to assign volunteer to event');
      }

      setSuccessMessage(`Successfully assigned volunteer to event! ${data.message}`);
      
      // Refresh the matches to update UI
      if (selectedEventId) {
        const response = await fetch(`http://localhost:5000/api/match/event/${selectedEventId}`);
        if (response.ok) {
          const data = await response.json();
          setMatches(data.matches || []);
        }
      }
    } catch (err) {
      setError(err.message || 'Error assigning volunteer to event.');
    } finally {
      setIsAssigning(false);
    }
  };

  return (
    <div className="min-h-screen flex items-start justify-center bg-gray-50 py-8 px-4">
      <div className="max-w-4xl w-full space-y-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold">Volunteer Matching Form</h2>
          <p className="text-sm text-gray-600">
            Select an event to see matching volunteers
          </p>
        </div>

        <div className="bg-white p-6 shadow rounded border">
          {isLoading ? (
            <p>Loading events...</p>
          ) : (
            <>
              <label htmlFor="event" className="block text-sm font-medium mb-2">
                Select Event
              </label>
              <select
                id="event"
                className="w-full border px-3 py-2 rounded mb-4"
                value={selectedEventId}
                onChange={handleEventChange}
              >
                <option value="">-- Select an Event --</option>
                {events && events.map(event => (
                  <option key={event.id} value={event.id}>
                    {event.name} - {formatDate(event.eventDate)} ({event.city}, {event.stateCode})
                  </option>
                ))}
              </select>

              {error && <p className="text-red-600 mb-4">{error}</p>}
              {successMessage && <p className="text-green-600 mb-4">{successMessage}</p>}

                <div>
                <h3 className="font-semibold mb-2">Matched Volunteers:</h3>
                {!matches || matches.length === 0 ? (
                  <p>No matching volunteers found.</p>
                ) : (
                  <ul className="divide-y divide-gray-200">
                    {matches.map(volunteer => (
                      <li key={volunteer.id} className="py-4 flex justify-between items-center">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <strong className="block text-lg">{volunteer.fullName}</strong>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              volunteer.matchType === 'full' ? 'bg-green-100 text-green-800' :
                              volunteer.matchType === 'city' ? 'bg-blue-100 text-blue-800' :
                              volunteer.matchType === 'partial' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {volunteer.matchType === 'full' ? 'Perfect Match' :
                               volunteer.matchType === 'city' ? 'State Match' :
                               volunteer.matchType === 'partial' ? 'Partial Match' : 'Match'}
                            </span>
                          </div>
                          {volunteer.city && volunteer.stateCode && (
                            <span className="text-gray-600">({volunteer.city}, {volunteer.stateCode})</span>
                          )}
                          <p className="text-sm text-gray-500 mt-1">
                            Skills: {volunteer.skills && volunteer.skills.join(', ')}
                          </p>
                          {volunteer.preferences && (
                            <p className="text-sm text-gray-500">
                              Preferences: {volunteer.preferences}
                            </p>
                          )}
                          {volunteer.availability && volunteer.availability.length > 0 && (
                            <p className="text-sm text-gray-500">Available: {volunteer.availability.join(', ')}</p>
                          )}
                        </div>
                        <button
                          onClick={() => handleAssignVolunteer(volunteer.id)}
                          disabled={isAssigning}
                          className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded disabled:opacity-50"
                        >
                          {isAssigning ? 'Assigning...' : 'Assign'}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default VolunteerMatchingForm;