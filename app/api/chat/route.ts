import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
  try {
    const { message, brandContext, history } = await req.json();

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: "API Key tidak dikonfigurasi." }, { status: 500 });
    }

    // Gunakan model yang sama dengan yang ada di lib/gemini.ts
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
      Anda adalah "Ajo", mentor branding UMKM Indonesia yang ramah. 
      Gunakan bahasa santai, akrab (seperti "Ajo bantuin", "kece", "cuan"), dan solutif.
      
      KONTEKS BRAND SAAT INI:
      Merek: ${brandContext.identity}
      Tagline: ${brandContext.tagline}
      Vibe: ${brandContext.vibe}
      Warna: ${brandContext.palette?.join(", ")}
      
      RIWAYAT CHAT TERAKHIR:
      ${JSON.stringify(history)}
      
      PERTANYAAN USER:
      ${message}
      
      TUGAS:
      Berikan jawaban singkat, padat, dan sangat membantu. Jangan gunakan format markdown yang rumit, cukup teks biasa yang enak dibaca di chat. Jawab dalam Bahasa Indonesia.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    if (!text) throw new Error("AI tidak mengembalikan teks.");

    return NextResponse.json({ text });
  } catch (error: any) {
    console.error("Chat API Error:", error);
    return NextResponse.json({ 
      error: "Gagal memproses pesan.", 
      details: error.message 
    }, { status: 500 });
  }
}
