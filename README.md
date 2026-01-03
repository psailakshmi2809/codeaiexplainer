# AI Chat Application

A simple full-stack chat app that lets you talk to AI models running locally on your computer. You can upload code projects and ask the AI to explain them.

## What Can You Do?

- Chat with local AI models (Ollama)
- Switch between different AI models
- Upload a ZIP file of your project code
- Get AI analysis of your code structure
- See syntax-highlighted code snippets
- Works on mobile and desktop

## Folder Structure

```
fullstack-ollama-tutorial/
├── backend/
│   ├── server.js          - Backend API (handles requests)
│   ├── codeAnalyzer.js    - Analyzes uploaded code
│   └── package.json       - Dependencies
│
├── frontend/
│   ├── src/
│   │   ├── App.tsx        - Main page
│   │   ├── components/    - Chat, upload, file viewer components
│   │   └── utils.ts       - Helper functions
│   └── package.json       - Dependencies
│
└── README.md
```

## What You Need

- Node.js (v18+) - Download from [nodejs.org](https://nodejs.org/)
- Ollama - Download from [ollama.ai](https://ollama.ai/)

## Installation

### Step 1: Setup Backend

```bash
cd backend
npm install
npm start
```

The backend starts on `http://localhost:5000`

### Step 2: Setup Frontend  

```bash
cd frontend
npm install
npm run dev
```

Open your browser to `http://localhost:5173`

### Step 3: Make Sure Ollama is Running

```bash
ollama list     # See what models you have
ollama pull phi3:mini    # Download a model if needed
```

## How It Works

1. **You type a message** in the chat box
2. **Frontend sends it** to the backend API
3. **Backend asks Ollama** to generate a response
4. **Response comes back** and displays in chat
5. **You can upload code** - it gets analyzed and explained

## API Endpoints

| Endpoint | What It Does |
|----------|-------------|
| `POST /api/chat` | Send a message, get AI response |
| `GET /api/models` | Get list of available AI models |
| `POST /api/project/upload` | Upload a ZIP file of code |

## Troubleshooting

**Problem:** Can't connect to backend
- Check: Is backend running? (`npm start` in backend folder)
- Check: Port 5000 is free

**Problem:** Can't connect to Ollama
- Check: Is Ollama running? Open terminal and run `ollama serve`
- Check: You have a model installed (`ollama list`)

**Problem:** Frontend shows blank page
- Check: Frontend is running (`npm run dev` in frontend folder)
- Check: Port 5173 is free

## Technology Used

**Frontend:** React, TypeScript, Vite (fast bundler)  
**Backend:** Node.js, Express (web server)  
**AI:** Ollama (runs models locally)

## Want to Learn More?

Check out these helpful links:
- [React Docs](https://react.dev/) - Learn React
- [Express Docs](https://expressjs.com/) - Learn Express  
- [Ollama Docs](https://ollama.ai/docs) - Learn Ollama

## Project Structure Explained

### Backend (Node.js + Express)

The backend is a simple API server that:
1. Listens for chat messages from the frontend
2. Sends them to Ollama
3. Gets the AI response back
4. Sends it to the frontend

### Frontend (React + TypeScript)

The frontend is a React app that:
1. Shows a chat interface
2. Sends messages to the backend
3. Displays responses from the AI
4. Lets you upload project files

## Next Steps

Want to add more features? Try these:

1. **Add chat history** - Store messages in a database
2. **Add user accounts** - Let multiple users chat
3. **Add more models** - Support different Ollama models
4. **Add export** - Download chat history as text/PDF
5. **Add voice** - Talk to the AI with your voice

---

Made with ❤️ using React, Node.js, and Ollama


