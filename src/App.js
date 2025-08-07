import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';

import { AuthProvider, AuthContext } from './context/AuthContext';
import VolunteerMatchingForm from './components/VolunteerMatchingForm';
import VolunteerHistory from './components/VolunteerHistory';
import LoginPage from './components/Login';
import RegisterPage from './components/Register';
import ProfileForm from './components/profileForm';
import EventManagementPage from './components/EventManagementPage';
import NotificationSystem from './components/NotificationSystem';
import VerifyEmail from './components/VerifyEmail';
import NotificationBadge from './components/NotificationBadge';
import { useNotifications } from './hooks/useNotifications';


const ProtectedRoute = ({ children, allowedRoles }) => {
  const { currentUser } = useContext(AuthContext);
  
  if (!currentUser) {
    return <Navigate to="/" replace />;
  }
  
  if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

const NavLink = ({ to, children, allowedRoles }) => {
  const { currentUser } = useContext(AuthContext);
  
  if (!currentUser || (allowedRoles && !allowedRoles.includes(currentUser.role))) {
    return null;
  }
  
  return (
    <li>
      <Link 
        to={to} 
        className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200"
      >
        {children}
      </Link>
    </li>
  );
};

const NotificationNavLink = () => {
  const { currentUser } = useContext(AuthContext);
  const { notificationCount } = useNotifications();
  
  if (!currentUser) {
    return null;
  }
  
  return (
    <li>
      <NotificationBadge count={notificationCount}>
        <Link 
          to="/notifications" 
          className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200"
        >
          Notifications
        </Link>
      </NotificationBadge>
    </li>
  );
};

function AppContent() {
  const { currentUser, logout } = useContext(AuthContext);

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl">
          <div className="flex items-center justify-between h-16 pl-2 pr-4 sm:pl-4 lg:pl-6">
            <div className="flex items-center">
              <h2 className="text-2xl font-bold text-blue-700">Volunteer Portal</h2>
              <ul className="flex space-x-8 ml-8">
                {!currentUser ? (
                  <>
                    <li>
                      <Link to="/" className="text-gray-700 hover:text-blue-600 font-medium">
                        Login
                      </Link>
                    </li>
                    <li>
                      <Link to="/register" className="text-gray-700 hover:text-blue-600 font-medium">
                        Register
                      </Link>
                    </li>
                  </>
                ) : (
                  <>
                    <NavLink to="/profile">Profile</NavLink>
                    <NavLink to="/VolunteerHistory" allowedRoles={['volunteer']}>
                      My History
                    </NavLink>
                    <NavLink to="/events" allowedRoles={['admin']}>
                      Event Management
                    </NavLink>
                    <NavLink to="/VolunteerMatchingForm" allowedRoles={['admin']}>
                      Match Volunteers
                    </NavLink>
                    <NotificationNavLink />
                  </>
                )}
              </ul>
            </div>
            
            {currentUser && (
              <div className="flex items-center">
                <span className="mr-4 text-sm text-gray-600">
                  Logged in as: <span className="font-medium">{currentUser.name}</span>
                  <span className="ml-2 bg-gray-200 text-xs px-2 py-1 rounded-full">
                    {currentUser.role}
                  </span>
                </span>
                <button
                  onClick={logout}
                  className="text-red-500 hover:text-red-700 font-medium"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          
          {/* Protected routes */}
          <Route path="/profile" element={
            <ProtectedRoute>
              <ProfileForm />
            </ProtectedRoute>
          } />
          
          <Route path="/VolunteerHistory" element={
            <ProtectedRoute allowedRoles={['volunteer']}>
              <VolunteerHistory />
            </ProtectedRoute>
          } />
          
          <Route path="/events" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <EventManagementPage />
            </ProtectedRoute>
          } />
          
          <Route path="/VolunteerMatchingForm" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <VolunteerMatchingForm />
            </ProtectedRoute>
          } />
          
          <Route path="/notifications" element={
            <ProtectedRoute>
              <NotificationSystem />
            </ProtectedRoute>
          } />
        </Routes>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
