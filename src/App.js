import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

import VolunteerMatchingForm from './components/VolunteerMatchingForm';
import VolunteerHistory from './components/VolunteerHistory';
import LoginPage from './components/Login';
import RegisterPage from './components/Register';
import ProfileForm from './components/profileForm';
import EventManagement from './components/EventManagement';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl">
            <div className="flex items-center h-16 pl-2 sm:pl-4 lg:pl-6">
              <h2 className="text-2xl font-bold text-blue-700">Volunteer Portal</h2>
              <ul className="flex space-x-8 ml-8">
                <li>
                  <Link 
                    to="/" 
                    className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200"
                  >
                    Login
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/register" 
                    className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200"
                  >
                    Register
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/profile" 
                    className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200"
                  >
                    Profile
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/event-management" 
                    className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200"
                  >
                    Event Management
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/VolunteerMatchingForm" 
                    className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200"
                  >
                    Matching Form
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/VolunteerHistory" 
                    className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200"
                  >
                    Volunteer History
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </nav>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/profile" element={<ProfileForm />} />
            <Route path="/event-management" element={<EventManagement />} />
            <Route path="/VolunteerMatchingForm" element={<VolunteerMatchingForm />} />
            <Route path="/VolunteerHistory" element={<VolunteerHistory />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
