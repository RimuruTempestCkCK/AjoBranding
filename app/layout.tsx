import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AjoBranding | Studio Branding AI",
  description: "Ubah foto biasa menjadi identitas merek premium dengan kampanye pemasaran sinematik menggunakan AI.",
  keywords: ["Branding AI", "Identitas Merek", "Pemasaran AI", "AjoBranding", "Pembuat Logo"],
  openGraph: {
    title: "AjoBranding | Studio Branding AI",
    description: "Ubah foto biasa menjadi identitas merek premium.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AjoBranding",
    description: "Studio Branding AI",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const currentYear = new Date().getFullYear();

  return (
    <html
      lang="id"
      className={`${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <main className="flex-grow">
          {children}
        </main>
        
        <footer className="w-full py-8 mt-16 border-t border-primary/10 bg-background relative overflow-hidden">
          <div className="w-full max-w-[1440px] mx-auto px-4 md:px-8 flex flex-col items-center justify-center gap-4 relative z-10">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground">
                © {currentYear} Dibuat dengan 
              </span>
              <span className="text-red-500 animate-pulse">❤️</span>
              <span className="text-sm font-medium text-muted-foreground">
                oleh <strong className="text-foreground">Firdinal Juliandre</strong>
              </span>
            </div>
            
            <a 
              href="https://instagram.com/ajogalehlauak" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 rounded-full glass hover:bg-primary/5 transition-colors border border-primary/10 group"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-4 h-4 text-pink-500 group-hover:scale-110 transition-transform"
              >
                <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
              </svg>
              <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                Support saya di Instagram <strong className="text-primary">@ajogalehlauak</strong>
              </span>
            </a>
          </div>
        </footer>
      </body>
    </html>
  );
}
