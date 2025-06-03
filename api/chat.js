import fetch from "node-fetch";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).send({ error: "Solo se permiten solicitudes POST" });
  }

  const pregunta = req.body.pregunta;

  if (!pregunta) {
    return res.status(400).send({ error: "Falta pregunta" });
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).send({ error: "Falta la API Key de Gemini" });
  }

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;

    const body = {
      contents: [
        {
          role: "user",
          parts: [{ text: `Eres un asistente amigable e inteligente. Responde claramente a: ${pregunta}` }],
        },
      ],
    };

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (
      data &&
      data.candidates &&
      data.candidates[0]?.content?.parts?.length > 0
    ) {
      return res.status(200).json({ respuesta: data.candidates[0].content.parts[0].text });
    } else {
      return res.status(500).json({ error: "Respuesta inválida de Gemini" });
    }

  } catch (err) {
    console.error("Error al conectar con Gemini:", err);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
}
