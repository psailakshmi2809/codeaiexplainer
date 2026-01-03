// API Response Types
export interface HelloResponse {
  message: string;
  timestamp: string;
}

export interface ChatResponse {
  response: string;
  model: string;
  conversationId: string;
  messageCount: number;
}

export interface HealthResponse {
  status: string;
  timestamp: string;
  config: {
    ollamaUrl: string;
    defaultModel: string;
    port: number;
  };
}

export interface ModelInfo {
  name: string;
  modified_at?: string;
  size?: number;
  digest?: string;
}

export interface ModelsResponse {
  models: ModelInfo[];
  count: number;
}

export interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  model?: string;
}

export interface Conversation {
  conversationId: string;
  messages: ConversationMessage[];
  createdAt: string;
  updatedAt: string;
}

// Component State Types
export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  model?: string;
}

export interface AppState {
  messages: Message[];
  inputMessage: string;
  loading: boolean;
  error: string | null;
  conversationId: string | null;
  availableModels: string[];
  selectedModel: string;
  isConnected: boolean;
}

// API Error Type
export interface ApiError {
  error: string;
  details?: string;
}
