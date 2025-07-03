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
    const resetForm = () => {
        setFormData({
            id: '',
            name: '',
            description: '',
            location: '',
            requiredSkills: [],
            urgency: '',
            eventDate: ''
        });
        setEditingEvent(null);
        setShowForm(false);
    };

    const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSkillsChange = (skill) => {
    setFormData(prev => ({
      ...prev,
      requiredSkills: prev.requiredSkills.includes(skill)
        ? prev.requiredSkills.filter(s => s !== skill)
        : [...prev.requiredSkills, skill]
    }));
  };


  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name || !formData.description || !formData.location || 
        formData.requiredSkills.length === 0 || !formData.urgency || !formData.eventDate) {
      alert('Please fill in all required fields');
      return;
    }

    if (formData.name.length > 100) {
      alert('Event name must be 100 characters or less');
      return;
    }

    if (editingEvent) {
      // Update event
      setEvents(prev => prev.map(event => 
        event.id === editingEvent.id ? { ...formData, id: editingEvent.id } : event
      ));
    } else {
      // Create new event
      const newEvent = {
        ...formData,
        id: Date.now().toString()
      };
      setEvents(prev => [...prev, newEvent]);
    }

    resetForm();
  };

return (
    <div>
      {/* Header */}
      <div>
        <div>
          <h1>Event Management</h1>
          <p>Create and manage volunteer events</p>
        </div>
        <div>
          <button onClick={() => setShowForm(true)}>Create New Event</button>
        </div>
      </div>

        {/* Event Form */}
        {showForm && (
            <div>
              <h2>{editingEvent ? 'Edit Event' : 'Create Event'}</h2>
              <form onSubmit={handleSubmit}>
                <input
                  type="text"
                  name="name"
                  placeholder="Event Name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
                <textarea
                  name="description"
                  placeholder="Event Description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                />
                <input
                  type="text"
                  name="location"
                  placeholder="Location"
                  value={formData.location}
                  onChange={handleInputChange}
                  required
                />
                {availableSkills.map(skill => (
                  <div key={skill}>
                    <label>
                      <input
                        type="checkbox"
                        checked={formData.requiredSkills.includes(skill)}
                        onChange={() => handleSkillsChange(skill)}
                        />  {skill}
                </label>
                  </div>
                ))}
                <select
                  name="urgency"
                  value={formData.urgency}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Urgency</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
                <input
                  type="date"
                  name="eventDate"
                  value={formData.eventDate}
                  onChange={handleInputChange}
                  required
                />
                <button type="submit">{editingEvent ? 'Update Event' : 'Create Event'}</button>
              </form>
            </div>
        )}
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
                    <button onClick={() => {
                      setEditingEvent(event);
                      setFormData(event);
                      setShowForm(true);
                    }}>Edit</button>
                    <button onClick={() => {
                      setEvents(prev => prev.filter(e => e.id !== event.id));
                      resetForm();
                    }}>Delete</button>
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