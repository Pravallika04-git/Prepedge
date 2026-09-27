import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../api/axios';
import { Send, Bot, Plus, MessageSquare } from 'lucide-react';

export default function Chat() {
  const { user } = useAuth();
  const toast = useToast();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [sessions, setSessions] = useState([]);
  const bottomRef = useRef(null);

  const initials = user?.fullName?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U';

  useEffect(() => {
    api.get('/ai/chat/sessions')
      .then(r => setSessions(r.data.data || []))
      .catch(() => {});
    // Start with a welcome message
    setMessages([{
      role: 'assistant',
      content: "👋 Hi! I'm your AI placement coach. Ask me anything about DSA, system design, interview tips, career advice, or technical concepts!",
    }]);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    try {
      const res = await api.post('/ai/chat', { message: userMsg, sessionId: sessionId || undefined });
      const data = res.data.data;
      if (!sessionId) setSessionId(data.sessionId);
      setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
    } catch (err) {
      toast.error('AI service unavailable. Check your API key configuration.');
      setMessages(prev => [...prev, { role: 'assistant', content: '⚠️ Sorry, I encountered an error. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  const newChat = () => {
    setSessionId(null);
    setMessages([{
      role: 'assistant',
      content: "👋 New conversation started! How can I help you with your placement preparation?",
    }]);
  };

  const loadSession = async (sid) => {
    try {
      const res = await api.get(`/ai/chat/history/${sid}`);
      setSessionId(sid);
      setMessages(res.data.data.map(m => ({ role: m.role.toLowerCase(), content: m.content })));
    } catch {
      toast.error('Failed to load session');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const QUICK_PROMPTS = [
    'Explain Big O notation',
    'Common system design questions',
    'How to prepare for DSA interviews?',
    'Tell me about array vs linked list',
  ];

  return (
    <div className="page-container" style={{ height: 'calc(100vh - var(--topbar-height))', display: 'flex', flexDirection: 'column' }}>
      <div className="page-header" style={{ marginBottom: '16px' }}>
        <h1><span className="gradient-text">AI Chat</span></h1>
        <p>Your personal placement preparation coach</p>
      </div>

      <div style={{ display: 'flex', gap: '20px', flex: 1, overflow: 'hidden', minHeight: 0 }}>
        {/* Sessions sidebar */}
        <div style={{ width: '220px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button id="new-chat" className="btn btn-primary btn-full btn-sm" onClick={newChat}>
            <Plus size={14} /> New Chat
          </button>

          {sessions.length > 0 && (
            <div className="card" style={{ flex: 1, overflow: 'auto', padding: '12px' }}>
              <div className="text-xs text-muted" style={{ marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>History</div>
              {sessions.map((sid, i) => (
                <button
                  key={sid}
                  className={`sidebar-link${sessionId === sid ? ' active' : ''}`}
                  style={{ padding: '8px 10px', marginBottom: '2px' }}
                  onClick={() => loadSession(sid)}
                >
                  <MessageSquare size={14} />
                  <span className="truncate">Session {i + 1}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Chat area */}
        <div className="chat-container" style={{ flex: 1 }}>
          <div className="chat-messages">
            <div className="chat-messages-list">
              {messages.map((msg, i) => (
                <div key={i} className={`chat-message ${msg.role}`}>
                  <div className={`message-avatar ${msg.role}`}>
                    {msg.role === 'user' ? initials : <Bot size={16} />}
                  </div>
                  <div className={`message-bubble ${msg.role}`}>
                    {msg.content}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="chat-message assistant">
                  <div className="message-avatar assistant"><Bot size={16} /></div>
                  <div className="message-bubble assistant">
                    <div className="typing-indicator">
                      <div className="typing-dot" />
                      <div className="typing-dot" />
                      <div className="typing-dot" />
                    </div>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Quick prompts */}
            {messages.length <= 1 && (
              <div style={{ padding: '0 24px 16px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {QUICK_PROMPTS.map(p => (
                  <button
                    key={p}
                    className="btn btn-ghost btn-sm"
                    style={{ border: '1px solid var(--border)', borderRadius: '999px' }}
                    onClick={() => { setInput(p); }}
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="chat-input-area">
              <textarea
                id="chat-input"
                className="chat-input"
                placeholder="Ask anything about placements, DSA, interviews…"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={1}
              />
              <button
                id="send-message"
                className="btn btn-primary"
                onClick={sendMessage}
                disabled={loading || !input.trim()}
                style={{ height: '44px', padding: '0 16px' }}
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
