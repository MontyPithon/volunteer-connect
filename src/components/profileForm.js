import React, { useState, useEffect } from 'react';
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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);
  const [userId, setUserId] = useState(1); // Default user ID for demo purposes
  
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

  // Load existing profile on component mount
  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setIsLoading(true);
      setError('');
      const response = await fetch(`/api/profiles/${userId}`);
      
      if (response.ok) {
        const data = await response.json();
        const profile = data.profile;
        
        setFormData({
          fullName: profile.fullName || '',
          address1: profile.address1 || '',
          address2: profile.address2 || '',
          city: profile.city || '',
          state: profile.state || '',
          zip: profile.zip || '',
          skills: profile.skills || [],
          preferences: profile.preferences || '',
        });
        
        if (profile.availability) {
          setAvailabilityDates(profile.availability.map(date => new Date(date)));
        }
        
        setIsEditMode(true);
        setSuccess('Profile loaded successfully');
      } else if (response.status === 404) {
        // Profile doesn't exist, stay in create mode
        setIsEditMode(false);
      } else {
        throw new Error('Failed to load profile');
      }
    } catch (err) {
      setError('Failed to load profile. Please try again.');
      console.error('Error loading profile:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.skills || formData.skills.length === 0) {
      setError('Please select at least one skill.');
      return;
    }

    if (availabilityDates.length === 0) {
      setError('Please add at least one available date.');
      return;
    }

    try {
      setIsLoading(true);
      
      const profileData = {
        ...formData,
        availability: availabilityDates.map(date => date.toISOString().split('T')[0])
      };

      const url = `/api/profiles/${userId}`;
      const method = isEditMode ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      });

      if (response.ok) {
        const data = await response.json();
        setSuccess(isEditMode ? 'Profile updated successfully!' : 'Profile created successfully!');
        setIsEditMode(true);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save profile');
      }
    } catch (err) {
      setError(err.message || 'Failed to save profile. Please try again.');
      console.error('Error saving profile:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-start justify-center bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-6">
        {/* Header */}
        <div className="text-center">
          <h2 className="mt-2 text-3xl font-bold text-gray-900">
            {isEditMode ? 'Edit Your Profile' : 'Complete Your Profile'}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Tell us about yourself to help match you with volunteer opportunities
          </p>
        </div>

        {/* Error and Success Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-800">{success}</p>
              </div>
            </div>
          </div>
        )}

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
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {isEditMode ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  isEditMode ? 'Update Profile' : 'Submit Profile'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
