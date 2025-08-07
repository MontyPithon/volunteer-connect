import { useState, useEffect, useCallback, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const API_BASE_URL = 'http://localhost:5000/api/notifications';

export const useNotifications = () => {
    const [notificationCount, setNotificationCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const { currentUser } = useContext(AuthContext);

    const fetchNotificationCount = useCallback(async () => {
        if (!currentUser || !currentUser.id) {
            setNotificationCount(0);
            return;
        }
        
        try {
            setLoading(true);
            const response = await axios.get(`${API_BASE_URL}/${currentUser.id}`);
            const count = response.data.notifications ? response.data.notifications.length : 0;
            setNotificationCount(count);
        } catch (error) {
            console.error('Error fetching notification count:', error);
            setNotificationCount(0);
        } finally {
            setLoading(false);
        }
    }, [currentUser]);

    useEffect(() => {
        if (currentUser) {
            fetchNotificationCount();
            const interval = setInterval(fetchNotificationCount, 30000);
            return () => clearInterval(interval);
        } else {
            setNotificationCount(0);
        }
    }, [currentUser, fetchNotificationCount]);

    return {
        notificationCount,
        loading,
        refreshCount: fetchNotificationCount
    };
};
