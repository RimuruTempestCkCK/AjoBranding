"use client";

import { useState, useEffect } from "react";
import { Hero } from "@/components/Hero";
import { UploadBox } from "@/components/UploadBox";
import { ResultCard } from "@/components/ResultCard";
import { HistoryList } from "@/components/HistoryList";
import { ChatPanel } from "@/components/ChatPanel";
import { BrandIdentityResult, HistoryItem } from "@/types/brand";
import { motion, AnimatePresence } from "framer-motion";

export default function Home() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<BrandIdentityResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("persona_history");
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse history");
      }
    }
  }, []);

  const saveToHistory = (newResult: BrandIdentityResult) => {
    const newItem: HistoryItem = {
      ...newResult,
      id: crypto.randomUUID(),
      timestamp: Date.now()
    };
    const newHistory = [newItem, ...history].slice(0, 10);
    setHistory(newHistory);
    localStorage.setItem("persona_history", JSON.stringify(newHistory));
  };

  const handleSelectHistory = (item: HistoryItem) => {
    setResult(item);
    setImageUrl(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleClearHistory = () => {
    setHistory([]);
    localStorage.removeItem("persona_history");
  };

  const handleImageSelect = async (file: File, brandName?: string) => {
    setIsGenerating(true);
    setError(null);
    setResult(null);
    setImageUrl(URL.createObjectURL(file));

    try {
      const formData = new FormData();
      formData.append("image", file);
      if (brandName) {
        formData.append("brandName", brandName);
      }

      const response = await fetch("/api/generate", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.details || data.error || "Gagal menghasilkan identitas merek");
      }

      setResult(data as BrandIdentityResult);
      saveToHistory(data as BrandIdentityResult);
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan selama analisis.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center pb-24 selection:bg-white/20">
      <Hero />

      <div className="w-full max-w-[1440px] mx-auto px-4 md:px-8 mt-0 flex flex-col items-center gap-16">
        <AnimatePresence mode="wait">
          {!result && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.4 }}
              className="w-full"
            >
              <UploadBox onImageSelect={handleImageSelect} isLoading={isGenerating} onError={setError} />
              
              {error && (
                <div className="mt-6 p-4 border border-red-500/50 bg-red-500/10 text-red-200 rounded-2xl text-center max-w-2xl mx-auto">
                  <p>{error}</p>
                </div>
              )}
            </motion.div>
          )}

          {result && (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.95, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
              className="w-full"
            >
              <ResultCard result={result} imageUrl={imageUrl} onReset={() => {
                setResult(null);
                setImageUrl(null);
              }} />
              <ChatPanel brandContext={result} />
            </motion.div>
          )}
        </AnimatePresence>

        {!result && history.length > 0 && (
          <HistoryList 
            history={history} 
            onSelect={handleSelectHistory} 
            onClear={handleClearHistory} 
          />
        )}
      </div>
    </main>
  );
}
