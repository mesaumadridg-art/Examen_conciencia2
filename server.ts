import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "5mb" }));

  // Initialize Gemini AI lazily/safely
  const getGeminiClient = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is missing.");
    }
    return new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  };

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", time: new Date().toISOString() });
  });

  // Spiritual Reflection / AI Advice API endpoint
  app.post("/api/spiritual-guidance", async (req, res) => {
    try {
      const { topic, sinsSummary, userQuestion } = req.body;
      
      const ai = getGeminiClient();

      const prompt = `Eres un asistente de acompañamiento y formación espiritual católica, fiel al Magisterio de la Iglesia, Santo Tomás de Aquino, el Catecismo de la Iglesia Católica y la tradición de los santos (como Santo Tomás de Aquino, San Agustín, San Ignacio de Loyola, San Francisco de Sales).
El usuario está preparando su examen de conciencia o buscando consejo para combatir sus inclinaciones de pecado y cultivar virtudes.

Contexto del usuario:
- Tema o área de lucha: ${topic || "Crecimiento espiritual y examen de conciencia"}
- Resumen de faltas/pecados frecuentes identificados: ${sinsSummary || "General"}
- Pregunta o inquietud específica del usuario: "${userQuestion || "Dame un consejo pastoral y espiritual práctico para vencer esta debilidad y cultivar la virtud contraria."}"

Por favor, proporciona una respuesta:
1. Con un tono muy respetuoso, caritativo, esperanzador y lleno de la misericordia divina.
2. Identificando la virtud contraria que debe cultivarse (por ejemplo: Humildad contra Soberbia, Paciencia contra Ira, Templanza contra Gula/Lujuria, Diligencia contra Pereza, Generosidad contra Avaricia, Caridad contra Envidia).
3. Con 3 o 4 consejos prácticos y concretos de ascética o vida diaria (oración, mortificación suave, examen particular, frecuencia de sacramentos).
4. Citando brevemente un pasaje de la Sagrada Escritura o una enseñanza/frase reconfortante de un Santo.
5. Mantén la respuesta clara, directa, profunda pero no excesivamente larga (máximo 350-400 palabras).`;

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt,
        config: {
          temperature: 0.7,
        },
      });

      res.json({ guidance: response.text });
    } catch (error: any) {
      console.error("Error generating spiritual guidance:", error);
      res.status(500).json({ 
        error: "No se pudo generar la orientación en este momento. Revisa tu clave API o intenta más tarde.",
        details: error.message 
      });
    }
  });

  // Vite middleware for development vs static production serving
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Servidor de Examen de Conciencia ejecutándose en http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Error al iniciar el servidor:", err);
});
