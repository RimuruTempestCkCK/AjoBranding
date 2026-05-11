import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

export function Hero() {
  return (
    <section className="relative w-full py-20 flex flex-col items-center justify-center px-4 md:px-8 overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-[1440px] mx-auto flex flex-col-reverse lg:flex-row items-center justify-between gap-12 lg:gap-8">
        
        {/* Text Section */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex-1 flex flex-col items-center lg:items-start text-center lg:text-left max-w-2xl"
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

          <p className="text-lg md:text-xl text-muted-foreground mb-8 font-medium leading-relaxed opacity-90">
            Nggak usah pusing mikirin ide jualan. Cukup masukin foto produk atau fotomu sendiri, biar Ajo yang racik ide konten, nama merek, sampai strategi jualan yang gampang banget buat ditiru!
          </p>
        </motion.div>

        {/* Image Section */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
          className="flex-1 w-full max-w-md lg:max-w-none flex justify-center lg:justify-end"
        >
          <div className="relative w-64 h-64 md:w-80 md:h-80 lg:w-[450px] lg:h-[450px]">
            {/* Decorative blob behind image */}
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/30 to-transparent rounded-full blur-2xl animate-pulse" />
            
            {/* Floating Card Element */}
            <div className="absolute -bottom-6 -left-6 bg-white/10 backdrop-blur-xl border border-white/20 p-4 rounded-2xl shadow-xl z-20 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                <span className="text-xl">📈</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-foreground">Omzet Naik!</span>
                <span className="text-xs text-muted-foreground">Strategi Jitu Ajo</span>
              </div>
            </div>

            <img 
              src="/ajo-hero.jpeg" 
              alt="AjoBranding Mentor" 
              className="relative z-10 w-full h-full object-cover rounded-[2rem] shadow-2xl border border-white/10 rotate-2 hover:rotate-0 transition-all duration-500 hover:scale-105"
            />
          </div>
        </motion.div>

      </div>
    </section>
  );
}
