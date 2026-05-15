import { GoogleGenerativeAI } from "@google/generative-ai";

if (!process.env.GEMINI_API_KEY) {
  console.warn("GEMINI_API_KEY is not set in the environment variables.");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "dummy-key");

const modelName = "gemini-1.5-flash";
console.log("Main model initialized:", modelName);
export const geminiModel = genAI.getGenerativeModel({ model: modelName }); // using flash for speed/vision

export async function fileToGenerativePart(file: File): Promise<{
  inlineData: { data: string; mimeType: string };
}> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64data = reader.result as string;
      const base64Content = base64data.split(",")[1];
      resolve({
        inlineData: {
          data: base64Content,
          mimeType: file.type,
        },
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
