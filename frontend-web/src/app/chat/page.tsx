"use client";

import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { MessageSquare, Send, User, Bot, Sparkles, AlertCircle, ShieldAlert, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import api from "@/utils/api";

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function ChatPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "Hello! I'm AI MedGuide, your personal health assistant. How can I help you today?" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestions = [
    "Common cold symptoms",
    "How to improve sleep?",
    "Heart health tips",
    "Low calorie diet"
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const hasToken = typeof window !== "undefined" && localStorage.getItem("token");
    if (!authLoading && !user && !hasToken) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/health/profile");
        setProfile(res.data);
      } catch (err) {
        console.warn("Profile fetch failed in ChatPage", err);
      }
    };
    if (user) fetchProfile();
  }, [user]);

  const handleSend = async (val: string = input) => {
    const text = val.trim();
    if (!text || isLoading) return;

    setInput("");
    setMessages(prev => [...prev, { role: 'user', content: text }]);
    setIsLoading(true);

    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_AI_SERVICE_URL || 'http://localhost:8000'}/chat`, {
        message: text,
        history: messages,
        user_profile: profile ? {
          ...profile,
          name: user?.name
        } : { name: user?.name }
      });

      setMessages(prev => [...prev, { role: 'assistant', content: response.data.response }]);
    } catch (error) {
      console.error("Chat Error:", error);
      setMessages(prev => [...prev, { role: 'assistant', content: "I'm sorry, I encountered an error. Please try again later." }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) return (
    <div className="flex items-center justify-center min-h-screen text-cyan-500 animate-pulse font-black uppercase tracking-widest text-[11px] italic">
      Syncing Health Intelligence...
    </div>
  );

  return (
    <main className="min-h-screen pt-10 md:pt-16 pb-24 px-6 max-w-5xl mx-auto relative overflow-hidden flex flex-col">
      {/* Background Glows */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-cyan-500/10 blur-[150px] -z-10 rounded-full"></div>
      <div className="absolute top-1/3 -right-24 w-80 h-80 bg-blue-500/5 blur-[120px] -z-10 rounded-full"></div>
      <div className="absolute bottom-0 left-1/3 w-72 h-72 bg-emerald-500/5 blur-[120px] -z-10 rounded-full"></div>

      {/* Header */}
      <header className="mb-10 relative">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-5"
        >
          <div className="relative group">
            <div className="absolute -inset-2 bg-gradient-to-r from-cyan-600 to-blue-500 rounded-2xl blur-lg opacity-40 group-hover:opacity-70 transition duration-500"></div>
            <div className="relative p-4 bg-black/60 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl">
              <MessageSquare className="w-7 md:w-8 h-7 md:h-8 text-cyan-400 group-hover:scale-110 transition-transform duration-500" />
            </div>
          </div>
          <div>
            <h1 className="text-3xl md:text-5xl font-black tracking-tighter text-white">
              AI Med<span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-400">Guide</span>
            </h1>
            <div className="flex items-center gap-2.5 mt-1.5">
              <div className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 flex items-center gap-2">
                <Sparkles className="w-3 h-3 text-cyan-500/50" /> Live Health Intelligence
              </p>
            </div>
          </div>
        </motion.div>
      </header>

      {/* Chat Container */}
      <div className="relative flex-1 flex flex-col min-h-[550px] max-h-[75vh] glass rounded-[3rem] border border-white/10 overflow-hidden shadow-2xl shadow-black/80 backdrop-blur-3xl bg-white/[0.01]">
        
        {/* Messages Viewport */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 custom-scrollbar">
          <AnimatePresence initial={false}>
            {messages.map((msg, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, y: 15, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex gap-4 max-w-[95%] md:max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border transition-all duration-500 ${
                    msg.role === 'user' 
                      ? 'bg-gradient-to-tr from-cyan-600 to-blue-600 border-white/20 shadow-[0_0_15px_rgba(6,182,212,0.3)]' 
                      : 'bg-white/5 border-white/10 shadow-lg'
                  }`}>
                    {msg.role === 'user' ? (
                      <User className="w-5 h-5 text-white" />
                    ) : (
                      <Bot className="w-5 h-5 text-cyan-400 group-hover:rotate-12 transition-transform" />
                    )}
                  </div>
                  
                  <div className={`group relative p-4 md:p-5 rounded-[1.75rem] text-[13px] md:text-sm font-medium leading-relaxed transition-all duration-300 shadow-xl ${
                    msg.role === 'user' 
                    ? 'bg-gradient-to-br from-cyan-600 to-blue-700 text-white rounded-tr-none border border-white/10' 
                    : 'bg-white/[0.04] backdrop-blur-2xl border border-white/10 text-gray-200 rounded-tl-none hover:bg-white/[0.07] hover:border-cyan-500/20'
                  }`}>
                    {/* Bot specific background polish */}
                    {msg.role === 'assistant' && (
                      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none rounded-[1.75rem]"></div>
                    )}
                    {msg.content}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {isLoading && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shadow-lg">
                  <Bot className="w-5 h-5 text-cyan-400 animate-spin-slow" />
                </div>
                <div className="bg-white/5 border border-white/10 p-5 rounded-3xl rounded-tl-none flex items-center gap-1.5 shadow-xl">
                  <motion.span animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1.5 h-1.5 bg-cyan-400 rounded-full"></motion.span>
                  <motion.span animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1.5 h-1.5 bg-cyan-400 rounded-full"></motion.span>
                  <motion.span animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1.5 h-1.5 bg-cyan-400 rounded-full"></motion.span>
                </div>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <div className="p-5 md:p-8 bg-gradient-to-b from-transparent via-black/20 to-black/60 border-t border-white/10">
          
          {/* Quick Suggestions - Premium Glass Chips */}
          <AnimatePresence>
            {!isLoading && messages.length < 3 && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-wrap gap-2.5 mb-5 px-1"
              >
                 {suggestions.map((s, idx) => (
                   <button 
                     key={idx}
                     onClick={() => handleSend(s)}
                     className="text-[10px] font-black uppercase tracking-widest px-4 py-2.5 rounded-2xl border border-white/10 bg-white/[0.03] hover:bg-cyan-500/10 hover:border-cyan-500/30 text-gray-400 hover:text-cyan-400 transition-all active:scale-95 flex items-center gap-2 group backdrop-blur-md"
                   >
                     <Sparkles className="w-3 h-3 opacity-40 group-hover:opacity-100 group-hover:scale-110 transition-all" />
                     {s}
                     <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                   </button>
                 ))}
              </motion.div>
            )}
          </AnimatePresence>

          <form 
            onSubmit={(e) => { e.preventDefault(); handleSend(); }} 
            className="relative flex items-center group/form"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-600/30 to-blue-600/30 blur-2xl rounded-2xl opacity-0 group-focus-within/form:opacity-100 transition-opacity pointer-events-none duration-700"></div>
            
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything about your symptoms or medical status..."
              className="flex-1 bg-white/5 border border-white/10 rounded-2xl pl-6 pr-16 py-4 md:py-5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-cyan-500/50 focus:bg-white/[0.08] transition-all backdrop-blur-xl relative z-10 font-medium italic"
              disabled={isLoading}
            />
            
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className={`absolute right-2 p-3 md:p-3.5 rounded-xl transition-all z-20 group/send ${
                input.trim() && !isLoading 
                ? 'bg-gradient-to-tr from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/30 active:scale-90 hover:brightness-110' 
                : 'bg-white/5 text-gray-600 cursor-not-allowed border border-white/5'
              }`}
            >
              <Send className={`w-5 h-5 transition-transform duration-500 ${input.trim() && !isLoading ? 'group-hover/send:translate-x-0.5 group-hover/send:-translate-y-0.5 group-hover/send:scale-110' : ''}`} />
            </button>
          </form>
        </div>
      </div>

      {/* Premium Disclaimer Banner */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="mt-8 p-6 rounded-[2rem] bg-gradient-to-r from-red-500/[0.06] to-amber-500/[0.04] border border-red-500/20 backdrop-blur-3xl shadow-2xl flex gap-5 items-center relative overflow-hidden group"
      >
        <div className="absolute top-0 right-0 w-32 h-full bg-red-400/[0.02] -skew-x-[30deg] translate-x-10 group-hover:translate-x-0 transition-transform duration-1000"></div>
        
        <div className="w-11 h-11 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0 shadow-inner shadow-red-500/5">
          <ShieldAlert className="w-6 h-6 text-red-400" />
        </div>
        
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1.5 text-red-400">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]"></span>
            <h3 className="text-[11px] font-black uppercase tracking-[0.25em]">Medical Disclaimer</h3>
          </div>
          <p className="text-[11px] text-gray-500 leading-relaxed font-medium max-w-3xl group-hover:text-gray-400 transition-colors">
            AI MedGuide provides AI-generated health information and is <span className="text-red-400/80 font-black">NOT</span> a substitute for professional medical advice. Always consult a qualified medical professional for serious conditions.
          </p>
        </div>
      </motion.div>
    </main>
  );
}
