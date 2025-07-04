import React, { useState } from 'react';
import Select from 'react-select';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const stateOptions = [
 { value: 'AL', label: 'AL' },
  { value: 'AK', label: 'AK' },
  { value: 'AZ', label: 'AZ' },
  { value: 'AR', label: 'AR' },
  { value: 'CA', label: 'CA' },
  { value: 'CO', label: 'CO' },
  { value: 'CT', label: 'CT' },
  { value: 'DE', label: 'DE' },
  { value: 'FL', label: 'FL' },
  { value: 'GA', label: 'GA' },
  { value: 'HI', label: 'HI' },
  { value: 'ID', label: 'ID' },
  { value: 'IL', label: 'IL' },
  { value: 'IN', label: 'IN' },
  { value: 'IA', label: 'IA' },
  { value: 'KS', label: 'KS' },
  { value: 'KY', label: 'KY' },
  { value: 'LA', label: 'LA' },
  { value: 'ME', label: 'ME' },
  { value: 'MD', label: 'MD' },
  { value: 'MA', label: 'MA' },
  { value: 'MI', label: 'MI' },
  { value: 'MN', label: 'MN' },
  { value: 'MS', label: 'MS' },
  { value: 'MO', label: 'MO' },
  { value: 'MT', label: 'MT' },
  { value: 'NE', label: 'NE' },
  { value: 'NV', label: 'NV' },
  { value: 'NH', label: 'NH' },
  { value: 'NJ', label: 'NJ' },
  { value: 'NM', label: 'NM' },
  { value: 'NY', label: 'NY' },
  { value: 'NC', label: 'NC' },
  { value: 'ND', label: 'ND' },
  { value: 'OH', label: 'OH' },
  { value: 'OK', label: 'OK' },
  { value: 'OR', label: 'OR' },
  { value: 'PA', label: 'PA' },
  { value: 'RI', label: 'RI' },
  { value: 'SC', label: 'SC' },
  { value: 'SD', label: 'SD' },
  { value: 'TN', label: 'TN' },
  { value: 'TX', label: 'TX' },
  { value: 'UT', label: 'UT' },
  { value: 'VT', label: 'VT' },
  { value: 'VA', label: 'VA' },
  { value: 'WA', label: 'WA' },
  { value: 'WV', label: 'WV' },
  { value: 'WI', label: 'WI' },
  { value: 'WY', label: 'WY' }

];

const skillsOptions = [
  { value: 'event_setup', label: 'Setup Crew' },
  { value: 'cooking', label: 'Cooking' },
  { value: 'landscaping', label: 'Land Scaping' },
  { value: 'childcare', label: 'Childcare' },
];

export default function ProfileForm() {
  const [availabilityDates, setAvailabilityDates] = useState([]);
  const [formData, setFormData] = useState({
    fullName: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    zip: '',
    skills: [],
    preferences: '',
  });

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleDateChange = (date) => {
    if (!availabilityDates.find((d) => d.toDateString() === date.toDateString())) {
      setAvailabilityDates((prev) => [...prev, date]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.skills || formData.skills.length === 0) {
    alert('Please select at least one skill.');
    return;
  }

    if (availabilityDates.length === 0) {
    alert('Please add at least one available date.');
    return;
  }
    console.log({ ...formData, availability: availabilityDates });
    alert('Profile submitted!');
  };

  return (
    <div className="min-h-screen flex items-start justify-center bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-6">
        {/* Header */}
        <div className="text-center">
          <h2 className="mt-2 text-3xl font-bold text-gray-900">
            Complete Your Profile
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Tell us about yourself to help match you with volunteer opportunities
          </p>
        </div>

        {/* Profile Form Card */}
        <div className="bg-white py-8 px-6 shadow-lg rounded-lg border border-gray-200">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
                Personal Information
              </h3>
              
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input 
                  id="fullName"
                  type="text" 
                  placeholder="Enter your full name" 
                  required 
                  maxLength={50}
                  value={formData.fullName} 
                  onChange={(e) => handleChange('fullName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            {/* Address Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
                Address Information
              </h3>
              
              <div>
                <label htmlFor="address1" className="block text-sm font-medium text-gray-700 mb-2">
                  Address 1 *
                </label>
                <input 
                  id="address1"
                  type="text" 
                  placeholder="Enter your street address" 
                  required 
                  maxLength={100}
                  value={formData.address1} 
                  onChange={(e) => handleChange('address1', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>

              <div>
                <label htmlFor="address2" className="block text-sm font-medium text-gray-700 mb-2">
                  Address 2
                </label>
                <input 
                  id="address2"
                  type="text" 
                  placeholder="Apartment, suite, etc. (optional)" 
                  maxLength={100}
                  value={formData.address2} 
                  onChange={(e) => handleChange('address2', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                    City *
                  </label>
                  <input 
                    id="city"
                    type="text" 
                    placeholder="Enter city" 
                    required 
                    maxLength={100}
                    value={formData.city} 
                    onChange={(e) => handleChange('city', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>

                <div>
                  <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-2">
                    State *
                  </label>
                  <select 
                    id="state"
                    required 
                    value={formData.state} 
                    onChange={(e) => handleChange('state', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  >
                    <option value="">Select a state</option>
                    {stateOptions.map(state => (
                      <option key={state.value} value={state.value}>{state.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="zip" className="block text-sm font-medium text-gray-700 mb-2">
                    Zip Code *
                  </label>
                  <input 
                    id="zip"
                    type="text" 
                    placeholder="Enter zip code" 
                    required 
                    pattern="\d{5,9}" 
                    maxLength={9}
                    value={formData.zip} 
                    onChange={(e) => handleChange('zip', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Skills Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
                Skills & Preferences
              </h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Skills *
                </label>
                <Select
                  options={skillsOptions}
                  isMulti
                  onChange={(selected) => handleChange('skills', selected)}
                  className="text-sm"
                  placeholder="Select your skills..."
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

              <div>
                <label htmlFor="preferences" className="block text-sm font-medium text-gray-700 mb-2">
                  Preferences
                </label>
                <textarea
                  id="preferences"
                  value={formData.preferences}
                  onChange={(e) => handleChange('preferences', e.target.value)}
                  placeholder="Tell us about your preferences, interests, or any special considerations..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                />
              </div>
            </div>

            {/* Availability Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
                Availability
              </h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Available Dates *
                </label>
                <DatePicker
                  selected={null}
                  onChange={handleDateChange}
                  placeholderText="Click to add a date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>

              {availabilityDates.length > 0 && (
                <div className="bg-gray-50 border border-gray-200 rounded-md p-3">
                  <p className="text-sm font-medium text-gray-700 mb-2">Selected Dates:</p>
                  <div className="flex flex-wrap gap-2">
                    {availabilityDates.map((d, i) => (
                      <span 
                        key={i} 
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        {d.toDateString()}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button 
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                Submit Profile
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
