import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

async function listarModelos() {
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`;
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    console.log("Modelos disponibles:", JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("Error al listar modelos:", error);
  }
}

listarModelos();
