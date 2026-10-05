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

  const formatResponse = (text) => {
    if (!text) return '';
    // Detect code blocks and preserve them
    const parts = text.split(/(```[\s\S]*?```)/g);
    return parts.map((part, i) => {
      if (part.startsWith('```')) {
        const lang = part.match(/^```(\w*)/)?.[1] || '';
        const code = part.replace(/^```\w*\n?/, '').replace(/```$/, '');
        return (
          <pre key={i} style={{
            background: 'rgba(0,0,0,0.4)', borderRadius: '8px', padding: '12px',
            fontSize: '0.82rem', overflowX: 'auto', margin: '8px 0',
            border: '1px solid rgba(99,102,241,0.2)', color: '#a7f3d0',
            fontFamily: "'Fira Code', 'Courier New', monospace", whiteSpace: 'pre-wrap'
          }}>
            {lang && <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem', marginBottom: 4 }}>{lang}</div>}
            {code}
          </pre>
        );
      }
      // Format **bold**, bullet points and line breaks
      return (
        <span key={i} style={{ whiteSpace: 'pre-wrap' }}>
          {part.split('\n').map((line, j) => {
            const boldFormatted = line.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
            return (
              <span key={j}>
                <span dangerouslySetInnerHTML={{ __html: boldFormatted }} />
                {j < part.split('\n').length - 1 && <br />}
              </span>
            );
          })}
        </span>
      );
    });
  };

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed) {
      toast.error('Please enter a question before sending.');
      return;
    }
    if (loading) return;

    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: trimmed }]);
    setLoading(true);

    try {
      const res = await api.post('/ai/chat', { message: trimmed, sessionId: sessionId || undefined });
      const data = res.data?.data;
      if (!data?.response) throw new Error('Empty response from server');
      if (!sessionId) setSessionId(data.sessionId);
      setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
    } catch (err) {
      const status = err.response?.status;
      let userMsg = '⚠️ Could not get a response. Please try again.';
      let toastMsg = 'AI service error. Please try again.';

      if (!err.response) {
        userMsg = '⚠️ Cannot reach the server. Please make sure the backend is running.';
        toastMsg = 'Backend unavailable. Start the Spring Boot server and try again.';
      } else if (status === 400) {
        userMsg = '⚠️ Invalid request — please enter a valid question.';
        toastMsg = 'Invalid request.';
      } else if (status === 401 || status === 403) {
        userMsg = '⚠️ Your session has expired. Please log in again.';
        toastMsg = 'Session expired — please log in again.';
      } else if (status >= 500) {
        userMsg = '⚠️ The server encountered an error. Please try again in a moment.';
        toastMsg = 'Server error. Check backend logs for details.';
      }

      toast.error(toastMsg);
      setMessages(prev => [...prev, { role: 'assistant', content: userMsg }]);
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
                    {msg.role === 'assistant' ? formatResponse(msg.content) : msg.content}
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
