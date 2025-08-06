// Load env vars
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const express = require('express');
const cors    = require('cors');

const sequelize       = require('./src/db');            // ← our new DB module
const eventRoutes     = require('./src/api/eventRoutes');
const matchingRoutes  = require('./src/api/matchingRoutes');
const historyRoutes   = require('./src/api/historyRoutes');    // points to your new historyRoutes file
const profileRoutes   = require('./src/api/profileRoutes');
const authRoutes      = require('./src/api/authRoutes');
const notificationRoutes = require('./src/api/notificationRoutes');

const app  = express();
const PORT = process.env.PORT || 5000;  // picks up env PORT if set

// Test Postgres connection early
sequelize.authenticate()
  .then(() => console.log('✅ Connected to Postgres'))
  .catch(err => console.error('❌ DB conn error:', err));

app.use(cors());
app.use(express.json());

// Mount all your routes
app.use('/api/events',        eventRoutes);
app.use('/api/match',         matchingRoutes);
app.use('/api/history',       historyRoutes);
app.use('/api/profiles',      profileRoutes);
app.use('/api/auth',          authRoutes);
app.use('/api/notifications', notificationRoutes);

// Health-check
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working!' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
