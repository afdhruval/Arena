import dotenv from "dotenv";

dotenv.config();

/*
    GEMINI_API_KEY
    MISTRAL_API_KEY
    COHOR_API_KEY
*/

// type CONFIG = {
//   readonly GEMINI_API_KEY: string;
//   readonly MISTRAL_API_KEY: string;
//   readonly COHOR_API_KEY: string;
// };

const configg = {
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || " ",
  MISTRAL_API_KEY: process.env.MISTRAL_API_KEY || " ",
  COHOR_API_KEY: process.env.COHOR_API_KEY || " ",
};

export default configg;
