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
    const { message, model = DEFAULT_MODEL, conversationId, projectId } = req.body;

    // Validation
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({ error: 'Valid message is required' });
    }

    console.log(`Chat request - Model: ${model}, ConversationId: ${conversationId || 'new'}, ProjectId: ${projectId || 'none'}`);

    // Get project context if projectId is provided
    let systemPrompt = null;
    let projectContext = '';
    
    if (projectId) {
      const project = projects.get(projectId);
      if (project) {
        const analysis = project.analysis;
        
        // Build project context
        projectContext = `

You are analyzing a codebase with the following characteristics:
- Project: ${project.name}
- Total Files: ${analysis.fileCount}
- Technologies: ${analysis.techStack.join(', ')}
- Entry Points: ${analysis.entryPoints.join(', ')}
- File Types: ${Object.entries(analysis.summary.filesByType).map(([ext, count]) => `${ext}: ${count}`).join(', ')}

When answering questions, provide WELL-ORGANIZED and CLEAR explanations:

**Structure your responses as follows:**
1. Use clear headings with ## or ### for different sections
2. Break down complex topics into bullet points or numbered lists
3. **IMPORTANT: Create Mermaid flowcharts** to visualize:
   - Code execution flow
   - Component relationships
   - Data flow between modules
   - Architecture diagrams
   - Process workflows
   
**Mermaid Syntax** (wrap in \`\`\`mermaid):
- Use flowchart TD/LR for process flows
- Use graph TD/LR for relationships
- Example:
\`\`\`mermaid
flowchart TD
    A[Start] --> B{Decision}
    B -->|Yes| C[Action 1]
    B -->|No| D[Action 2]
    C --> E[End]
    D --> E
\`\`\`

**Response Guidelines:**
1. Reference specific files and line numbers when possible
2. Explain code architecture clearly with visual diagrams
3. Identify relationships between components using flowcharts
4. Suggest improvements based on best practices
5. Use code blocks with proper language tags
6. Create visual flowcharts for ANY workflow or architecture explanation
7. Break long explanations into organized sections

The user's question is about this codebase.`;

        // If the question mentions specific files, try to include their content
        const mentionedFiles = project.analyzer.searchFiles(message);
        if (mentionedFiles.length > 0 && mentionedFiles.length <= 3) {
          projectContext += '\n\nRelevant files mentioned:\n';
          for (const file of mentionedFiles.slice(0, 3)) {
            try {
              const content = project.analyzer.getFileContent(file.path);
              // Limit content to first 500 lines
              const lines = content.split('\n').slice(0, 500).join('\n');
              projectContext += `\n--- ${file.path} ---\n${lines}\n`;
            } catch (error) {
              console.error(`Error reading file ${file.path}:`, error);
            }
          }
        }

        systemPrompt = projectContext;
      }
    }

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

    // Build context from conversation history
    let contextPrompt = '';
    
    // Add general system prompt if no project context
    if (!systemPrompt) {
      contextPrompt = `You are a helpful AI assistant. When explaining concepts or code:

**Please structure your responses clearly:**
1. Use headings (## or ###) to organize different sections
2. Break down complex information into bullet points or numbered lists
3. **Create Mermaid flowcharts** when explaining:
   - Workflows or processes
   - System architecture
   - Data flow
   - Algorithm steps
   - Decision trees

**Mermaid Flowchart Syntax** (wrap in \`\`\`mermaid):
Example:
\`\`\`mermaid
flowchart TD
    A[Start] --> B{Condition?}
    B -->|Yes| C[Action 1]
    B -->|No| D[Action 2]
    C --> E[End]
    D --> E
\`\`\`

**Guidelines:**
- Use proper markdown formatting
- Include code blocks with language tags
- Create visual diagrams for better understanding
- Be clear, concise, and well-organized

`;
    } else {
      contextPrompt = systemPrompt + '\n\n';
    }
    
    // Add recent conversation history (last 5 messages)
    const recentMessages = conversation.messages.slice(-6, -1); // Exclude the current message
    if (recentMessages.length > 0) {
      contextPrompt += 'Previous conversation:\n';
      recentMessages.forEach(msg => {
        contextPrompt += `${msg.role}: ${msg.content}\n`;
      });
      contextPrompt += '\n';
    }
    
    contextPrompt += `User: ${message}\nAssistant:`;

    // Call Ollama
    const ollamaResponse = await fetch(`${OLLAMA_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: model,
        prompt: contextPrompt,
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
   POST   /api/project/upload      - Upload project for analysis
   GET    /api/project/:id         - Get project analysis
   GET    /api/project/:id/file    - Get file content from project
   DELETE /api/project/:id          - Delete project
   GET    /api/conversations/:id   - Get conversation history
   DELETE /api/conversations/:id   - Delete conversation
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠️  Make sure Ollama is running on port 11434
    Run: ollama serve

🔗 Frontend should connect to: http://localhost:${PORT}

Press Ctrl+C to stop the server
`);
});
