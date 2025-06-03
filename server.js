import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(cors({
  origin: ["http://127.0.0.1:3002", "http://localhost:3002"]
}));
app.use(express.json());

app.post("/api/chat", async (req, res) => {
  const pregunta = req.body.pregunta;
  if (!pregunta) return res.status(400).send({ error: "Falta pregunta" });

  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).send({ error: "Falta la API Key de Gemini en .env" });
  }

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${process.env.GEMINI_API_KEY}`;

    // PRUEBA 1: Body que tenías (puedes cambiar a PRUEBA 2 si quieres)
    const body = {
      contents: [{
        role: "user",
        parts: [{ text: `Eres un asistente amigable e inteligente. Responde claramente a: ${pregunta}` }]
      }]
    };

    // PRUEBA 2: Body alternativo más simple (descomenta para probar)
    /*
    const body = {
      prompt: `Eres un asistente amigable e inteligente. Responde claramente a: ${pregunta}`
    };
    */

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error HTTP ${response.status}:`, errorText);
      return res.status(response.status).send({ error: `Error HTTP ${response.status}: ${errorText}` });
    }

    const data = await response.json();
    console.log("Respuesta completa de Gemini:", JSON.stringify(data, null, 2));

    if (
      data &&
      data.candidates &&
      data.candidates.length > 0 &&
      data.candidates[0].content &&
      data.candidates[0].content.parts &&
      data.candidates[0].content.parts.length > 0
    ) {
      const texto = data.candidates[0].content.parts[0].text;
      return res.send({ respuesta: texto });
    } else if (data?.error) {
      return res.status(500).send({ error: data.error });
    } else {
      return res.send({ respuesta: "Lo siento, no pude generar una respuesta." });
    }

  } catch (error) {
    console.error("Error al conectar con Gemini:", error);
    return res.status(500).send({ error: "Error al conectar con Gemini" });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
});
