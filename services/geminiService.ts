import { GoogleGenAI, Type } from "@google/genai";
import { QuizQuestion } from '../types';

// Access the key from the environment variable (Vite style)
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

if (!apiKey) {
    console.error("⚠️ Gemini API Key is missing! Make sure you have VITE_GEMINI_API_KEY in your .env file.");
}

// Initialize the client only if the key exists to prevent immediate crash
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

// Helper to fetch video title using noembed (CORS-friendly oEmbed proxy)
const fetchVideoTitle = async (url: string): Promise<string> => {
  try {
    const response = await fetch(`https://noembed.com/embed?url=${encodeURIComponent(url)}`);
    const data = await response.json();
    return data.title || "";
  } catch (error) {
    console.warn("Failed to fetch video title", error);
    return "";
  }
};

export const generateQuizFromTopic = async (topicInput: string, videoUrl: string): Promise<{ questions: QuizQuestion[], derivedTopic: string }> => {
  if (!ai) {
      throw new Error("Gemini API Key is missing. Please check your app configuration.");
  }

  try {
    // 1. Determine the context (User Input -> Video Title -> URL Fallback)
    let derivedTopic = topicInput.trim();
    
    if (!derivedTopic) {
       // If no topic provided, try to fetch the video title
       derivedTopic = await fetchVideoTitle(videoUrl);
    }

    // 2. Construct the prompt
    const contextDescription = derivedTopic 
        ? `The video is titled or about: "${derivedTopic}".`
        : `The video URL is: "${videoUrl}". Try to infer the educational topic from the URL or treat it as a general knowledge assessment if the video is not recognized.`;

    const prompt = `
      You are an educational expert. Create a multiple-choice quiz about the following video content.
      ${contextDescription}
      
      Generate exactly 5 questions.
      For each question, provide 4 options and the index of the correct answer (0-3).
      The difficulty should be moderate, testing understanding of the subject matter.
    `;

    // 3. Call Gemini API
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              question: { type: Type.STRING },
              options: { 
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              correctAnswerIndex: { type: Type.INTEGER }
            },
            required: ["question", "options", "correctAnswerIndex"]
          }
        }
      }
    });

    const text = response.text;
    if (!text) {
        throw new Error("No data returned from AI");
    }
    
    const quizData = JSON.parse(text) as QuizQuestion[];
    
    return {
        questions: quizData,
        derivedTopic: derivedTopic || "Video Assessment"
    };

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to generate quiz. Please check the URL or try adding a topic manually.");
  }
};