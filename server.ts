import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { GoogleGenAI, HarmBlockThreshold, HarmCategory, ThinkingLevel } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const SYSTEM_PROMPT = `CERO, EL AGUJERO NEGRO MATEMÁTICO
1. PERSONALIDAD: Eres "Cero", un pequeño y simpático agujero negro en la Galaxia Aritmética. Curioso, amable y despistado. Usas metáforas espaciales ("¡Por los anillos de Saturno!"). Tienes "hipo cósmico" con errores matemáticos.
2. ROL: Pides "comida" (cifras/resoluciones). Eres un compañero socrático, no juzgas, ayudas a "cocinar" el cálculo.
3. OBJETIVO: Ayudar a niños de 6-12 años a resolver problemas por sí mismos para que puedas engullir el resultado y crecer.
4. FORMATO: Saluda con un dato curioso del espacio. Usa analogías (planetas=unidades). Acierto: "¡Delicioso! Mi masa aumenta". Error: "¡Hip! Siento una turbulencia... ¿Revisamos?". Máximo 3-4 frases.
5. EXCEPCIONES: NUNCA des el resultado final a la primera. Si preguntan otra cosa, redirige a la misión numérica suavemente. Adapta el nivel a la edad.`;

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Add middleware to parse JSON bodies
  app.use(express.json());

  // API routes FIRST
  app.post("/api/chat", async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
         res.status(500).json({ error: "API Key Inválida o no configurada. Por favor, configura tu GEMINI_API_KEY en el panel lateral de AI Studio." });
         return;
      }
      
      const ai = new GoogleGenAI({ apiKey });
      const { history, message } = req.body;

      const formattedHistory = (history || []).map((msg: any) => ({
        role: msg.role === 'model' ? 'model' : 'user',
        parts: msg.parts // assuming it's already { text: "..." } from the client
      }));

      const aiChat = ai.chats.create({
        model: "gemini-3.1-flash-lite-preview", 
        config: {
          systemInstruction: SYSTEM_PROMPT,
          temperature: 1.65,
          thinkingConfig: {
            thinkingLevel: ThinkingLevel.MINIMAL,
          },
          safetySettings: [
            {
              category: HarmCategory.HARM_CATEGORY_HARASSMENT,
              threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
            },
            {
              category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
              threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
            },
            {
              category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
              threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
            },
            {
              category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
              threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
            },
          ],
          tools: [{ googleSearch: {} }],
        },
        history: formattedHistory
      });

      const result = await aiChat.sendMessage({ message });
      const responseText = result.text; 

      res.status(200).json({ reply: responseText });
    } catch (error: any) {
      console.error("Error en la galaxia:", JSON.stringify(error, null, 2));
      res.status(500).json({ error: 'Error de conexión estelar' });
    }
  });

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    // For Express 4
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
