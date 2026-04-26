import { ChatGoogle } from "@langchain/google";
import { ChatMistralAI } from "@langchain/mistralai";
import { ChatCohere } from "@langchain/cohere";
import configg from "../config/config.js";

export const geminiModel = new ChatGoogle({
  model: "gemini-1.5-flash",
  apiKey: configg.GEMINI_API_KEY,
});

export const mistralModel = new ChatMistralAI({
  model: "mistral-medium-latest",
  apiKey: configg.MISTRAL_API_KEY,
});

export const cohereModel = new ChatCohere({
  model: "command-a-03-2025",
  apiKey: configg.COHERE_API_KEY,
});
