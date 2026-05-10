"use client";

import { HistoryItem } from "@/types/brand";
import { Clock, ChevronRight, Trash2 } from "lucide-react";
import { motion } from "framer-motion";

interface HistoryListProps {
  history: HistoryItem[];
  onSelect: (item: HistoryItem) => void;
  onClear: () => void;
}

export function HistoryList({ history, onSelect, onClear }: HistoryListProps) {
  if (!history || history.length === 0) return null;

  return (
    <div className="w-full max-w-[1440px] mx-auto px-4 mt-16 pb-12 border-t border-border pt-12">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-xl">
            <Clock className="w-5 h-5 text-primary" />
          </div>
          <h3 className="text-2xl font-bold text-foreground">Riwayat Merek</h3>
        </div>
        <button
          onClick={onClear}
          className="flex items-center gap-2 px-4 py-2 rounded-full border border-red-500/20 text-sm font-medium text-red-500 hover:bg-red-500/10 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
          Hapus Riwayat
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {history.map((item, index) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            key={item.id}
            onClick={() => onSelect(item)}
            className="p-6 glass-panel rounded-3xl cursor-pointer hover:border-primary/30 transition-all duration-300 group flex flex-col h-full"
          >
            <div className="flex justify-between items-start mb-4">
              <h4 className="text-xl font-bold text-foreground leading-tight">
                {item.identity.split(" ")[0]} <br />
                <span className="text-gradient-gold">{item.identity.split(" ").slice(1).join(" ")}</span>
              </h4>
              <ChevronRight className="w-6 h-6 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
            </div>
            
            <p className="text-sm text-muted-foreground mb-6 line-clamp-3 italic flex-grow">
              "{item.tagline}"
            </p>
            
            <div className="flex items-center justify-between mt-auto pt-4 border-t border-border">
              <div className="flex gap-2">
                {item.palette.slice(0, 5).map((color, idx) => (
                  <div
                    key={idx}
                    className="w-6 h-6 rounded-full border border-black/10 shadow-sm"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              <div className="text-xs font-mono text-muted-foreground">
                {new Date(item.timestamp).toLocaleDateString('id-ID')}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
