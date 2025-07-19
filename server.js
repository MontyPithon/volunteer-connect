const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Import routes
const eventRoutes = require('./src/api/eventRoutes');
const matchingRoutes = require('./src/api/matchingRoutes');
const historyRoutes = require('./src/api/historyRoutes');
const profileRoutes = require('./src/api/profileRoutes');
const authRoutes = require('./src/api/authRoutes');
const notificationRoutes = require('./src/api/notificationRoutes');

// Use routes
app.use('/api/events', eventRoutes);
app.use('/api/match', matchingRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/profiles', profileRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/notifications', notificationRoutes);

// Simple test route
app.get('/api/test', (req, res) => {
    res.json({ message: 'API is working!' });
  });
  
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
