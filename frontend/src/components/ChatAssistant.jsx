import React, { useState, useRef, useEffect } from 'react';
import api from '../api/axios';

const ChatAssistant = ({ userType = 'guest', companyId = null, position = 'bottom-right' }) => {
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [config, setConfig] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchChatbotConfig();
  }, [userType]);

  useEffect(() => {
    if (config && chatMessages.length === 0) {
      setChatMessages([{ sender: 'ai', text: config.greeting }]);
    }
  }, [config]);

  const fetchChatbotConfig = async () => {
    try {
      const type = userType === 'guest' ? 'landing' : userType;
      const { data } = await api.get(`/api/chatbot/config/${type}`);
      setConfig(data);
    } catch (error) {
      console.error('Failed to fetch chatbot config:', error);
      // Use fallback greeting if config fetch fails
      setConfig({
        greeting: userType === 'guest' 
          ? 'Hi! I\'m WorkPro Assistant. Ask me anything about our platform!' 
          : 'Hi! I\'m WorkPro. Ask me about your tasks or company updates.',
        responses: [],
        fallbackResponse: 'I\'m not sure about that. Can you try rephrasing your question?',
        isActive: true
      });
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const sendChat = async () => {
    if (!chatInput.trim()) return;
    const prompt = chatInput.trim();
    setChatMessages((prev) => [...prev, { sender: 'user', text: prompt }]);
    setChatInput('');

    try {
      setChatLoading(true);

      if (userType === 'guest') {
        // For landing page - use predefined responses or simple AI
        const response = await handleGuestQuery(prompt);
        setChatMessages((prev) => [...prev, { sender: 'ai', text: response }]);
      } else {
        // For logged-in users - use backend AI
        const { data } = await api.post(
          '/api/ai/chat',
          { message: prompt },
          { headers: { 'x-company-id': companyId || undefined } }
        );
        setChatMessages((prev) => [...prev, { sender: 'ai', text: data.reply || 'No response yet.' }]);
      }
    } catch (err) {
      console.error('Chat failed:', err);
      setChatMessages((prev) => [
        ...prev,
        { sender: 'ai', text: 'Unable to respond right now. Try again soon.' }
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleGuestQuery = async (query) => {
    if (!config || !config.responses) {
      return 'Service unavailable. Please try again later.';
    }

    const lowerQuery = query.toLowerCase();
    
    // Sort responses by priority (highest first)
    const sortedResponses = [...config.responses].sort((a, b) => (b.priority || 0) - (a.priority || 0));
    
    // Find first matching response based on keywords
    for (const resp of sortedResponses) {
      if (resp.keywords && resp.keywords.length > 0) {
        const hasMatch = resp.keywords.some(keyword => 
          lowerQuery.includes(keyword.toLowerCase())
        );
        if (hasMatch) {
          return resp.response;
        }
      }
    }
    
    // Return fallback if no matches
    return config.fallbackResponse || 'I\'m not sure about that. Can you try rephrasing your question?';
  };

  const getPositionClasses = () => {
    switch (position) {
      case 'bottom-left':
        return 'bottom-6 left-6';
      case 'bottom-right':
      default:
        return 'bottom-6 right-6';
    }
  };

  const getColorScheme = () => {
    switch (userType) {
      case 'manager':
        return {
          gradient: 'from-blue-500 to-indigo-600',
          button: 'from-blue-500 to-indigo-600',
          userBg: 'bg-blue-600',
          icon: 'fa-user-tie'
        };
      case 'employee':
        return {
          gradient: 'from-emerald-500 to-green-600',
          button: 'from-emerald-500 to-green-600',
          userBg: 'bg-emerald-600',
          icon: 'fa-user'
        };
      case 'guest':
      default:
        return {
          gradient: 'from-purple-500 to-pink-600',
          button: 'from-purple-500 to-pink-600',
          userBg: 'bg-purple-600',
          icon: 'fa-headset'
        };
    }
  };

  const colors = getColorScheme();

  return (
    <div className={`fixed ${getPositionClasses()} z-50`}>
      {chatOpen && (
        <div className="w-80 md:w-96 bg-white border border-slate-200 rounded-2xl shadow-2xl mb-3 overflow-hidden animate-slide-up">
          <div className={`px-4 py-3 bg-gradient-to-r ${colors.gradient} text-white flex items-center justify-between`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <i className={`fa-solid ${colors.icon} text-lg`}></i>
              </div>
              <div>
                <p className="text-sm font-bold">WorkPro Assistant</p>
                <p className="text-xs text-white/80">
                  {userType === 'guest' ? 'How can I help?' : 'Ask me anything'}
                </p>
              </div>
            </div>
            <button
              onClick={() => setChatOpen(false)}
              className="text-white/80 hover:text-white text-2xl leading-none"
            >
              ×
            </button>
          </div>

          <div className="max-h-96 overflow-y-auto p-4 space-y-3 bg-slate-50">
            {chatMessages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm shadow-sm ${
                    msg.sender === 'user'
                      ? `${colors.userBg} text-white rounded-br-sm`
                      : 'bg-white text-slate-800 border border-slate-200 rounded-bl-sm'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {chatLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-slate-200 rounded-2xl px-4 py-2.5 text-sm text-slate-500">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-3 border-t border-slate-200 bg-white">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendChat()}
                placeholder="Type your message..."
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={sendChat}
                disabled={chatLoading || !chatInput.trim()}
                className={`w-10 h-10 rounded-xl bg-gradient-to-r ${colors.button} text-white flex items-center justify-center hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <i className="fa-solid fa-paper-plane text-sm"></i>
              </button>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={() => setChatOpen((v) => !v)}
        className={`w-14 h-14 rounded-full shadow-2xl bg-gradient-to-r ${colors.button} text-white flex items-center justify-center text-xl hover:scale-110 transition-transform`}
      >
        {chatOpen ? (
          <i className="fa-solid fa-chevron-down"></i>
        ) : (
          <i className="fa-solid fa-comments"></i>
        )}
      </button>
    </div>
  );
};

export default ChatAssistant;
