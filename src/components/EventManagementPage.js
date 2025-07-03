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
        <div className='event-management-page bg-gray-100 min-h-screen max-w-4xl mx-auto p-4'>
            {/* Header */}
            <div className='header flex justify-between items-center max-w-4xl mx-auto p-4 border-b mb-4 border-gray-300'>
                <div>
                    <h1 className='text-lg font-bold'>Event Management</h1>
                    <p className='text-sm'>Create and manage volunteer events</p>
                </div>
                <div>
                    <button className='bg-blue-500 text-white px-4 py-2 rounded' onClick={() => setShowForm(true)}>Create New Event</button>
                </div>
            </div>

            {/* Event Form */}
            {showForm && (
                <div className='event-form bg-white p-6 rounded shadow-md mb-4'>
                    <h2 className='text-lg font-bold'>{editingEvent ? 'Edit Event' : 'Create Event'}</h2>
                    <form onSubmit={handleSubmit} className='space-y-4'>
                        <div className='mb-4 mt-4'>
                            <input
                                type="text"
                                name="name"
                                placeholder="Event Name"
                                value={formData.name}
                                onChange={handleInputChange}
                                required
                                className='w-full p-2 border border-gray-300 rounded-md'
                            />
                        </div>
                        <div className='mb-4 mt-4'>
                            <textarea
                                name="description"
                                placeholder="Event Description"
                                value={formData.description}
                                onChange={handleInputChange}
                                required
                                className='w-full p-2 border border-gray-300 rounded-md'
                            />
                        </div>
                        <div>
                            <input
                                type="text"
                                name="location"
                                placeholder="Location"
                                value={formData.location}
                                onChange={handleInputChange}
                                required
                                className='w-full p-2 border border-gray-300 rounded-md'
                            />
                        </div>
                        <div className='w-full p-2 border border-gray-300 rounded-md'>
                            <label className='block mb-2'>Required Skills:</label>
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
                        </div>
                        <div className='w-full p-2 border border-gray-300 rounded-md'>
                            <label className='block mb-2'>Urgency:</label>
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
                        </div>
                        <div className='w-full p-2 border border-gray-300 rounded-md'>
                            <label className='block mb-2'>Event Date:</label>
                            <input
                                type="date"
                                name="eventDate"
                                value={formData.eventDate}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className='flex justify-between items-center mt-4'>
                            <div>
                                <button type="button" onClick={resetForm} className='bg-gray-300 text-black px-4 py-2 rounded-md'>Cancel</button>
                            </div>
                            <div>
                                <button type="submit" className='bg-blue-500 text-white px-4 py-2 rounded-md'>{editingEvent ? 'Update Event' : 'Create Event'}</button>
                            </div>
                        </div>
                    </form>
                </div>
            )}
            {/* Events Table */}
            <div className='events-table bg-white p-6 rounded shadow-md'>
                {events.length === 0 ? (
                    <div>
                        <h3>No events found</h3>
                    </div>
                ) : (
                    <table className='min-w-full bg-white'>
                        <thead>
                            <tr>
                                <th className='py-2 px-4 border-b border-gray-300 text-left'>Event Details</th>
                                <th className='py-2 px-4 border-b border-gray-300 text-left'>Location</th>
                                <th className='py-2 px-4 border-b border-gray-300 text-left'>Urgency</th>
                                <th className='py-2 px-4 border-b border-gray-300 text-left'>Date</th>
                                <th className='py-2 px-4 border-b border-gray-300 text-left'>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {events.map((event) => (
                                <tr key={event.id}>
                                    <td className='py-2 px-4 border-b border-gray-300'>
                                        <div className='font-bold'>{event.name}</div>
                                        <div className='text-small'>{event.description}</div>
                                    </td>
                                    <td className='py-2 px-4 border-b border-gray-300'>
                                        <div>{event.location}</div>
                                    </td>
                                    <td className='py-2 px-4 border-b border-gray-300'>
                                        <span>
                                            {event.urgency}
                                        </span>
                                    </td>
                                    <td className='py-2 px-4 border-b border-gray-300'>
                                        <span>
                                            {event.eventDate}
                                        </span>
                                    </td>
                                    <td className='gap-2 py-2 px-4 border-b border-gray-300'>
                                        <button className=' text-blue-500 px-2 py-1 rounded transition duration-200 hover:bg-blue-500 hover:text-white' onClick={() => {
                                            setEditingEvent(event);
                                            setFormData(event);
                                            setShowForm(true);
                                        }}>Edit</button>
                                        <button className=' text-red-500 px-2 py-1 rounded transition duration-200 hover:bg-red-500 hover:text-white' onClick={() => {
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