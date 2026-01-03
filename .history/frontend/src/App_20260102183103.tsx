import { useState, ChangeEvent } from 'react';

// Type definitions
interface HelloResponse {
  message: string;
  timestamp: string;
}

interface ChatResponse {
  response: string;
  model: string;
}

function App() {
  // ============================================
  // STEP 1: Set up state variables
  // ============================================
  const [message, setMessage] = useState<string>('');      // User's input
  const [response, setResponse] = useState<string>('');    // Ollama's response
  const [loading, setLoading] = useState<boolean>(false);   // Loading state
  const [error, setError] = useState<string>('');          // Error messages

  // ============================================
  // STEP 2: Test backend connection (simple)
  // ============================================
  const testBackend = async (): Promise<void> => {
    try {
      setLoading(true);
      setError('');
      
      // Call our backend's test endpoint
      const response = await fetch('http://localhost:5000/api/hello');
      const data: HelloResponse = await response.json();
      
      setResponse(`✅ Backend connected! Message: ${data.message}`);
    } catch (err) {
      setError('❌ Cannot connect to backend. Make sure it is running on port 5000.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // STEP 3: Send message to Ollama via backend
  // ============================================
  const sendToOllama = async (): Promise<void> => {
    if (!message.trim()) {
      setError('Please enter a message');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setResponse(''); // Clear previous response

      // Call our backend's chat endpoint
      const res = await fetch('http://localhost:5000/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message })
      });

      if (!res.ok) {
        throw new Error('Backend request failed');
      }

      const data: ChatResponse = await res.json();
      
      // Display Ollama's response
      setResponse(data.response);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(`❌ Error: ${errorMessage}. Make sure backend and Ollama are running.`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // STEP 4: Render the UI
  // ============================================
  return (
    <div className="App">
      <h1>🎓 Learn: Frontend ↔️ Backend ↔️ Ollama</h1>
      
      {/* Test Connection Section */}
      <div className="section">
        <h2>Step 1: Test Backend Connection</h2>
        <button onClick={testBackend} disabled={loading}>
          Test Backend
        </button>
      </div>

      {/* Chat with Ollama Section */}
      <div className="section">
        <h2>Step 2: Chat with Ollama</h2>
        <textarea
          value={message}
          onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setMessage(e.target.value)}
          placeholder="Type your message here..."
          rows={4}
        />
        <button onClick={sendToOllama} disabled={loading}>
          {loading ? 'Sending...' : 'Send to Ollama'}
        </button>
      </div>

      {/* Display Response */}
      {response && (
        <div className="response">
          <h3>📝 Response:</h3>
          <p>{response}</p>
        </div>
      )}

      {/* Display Error */}
      {error && (
        <div className="error">
          <h3>⚠️ Error:</h3>
          <p>{error}</p>
        </div>
      )}

      {/* How It Works */}
      <div className="info">
        <h3>🔄 How it works:</h3>
        <ol>
          <li><strong>Frontend (React)</strong> - Runs on port 5173</li>
          <li>Sends request to <strong>Backend (Express)</strong> - Runs on port 5000</li>
          <li>Backend forwards request to <strong>Ollama</strong> - Runs on port 11434</li>
          <li>Response flows back: Ollama → Backend → Frontend</li>
        </ol>
      </div>
    </div>
  );
}

export default App;
