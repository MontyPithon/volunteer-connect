import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

import VolunteerMatchingForm from './components/VolunteerMatchingForm';
import VolunteerHistory from './components/VolunteerHistory';
import LoginPage from './components/Login';
import RegisterPage from './components/Register';
import ProfileForm from './components/profileForm';
import EventManagementPage from './components/EventManagementPage';

function App() {
  return (
    <Router>
      <div>
        <nav style={styles.nav}>
          <h2 style={styles.logo}>Volunteer Portal</h2>
          <ul style={styles.navLinks}>
            <li><Link to="/" style={styles.link}>Login</Link></li>
            <li><Link to="/register" style={styles.link}>Register</Link></li>
            <li><Link to="/profile" style={styles.link}>Profile</Link></li>
            <li><Link to="/VolunteerMatchingForm" style={styles.link}>Matching Form</Link></li>
            <li><Link to="/VolunteerHistory" style={styles.link}>Volunteer History</Link></li>
            <li><Link to="/events" style={styles.link}>Event Management</Link></li>
          </ul>
        </nav>

        <div style={styles.container}>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/profile" element={<ProfileForm />} />
          <Route path="/VolunteerMatchingForm" element={<VolunteerMatchingForm />} />
          <Route path="/VolunteerHistory" element={<VolunteerHistory />} />
          <Route path="/events" element={<EventManagementPage />} />
        </Routes>
        </div>
      </div>
    </Router>
  );
}

const styles = {
  nav: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#3f51b5',
    padding: '10px 20px',
    color: 'white'
  },
  logo: {
    margin: 0
  },
  navLinks: {
    listStyle: 'none',
    display: 'flex',
    gap: '15px',
    margin: 0
  },
  link: {
    color: 'white',
    textDecoration: 'none',
    fontWeight: 'bold'
  },
  container: {
    padding: '20px'
  }
};

export default App;
