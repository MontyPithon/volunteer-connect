const users = [
  {    
    id: 1,
    email: "test@test.com",
    password: "abc123",
    profile: {
      fullName: "John Doe",
      address1: "123 Main St",
      address2: "Apt 4B",
      city: "New York",
      state: "NY",
      zip: "10001",
      skills: [
        { value: 'event_setup', label: 'Setup Crew' },
        { value: 'cooking', label: 'Cooking' }
      ],
      preferences: "I prefer outdoor events and working with children",
      availability: ["2024-01-15", "2024-01-20", "2024-01-25"],
      createdAt: "2024-01-01T00:00:00.000Z",
      updatedAt: "2024-01-01T00:00:00.000Z"
    }
  },
  { 
    id: 2,
    email: 'hello@gmail.com', 
    password: 'hello',
    profile: {
      fullName: "Jane Smith",
      address1: "456 Oak Ave",
      address2: "",
      city: "Los Angeles",
      state: "CA",
      zip: "90210",
      skills: [
        { value: 'landscaping', label: 'Land Scaping' },
        { value: 'childcare', label: 'Childcare' }
      ],
      preferences: "I enjoy gardening and working with seniors",
      availability: ["2024-01-10", "2024-01-18", "2024-01-30"],
      createdAt: "2024-01-02T00:00:00.000Z",
      updatedAt: "2024-01-02T00:00:00.000Z"
    }
  }
];

module.exports = users;
