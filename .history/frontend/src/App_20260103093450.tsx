import { useState, useEffect, useRef, ChangeEvent } from 'react';
import './App.css';
import type { Message, ChatResponse, ModelsResponse } from './types';
import { 
  formatTimestamp, 
  generateId, 
  formatModelName,
  parseCodeBlocks,
  copyToClipboard,
  API_BASE_URL 
} from './utils';
import { FileUpload } from './components/FileUpload';
import { ProjectViewer } from './components/ProjectViewer';

function App() {
  // State Management
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('phi3:mini');
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  
  // Project state
  const [currentProject, setCurrentProject] = useState<{id: string, name: string, analysis: any} | null>(null);
  const [showUpload, setShowUpload] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Check backend connection on mount
  useEffect(() => {
    checkConnection();
    fetchAvailableModels();
  }, []);

  // Check backend and Ollama connection
  const checkConnection = async (): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/health`);
      if (response.ok) {
        setIsConnected(true);
        setError('');
      } else {
        setIsConnected(false);
        setError('Backend is not responding properly');
      }
    } catch (err) {
      setIsConnected(false);
      setError('Cannot connect to backend. Make sure it is running on port 5000.');
    }
  };

  // Fetch available Ollama models
  const fetchAvailableModels = async (): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/models`);
      if (response.ok) {
        const data: ModelsResponse = await response.json();
        const modelNames = data.models.map(m => m.name);
        setAvailableModels(modelNames);
        if (modelNames.length > 0 && !modelNames.includes(selectedModel)) {
          setSelectedModel(modelNames[0]);
        }
      }
    } catch (err) {
      console.error('Failed to fetch models:', err);
    }
  };

  // Send message to AI
  const sendMessage = async (): Promise<void> => {
    const trimmedMessage = inputMessage.trim();
    
    if (!trimmedMessage) {
      setError('Please enter a message');
      return;
    }

    if (!isConnected) {
      setError('Not connected to backend. Please check your connection.');
      return;
    }

    // Create user message
    const userMessage: Message = {
      id: generateId(),
      role: 'user',
      content: trimmedMessage,
      timestamp: new Date()
    };

    // Add user message to chat
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: trimmedMessage,
          model: selectedModel,
          conversationId: conversationId,
          projectId: currentProject?.id
        }),
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ChatResponse = await response.json();

      // Update conversation ID if new
      if (!conversationId && data.conversationId) {
        setConversationId(data.conversationId);
      }

      // Create assistant message
      const assistantMessage: Message = {
        id: generateId(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
        model: data.model
      };

      setMessages(prev => [...prev, assistantMessage]);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(`Failed to send message: ${errorMessage}`);
      console.error('Error sending message:', err);
    } finally {
      setLoading(false);
      textareaRef.current?.focus();
    }
  };

  // Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Clear conversation
  const clearConversation = () => {
    if (window.confirm('Are you sure you want to clear this conversation?')) {
      setMessages([]);
      setConversationId(null);
      setError('');
    }
  };

  // Handle project upload success
  const handleUploadSuccess = (projectId: string, analysis: any) => {
    setCurrentProject({
      id: projectId,
      name: analysis.summary?.projectName || 'Uploaded Project',
      analysis: analysis
    });
    setShowUpload(false);
    setMessages([]);
    setConversationId(null);
    
    // Add welcome message about the project
    const welcomeMessage: Message = {
      id: generateId(),
      role: 'assistant',
      content: `I've analyzed your project! 🎉\n\n**Summary:**\n- ${analysis.fileCount} files\n- Technologies: ${analysis.techStack.join(', ')}\n- Entry points: ${analysis.entryPoints.join(', ')}\n\nYou can now ask me questions about your codebase. Try:\n- "Explain the project architecture"\n- "How does authentication work?"\n- "What does [filename] do?"\n- "Show me the main components"`,
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
  };

  // Handle project upload error
  const handleUploadError = (errorMsg: string) => {
    setError(errorMsg);
  };

  // Close project
  const closeProject = () => {
    if (window.confirm('Close this project? Your chat history will be cleared.')) {
      setCurrentProject(null);
      setMessages([]);
      setConversationId(null);
      setError('');
    }
  };

  // Copy code to clipboard
  const handleCopyCode = async (code: string, blockId: string) => {
    const success = await copyToClipboard(code);
    if (success) {
      setCopiedCode(blockId);
      setTimeout(() => setCopiedCode(null), 2000);
    }
  };

  // Render message content with code blocks
  const renderMessageContent = (content: string, messageId: string) => {
    const parts = parseCodeBlocks(content);
    
    return parts.map((part, index) => {
      if (part.type === 'code') {
        const blockId = `${messageId}-${index}`;
        return (
          <div key={index} className="code-block">
            <div className="code-header">
              <span className="code-language">{part.language}</span>
              <button
                className={`copy-button ${copiedCode === blockId ? 'copied' : ''}`}
                onClick={() => handleCopyCode(part.content, blockId)}
              >
                {copiedCode === blockId ? '✓ Copied!' : '📋 Copy'}
              </button>
            </div>
            <div className="code-content">
              <pre><code>{part.content}</code></pre>
            </div>
          </div>
        );
      }
      return <p key={index}>{part.content}</p>;
    });
  };

  return (
    <div className="App">
      {/* Header */}
      <header className="app-header">
        <h1>🤖 CodeExplainer AI</h1>
        <p className="app-subtitle">
          {currentProject ? 'Chat with your codebase' : 'Powered by Ollama & Local AI Models'}
        </p>
      </header>

      {/* Status Bar */}
      <div className="status-bar">
        <div className="status-item">
          <div className={`status-dot ${isConnected ? 'connected' : 'disconnected'}`}></div>
          <span>{isConnected ? '✓ Connected' : '✗ Disconnected'}</span>
        </div>
        
        <div className="model-selector">
          <span>🎯 Model:</span>
          <select 
            value={selectedModel} 
            onChange={(e) => setSelectedModel(e.target.value)}
            disabled={loading}
          >
            {availableModels.length > 0 ? (
              availableModels.map(model => (
                <option key={model} value={model}>{formatModelName(model)}</option>
              ))
            ) : (
              <option value={selectedModel}>{formatModelName(selectedModel)}</option>
            )}
          </select>
        </div>

        {!currentProject ? (
          <button 
            className="upload-project-btn"
            onClick={() => setShowUpload(!showUpload)}
            title="Upload a project to analyze"
          >
            📦 Upload Project
          </button>
        ) : (
          <div className="project-badge">
            📦 {currentProject.name}
          </div>
        )}

        <div className="status-item">
          <span>💬 Messages: {messages.length}</span>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="error-banner">
          <span className="error-banner-icon">⚠️</span>
          <div className="error-banner-content">
            <h4>Error</h4>
            <p>{error}</p>
          </div>
        </div>
      )}

      {/* Actions Bar */}
      {messages.length > 0 && (
        <div className="actions-bar">
          <div className="actions-left">
            <span className="text-muted">Conversation ID: {conversationId?.slice(0, 12)}...</span>
          </div>
          <div className="actions-right">
            <button 
              className="btn btn-secondary btn-small" 
              onClick={checkConnection}
              disabled={loading}
            >
              🔄 Refresh
            </button>
            <button 
              className="btn btn-danger btn-small" 
              onClick={clearConversation}
              disabled={loading}
            >
              🗑️ Clear Chat
            </button>
          </div>
        </div>
      )}

      {/* Chat Container */}
      <div className="chat-container">
        {/* Messages Area */}
        <div className="messages-area">
          {messages.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">💬</div>
              <h3>Start a Conversation</h3>
              <p>
                Send a message to begin chatting with the AI. 
                Try asking questions, requesting code examples, or having a general conversation!
              </p>
            </div>
          ) : (
            <>
              {messages.map((message) => (
                <div key={message.id} className={`message ${message.role}`}>
                  <div className="message-avatar">
                    {message.role === 'user' ? '👤' : '🤖'}
                  </div>
                  <div className="message-content">
                    <div className="message-bubble">
                      {renderMessageContent(message.content, message.id)}
                    </div>
                    <div className="message-info">
                      <span>{formatTimestamp(message.timestamp)}</span>
                      {message.model && (
                        <span className="message-model">{formatModelName(message.model)}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </>
          )}

          {/* Loading Indicator */}
          {loading && (
            <div className="message assistant">
              <div className="message-avatar">🤖</div>
              <div className="message-content">
                <div className="loading-indicator">
                  <span>AI is thinking</span>
                  <div className="loading-dots">
                    <div className="loading-dot"></div>
                    <div className="loading-dot"></div>
                    <div className="loading-dot"></div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="input-area">
          <div className="input-container">
            <div className="input-wrapper">
              <textarea
                ref={textareaRef}
                value={inputMessage}
                onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message here... (Shift+Enter for new line)"
                disabled={loading}
                rows={3}
              />
            </div>
            <button
              className="btn btn-primary"
              onClick={sendMessage}
              disabled={loading || !inputMessage.trim()}
            >
              {loading ? '⏳ Sending...' : '🚀 Send'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
