import { GoogleGenAI, Type } from "@google/genai";
import { QuizQuestion } from '../types';

// Access the key from the environment variable (Vite style)
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

if (!apiKey) {
    console.error("⚠️ Gemini API Key is missing! Make sure you have VITE_GEMINI_API_KEY in your .env file.");
}

// Initialize the client only if the key exists to prevent immediate crash
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

/**
 * Helper: Fetches the transcript from your Vercel serverless function.
 * This is the "Gold Standard" for quiz generation.
 */
const fetchTranscript = async (url: string): Promise<string> => {
  try {
    // Calls the Vercel serverless function at /api/transcript
    const response = await fetch(`/api/transcript?url=${encodeURIComponent(url)}`);
    
    if (!response.ok) return ""; 

    const data = await response.json();
    return data.transcript || "";
  } catch (error) {
    console.warn("Transcript fetch failed (falling back to title):", error);
    return "";
  }
};

/**
 * Helper: Fetches video metadata (title and channel name) using noembed.
 */
const fetchVideoMetadata = async (url: string): Promise<{ title: string, channelName: string }> => {
  try {
    const response = await fetch(`https://noembed.com/embed?url=${encodeURIComponent(url)}`);
    const data = await response.json();
    return {
      title: data.title || "",
      channelName: data.author_name || ""
    };
  } catch (error) {
    console.warn("Failed to fetch video metadata", error);
    return {
      title: "",
      channelName: ""
    };
  }
};

/**
 * Helper: Fetches video title using noembed (Fallback method).
 */
const fetchVideoTitle = async (url: string): Promise<string> => {
  try {
    // Removed 'callback' param to ensure we get pure JSON, not JSONP
    const response = await fetch(`https://noembed.com/embed?url=${encodeURIComponent(url)}`);
    const data = await response.json();
    return data.title || "";
  } catch (error) {
    console.warn("Failed to fetch video title", error);
    return "";
  }
};

export const generateQuizFromTopic = async (videoUrl: string): Promise<{ questions: QuizQuestion[], derivedTopic: string, channelName: string }> => {
  if (!ai) {
      throw new Error("Gemini API Key is missing. Please check your app configuration.");
  }

  try {
    // 1. GATHER CONTEXT (Try Transcript -> Fallback to Title)
    let transcript = "";
    let derivedTopic = "";
    let channelName = "";

    if (videoUrl) {
      transcript = await fetchTranscript(videoUrl);
      
      // Try to fetch the metadata (title and channel name)
      const videoData = await fetchVideoMetadata(videoUrl);
      derivedTopic = videoData.title;
      channelName = videoData.channelName;
    }

    // 2. CONSTRUCT THE PROMPT
    let prompt = "";
    if (transcript && transcript.length > 50) {
      // --- PATH A: HIGH ACCURACY (Transcript Available) ---
      prompt = `
        You are an educational expert. Create a multiple-choice quiz based STRICTLY on the provided video transcript below.
        
        Rules:
        1. Ignore any intro/outro fluff (sponsors, liking, subscribing).
        2. Focus on the core educational concepts taught.
        3. Generate exactly 5 questions.
        4. Provide 4 options per question.
        5. Indicate the correct answer index (0-3).

        TRANSCRIPT:
        "${transcript.slice(0, 30000)}" 
      `;
    } else {
      // --- PATH B: FALLBACK (Title/URL only) ---
      const contextDescription = derivedTopic 
        ? `The video is titled: "${derivedTopic}".`
        : `The video URL is: "${videoUrl}". Try to infer the topic from the URL.`;

      prompt = `
        You are an educational expert. Create a multiple-choice quiz about the following video content.
        ${contextDescription}
        
        Since the full transcript is unavailable, generate general knowledge questions relevant to this specific topic.
        Generate exactly 5 questions.
        For each question, provide 4 options and the index of the correct answer (0-3).
      `;
    }

    // 3. CALL GEMINI API
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
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
        derivedTopic: derivedTopic || "Video Assessment",
        channelName: channelName || "Unknown Channel"
    };

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to generate quiz. Please check the URL or try again.");
  }
};