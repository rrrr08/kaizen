
import { GoogleGenAI, Type } from "@google/genai";

const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";

export const getGeminiInstance = () => {
  return new GoogleGenAI({ apiKey: API_KEY });
};

export const generateDailyPuzzle = async () => {
    if (!API_KEY) {
        return {
            riddle: "I speak without a mouth and hear without ears. I have no body, but I come alive with wind. What am I?",
            answer: "Echo"
        };
    }

  const ai = getGeminiInstance();
  try {
      const response = await ai.models.generateContent({
        model: 'gemini-1.5-flash',
        contents: "Generate a short, arcade-themed riddle for a board game website. Make it challenging but fun. Provide the riddle and the answer separately.",
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              riddle: { type: Type.STRING },
              answer: { type: Type.STRING }
            },
            required: ["riddle", "answer"]
          }
        }
      });
      const text = response.text || "{}";
      return JSON.parse(text);
  } catch (error) {
      console.error("Gemini API Error:", error);
      return {
          riddle: "I have keys but no locks. I have a space but no room. You can enter, but never leave. What am I?",
          answer: "Keyboard"
      };
  }
};

export const getGameRecommendation = async (mood: string) => {
    if (!API_KEY) {
        return {
            title: "Neon Pulse",
            description: "A fast-paced rhythm game where you dodge lasers to the beat."
        };
    }

  const ai = getGeminiInstance();
  try {
      const response = await ai.models.generateContent({
        model: 'gemini-1.5-flash',
        contents: `Based on the mood "${mood}", suggest a creative board game concept that would fit our arcade aesthetic. Provide a title and a 1-sentence description.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING }
            },
            required: ["title", "description"]
          }
        }
      });
      const text = response.text || "{}";
      return JSON.parse(text);
  } catch (error) {
      console.error("Gemini API Error:", error);
      return {
          title: "Glitch Hunter",
          description: "Hunt down rogue bugs in the system before they crash the mainframe."
      };
  }
};
