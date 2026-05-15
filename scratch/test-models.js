const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require("fs");

async function listModels() {
  let apiKey = "";
  try {
    const env = fs.readFileSync(".env.local", "utf8");
    const match = env.match(/GEMINI_API_KEY=(.*)/);
    if (match) apiKey = match[1].trim();
  } catch (e) {
    console.error("Could not read .env.local");
    return;
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const models = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-1.0-pro", "gemini-pro"];
  
  for (const m of models) {
    try {
      const model = genAI.getGenerativeModel({ model: m });
      console.log(`Checking ${m}...`);
      await model.generateContent("hi");
      console.log(`✅ ${m} is available`);
    } catch (e) {
      console.log(`❌ ${m} is NOT available: ${e.message}`);
    }
  }
}

listModels();
