import { BrandIdentityResult } from "@/types/brand";
import { motion } from "framer-motion";
import { Palette, Quote, Zap, Share2, Film, RefreshCcw, Download } from "lucide-react";
import { useRef, useCallback } from "react";
import * as htmlToImage from "html-to-image";

interface ResultCardProps {
  result: BrandIdentityResult;
  imageUrl?: string | null;
  onReset: () => void;
}

export function ResultCard({ result, imageUrl, onReset }: ResultCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleDownload = useCallback(() => {
    if (cardRef.current === null) {
      return;
    }

    // Create a wrapper to ensure dark mode background is captured
    const element = cardRef.current;

    htmlToImage.toPng(element, {
      pixelRatio: 2, // High quality
      backgroundColor: '#F8F9FA',
      style: {
        padding: '2rem',
        borderRadius: '2rem'
      }
    })
      .then(async (dataUrl) => {
        const filename = `${result.identity.replace(/\s+/g, '-').toLowerCase()}-merek.png`;
        
        try {
          // 📱 iOS & Mobile Fallback: Native Web Share API
          if (navigator.share) {
            const blob = await (await fetch(dataUrl)).blob();
            const file = new File([blob], filename, { type: 'image/png' });
            
            if (navigator.canShare && navigator.canShare({ files: [file] })) {
              await navigator.share({
                files: [file],
                title: 'Hasil AjoBranding',
              });
              return; // Stop here if share sheet opened successfully
            }
          }
        } catch (e) {
          console.log("Share API batal/gagal, lanjut ke fallback unduh", e);
        }

        // 💻 Desktop Fallback
        const link = document.createElement('a');
        link.download = filename;
        link.href = dataUrl;
        link.click();
      })
      .catch((err) => {
        console.error('Oops, ada yang salah!', err);
        alert('Maaf, fitur unduh gagal di perangkat ini. Anda bisa langsung melakukan Screenshot layar Anda.');
      });
  }, [cardRef, result.identity]);
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="w-full flex flex-col gap-8">
      {/* Top Header - Image Thumbnail & Actions */}
      <div className="flex flex-col md:flex-row items-center justify-between w-full gap-6 bg-primary/5 p-4 rounded-3xl border border-primary/10">
        <div className="flex items-center gap-4 w-full md:w-auto">
          {imageUrl ? (
            <img src={imageUrl} alt="Source" className="w-16 h-16 md:w-20 md:h-20 object-cover rounded-2xl shadow-md border border-white/20" />
          ) : (
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center shadow-md">
              <span className="text-2xl font-bold text-primary opacity-50">
                {result.identity.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <div>
            <h3 className="font-bold text-foreground">Foto Sumber</h3>
            <p className="text-xs text-muted-foreground">Basis analisis AI</p>
          </div>
        </div>

        <div className="flex justify-end w-full md:w-auto gap-3">
          <button
            onClick={handleDownload}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-bold shadow-lg"
          >
            <Download className="w-4 h-4" />
            Unduh PNG
          </button>
          <button
            onClick={onReset}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-full glass hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-sm font-medium text-foreground"
          >
            <RefreshCcw className="w-4 h-4" />
            Ulangi
          </button>
        </div>
      </div>

      {/* FULL WIDTH DASHBOARD (DOWNLOADED) */}
      <motion.div
        ref={cardRef}
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="w-full flex flex-col gap-6 p-6 rounded-[2rem] bg-background border border-primary/5 shadow-2xl"
      >
        {/* Main Identity Header */}
        <motion.div variants={itemVariants} className="glass-panel rounded-3xl p-8 md:p-10 bg-gradient-to-br from-primary/10 via-background to-transparent border-primary/20 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
          <h2 className="text-5xl md:text-6xl font-black text-foreground mb-4 leading-tight tracking-tight relative z-10">
            {result.identity.split(" ")[0]} <span className="text-gradient-gold">{result.identity.split(" ").slice(1).join(" ")}</span>
          </h2>
          <div className="inline-flex items-center px-4 py-2 bg-background/80 backdrop-blur-sm text-primary rounded-full font-bold tracking-widest uppercase text-xs border border-primary/20 shadow-sm relative z-10">
            Nuansa Utama: {result.vibe}
          </div>
        </motion.div>

        {/* 2-Column Grid for Top Cards to prevent narrow elongated look */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Brand Name Eval */}
          {result.brandName && (
            <motion.div variants={itemVariants} className="glass-panel rounded-3xl p-6 bg-gradient-to-br from-blue-500/5 to-transparent flex flex-col h-full border border-blue-500/10">
              <div className="flex items-center gap-2 mb-4">
                <Zap className="w-4 h-4 text-blue-500" />
                <h3 className="font-bold text-foreground text-sm uppercase tracking-wider">Nama Merek</h3>
              </div>
              <div className="mb-4">
                <span className="text-3xl font-black text-blue-600">{result.brandName.potentialScore}</span>
                <span className="text-sm text-muted-foreground font-bold">/100 Skor</span>
              </div>
              <p className="text-sm text-foreground leading-relaxed text-justify mb-4 flex-grow opacity-90">
                {result.brandName.evaluation.replace(/\*\*/g, '').replace(/\*/g, '')}
              </p>
              {result.brandName.suggestions && result.brandName.suggestions.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-auto pt-4 border-t border-blue-500/10">
                  {result.brandName.suggestions.map((s, i) => (
                    <span key={i} className="px-2 py-1 bg-white/50 dark:bg-black/20 rounded-md text-xs font-bold text-blue-700">
                      Saran {i + 1}: {s.replace(/\*\*/g, '').replace(/\*/g, '').replace(/^Saran \d+:/i, '').trim()}
                    </span>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* Tagline */}
          <motion.div variants={itemVariants} className="glass-panel rounded-3xl p-6 flex flex-col justify-center items-center relative overflow-hidden group border border-primary/10 min-h-[250px]">
            <Quote className="w-12 h-12 text-primary/10 absolute top-4 left-4" />
            <p className="text-2xl md:text-3xl font-black text-center leading-snug text-foreground z-10 px-4">
              "{result.tagline}"
            </p>
          </motion.div>

          <motion.div variants={itemVariants} className="glass-panel rounded-3xl p-6 border border-primary/10">
            <div className="flex items-center gap-2 mb-6">
              <Palette className="w-4 h-4 text-primary" />
              <h3 className="font-bold text-foreground text-sm uppercase tracking-wider">Palet Warna</h3>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-4 h-[calc(100%-3rem)]">
              {result.palette.map((color, idx) => (
                <div key={idx} className="flex flex-col items-center justify-center gap-2 bg-background/50 rounded-xl p-3 border border-primary/5 hover:scale-105 transition-transform flex-grow">
                  <div className="w-12 h-12 rounded-full shadow-inner" style={{ backgroundColor: color }} />
                  <span className="text-xs font-mono font-bold text-muted-foreground uppercase">{color}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Brand Kit */}
          {result.brandKit && (
            <motion.div variants={itemVariants} className="glass-panel rounded-3xl p-6 flex flex-col gap-4 border border-primary/10">
              <h3 className="font-bold text-foreground text-sm uppercase tracking-wider mb-2">Pilar Merek</h3>
              <div className="space-y-4">
                <div>
                  <span className="text-[10px] text-primary font-bold uppercase tracking-widest block mb-1">Target Audience</span>
                  <p className="text-xs font-medium text-foreground opacity-90">{result.brandKit.targetAudience}</p>
                </div>
                <div>
                  <span className="text-[10px] text-primary font-bold uppercase tracking-widest block mb-1">Positioning</span>
                  <p className="text-xs font-medium text-foreground opacity-90">{result.brandKit.brandPositioning}</p>
                </div>
                <div>
                  <span className="text-[10px] text-primary font-bold uppercase tracking-widest block mb-1">Emotion Trigger</span>
                  <p className="text-xs font-medium text-foreground opacity-90">{result.brandKit.emotionTrigger}</p>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* 2-Column Grid for Content & Story */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div variants={itemVariants} className="glass-panel rounded-3xl p-8 bg-accent/5 border border-accent/10">
            <div className="flex items-center gap-2 mb-4">
              <Share2 className="w-5 h-5 text-accent" />
              <h3 className="font-bold text-foreground">Strategi Caption Viral</h3>
            </div>
            <p className="text-sm leading-relaxed text-justify opacity-90">{result.caption}</p>
          </motion.div>

          <motion.div variants={itemVariants} className="glass-panel rounded-3xl p-8 bg-secondary/5 border border-secondary/10">
            <div className="flex items-center gap-2 mb-4">
              <Film className="w-5 h-5 text-secondary" />
              <h3 className="font-bold text-foreground">Konsep Visual & Sinematik</h3>
            </div>
            {typeof result.story === 'string' ? (
              <p className="text-sm leading-relaxed text-justify opacity-90">{result.story}</p>
            ) : (
              <div className="space-y-3 text-sm text-justify opacity-90">
                <p><strong className="text-secondary">Judul:</strong> {result.story?.title}</p>
                <p><strong className="text-secondary">Logline:</strong> {result.story?.logline}</p>
                <p><strong className="text-secondary">Konsep:</strong> {result.story?.concept}</p>
              </div>
            )}
          </motion.div>
        </div>

        {/* Full-width complex strategy blocks inside a 2-column macro grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Strategy Block */}
          {result.strategy && typeof result.strategy === 'object' && (
            <motion.div variants={itemVariants} className="glass-panel rounded-3xl p-8 border border-primary/10">
              <h3 className="font-black text-xl mb-6 text-foreground">Blueprint Bisnis & Pemasaran</h3>
              <div className="space-y-6">
                {result.strategy.marketing && (
                  <div>
                    <h4 className="text-xs font-bold text-primary uppercase tracking-widest mb-3 border-b border-primary/10 pb-2">Taktik Pemasaran</h4>
                    <ul className="space-y-3">
                      {result.strategy.marketing.map((step, idx) => (
                        <li key={`mkt-${idx}`} className="flex flex-col gap-1.5 text-sm text-justify opacity-90 p-4 bg-primary/5 rounded-xl border border-primary/10">
                          <span className="text-primary font-bold text-xs uppercase tracking-widest flex items-center gap-1">
                            <Zap className="w-3 h-3" /> Saran {idx + 1}
                          </span>
                          <span className="leading-relaxed">
                            {step.replace(/\*\*/g, '').replace(/\*/g, '').replace(/^Saran \d+:?/i, '').trim()}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {result.strategy.content && (
                  <div>
                    <h4 className="text-xs font-bold text-primary uppercase tracking-widest mb-3 border-b border-primary/10 pb-2">Ide Konten</h4>
                    <ul className="space-y-3">
                      {result.strategy.content.map((step, idx) => (
                        <li key={`cnt-${idx}`} className="flex flex-col gap-1.5 text-sm text-justify opacity-90 p-4 bg-primary/5 rounded-xl border border-primary/10">
                          <span className="text-primary font-bold text-xs uppercase tracking-widest flex items-center gap-1">
                            <Zap className="w-3 h-3" /> Saran Konten {idx + 1}
                          </span>
                          <span className="leading-relaxed">
                            {step.replace(/\*\*/g, '').replace(/\*/g, '').replace(/^Saran Konten \d+:?/i, '').trim()}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {result.strategy.sales && (
                  <div>
                    <h4 className="text-xs font-bold text-primary uppercase tracking-widest mb-3 border-b border-primary/10 pb-2">Strategi Penjualan</h4>
                    <ul className="space-y-3">
                      {result.strategy.sales.map((step, idx) => (
                        <li key={`sls-${idx}`} className="flex flex-col gap-1.5 text-sm text-justify opacity-90 p-4 bg-primary/5 rounded-xl border border-primary/10">
                          <span className="text-primary font-bold text-xs uppercase tracking-widest flex items-center gap-1">
                            <Zap className="w-3 h-3" /> Saran Jualan {idx + 1}
                          </span>
                          <span className="leading-relaxed">
                            {step.replace(/\*\*/g, '').replace(/\*/g, '').replace(/^Saran Jualan \d+:?/i, '').trim()}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          <div className="flex flex-col gap-6">
            {/* Execution Plan */}
            {result.executionPlan && (
              <motion.div variants={itemVariants} className="glass-panel rounded-3xl p-8 border border-primary/10">
                <h3 className="font-black text-xl mb-6 text-foreground">Actionable Execution Plan</h3>
                <div className="space-y-4">
                  {result.executionPlan.day1 && (
                    <div className="bg-background/50 p-4 rounded-2xl border border-blue-500/10">
                      <h4 className="text-xs font-bold text-blue-500 uppercase tracking-widest mb-2 flex items-center gap-1">
                        <Zap className="w-3 h-3" /> Saran Hari 1
                      </h4>
                      <p className="text-sm text-justify opacity-90">
                        {result.executionPlan.day1.replace(/\*\*/g, '').replace(/\*/g, '').replace(/^(🎯 )?Saran Hari 1:?/i, '').trim()}
                      </p>
                    </div>
                  )}
                  {result.executionPlan.week1 && (
                    <div className="bg-background/50 p-4 rounded-2xl border border-blue-500/10">
                      <h4 className="text-xs font-bold text-blue-500 uppercase tracking-widest mb-2 flex items-center gap-1">
                        <Zap className="w-3 h-3" /> Saran Minggu 1
                      </h4>
                      <p className="text-sm text-justify opacity-90">
                        {result.executionPlan.week1.replace(/\*\*/g, '').replace(/\*/g, '').replace(/^(🎯 )?Saran Minggu 1:?/i, '').trim()}
                      </p>
                    </div>
                  )}
                  {result.executionPlan.growthPlan && (
                    <div className="bg-background/50 p-4 rounded-2xl border border-blue-500/10">
                      <h4 className="text-xs font-bold text-blue-500 uppercase tracking-widest mb-2 flex items-center gap-1">
                        <Zap className="w-3 h-3" /> Saran 30 Hari
                      </h4>
                      <p className="text-sm text-justify opacity-90">
                        {result.executionPlan.growthPlan.replace(/\*\*/g, '').replace(/\*/g, '').replace(/^(🎯 )?Saran 30 Hari:?/i, '').trim()}
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Monetization */}
            {result.monetization && (
              <motion.div variants={itemVariants} className="glass-panel rounded-3xl p-8 border border-emerald-500/20 bg-emerald-500/5">
                <h3 className="font-black text-xl mb-6 text-emerald-700 dark:text-emerald-400">Strategi Monetisasi</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {result.monetization.quickWin && (
                    <div className="bg-background/50 p-4 rounded-2xl border border-emerald-500/10">
                      <h4 className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-2 flex items-center gap-1">
                        <Zap className="w-3 h-3" /> Tips Cepat Cuan
                      </h4>
                      <p className="text-sm text-justify opacity-90">
                        {result.monetization.quickWin.replace(/\*\*/g, '').replace(/\*/g, '').replace(/^(💡 )?Tips Cepat Cuan:?/i, '').trim()}
                      </p>
                    </div>
                  )}
                  {result.monetization.pricingStrategy && (
                    <div className="bg-background/50 p-4 rounded-2xl border border-emerald-500/10">
                      <h4 className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-2 flex items-center gap-1">
                        <Zap className="w-3 h-3" /> Tips Harga
                      </h4>
                      <p className="text-sm text-justify opacity-90">
                        {result.monetization.pricingStrategy.replace(/\*\*/g, '').replace(/\*/g, '').replace(/^(💡 )?Tips Harga:?/i, '').trim()}
                      </p>
                    </div>
                  )}
                  {result.monetization.upsellStrategy && (
                    <div className="md:col-span-2 mt-2 bg-background/50 p-4 rounded-2xl border border-emerald-500/10">
                      <h4 className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-2 flex items-center gap-1">
                        <Zap className="w-3 h-3" /> Tips Nambah Omset
                      </h4>
                      <p className="text-sm text-justify opacity-90">
                        {result.monetization.upsellStrategy.replace(/\*\*/g, '').replace(/\*/g, '').replace(/^(💡 )?Tips Nambah Omset:?/i, '').trim()}
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* 7 Day Content Grid */}
        {result.contentPlan && result.contentPlan["7DaysContent"] && (
          <motion.div variants={itemVariants} className="glass-panel rounded-3xl p-8 border border-purple-500/20 bg-purple-500/5">
            <h3 className="font-black text-xl mb-6 text-purple-700 dark:text-purple-400">Kalender Konten 7 Hari</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {result.contentPlan["7DaysContent"].map((content, idx) => (
                <div key={idx} className="bg-background/80 p-5 rounded-2xl shadow-sm border border-purple-500/10 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 flex items-center justify-center font-black text-xs">
                      D{idx + 1}
                    </div>
                    <span className="text-xs font-bold text-purple-600 uppercase tracking-wider">Ide Hari {idx + 1}</span>
                  </div>
                  <p className="text-xs leading-relaxed text-justify opacity-90">
                    {content.replace(/\*\*/g, '').replace(/\*/g, '').replace(/^Hari \d+:?/i, '').trim()}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

      </motion.div>
    </div>
  );
}
