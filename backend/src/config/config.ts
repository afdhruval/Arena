import dotenv from "dotenv";
dotenv.config();

const required = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing environment variable: ${key}`);
  }
  return value;
};

const configg = {
  GEMINI_API_KEY: required("GEMINI_API_KEY"),
  MISTRAL_API_KEY: required("MISTRAL_API_KEY"),
  COHERE_API_KEY: required("COHERE_API_KEY"),
};

export default configg;
