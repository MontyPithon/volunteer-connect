import React, { useState, useEffect } from 'react';

// NotificationSystem component to display notifications
// Display notifications for new event assignments, updates, and reminders
const NotificationSystem = () => {
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        const sampleNotifications = [
            { 
                id: 1, 
                type: 'event', 
                message: 'You have been assigned to a new event: Beach Cleanup on July 15.', 
                date: '2025-07-01' 
            },
            { 
                id: 2, 
                type: 'update', 
                message: 'The event schedule for July has been updated. Please check your profile for details.', 
                date: '2025-07-02' 
            },
            { 
                id: 3, 
                type: 'reminder', 
                message: 'Your next volunteering event is on July 20.', 
                date: '2025-07-10' 
            }
        ];
        setNotifications(sampleNotifications);
    }, []);
    const closeNotification = (id) => {
        setNotifications(notifications.filter(notification => notification.id !== id));
    };
    return (
        <div className='notification-system bg-gray-100 min-h-screen max-w-4xl mx-auto p-4'>
            <div className='header flex justify-between items-center max-w-4xl mx-auto p-4 border-b mb-4 border-gray-300'>
                <h1 className='text-2xl font-bold'>Notifications</h1>
            </div>
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
    );
};

export default NotificationSystem;
