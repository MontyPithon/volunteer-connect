import React, { useState, useEffect } from 'react';

const VolunteerMatchingForm = () => {
  const [selectedVolunteerId, setSelectedVolunteerId] = useState('');
  const [volunteers, setVolunteers] = useState([]);
  const [matches, setMatches] = useState([]);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch volunteers when component mounts
  useEffect(() => {
    const fetchVolunteers = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/match/profiles');
        if (!response.ok) throw new Error('Failed to fetch profiles');
        const data = await response.json();
        setVolunteers(data);
      } catch (err) {
        console.error('Error fetching profiles:', err);
        setError('Error loading volunteer profiles: ' + err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVolunteers();
  }, []);

  const handleVolunteerChange = async (e) => {
    const volunteerId = e.target.value;
    setSelectedVolunteerId(volunteerId);
    setMatches([]);
    setError('');
    setSuccessMessage('');

    if (!volunteerId) return;

    try {
      const profileResponse = await fetch(`http://localhost:5000/api/match/profiles/${volunteerId}`);
      if (!profileResponse.ok) throw new Error('Failed to fetch volunteer profile');
      const profileData = await profileResponse.json();

      const matchResponse = await fetch('http://localhost:5000/api/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData)
      });

      if (!matchResponse.ok) throw new Error('Failed to fetch matches');
      const matchData = await matchResponse.json();
      setMatches(matchData.matches || []);
    } catch (err) {
      setError('Error fetching matched events: ' + err.message);
    }
  };

  const handleAssignVolunteer = async (eventId) => {
    if (!selectedVolunteerId) {
      setError('Please select a volunteer first');
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
          volunteerId: selectedVolunteerId,
          eventId: eventId
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to assign volunteer to event');
      }

      setSuccessMessage(`Successfully assigned volunteer to event! ${data.message}`);
      
      // Refresh the matches to update UI
      if (selectedVolunteerId) {
        // Use our new endpoint for profile data
        const profileResponse = await fetch(`http://localhost:5000/api/match/profiles/${selectedVolunteerId}`);
        if (!profileResponse.ok) throw new Error('Failed to fetch volunteer profile');
        const profileData = await profileResponse.json();

        const matchResponse = await fetch('http://localhost:5000/api/match', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(profileData)
        });
        
        if (matchResponse.ok) {
          const matchData = await matchResponse.json();
          setMatches(matchData.matches || []);
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
            Match volunteers with events based on their skills and availability
          </p>
        </div>

        <div className="bg-white p-6 shadow rounded border">
          {isLoading ? (
            <p>Loading volunteers...</p>
          ) : (
            <>
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
                {volunteers && volunteers.map(v => (
                  <option key={v.userId} value={v.userId}>
                    {v.fullName}
                  </option>
                ))}
              </select>

              {error && <p className="text-red-600 mb-4">{error}</p>}
              {successMessage && <p className="text-green-600 mb-4">{successMessage}</p>}

              <div>
                <h3 className="font-semibold mb-2">Matched Events:</h3>
                {!matches || matches.length === 0 ? (
                  <p>No matches found.</p>
                ) : (
                  <ul className="divide-y divide-gray-200">
                    {matches.map(ev => (
                      <li key={ev.id} className="py-4 flex justify-between items-center">
                        <div>
                          <strong className="block text-lg">{ev.name}</strong>
                          <span className="text-gray-600">{ev.date} ({ev.location})</span>
                          <p className="text-sm text-gray-500 mt-1">
                            Required skills: {ev.requiredSkills && ev.requiredSkills.join(', ')}
                          </p>
                        </div>
                        <button
                          onClick={() => handleAssignVolunteer(ev.id)}
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