import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import { X, Send, Bot, User } from 'lucide-react';
import { chatWithCoach } from '../services/gemini';

interface ChatCoachProps {
  isOpen: boolean;
  onClose: () => void;
}

const ChatCoach: React.FC<ChatCoachProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: 'Hola, soy tu entrenador IA. ¿Tienes dudas sobre tu plan o necesitas consejos de running?', timestamp: Date.now() }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg: ChatMessage = { role: 'user', text: input, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
        // Format history for Gemini API
        const history = messages.map(m => ({
            role: m.role,
            parts: [{ text: m.text }]
        }));

        const responseText = await chatWithCoach(history, userMsg.text);
        
        setMessages(prev => [...prev, {
            role: 'model',
            text: responseText,
            timestamp: Date.now()
        }]);
    } catch (error) {
        setMessages(prev => [...prev, {
            role: 'model',
            text: 'Lo siento, hubo un error de conexión. Inténtalo de nuevo.',
            timestamp: Date.now()
        }]);
    } finally {
        setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-6 bg-black/50 backdrop-blur-sm">
      <div className="bg-zinc-900 w-full max-w-lg h-[80vh] sm:h-[600px] sm:rounded-2xl shadow-2xl flex flex-col border border-zinc-800 animate-in slide-in-from-bottom-10">
        
        {/* Header */}
        <div className="p-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-900 sm:rounded-t-2xl">
            <div className="flex items-center gap-3">
                <div className="bg-emerald-600 p-2 rounded-lg">
                    <Bot className="h-5 w-5 text-white" />
                </div>
                <div>
                    <h3 className="font-bold text-white">Coach IA</h3>
                    <p className="text-xs text-zinc-400">Siempre disponible</p>
                </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-zinc-800 rounded-full text-zinc-400 hover:text-white transition">
                <X className="h-5 w-5" />
            </button>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] rounded-2xl p-3 text-sm ${
                        msg.role === 'user' 
                        ? 'bg-emerald-600 text-white rounded-br-none' 
                        : 'bg-zinc-800 text-zinc-200 rounded-bl-none'
                    }`}>
                        {msg.text}
                    </div>
                </div>
            ))}
            {loading && (
                 <div className="flex justify-start">
                    <div className="bg-zinc-800 p-3 rounded-2xl rounded-bl-none flex gap-1">
                        <div className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce delay-100"></div>
                        <div className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce delay-200"></div>
                    </div>
                 </div>
            )}
        </div>

        {/* Input */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-900 sm:rounded-b-2xl">
            <div className="flex gap-2">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Escribe tu pregunta..."
                    className="flex-1 bg-zinc-950 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
                />
                <button 
                    onClick={handleSend}
                    disabled={!input.trim() || loading}
                    className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white p-3 rounded-xl transition"
                >
                    <Send className="h-5 w-5" />
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ChatCoach;