import "dotenv/config";
import express from "express";
import useGrph from "./services/grap.ai.service.js";

const app = express();

app.post("/use-graph", async (req, res) => {
  await useGrph("what is the capital of india?");
});

export default app;
