import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api/notifications';
const USER_ID = '1';

const NotificationSystem = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_BASE_URL}/${USER_ID}`);
            setNotifications(response.data);
        } catch (error) {
            console.error('Error fetching notifications:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const closeNotification = async (id) => {
        try {
            await axios.delete(`${API_BASE_URL}/${USER_ID}/${id}`);
            setNotifications(notifications.filter(notification => notification.id !== id));
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
                {notifications.length === 0 ? (
                    <p className='text-gray-500'>No new notifications</p>
                ) : (
                    <div className='notifications-list bg-white p-4 rounded shadow'>
                        <ul>
                            {notifications.map(notification => (
                                <li key={notification.id} className='notification-item mb-4 p-4'>
                                    <h2 className='text-lg font-semibold border-b pb-2 mb-2 border-gray-300'>{notification.type.charAt(0).toUpperCase() + notification.type.slice(1)}</h2>
                                <button 
                                    className='text-red-500 px-2 py-1 rounded transition duration-200 hover:bg-red-500 hover:text-white float-right' 
                                    onClick={() => closeNotification(notification.id)}
                                >
                                    Mark as Read
                                </button>
                                {/* Display notification message and date */}
                                <p>{notification.message}</p>
                                <p className='text-xs'>{notification.date}</p>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            </div>
        </div>
    );
};

export default NotificationSystem;
