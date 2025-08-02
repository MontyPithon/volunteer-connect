import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const API_BASE_URL = 'http://localhost:5000/api/notifications';

const NotificationSystem = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { currentUser } = useContext(AuthContext);

    useEffect(() => {
        if (currentUser) {
            fetchNotifications();
        }
    }, [currentUser]);

    const fetchNotifications = async () => {
        if (!currentUser) return;
        
        try {
            setLoading(true);
            const response = await axios.get(`${API_BASE_URL}/${currentUser.id}`);
            console.log('Fetched notifications:', response.data);
            setNotifications(response.data.notifications);
        } catch (error) {
            console.error('Error fetching notifications:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const closeNotification = async (id) => {
        if (!currentUser) return;
        
        try {
            await axios.delete(`${API_BASE_URL}/${currentUser.id}/${id}`);
            setNotifications(notifications.filter(notification => notification.notification_id !== id));
        } catch (error) {
            console.error('Error marking notification as read:', error);
            setError(error.message);
        }
    };

    return (
        <div className='notification-system bg-gray-50 min-h-screen'>
            {/* Header */}
            <div className="bg-gray-50 py-8 px-4">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-3xl font-bold text-gray-900">
                        Notifications
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Here you can find all your notifications, such as new event assignments, updates, and reminders.
                    </p>
                </div>
            </div>
            
            <div className='max-w-4xl mx-auto px-4'>
                {loading ? (
                    <p className="text-gray-500">Loading notifications...</p>
                ) : notifications.length === 0 ? (
                    <p className='text-gray-500'>No new notifications</p>
                ) : (
                    <div className='notifications-list bg-white p-4 rounded shadow'>
                        <ul>
                            {notifications.map(notification => (
                                <li key={notification.notification_id} className='notification-item mb-4 p-4 border border-gray-200 rounded'>
                                    <h2 className='text-lg font-semibold border-b pb-2 mb-2 border-gray-300'>
                                        Notification
                                    </h2>
                                    <button 
                                        className='text-red-500 px-2 py-1 rounded transition duration-200 hover:bg-red-500 hover:text-white float-right' 
                                        onClick={() => closeNotification(notification.notification_id)}
                                    >
                                        Mark as Read
                                    </button>
                                    {/* Display notification message and date */}
                                    <p>{notification.message}</p>
                                    <p className='text-xs'>{new Date(notification.created_at).toLocaleString()}</p>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
                {error && <p className="text-red-500 mt-2">Error: {error}</p>}
            </div>
        </div>
    );
};

export default NotificationSystem;
