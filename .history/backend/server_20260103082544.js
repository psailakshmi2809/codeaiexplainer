const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const OLLAMA_URL = process.env.OLLAMA_URL || 'http://127.0.0.1:11434';
const DEFAULT_MODEL = process.env.DEFAULT_MODEL || 'phi3:mini';

// Middleware
app.use(cors());
app.use(express.json());

// In-memory conversation storage (use a database in production)
const conversations = new Map();

// Logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    config: {
      ollamaUrl: OLLAMA_URL,
      defaultModel: DEFAULT_MODEL,
      port: PORT
    }
  });
});

// Get available models
app.get('/api/models', async (req, res) => {
  try {
    const response = await fetch(`${OLLAMA_URL}/api/tags`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch models from Ollama');
    }

    const data = await response.json();
    
    res.json({
      models: data.models || [],
      count: data.models?.length || 0
    });

  } catch (error) {
    console.error('Error fetching models:', error);
    res.status(500).json({
      error: 'Failed to fetch available models',
      details: error.message
    });
  }
});

// Get conversation history
app.get('/api/conversations/:id', (req, res) => {
  const { id } = req.params;
  const conversation = conversations.get(id);

  if (!conversation) {
    return res.status(404).json({ error: 'Conversation not found' });
  }

  res.json({
    conversationId: id,
    messages: conversation.messages,
    createdAt: conversation.createdAt,
    updatedAt: conversation.updatedAt
  });
});

// Delete conversation
app.delete('/api/conversations/:id', (req, res) => {
  const { id } = req.params;
  
  if (conversations.has(id)) {
    conversations.delete(id);
    res.json({ message: 'Conversation deleted successfully' });
  } else {
    res.status(404).json({ error: 'Conversation not found' });
  }
});

// Chat endpoint with conversation history
app.post('/api/chat', async (req, res) => {
  try {
    const { message, model = DEFAULT_MODEL, conversationId } = req.body;

    // Validation
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({ error: 'Valid message is required' });
    }

    console.log(`Chat request - Model: ${model}, ConversationId: ${conversationId || 'new'}`);

    // Get or create conversation
    let conversation;
    const convId = conversationId || `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    if (conversations.has(convId)) {
      conversation = conversations.get(convId);
    } else {
      conversation = {
        messages: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      conversations.set(convId, conversation);
    }

    // Add user message to conversation
    conversation.messages.push({
      role: 'user',
      content: message,
      timestamp: new Date().toISOString()
    });

    // Call Ollama
    const ollamaResponse = await fetch(`${OLLAMA_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: model,
        prompt: message,
        stream: false,
        options: {
          temperature: 0.7,
          top_p: 0.9,
        }
      })
    });

    if (!ollamaResponse.ok) {
      const errorText = await ollamaResponse.text();
      console.error('Ollama error:', errorText);
      throw new Error(`Ollama API error: ${ollamaResponse.status}`);
    }

    const data = await ollamaResponse.json();

    // Add AI response to conversation
    conversation.messages.push({
      role: 'assistant',
      content: data.response,
      timestamp: new Date().toISOString(),
      model: data.model
    });

    conversation.updatedAt = new Date().toISOString();

    // Send response
    res.json({
      response: data.response,
      model: data.model,
      conversationId: convId,
      messageCount: conversation.messages.length
    });

  } catch (error) {
    console.error('Error in chat endpoint:', error);
    res.status(500).json({
      error: 'Failed to process chat request',
      details: error.message
    });
  }
});

// Legacy hello endpoint (for backward compatibility)
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
