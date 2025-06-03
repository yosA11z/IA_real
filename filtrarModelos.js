import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

async function obtenerModelosValidos() {
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
  const data = await response.json();

  const modelosValidos = data.models
    .filter(m => m.supportedGenerationMethods?.includes("generateContent"))
    .map(m => m.name);

  console.log("✅ Modelos compatibles con generateContent:");
  modelosValidos.forEach(m => console.log(`- ${m}`));
}

obtenerModelosValidos();
