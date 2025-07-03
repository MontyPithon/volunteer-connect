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
      <h1>Event Management Page</h1>
    </div>
  );
};

export default EventManagementPage;