import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, Bot, Loader2, X } from 'lucide-react';
import parkingApi from '../api/parkingApi';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, role: 'bot', content: 'Hi! I\'m your SPS Assistant. Ask me about parking slots, bookings, wallet, or anything!' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = { id: Date.now(), role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await parkingApi.sendChat(input);
      const botMessage = {
        id: Date.now() + 1,
        role: 'bot',
        content: response.answer || 'No response received.'
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      const msg = error.name === 'AbortError'
        ? 'Request timed out. The AI model is taking too long — please try again.'
        : `Error: ${error.message}. Ensure backend and OpenClaw server are running.`;
      const errorMessage = {
        id: Date.now() + 1,
        role: 'bot',
        content: msg
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>

      {isOpen && (
        <div className="fixed bottom-6 right-6 w-80 h-[500px] bg-[#121e1e] rounded-3xl border border-white/10 shadow-2xl backdrop-blur-xl z-50 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl shadow-lg">
                <Bot size={20} className="text-black" />
              </div>
              <div>
                <h3 className="font-black text-white text-lg">OpenClaw Assistant</h3>
                <p className="text-cyan-400 text-sm font-bold">SPS Parking Helper</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 hover:bg-white/10 rounded-xl transition-all"
            >
              <X size={20} className="text-slate-400" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 p-6 overflow-y-auto custom-scrollbar space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-4 rounded-2xl shadow-lg ${msg.role === 'user'
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-black rounded-br-sm'
                      : 'bg-[#1a2d3a] text-white rounded-bl-sm border border-white/20'
                    }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-[#1a2d3a] p-4 rounded-2xl border border-white/20 flex items-center space-x-2">
                  <Loader2 size={16} className="animate-spin text-cyan-400" />
                  <span className="text-white text-sm">OpenClaw thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-6 border-t border-white/10">
            <div className="flex space-x-3">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about parking, bookings, slots..."
                className="flex-1 bg-[#0d1616] border border-white/20 rounded-2xl p-4 text-white placeholder-slate-500 focus:ring-2 focus:ring-cyan-500/50 focus:border-transparent resize-none h-12"
                rows={1}
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || isLoading}
                className="w-12 h-12 bg-cyan-500 hover:bg-cyan-400 text-black rounded-2xl flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-cyan-500/25"
              >
                <Send size={18} />
              </button>
            </div>
            <p className="text-xs text-slate-500 mt-2 text-center">
              Powered by OpenClaw Agent
            </p>
          </div>
        </div>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #0d1616;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #334155;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #475569;
        }
      `}</style>
    </>
  );
};

export default Chatbot;
