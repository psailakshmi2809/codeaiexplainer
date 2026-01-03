const express = require('express');
const cors = require('cors');
const multer = require('multer');
const AdmZip = require('adm-zip');
const fs = require('fs');
const path = require('path');
const CodeAnalyzer = require('./codeAnalyzer');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const OLLAMA_URL = process.env.OLLAMA_URL || 'http://127.0.0.1:11434';
const DEFAULT_MODEL = process.env.DEFAULT_MODEL || 'phi3:mini';
const UPLOAD_DIR = path.join(__dirname, 'uploads');

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/zip' || file.mimetype === 'application/x-zip-compressed') {
      cb(null, true);
    } else {
      cb(new Error('Only .zip files are allowed'));
    }
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// In-memory conversation storage (use a database in production)
const conversations = new Map();
// In-memory project storage
const projects = new Map();

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

// Upload and analyze project
app.post('/api/project/upload', upload.single('project'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const zipPath = req.file.path;
    const projectId = path.basename(req.file.filename, path.extname(req.file.filename));
    const extractPath = path.join(UPLOAD_DIR, projectId);

    console.log(`Extracting project: ${projectId}`);

    // Extract zip file
    const zip = new AdmZip(zipPath);
    zip.extractAllTo(extractPath, true);

    // Delete zip file after extraction
    fs.unlinkSync(zipPath);

    // Analyze the project
    const analyzer = new CodeAnalyzer(extractPath);
    const analysis = await analyzer.analyze();

    // Store project data
    projects.set(projectId, {
      id: projectId,
      name: req.file.originalname.replace('.zip', ''),
      path: extractPath,
      analyzer: analyzer,
      analysis: analysis,
      uploadedAt: new Date(),
      conversationId: null
    });

    console.log(`Project analyzed: ${analysis.fileCount} files, ${analysis.techStack.length} technologies`);

    res.json({
      projectId,
      name: projects.get(projectId).name,
      analysis
    });

  } catch (error) {
    console.error('Project upload error:', error);
    res.status(500).json({
      error: 'Failed to upload and analyze project',
      details: error.message
    });
  }
});

// Get project analysis
app.get('/api/project/:id', (req, res) => {
  const { id } = req.params;
  const project = projects.get(id);

  if (!project) {
    return res.status(404).json({ error: 'Project not found' });
  }

  res.json({
    projectId: project.id,
    name: project.name,
    analysis: project.analysis,
    uploadedAt: project.uploadedAt
  });
});

// Get file content from project
app.get('/api/project/:id/file', (req, res) => {
  const { id } = req.params;
  const { path: filePath } = req.query;

  const project = projects.get(id);

  if (!project) {
    return res.status(404).json({ error: 'Project not found' });
  }

  if (!filePath) {
    return res.status(400).json({ error: 'File path is required' });
  }

  try {
    const content = project.analyzer.getFileContent(filePath);
    res.json({ path: filePath, content });
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

// Delete project
app.delete('/api/project/:id', (req, res) => {
  const { id } = req.params;
  const project = projects.get(id);

  if (!project) {
    return res.status(404).json({ error: 'Project not found' });
  }

  // Delete project directory
  try {
    fs.rmSync(project.path, { recursive: true, force: true });
    projects.delete(id);
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ error: 'Failed to delete project' });
  }
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

// Legacy chat endpoint (deprecated - use new /api/chat instead)
app.post('/api/chat-legacy', async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    console.log('Legacy chat request:', message);

    const ollamaResponse = await fetch(`${OLLAMA_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        prompt: message,
        stream: false
      })
    });

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

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    path: req.path,
    method: req.method
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    details: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║              🚀 AI CHAT BACKEND SERVER                      ║
╚════════════════════════════════════════════════════════════╝

✅ Server Status: RUNNING
📍 Server URL:    http://localhost:${PORT}
🤖 Ollama URL:    ${OLLAMA_URL}
🎯 Default Model: ${DEFAULT_MODEL}
🌍 Environment:   ${process.env.NODE_ENV || 'development'}

📚 Available Endpoints:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   GET    /api/health              - Server health check
   GET    /api/models              - List available models
   POST   /api/chat                - Send chat message
   GET    /api/conversations/:id   - Get conversation history
   DELETE /api/conversations/:id   - Delete conversation
   GET    /api/hello               - Legacy hello endpoint
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠️  Make sure Ollama is running on port 11434
    Run: ollama serve

🔗 Frontend should connect to: http://localhost:${PORT}

Press Ctrl+C to stop the server
`);
});
