import { ChatGoogle } from "@langchain/google"
import { ChatMistralAI } from "@langchain/mistralai"
import { ChatCohere } from "@langchain/cohere"
import configg from "../config/config.js"

const geminiModel = new ChatGoogle({
    model: "gemini-flash-latest",
    apiKey: configg.GEMINI_API_KEY
})


const mistralModel = new ChatGoogle({
    model: "mistral-medium-latest",
    apiKey: configg.MISTRAL_API_KEY
})

const cohereModel = new ChatGoogle({
    model: "command-a-03-2025",
    apiKey: configg.COHOR_API_KEY
})