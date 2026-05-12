"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Send, X, Bot, User, Loader2 } from "lucide-react";
import { BrandIdentityResult } from "@/types/brand";
import clsx from "clsx";

interface Message {
  role: "ajo" | "user";
  text: string;
}

interface ChatPanelProps {
  brandContext: BrandIdentityResult;
}

export function ChatPanel({ brandContext }: ChatPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    { role: "ajo", text: `Halo! Saya Ajo. Ada yang mau ditanyain soal brand "${brandContext.identity}" kamu ini?` }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const suggestedQuestions = [
    "Apa strategi konten terbaik buat saya?",
    "Siapa target audience saya sebenarnya?",
    "Kasih ide promo buat minggu depan dong!",
  ];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async (text?: string) => {
    const messageToSend = text || input;
    if (!messageToSend.trim() || isLoading) return;

    const userMsg = messageToSend.trim();
    if (!text) setInput("");
    setMessages((prev) => [...prev, { role: "user", text: userMsg }]);
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMsg,
          brandContext,
          history: messages.slice(-5)
        }),
      });

      const data = await response.json();
      if (data.text) {
        setMessages((prev) => [...prev, { role: "ajo", text: data.text }]);
      } else if (data.error) {
        throw new Error(data.details || data.error);
      }
    } catch (error: any) {
      const errorMsg = error.message || "Ajo lagi agak lemot nih.";
      setMessages((prev) => [...prev, { role: "ajo", text: `Maaf ya, ${errorMsg} Coba tanya lagi nanti ya!` }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9, transformOrigin: "bottom right" }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="mb-4 w-[350px] sm:w-[420px] h-[550px] glass-panel rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden border border-primary/20 bg-white/95 backdrop-blur-xl"
          >
            {/* Header */}
            <div className="p-6 bg-gradient-to-r from-primary to-blue-600 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center border border-white/30">
                    <Bot className="w-6 h-6" />
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-base leading-tight">Ajo Mentor</h3>
                  <p className="text-[10px] opacity-90 uppercase tracking-widest font-bold">Online & Siap Bantu</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-2 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages Area */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-4 scroll-smooth bg-gray-50/50">
              {messages.map((msg, i) => (
                <div key={i} className={clsx("flex gap-3", msg.role === "user" ? "flex-row-reverse" : "flex-row")}>
                  <div className={clsx(
                    "w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-[10px] font-bold shadow-sm",
                    msg.role === "user" ? "bg-primary text-white" : "bg-white border border-primary/20 text-primary"
                  )}>
                    {msg.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>
                  <div className={clsx(
                    "max-w-[75%] p-3.5 rounded-2xl text-sm leading-relaxed shadow-sm",
                    msg.role === "user" 
                      ? "bg-primary text-primary-foreground rounded-tr-none" 
                      : "bg-white border border-gray-100 text-foreground rounded-tl-none"
                  )}>
                    {msg.text}
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex gap-3 items-start">
                  <div className="w-8 h-8 rounded-full bg-white border border-primary/20 flex items-center justify-center text-primary">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="bg-white border border-gray-100 p-3.5 rounded-2xl rounded-tl-none shadow-sm flex gap-1.5 items-center">
                    <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1.5 h-1.5 bg-primary/40 rounded-full" />
                    <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1.5 h-1.5 bg-primary/40 rounded-full" />
                    <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1.5 h-1.5 bg-primary/40 rounded-full" />
                  </div>
                </div>
              )}
            </div>

            {/* Suggested Questions */}
            {!isLoading && messages.length < 3 && (
              <div className="px-5 py-2 flex flex-wrap gap-2 bg-gray-50/50">
                {suggestedQuestions.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(q)}
                    className="text-[11px] px-3 py-1.5 bg-white border border-primary/10 rounded-full text-primary hover:bg-primary hover:text-white transition-all shadow-sm"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            {/* Input Area */}
            <div className="p-5 bg-white border-t border-gray-100 flex gap-3 items-center">
              <input
                type="text"
                placeholder="Tulis pesan ke Ajo..."
                className="flex-1 bg-gray-100 px-5 py-3 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
              />
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleSend()}
                disabled={isLoading || !input.trim()}
                className="w-11 h-11 bg-primary text-primary-foreground rounded-2xl flex items-center justify-center shadow-lg disabled:opacity-50 disabled:grayscale transition-all"
              >
                <Send className="w-5 h-5" />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-16 h-16 bg-primary text-primary-foreground rounded-full shadow-2xl flex items-center justify-center relative overflow-hidden group border-4 border-white dark:border-gray-800"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        {isOpen ? <X className="w-7 h-7" /> : <MessageCircle className="w-7 h-7" />}
        {!isOpen && (
          <div className="absolute top-2 right-2 w-4 h-4 bg-red-500 rounded-full border-2 border-white animate-bounce" />
        )}
      </motion.button>
    </div>
  );
}
