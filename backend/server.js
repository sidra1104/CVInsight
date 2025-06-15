const express = require('express');
const axios = require('axios');
const cors = require('cors');
const morgan = require('morgan');

const app = express();
const PORT = 3001; // Different from Flask's port (5000)

// Middleware
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Configuration
const PYTHON_API_URL = 'http://localhost:5000'; // Your Flask API

// Routes
app.post('/api/analyze', async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text field is required' });
    }

    // Forward request to Python API
    const response = await axios.post(`${PYTHON_API_URL}/analyze`, { text });
    res.json(response.data);

  } catch (error) {
    console.error('Error calling Python API:', error.message);
    res.status(500).json({ error: 'Failed to analyze resume' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Node.js backend running on http://localhost:${PORT}`);
});