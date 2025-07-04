import React, { useState } from 'react';
import Select from 'react-select';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const urgencyOptions = [
  { value: 'High', label: 'High' },
  { value: 'Medium', label: 'Medium' },
  { value: 'Low', label: 'Low' }
];

const skillsOptions = [
  { value: 'Cooking', label: 'Cooking' },
  { value: 'Teaching', label: 'Teaching' },
  { value: 'Organizing', label: 'Organizing' },
  { value: 'Driving', label: 'Driving' },
  { value: 'Medical Assistance', label: 'Medical Assistance' },
  { value: 'Childcare', label: 'Childcare' },
  { value: 'Landscaping', label: 'Landscaping' },
  { value: 'Logistics', label: 'Logistics' }
];

export default function EventManagement() {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: '',
    requiredSkills: [],
    urgency: '',
    date: null
  });

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validation
    if (!formData.name.trim()) {
      alert('Please enter an event name.');
      return;
    }

    if (!formData.description.trim()) {
      alert('Please enter an event description.');
      return;
    }

    if (!formData.location.trim()) {
      alert('Please enter an event location.');
      return;
    }

    if (!formData.requiredSkills || formData.requiredSkills.length === 0) {
      alert('Please select at least one required skill.');
      return;
    }

    if (!formData.urgency) {
      alert('Please select an urgency level.');
      return;
    }

    if (!formData.date) {
      alert('Please select an event date.');
      return;
    }

    // Format date for storage
    const formattedDate = formData.date.toISOString().split('T')[0];
    
    const newEvent = {
      id: Date.now(), // Simple ID generation
      name: formData.name,
      description: formData.description,
      location: formData.location,
      requiredSkills: formData.requiredSkills.map(skill => skill.value),
      urgency: formData.urgency.value,
      date: formattedDate
    };

    console.log('New event created:', newEvent);
    alert('Event created successfully!');

    // Reset form
    setFormData({
      name: '',
      description: '',
      location: '',
      requiredSkills: [],
      urgency: '',
      date: null
    });
  };

  return (
    <div className="min-h-screen flex items-start justify-center bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-6">
        {/* Header */}
        <div className="text-center">
          <h2 className="mt-2 text-3xl font-bold text-gray-900">
            Event Management
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Create and manage volunteer events
          </p>
        </div>

        {/* Admin Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">Administrator Access</h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>This form is for administrators to create and manage volunteer events.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Event Form Card */}
        <div className="bg-white py-8 px-6 shadow-lg rounded-lg border border-gray-200">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Event Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Event Name *
              </label>
              <input
                id="name"
                type="text"
                required
                maxLength={100}
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Enter event name"
              />
            </div>

            {/* Event Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Event Description *
              </label>
              <textarea
                id="description"
                required
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                placeholder="Describe the event and what volunteers will be doing..."
              />
            </div>

            {/* Location */}
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                Location *
              </label>
              <textarea
                id="location"
                required
                value={formData.location}
                onChange={(e) => handleChange('location', e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                placeholder="Enter event location (address, venue, etc.)"
              />
            </div>

            {/* Required Skills */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Required Skills *
              </label>
              <Select
                options={skillsOptions}
                isMulti
                value={formData.requiredSkills}
                onChange={(selected) => handleChange('requiredSkills', selected)}
                className="text-sm"
                placeholder="Select required skills..."
                styles={{
                  control: (provided) => ({
                    ...provided,
                    borderColor: '#d1d5db',
                    '&:hover': {
                      borderColor: '#3b82f6'
                    },
                    '&:focus-within': {
                      borderColor: '#3b82f6',
                      boxShadow: '0 0 0 2px rgba(59, 130, 246, 0.1)'
                    }
                  })
                }}
              />
            </div>

            {/* Urgency */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Urgency Level *
              </label>
              <Select
                options={urgencyOptions}
                value={formData.urgency}
                onChange={(selected) => handleChange('urgency', selected)}
                className="text-sm"
                placeholder="Select urgency level..."
                styles={{
                  control: (provided) => ({
                    ...provided,
                    borderColor: '#d1d5db',
                    '&:hover': {
                      borderColor: '#3b82f6'
                    },
                    '&:focus-within': {
                      borderColor: '#3b82f6',
                      boxShadow: '0 0 0 2px rgba(59, 130, 246, 0.1)'
                    }
                  })
                }}
              />
            </div>

            {/* Event Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Event Date *
              </label>
              <DatePicker
                selected={formData.date}
                onChange={(date) => handleChange('date', date)}
                placeholderText="Select event date"
                minDate={new Date()}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                Create Event
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 