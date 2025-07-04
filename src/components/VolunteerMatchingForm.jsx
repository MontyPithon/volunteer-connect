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
    <div className="min-h-screen flex items-start justify-center bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full space-y-6">
        {/* Header */}
        <div className="text-center">
          <h2 className="mt-2 text-3xl font-bold text-gray-900">
            Volunteer Matching Form
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Match volunteers with events based on their skills and availability
          </p>
        </div>

        {/* Main Content Card */}
        <div className="bg-white py-8 px-6 shadow-lg rounded-lg border border-gray-200">
          {/* Volunteer Selection Section */}
          <div className="space-y-6">
            <div>
              <label htmlFor='volunteer' className="block text-sm font-medium text-gray-700 mb-2">
                Select Volunteer
              </label>
              <select
                id='volunteer'
                onChange={handleVolunteerChange}
                value={selectedVolunteerId}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                <option value=''>-- Select Volunteer --</option>
                {volunteers.map(v => (
                  <option key={v.id} value={v.id}>
                    {v.fullName}
                  </option>
                ))}
              </select>
            </div>

            {/* Matched Events Section */}
            {matches.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
                  Matched Events
                </h3>
                <div className="grid gap-4">
                  {matches.map(event => (
                    <div key={event.id} className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="text-lg font-semibold text-gray-900 mb-2">
                            {event.name}
                          </h4>
                          <p className="text-gray-700 mb-3">
                            {event.description}
                          </p>
                          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                            <div className="flex items-center">
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              {event.location}
                            </div>
                            <div className="flex items-center">
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              {event.date}
                            </div>
                            <div className="flex items-center">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                event.urgency === 'High' ? 'bg-red-100 text-red-800' :
                                event.urgency === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-green-100 text-green-800'
                              }`}>
                                {event.urgency} Urgency
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="ml-4">
                          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
                            Assign Volunteer
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* No Matches Message */}
            {selectedVolunteerId && matches.length === 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800">
                      No matching events found
                    </h3>
                    <div className="mt-2 text-sm text-yellow-700">
                      <p>No events match this volunteer's skills and availability. Consider updating the volunteer's profile or creating new events.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VolunteerMatchingForm;
