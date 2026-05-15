import { NextRequest, NextResponse } from "next/server";
import { geminiModel } from "@/lib/gemini";
import { SYSTEM_PROMPT } from "@/constants/prompts";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("image") as File;
    const brandName = formData.get("brandName") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const base64Data = buffer.toString("base64");

    const imagePart = {
      inlineData: {
        data: base64Data,
        mimeType: file.type,
      },
    };

    let promptContext = SYSTEM_PROMPT;
    if (brandName) {
      promptContext += `\n\nKonteks Tambahan: Pengguna telah memiliki nama merek yaitu "${brandName}". Silakan evaluasi nama merek ini secara kritis, berikan skor potensi, dan berikan 3 saran nama alternatif/perbaikan di dalam properti brandName pada JSON.`;
    } else {
      promptContext += `\n\nKonteks Tambahan: Pengguna belum memiliki nama merek. Berikan 3 ide saran nama merek yang SANGAT PREMIUM dan berdampak kuat di dalam properti brandName pada JSON.`;
    }

    const result = await geminiModel.generateContent([promptContext, imagePart]);
    const responseText = result.response.text();

    // Clean up potential markdown formatting like ```json ... ```
    let jsonString = responseText;
    const jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      jsonString = jsonMatch[1];
    } else {
      // try to extract just the curly braces
      const braceMatch = responseText.match(/\{[\s\S]*\}/);
      if (braceMatch) {
        jsonString = braceMatch[0];
      }
    }

    const brandData = JSON.parse(jsonString);

    return NextResponse.json(brandData);
  } catch (error: any) {
    console.error("Error generating brand identity:", error);
    return NextResponse.json({ 
      error: "Gagal menghasilkan identitas merek.", 
      details: error.message 
    }, { status: 500 });
  }
}
