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
    <form onSubmit={handleSubmit} style={{ maxWidth: '600px', margin: 'auto' }}>
      <h2>Complete Your Profile</h2>

      <input type="text" placeholder="Full Name" required maxLength={50}
        value={formData.fullName} onChange={(e) => handleChange('fullName', e.target.value)} />

      <input type="text" placeholder="Address 1" required maxLength={100}
        value={formData.address1} onChange={(e) => handleChange('address1', e.target.value)} />

      <input type="text" placeholder="Address 2" maxLength={100}
        value={formData.address2} onChange={(e) => handleChange('address2', e.target.value)} />

      <input type="text" placeholder="City" required maxLength={100}
        value={formData.city} onChange={(e) => handleChange('city', e.target.value)} />

      <select required value={formData.state} onChange={(e) => handleChange('state', e.target.value)}>
        <option value="">Select a state</option>
        {stateOptions.map(state => (
          <option key={state.value} value={state.value}>{state.label}</option>
        ))}
      </select>

      <input type="text" placeholder="Zip Code" required pattern="\d{5,9}" maxLength={9}
        value={formData.zip} onChange={(e) => handleChange('zip', e.target.value)} />

      <label>Skills:</label>
      <Select
        options={skillsOptions}
        isMulti
        onChange={(selected) => handleChange('skills', selected)}
      />

      <label>Preferences:</label>
      <textarea
        value={formData.preferences}
        onChange={(e) => handleChange('preferences', e.target.value)}
      />

      <label>Availability Dates:</label>
      <DatePicker
        selected={null}
        onChange={handleDateChange}
        placeholderText="Click to add a date"
      />
      <div>
        {availabilityDates.map((d, i) => (
          <span key={i}>{d.toDateString()} | </span>
        ))}
      </div>

      <br />
      <button type="submit">Submit Profile</button>
    </form>
  );
}
