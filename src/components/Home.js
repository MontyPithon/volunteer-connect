import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Home = () => {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/events');
        const today = new Date();
        const upcoming = response.data.events
          .filter(event => new Date(event.eventDate) >= today)
          .sort((a, b) => new Date(a.eventDate) - new Date(b.eventDate))
          .slice(0, 3);
        setEvents(upcoming);
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    };

    fetchEvents();
  }, []);

  return (
    <div className="bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto text-center">
        <h1 className="text-4xl font-bold  mb-6">Welcome to Volunteer Connect</h1>
        <p className="text-lg text-gray-600 mb-8">
          Connecting volunteers with events and opportunities to make a difference in their community.
        </p>
        <div className="flex justify-center space-x-4">
          <Link 
            to="/login" 
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Login
          </Link>
          <Link 
            to="/register" 
            className="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors"
          >
            Register
          </Link>
        </div>
      </div>
      {events.length > 0 && (
        <div className="mt-12 max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold mb-6 text-center text-gray-900">
            Upcoming Events
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {events.map(event => (
              <div 
                key={event.id} 
                className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
              >
                <h3 className="text-xl font-semibold mb-2 text-blue-700">
                  {event.name}
                </h3>
                <p className="text-gray-600 mb-4">
                  {event.description.substring(0, 100)}...
                </p>
                <div className="text-sm text-gray-500 space-y-1">
                  <p><span className="font-medium">Date:</span> {new Date(event.eventDate).toLocaleDateString()}</p>
                  <p><span className="font-medium">Location:</span> {event.location}, {event.city}, {event.stateCode}</p>
                  <p><span className="font-medium">Skills needed:</span> {event.requiredSkills.join(', ')}</p>
                  <p><span className="font-medium">Urgency:</span> {event.urgency}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
