import "dotenv/config";
import express from "express";
import useGrph from "./services/grap.ai.service.js";

const app = express();

app.post("/", async (req, res) => {
  const result = await useGrph("write an factorial code in javascript.");

  res.json(result);

  console.log(result);
});

export default app;
