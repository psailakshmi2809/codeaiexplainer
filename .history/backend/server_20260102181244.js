// ============================================
// STEP 1: Import required packages
// ============================================
const express = require('express');
const cors = require('cors');

// Create an Express application
const app = express();
const PORT = 5000;

// ============================================
// STEP 2: Set up middleware
// ============================================
// CORS: Allows frontend (running on port 5173) to talk to backend (port 5000)
app.use(cors());

// JSON Parser: Allows us to read JSON data from requests
app.use(express.json());

// ============================================
// STEP 3: Simple test endpoint (no Ollama yet)
// ============================================
app.get('/api/hello', (req, res) => {
  res.json({ 
    message: 'Hello from backend!',
    timestamp: new Date().toISOString()
  });
});

// ============================================
// STEP 4: Ollama connection endpoint
// ============================================
app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;
    
    // Check if message was provided
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    console.log('Received message:', message);

    // Call Ollama API
    // Ollama runs on localhost:11434 by default
    const ollamaResponse = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama3.2',  // Make sure you have this model installed
        prompt: message,
        stream: false       // Get complete response at once (easier for beginners)
      })
    });

    const data = await ollamaResponse.json();
    
    // Send Ollama's response back to frontend
    res.json({ 
      response: data.response,
      model: data.model
    });

  } catch (error) {
    console.error('Error calling Ollama:', error);
    res.status(500).json({ 
      error: 'Failed to connect to Ollama',
      details: error.message 
    });
  }
});

// ============================================
// STEP 5: Start the server
// ============================================
app.listen(PORT, () => {
  console.log(`
  ✅ Backend server is running!
  
  📍 URL: http://localhost:${PORT}
  
  📚 Available endpoints:
     - GET  /api/hello  (test endpoint)
     - POST /api/chat   (chat with Ollama)
  
  🔗 Make sure Ollama is running on port 11434
  `);
});
