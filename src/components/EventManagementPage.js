import React, { use, useEffect, useState } from 'react';

const EventManagementPage = () => {
  const [events, setEvents] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    description: '',
    location: '',
    requiredSkills: [],
    urgency: '',
    eventDate: ''
  });
  const availableSkills = ['Cooking', 'Teaching', 'Cleaning', 'Gardening', 'Organizing', 'Communication'];

  useEffect(() => {
    const sampleEvents = [
        {
        id: '1',
        name: 'Community Cleanup',
        description: 'A day of cleaning up the local park.',
        location: 'Central Park, 45th St',
        requiredSkills: ['Cleaning'],
        urgency: 'High',
        eventDate: '07-12-2025'
        },
        {
        id: '2',
        name: 'Food Drive',
        description: 'Collecting food items for the local food bank.',
        location: 'Community Center, 123 Main St',
        requiredSkills: ['Organizing', 'Communication'],
        urgency: 'Medium',
        eventDate: '07-01-2025'
        }
    ];
    setEvents(sampleEvents);
  }, []);

return (
    <div>
      {/* Header */}
      <div>
        <div>
          <h1>Event Management</h1>
          <p>Create and manage volunteer events</p>
        </div>
        <div>
          {/* Create button */}
        </div>
      </div>

      {/* Events Table */}
      <div>
        {events.length === 0 ? (
          <div>
            <h3>No events found</h3>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Event Details</th>
                <th>Location</th>
                <th>Urgency</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {events.map((event) => (
                <tr key={event.id}>
                  <td>
                    <div>{event.name}</div>
                    <div>{event.description}</div>
                  </td>
                  <td>
                    <div>{event.location}</div>
                  </td>
                  <td>
                    <span>
                      {event.urgency}
                    </span>
                  </td>
                  <td>{event.eventDate}</td>
                  <td>
                    {/* Edit and delete buttons*/}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default EventManagementPage;