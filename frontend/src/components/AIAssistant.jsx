import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, X, Send, User, Loader2 } from 'lucide-react';
import api from '../services/api';

const AIAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, type: 'ai', text: 'Hi! I am your FinTrack AI Assistant. Ask me anything about your budget, expenses, income, or savings goals.' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { id: Date.now(), type: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await api.post('/ai/ask', { question: userMessage.text });
      setMessages(prev => [...prev, { id: Date.now(), type: 'ai', text: res.data.answer }]);
    } catch (error) {
      setMessages(prev => [...prev, { id: Date.now(), type: 'ai', text: 'Sorry, I encountered an error while analyzing your data.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-primary to-purple-600 rounded-full flex items-center justify-center text-white shadow-2xl shadow-primary/30 z-40 transition-all ${isOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
      >
        <Bot className="w-7 h-7" />
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 right-6 w-80 sm:w-96 h-[500px] max-h-[80vh] glass-card rounded-2xl flex flex-col overflow-hidden z-50 border border-slate-700 shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-slate-800/80 border-b border-slate-700">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary to-purple-600 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">FinTrack AI</h3>
                  <p className="text-xs text-success flex items-center">
                    <span className="w-2 h-2 rounded-full bg-success mr-1"></span> Online
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-900/50">
              {messages.map((msg) => (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={msg.id}
                  className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex gap-2 max-w-[85%] ${msg.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center mt-1 ${msg.type === 'user' ? 'bg-slate-700' : 'bg-primary/20'}`}>
                      {msg.type === 'user' ? <User className="w-3 h-3 text-white" /> : <Bot className="w-3 h-3 text-primary" />}
                    </div>
                    <div className={`p-3 rounded-2xl text-sm ${msg.type === 'user' ? 'bg-primary text-white rounded-tr-sm' : 'bg-slate-800 text-slate-200 rounded-tl-sm border border-slate-700/50'}`}>
                      {/* Very basic markdown rendering for bold text */}
                      {msg.text.split('**').map((part, i) => i % 2 === 1 ? <strong key={i} className="text-white">{part}</strong> : part)}
                    </div>
                  </div>
                </motion.div>
              ))}
              {isLoading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                  <div className="flex gap-2 max-w-[85%]">
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex-shrink-0 flex items-center justify-center mt-1">
                      <Bot className="w-3 h-3 text-primary" />
                    </div>
                    <div className="p-3 rounded-2xl bg-slate-800 text-slate-400 rounded-tl-sm border border-slate-700/50 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 bg-slate-800/80 border-t border-slate-700">
              <form onSubmit={handleSubmit} className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about your budget..."
                  className="flex-1 bg-slate-900 border border-slate-600 rounded-full px-4 py-2 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-primary transition-colors"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary-dark transition-colors flex-shrink-0"
                >
                  <Send className="w-4 h-4 ml-0.5" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AIAssistant;
