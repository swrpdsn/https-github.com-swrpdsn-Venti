// supabase/functions/shared/gemini.ts
import { GoogleGenAI } from "https://esm.sh/@google/genai@1.28.0";

// Add type definition for the Deno global to resolve TypeScript error in non-Deno environments.
declare const Deno: {
    env: {
        get: (key: string) => string | undefined;
    };
};

// Get the API key from the environment variable on Supabase
const apiKey = Deno.env.get('API_KEY');
if (!apiKey) {
    throw new Error("API_KEY is not set in the environment.");
}

// Initialize the Google AI client for use in all functions
export const ai = new GoogleGenAI({ apiKey });