import { BrandIdentityResult } from "@/types/brand";
import { motion } from "framer-motion";
import { Palette, Quote, Zap, Share2, Film, RefreshCcw, Download, Users, Target, Heart, Sparkles, FileText, Presentation } from "lucide-react";
import { useRef, useCallback } from "react";
import * as htmlToImage from "html-to-image";
import jsPDF from "jspdf";
import pptxgen from "pptxgenjs";

interface ResultCardProps {
  result: BrandIdentityResult;
  imageUrl?: string | null;
  onReset: () => void;
}

export function ResultCard({ result, imageUrl, onReset }: ResultCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleDownload = useCallback(() => {
    if (cardRef.current === null) return;

    const originalElement = cardRef.current;

    // 🚀 TRIK PAMUNGKAS: Buat kloningan elemen secara rahasia di layar (hidden)
    // Gunakan 1024px (Standar Desktop/Tablet) agar teks tidak kekecilan 
    // dan mencegah iOS Safari melakukan kompresi paksa (blur) karena batas memori kanvas.
    const printContainer = document.createElement('div');
    printContainer.style.position = 'absolute';
    printContainer.style.left = '-9999px';
    printContainer.style.top = '-9999px';
    printContainer.style.width = '1024px';

    const clone = originalElement.cloneNode(true) as HTMLElement;

    // Modifikasi class pada kloningan untuk memaksa susunan Desktop
    const elements = clone.querySelectorAll('*');
    elements.forEach((el) => {
      const htmlEl = el as HTMLElement;

      // Paksa Flex Row
      if (htmlEl.classList.contains('md:flex-row')) {
        htmlEl.classList.remove('flex-col');
        htmlEl.style.display = 'flex';
        htmlEl.style.flexDirection = 'row';
      }

      // Paksa Width Auto
      if (htmlEl.classList.contains('md:w-auto')) {
        htmlEl.classList.remove('w-full');
        htmlEl.style.width = 'auto';
      }

      // Paksa Grid Desktop
      if (htmlEl.classList.contains('lg:grid-cols-4')) {
        htmlEl.classList.remove('grid-cols-1', 'sm:grid-cols-2');
        htmlEl.style.display = 'grid';
        htmlEl.style.gridTemplateColumns = 'repeat(4, minmax(0, 1fr))';
      } else if (htmlEl.classList.contains('lg:grid-cols-2') || htmlEl.classList.contains('xl:grid-cols-2') || htmlEl.classList.contains('md:grid-cols-2')) {
        htmlEl.classList.remove('grid-cols-1', 'sm:grid-cols-2');
        htmlEl.style.display = 'grid';
        htmlEl.style.gridTemplateColumns = 'repeat(2, minmax(0, 1fr))';
      }

      // Paksa Text Size
      if (htmlEl.classList.contains('lg:text-7xl')) {
        htmlEl.style.fontSize = '4.5rem';
        htmlEl.style.lineHeight = '1';
      }
    });

    clone.style.padding = '3rem';
    clone.style.backgroundColor = '#F8F9FA'; // Pastikan background putih/terang
    clone.style.borderRadius = '2rem';
    clone.style.margin = '0';
    clone.style.boxShadow = 'none';

    printContainer.appendChild(clone);
    document.body.appendChild(printContainer);

    // Sekarang elemen sudah di dalam DOM dan bisa diukur tingginya secara presisi!
    const targetWidth = 1024;
    const targetHeight = clone.offsetHeight;

    htmlToImage.toPng(clone, {
      pixelRatio: 1.5, // 1.5 adalah angka paling aman untuk iOS agar tidak diburamkan otomatis
      backgroundColor: '#F8F9FA',
      width: targetWidth,
      height: targetHeight,
      style: {
        margin: '0',
      }
    })
      .then(async (dataUrl) => {
        // Bersihkan elemen rahasia
        document.body.removeChild(printContainer);

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
        if (document.body.contains(printContainer)) {
          document.body.removeChild(printContainer);
        }
        console.error('Oops, ada yang salah!', err);
        alert('Maaf, fitur unduh gagal di perangkat ini. Anda bisa langsung melakukan Screenshot layar Anda.');
      });
  }, [cardRef, result.identity]);

  const handleExportPDF = useCallback(async () => {
    if (cardRef.current === null) return;

    const element = cardRef.current;
    try {
      const dataUrl = await htmlToImage.toPng(element, {
        pixelRatio: 2,
        backgroundColor: "#F8F9FA",
      });

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "px",
        format: [element.offsetWidth * 2, element.offsetHeight * 2]
      });

      pdf.addImage(dataUrl, "PNG", 0, 0, element.offsetWidth * 2, element.offsetHeight * 2);
      pdf.save(`${result.identity.replace(/\s+/g, "-").toLowerCase()}-brand-strategy.pdf`);
    } catch (err) {
      console.error("PDF Export failed:", err);
      alert("Gagal mengekspor PDF. Silakan coba gunakan fitur Screenshot.");
    }
  }, [result.identity]);

  const handleExportPPTX = useCallback(() => {
    const pptx = new pptxgen();
    pptx.layout = "LAYOUT_WIDE";
    pptx.defineSlideMaster({
      title: "MASTER_SLIDE",
      background: { color: "F8F9FA" },
      margin: [0.5, 0.5, 0.5, 0.5],
      footer: { x: 0.5, y: 7.0, w: "90%", h: 0.5, text: "AjoBranding AI - Strategi Merek Premium", fontSize: 10, color: "9CA3AF" }
    });

    // 1. Title Slide
    let slide = pptx.addSlide({ masterName: "MASTER_SLIDE" });
    slide.addShape(pptx.ShapeType.rect, { x: 0, y: 2.5, w: "100%", h: 2, fill: { color: "3B82F6" } });
    slide.addText("AjoBranding Strategy", { x: 0, y: 2.8, w: "100%", fontSize: 48, bold: true, color: "FFFFFF", align: "center" });
    slide.addText(result.identity, { x: 0, y: 3.8, w: "100%", fontSize: 32, bold: true, color: "FFFFFF", align: "center" });
    slide.addText(`"${result.tagline}"`, { x: 0.5, y: 5.5, w: "90%", fontSize: 24, italic: true, color: "6B7280", align: "center" });

    // 2. Brand Identity & Evaluation
    slide = pptx.addSlide({ masterName: "MASTER_SLIDE" });
    slide.addText("Identitas & Evaluasi Merek", { x: 0.5, y: 0.5, fontSize: 28, bold: true, color: "3B82F6" });
    slide.addShape(pptx.ShapeType.line, { x: 0.5, y: 0.9, w: 12, h: 0, line: { color: "3B82F6", width: 2 } });

    slide.addText("Nuansa Merek:", { x: 0.5, y: 1.5, fontSize: 18, bold: true, color: "1F2937" });
    slide.addText(result.vibe, { x: 0.5, y: 1.9, fontSize: 16, color: "4B5563" });

    if (result.brandName) {
      slide.addText("Skor Potensi Nama:", { x: 7, y: 1.5, fontSize: 18, bold: true, color: "1F2937" });
      slide.addText(`${result.brandName.potentialScore}/100`, { x: 7, y: 1.9, fontSize: 24, bold: true, color: "3B82F6" });

      slide.addText("Evaluasi Ajo:", { x: 0.5, y: 3.0, fontSize: 14, bold: true, color: "3B82F6" });
      slide.addText(result.brandName.evaluation, { x: 0.5, y: 3.3, w: 12, fontSize: 11, color: "4B5563" });
    }

    // 3. Brand Kit (Audience & Positioning)
    if (result.brandKit) {
      slide = pptx.addSlide({ masterName: "MASTER_SLIDE" });
      slide.addText("Target & Positioning", { x: 0.5, y: 0.5, fontSize: 28, bold: true, color: "3B82F6" });

      const boxes = [
        { title: "Target Audience", text: result.brandKit.targetAudience, color: "EFF6FF", textCol: "1E40AF" },
        { title: "Positioning", text: result.brandKit.brandPositioning, color: "F0FDF4", textCol: "166534" },
        { title: "Emotion Trigger", text: result.brandKit.emotionTrigger, color: "FAF5FF", textCol: "6B21A8" }
      ];

      boxes.forEach((box, i) => {
        slide.addShape(pptx.ShapeType.rect, { x: 0.5 + (i * 4.3), y: 1.5, w: 4, h: 4, fill: { color: box.color }, line: { color: box.textCol, width: 1 } });
        slide.addText(box.title, { x: 0.5 + (i * 4.3), y: 1.7, w: 4, fontSize: 18, bold: true, color: box.textCol, align: "center" });
        slide.addText(box.text, { x: 0.7 + (i * 4.3), y: 2.2, w: 3.6, fontSize: 12, color: "374151", align: "center" });
      });
    }

    // 4. Color Palette & Differentiation
    slide = pptx.addSlide({ masterName: "MASTER_SLIDE" });
    slide.addText("Warna & Diferensiasi", { x: 0.5, y: 0.5, fontSize: 28, bold: true, color: "3B82F6" });

    if (result.palette) {
      slide.addText("Palet Warna Premium:", { x: 0.5, y: 1.5, fontSize: 14, bold: true });
      result.palette.forEach((color, idx) => {
        slide.addShape(pptx.ShapeType.rect, { x: 0.5 + (idx * 1.5), y: 2.0, w: 1.3, h: 1.3, fill: { color: color.replace("#", "") }, line: { color: "FFFFFF", width: 2 } });
        slide.addText(color, { x: 0.5 + (idx * 1.5), y: 3.4, w: 1.3, fontSize: 10, align: "center", fontFace: "Courier New" });
      });
    }

    if (result.differentiation) {
      slide.addShape(pptx.ShapeType.rect, { x: 0.5, y: 4.5, w: 12, h: 2, fill: { color: "FFFBEB" }, line: { color: "F59E0B", width: 1 } });
      slide.addText("KEUNGGULAN UNIK (DIFFERENTIATION)", { x: 0.7, y: 4.7, fontSize: 12, bold: true, color: "B45309" });
      slide.addText(result.differentiation, { x: 0.7, y: 5.1, w: 11.6, fontSize: 14, color: "92400E", italic: true });
    }

    // 5. Content & Visual Strategy
    slide = pptx.addSlide({ masterName: "MASTER_SLIDE" });
    slide.addText("Strategi Konten & Visual", { x: 0.5, y: 0.5, fontSize: 28, bold: true, color: "3B82F6" });

    slide.addText("Caption Viral:", { x: 0.5, y: 1.5, fontSize: 14, bold: true, color: "3B82F6" });
    slide.addText(result.caption, { x: 0.5, y: 1.8, w: 6, h: 4, fontSize: 11, color: "4B5563", valign: "top", border: { type: "dash", color: "CBD5E1" } });

    slide.addText("Konsep Visual & Sinematik:", { x: 7, y: 1.5, fontSize: 14, bold: true, color: "3B82F6" });
    const storyText = typeof result.story === "string" ? result.story : `Judul: ${result.story?.title}\n\nLogline: ${result.story?.logline}\n\nKonsep: ${result.story?.concept}`;
    slide.addText(storyText, { x: 7, y: 1.8, w: 5.5, h: 4, fontSize: 11, color: "4B5563", valign: "top" });

    // 6. Content Calendar
    if (result.contentPlan && result.contentPlan["7DaysContent"]) {
      slide = pptx.addSlide({ masterName: "MASTER_SLIDE" });
      slide.addText("Kalender Konten 7 Hari", { x: 0.5, y: 0.5, fontSize: 28, bold: true, color: "3B82F6" });

      result.contentPlan["7DaysContent"].forEach((plan, i) => {
        const xPos = 0.5 + (i % 4) * 3.1;
        const yPos = i < 4 ? 1.5 : 4.2;
        slide.addShape(pptx.ShapeType.rect, { x: xPos, y: yPos, w: 2.8, h: 2.5, fill: { color: "F5F3FF" } });
        slide.addText(`HARI ${i + 1}`, { x: xPos, y: yPos + 0.2, w: 2.8, fontSize: 14, bold: true, color: "7C3AED", align: "center" });
        slide.addText(plan, { x: xPos + 0.1, y: yPos + 0.6, w: 2.6, fontSize: 10, color: "4C1D95", align: "center" });
      });
    }

    // 7. Closing Slide
    slide = pptx.addSlide({ masterName: "MASTER_SLIDE" });
    slide.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: "100%", h: "100%", fill: { color: "3B82F6" } });
    slide.addText("Siap Untuk Beraksi?", { x: 0, y: 3, w: "100%", fontSize: 44, bold: true, color: "FFFFFF", align: "center" });
    slide.addText("Ajo Percaya Brand Kamu Bakal Meledak! 🚀", { x: 0, y: 4, w: "100%", fontSize: 24, color: "FFFFFF", align: "center" });

    pptx.writeFile({ fileName: `${result.identity.replace(/\s+/g, "-").toLowerCase()}-presentation.pptx` });
  }, [result]);
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

        <div className="flex flex-wrap justify-end w-full md:w-auto gap-2">
          <button
            onClick={handleDownload}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-xs font-bold shadow-md"
            title="Unduh PNG"
          >
            <Download className="w-3.5 h-3.5" />
            PNG
          </button>
          <button
            onClick={handleExportPDF}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-rose-600 text-white hover:bg-rose-700 transition-colors text-xs font-bold shadow-md"
            title="Unduh PDF"
          >
            <FileText className="w-3.5 h-3.5" />
            PDF
          </button>
          <button
            onClick={handleExportPPTX}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-orange-500 text-white hover:bg-orange-600 transition-colors text-xs font-bold shadow-md"
            title="Unduh PPTX"
          >
            <Presentation className="w-3.5 h-3.5" />
            PPTX
          </button>
          <button
            onClick={onReset}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-full glass hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-xs font-medium text-foreground"
          >
            <RefreshCcw className="w-3.5 h-3.5" />
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
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-foreground mb-4 leading-tight tracking-tight relative z-10">
            {result.identity.split(" ")[0]} <span className="text-gradient-gold">{result.identity.split(" ").slice(1).join(" ")}</span>
          </h2>
          <div className="inline-flex items-center px-4 py-2 bg-background/80 backdrop-blur-sm text-primary rounded-full font-bold tracking-widest uppercase text-xs border border-primary/20 shadow-sm relative z-10">
            Nuansa Utama: {result.vibe}
          </div>
        </motion.div>

        {/* TAGLINE BANNER (FULL WIDTH) */}
        <motion.div variants={itemVariants} className="glass-panel rounded-3xl p-8 flex flex-col justify-center items-center relative overflow-hidden group border border-primary/20 bg-gradient-to-r from-primary/5 via-background to-primary/5 shadow-sm">
          <Quote className="w-16 h-16 text-primary/10 absolute top-4 left-4" />
          <p className="text-2xl sm:text-3xl md:text-4xl font-black text-center leading-snug text-primary/90 z-10 px-8 italic tracking-tight">
            "{result.tagline}"
          </p>
          <Quote className="w-16 h-16 text-primary/10 absolute bottom-4 right-4 rotate-180" />
        </motion.div>

        {/* 2-Column Grid for Brand Name & Brand Kit */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Brand Name Eval */}
          {result.brandName && (
            <motion.div variants={itemVariants} className="glass-panel rounded-3xl p-8 bg-gradient-to-br from-blue-500/5 to-transparent flex flex-col h-full border border-blue-500/10">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-500/10 rounded-xl">
                  <Sparkles className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="font-bold text-foreground text-sm uppercase tracking-widest">Nama Merek</h3>
              </div>
              <div className="mb-6 flex items-baseline gap-2">
                <span className="text-4xl font-black text-blue-600">{result.brandName.potentialScore}</span>
                <span className="text-sm text-muted-foreground font-bold uppercase tracking-widest">/100 Skor</span>
              </div>
              <p className="text-sm text-foreground leading-relaxed text-justify mb-6 flex-grow opacity-90">
                {result.brandName.evaluation.replace(/\*\*/g, '').replace(/\*/g, '')}
              </p>
              {result.brandName.suggestions && result.brandName.suggestions.length > 0 && (
                <div className="flex flex-col gap-2 mt-auto pt-6 border-t border-blue-500/10">
                  <span className="text-xs font-bold text-blue-500 uppercase tracking-widest mb-1">Rekomendasi Nama:</span>
                  <div className="flex flex-wrap gap-2">
                    {result.brandName.suggestions.map((s, i) => (
                      <span key={i} className="px-3 py-1.5 bg-blue-500/10 rounded-lg text-xs font-bold text-blue-700 dark:text-blue-400 border border-blue-500/20">
                        {s.replace(/\*\*/g, '').replace(/\*/g, '').replace(/^Saran \d+:/i, '').trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Brand Kit */}
          {result.brandKit && (
            <motion.div variants={itemVariants} className="glass-panel rounded-3xl p-8 flex flex-col gap-6 border border-primary/10">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-primary/10 rounded-xl">
                  <Target className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-bold text-foreground text-sm uppercase tracking-widest">Pilar Merek</h3>
              </div>
              <div className="space-y-6 flex-grow flex flex-col justify-center">
                <div className="flex gap-4 items-start">
                  <div className="mt-1 p-1.5 bg-rose-500/10 rounded-lg shrink-0">
                    <Users className="w-4 h-4 text-rose-500" />
                  </div>
                  <div>
                    <span className="text-[10px] text-rose-500 font-bold uppercase tracking-widest block mb-1">Target Audience</span>
                    <p className="text-sm font-medium text-foreground opacity-90 leading-relaxed">{result.brandKit.targetAudience}</p>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="mt-1 p-1.5 bg-emerald-500/10 rounded-lg shrink-0">
                    <Target className="w-4 h-4 text-emerald-500" />
                  </div>
                  <div>
                    <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest block mb-1">Positioning</span>
                    <p className="text-sm font-medium text-foreground opacity-90 leading-relaxed">{result.brandKit.brandPositioning}</p>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="mt-1 p-1.5 bg-purple-500/10 rounded-lg shrink-0">
                    <Heart className="w-4 h-4 text-purple-500" />
                  </div>
                  <div>
                    <span className="text-[10px] text-purple-500 font-bold uppercase tracking-widest block mb-1">Emotion Trigger</span>
                    <p className="text-sm font-medium text-foreground opacity-90 leading-relaxed">{result.brandKit.emotionTrigger}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Palette & Differentiation */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Brand Palette */}
          {result.palette && result.palette.length > 0 && (
            <motion.div variants={itemVariants} className="glass-panel rounded-3xl p-8 border border-primary/10 flex flex-col gap-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-xl">
                  <Palette className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-bold text-foreground text-sm uppercase tracking-widest">Palet Warna</h3>
              </div>
              <div className="grid grid-cols-5 gap-3">
                {result.palette.map((color, idx) => (
                  <div key={idx} className="flex flex-col gap-2">
                    <div
                      className="aspect-square rounded-2xl shadow-inner border border-black/5 dark:border-white/10"
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                    <span className="text-[10px] font-mono text-center opacity-60 truncate uppercase">{color}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Differentiation */}
          {result.differentiation && (
            <motion.div variants={itemVariants} className="glass-panel rounded-3xl p-8 border border-amber-500/20 bg-amber-500/5">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-amber-500/10 rounded-xl">
                  <Zap className="w-5 h-5 text-amber-600" />
                </div>
                <h3 className="font-bold text-foreground text-sm uppercase tracking-widest">Keunggulan Unik</h3>
              </div>
              <p className="text-sm leading-relaxed text-justify opacity-90">
                {result.differentiation.replace(/\*\*/g, '').replace(/\*/g, '')}
              </p>
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
