"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Upload, Image as ImageIcon, X, Loader2, Mic, MicOff } from "lucide-react";
import clsx from "clsx";

interface UploadBoxProps {
  onImageSelect: (file: File, brandName?: string) => void;
  isLoading: boolean;
  onError?: (msg: string) => void;
}

export function UploadBox({ onImageSelect, isLoading, onError }: UploadBoxProps) {
  const [dragActive, setDragActive] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [brandName, setBrandName] = useState("");
  const [isListening, setIsListening] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const recognitionRef = useRef<any>(null);

  const startListening = () => {
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      return;
    }

    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).speechRecognition;
    if (!SpeechRecognition) {
      alert("Maaf, browser Anda tidak mendukung fitur pengenalan suara.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.lang = 'id-ID';
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => {
      setIsListening(false);
      recognitionRef.current = null;
    };
    
    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
      if (event.error === 'not-allowed') {
        alert("Akses mikrofon ditolak. Mohon izinkan mikrofon di pengaturan browser Anda.");
      } else if (event.error === 'no-speech') {
        // Abaikan atau beri tahu user secara halus
        console.warn("Ajo nggak denger apa-apa nih, coba ngomong lagi ya!");
      }
    };

    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0])
        .map((result) => result.transcript)
        .join('');
      
      setBrandName(transcript);
    };

    try {
      recognition.start();
    } catch (err) {
      console.error("Failed to start recognition:", err);
      setIsListening(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      if (onError) onError("Harap unggah gambar dengan format JPG, PNG, atau WEBP.");
      return;
    }

    const maxSize = 4 * 1024 * 1024; // 4MB
    if (file.size > maxSize) {
      if (onError) onError("Ukuran gambar terlalu besar. Maksimal 4MB.");
      return;
    }

    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    onImageSelect(file, brandName.trim() !== "" ? brandName.trim() : undefined);
  };

  const clearImage = () => {
    setPreviewUrl(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 flex flex-col gap-6">
      <div className="w-full glass-panel p-6 rounded-3xl border-primary/10">
        <label htmlFor="brandName" className="block text-sm font-semibold text-foreground mb-2">
          Nama Merek Anda (Opsional)
        </label>
        <p className="text-xs text-muted-foreground mb-4">
          Isi sebelum mengunggah gambar jika Anda sudah memiliki nama. Jika dikosongkan, AI akan menyarankan 3 nama premium untuk Anda.
        </p>
        <div className="relative">
          <input
            type="text"
            id="brandName"
            placeholder="Misal: Kopi Senja, atau biarkan kosong"
            className="w-full pl-5 pr-12 py-3 rounded-xl border border-primary/20 bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-foreground"
            value={brandName}
            onChange={(e) => setBrandName(e.target.value)}
            disabled={isLoading || previewUrl !== null}
          />
          <button
            type="button"
            onClick={startListening}
            disabled={isLoading || previewUrl !== null}
            className={clsx(
              "absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-colors",
              isListening ? "bg-red-500 text-white animate-pulse" : "text-primary hover:bg-primary/10"
            )}
            title={isListening ? "Mendengarkan..." : "Gunakan Suara"}
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className={clsx(
          "relative overflow-hidden rounded-3xl border-2 transition-all duration-300",
          dragActive ? "border-primary/40 bg-primary/5" : "border-border bg-white",
          "glass-panel hover:border-primary/30 group"
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleChange}
          disabled={isLoading}
        />

        {previewUrl ? (
          <div className="relative aspect-video w-full">
            <img
              src={previewUrl}
              alt="Preview"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-white/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              {!isLoading && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    clearImage();
                  }}
                  className="p-3 bg-white/80 hover:bg-white rounded-full shadow-lg backdrop-blur-md transition-all text-primary"
                >
                  <X className="w-6 h-6" />
                </button>
              )}
            </div>
            {isLoading && (
              <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center">
                <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
                <p className="text-primary font-medium animate-pulse tracking-wide">
                  Tunggu sebentar yaa, lagi diproses ⏳😊
                </p>
              </div>
            )}
          </div>
        ) : (
          <div
            className="p-12 md:p-20 text-center cursor-pointer flex flex-col items-center justify-center h-full min-h-[300px]"
            onClick={() => inputRef.current?.click()}
          >
            <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center mb-6 border border-primary/10 group-hover:scale-110 transition-transform duration-500">
              <Upload className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-2xl font-semibold mb-3 text-foreground">
              Unggah Gambar Anda
            </h3>
            <p className="text-muted-foreground mb-6 max-w-sm">
              Tarik dan lepas gambar produk, bisnis, atau diri Anda.
            </p>
            <button className="px-8 py-3 bg-primary text-primary-foreground rounded-full font-medium hover:scale-105 transition-transform duration-300 shadow-md hover:shadow-lg">
              Pilih File
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
