import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

export function Hero() {
  return (
    <section className="relative w-full pt-20 pb-4 flex flex-col items-center justify-center px-4 md:px-8 overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-5xl mx-auto flex flex-col items-center">

        {/* Centered Top Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-primary/20 bg-primary/5 backdrop-blur-md mb-16 shadow-sm"
        >
          <Sparkles className="w-4 h-4 text-primary animate-pulse" />
          <span className="text-sm text-primary font-bold tracking-wider uppercase">
            AjoBranding Siap Bantu! 🚀
          </span>
        </motion.div>

        {/* Middle row: Text on Left, Image on Right */}
        <div className="w-full flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12">

          {/* Left Column: Text */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
            className="flex-1 flex flex-col items-center lg:items-start text-center lg:text-left"
          >
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-foreground leading-tight mb-6">
              Sini Ajo Bantuin Biar{" "}
              <span className="text-gradient-gold block mt-2">Branding Kamu Makin Kece!</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground font-medium leading-relaxed opacity-90 max-w-xl">
              Nggak usah pusing mikirin ide jualan. Cukup masukin foto produk atau fotomu sendiri, biar Ajo yang racik ide konten, nama merek, sampai strategi jualan yang gampang banget buat ditiru!
            </p>
          </motion.div>

          {/* Right Column: Image */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
            className="flex-1 flex justify-center lg:justify-end"
          >
            {/* Transparent Image */}
            <img
              src="/ajo-hero.png"
              alt="AjoBranding Mentor"
              className="w-64 h-auto md:w-80 lg:w-[400px] object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-500"
            />
          </motion.div>

        </div>

      </div>
    </section>
  );
}
