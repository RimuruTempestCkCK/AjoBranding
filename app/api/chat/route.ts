import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { message, brandContext, history } = await req.json();

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Pesan tidak boleh kosong." }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "API Key tidak dikonfigurasi." }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const modelName = process.env.GEMINI_MODEL || "gemini-3.5-flash";
    const model = genAI.getGenerativeModel({ model: modelName });

    const safeBrandContext = {
      identity: brandContext?.identity || "Belum ditentukan",
      tagline: brandContext?.tagline || "-",
      vibe: brandContext?.vibe || "-",
      palette: Array.isArray(brandContext?.palette) ? brandContext.palette.join(", ") : "-",
    };

    const prompt = `
      Anda adalah "Ajo", mentor branding UMKM Indonesia yang ramah. 
      Gunakan bahasa santai, akrab (seperti "Ajo bantuin", "kece", "cuan"), dan solutif.
      
      KONTEKS BRAND SAAT INI:
      Merek: ${safeBrandContext.identity}
      Tagline: ${safeBrandContext.tagline}
      Vibe: ${safeBrandContext.vibe}
      Warna: ${safeBrandContext.palette}
      
      RIWAYAT CHAT TERAKHIR:
      ${JSON.stringify(history || [])}
      
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
    return NextResponse.json(
      { 
        error: "Gagal memproses pesan.", 
        details: error.message 
      },
      { status: 500 }
    );
  }
}
