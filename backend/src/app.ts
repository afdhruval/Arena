import "dotenv/config";
import express from "express";
import cors from "cors";
import runBattle from "./services/grap.ai.service.js";

const app = express();

app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

// Battle endpoint
app.post("/api/battle", async (req, res) => {
  try {
    const { prompt } = req.body as { prompt?: string };

    if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
      res.status(400).json({ error: "prompt is required" });
      return;
    }

    console.log(`\n⚔️  Battle starting for: "${prompt.slice(0, 80)}..."`);

    const result = await runBattle(prompt.trim());

    console.log("✅ Battle complete.");

    res.json({
      solution_1: result.solution_1,
      solution_2: result.solution_2,
      judge: result.judge,
    });
  } catch (err) {
    console.error("Battle error:", err);
    res.status(500).json({
      error: "Battle failed",
      details: err instanceof Error ? err.message : String(err),
    });
  }
});

export default app;
