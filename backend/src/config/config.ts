export const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";
export const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || "";
export const GOOGLE_CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL || "";

export const SUPABASE_URL = process.env.SUPABASE_URL || "";
export const SUPABASE_SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY || "";

export const RECAPTCHA_SECRET_KEY = process.env.RECAPTCHA_SECRET_KEY || "";

export const SECRET_KEY = process.env.JWT_SECRET || "clavePorDefecto";

export const API_PREFIX = "/api";

export const ollamaConfig = {
  host: process.env.OLLAMA_HOST || "http://localhost:11434",
  model: process.env.OLLAMA_MODEL || "llama3.2:1b",
};
