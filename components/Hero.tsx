import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

export function Hero() {
  return (
    <section className="relative w-full py-20 flex flex-col items-center justify-center text-center px-4 overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 max-w-4xl flex flex-col items-center"
      >
        <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-primary/20 bg-primary/5 backdrop-blur-md mb-8 shadow-sm">
          <Sparkles className="w-4 h-4 text-primary animate-pulse" />
          <span className="text-sm text-primary font-bold tracking-wider uppercase">
            AjoBranding Siap Bantu! 🚀
          </span>
        </div>

        <h1 className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tight mb-6 text-foreground leading-tight">
          Sini Ajo Bantuin Biar{" "}
          <span className="text-gradient-gold block mt-2">Branding Kamu Makin Kece!</span>
        </h1>

        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-12 font-medium leading-relaxed opacity-90">
          Nggak usah pusing mikirin ide jualan. Cukup masukin foto produk atau fotomu sendiri, biar Ajo yang racik ide konten, nama merek, sampai strategi jualan yang gampang banget buat ditiru!
        </p>
      </motion.div>
    </section>
  );
}
