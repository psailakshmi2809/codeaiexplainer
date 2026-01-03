const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

app.get('/api/hello', (req, res) => {
  res.json({
    message: 'Hello from backend!',
    timestamp: new Date().toISOString()
  });
});

app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    console.log('Received message:', message);

    const ollamaResponse = await fetch(
      'http://127.0.0.1:11434/api/generate', // ✅ IPv4 FIX
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'phi3:mini', // ✅ INSTALLED MODEL
          prompt: message,
          stream: false
        })
      }
    );

    if (!ollamaResponse.ok) {
      const text = await ollamaResponse.text();
      console.error('Ollama error:', text);
      return res.status(500).json({ error: 'Ollama error', details: text });
    }

    const data = await ollamaResponse.json();

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

app.listen(PORT, () => {
  console.log(`
✅ Backend server is running!

📍 URL: http://localhost:${PORT}

📚 Endpoints:
- GET  /api/hello
- POST /api/chat

🔗 Ollama must be running on port 11434
`);
});
