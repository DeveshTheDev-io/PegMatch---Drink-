import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

async function generateWithFallback(prompt: string) {
  try {
    return await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
    });
  } catch (error: any) {
    if (error?.status === 503 || error?.message?.includes("503") || error?.message?.includes("UNAVAILABLE")) {
      console.log("gemini-3.5-flash unavailable, falling back to gemini-2.5-flash");
      return await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });
    }
    throw error;
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API routes FIRST
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.post("/api/gemini/icebreaker", async (req, res) => {
    try {
      const { user1Name, user1Prefs, user2Name, user2Prefs } = req.body;
      
      const prompt = `You are a helpful, witty dating app assistant. Generate 3 short, engaging conversation icebreakers for ${user1Name} to send to ${user2Name}.
They have the following spirit/drink preferences in common or distinct:
${user1Name}'s preferences: ${user1Prefs.join(", ") || "None specified"}
${user2Name}'s preferences: ${user2Prefs.join(", ") || "None specified"}

Focus on their shared or complementary interests in Indian spirits, craft beers, wines, or other drinks. Keep the icebreakers casual, fun, and not overly cheesy. Just return the 3 icebreakers separated by a newline character. No numbering or other text.`;

      const response = await generateWithFallback(prompt);

      res.json({ icebreakers: response.text?.split('\n').filter(Boolean) || [] });
    } catch (error) {
      console.error("Gemini API error:", error);
      res.status(500).json({ error: "Failed to generate icebreakers" });
    }
  });

  app.post("/api/gemini/pairings", async (req, res) => {
    try {
      const { preferences } = req.body;
      
      const prompt = `You are a culinary expert and sommelier. Based on these spirit/drink preferences: ${preferences.join(", ") || "None specified"}.
Suggest 3 excellent food pairings (e.g. specific dishes, Indian or international) that perfectly match these drinks. 
Format your response as a simple list separated by newlines, with the drink name and dish in one sentence. Example: "Amrut Fusion pairs beautifully with smoky Tandoori Lamb Chops."
Just return the 3 pairings separated by a newline character. No numbering or other text.`;

      const response = await generateWithFallback(prompt);

      res.json({ pairings: response.text?.split('\n').filter(Boolean) || [] });
    } catch (error) {
      console.error("Gemini API error:", error);
      res.status(500).json({ error: "Failed to generate pairings" });
    }
  });

  app.post("/api/gemini/bartender", async (req, res) => {
    try {
      const { message } = req.body;
      
      const prompt = `You are a virtual "Bartender Bot". Read the following chat message: "${message}".
If the message mentions a specific Indian alcohol brand or spirit (e.g., Old Monk, Amrut, Paul John, Bira 91, Sula, etc.), provide a short, fun, 1-2 sentence fact about its history or origin.
If NO specific alcohol brand is mentioned, reply with exactly the word "NONE". Do not say anything else.`;

      const response = await generateWithFallback(prompt);

      const text = response.text?.trim() || "";
      if (text === "NONE" || text.includes("NONE")) {
        res.json({ fact: null });
      } else {
        res.json({ fact: text });
      }
    } catch (error) {
      console.error("Gemini API error:", error);
      res.status(500).json({ error: "Failed to query bartender" });
    }
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
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
