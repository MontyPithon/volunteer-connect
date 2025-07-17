const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Import routes
const eventRoutes = require('./src/api/eventRoutes');

// Use routes
app.use('/api/events', eventRoutes);

// Simple test route
app.get('/api/test', (req, res) => {
    res.json({ message: 'API is working!' });
  });
  
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });