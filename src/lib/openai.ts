import axios from "axios";

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
const OPENAI_BASE_URL = "https://api.openai.com/v1";

const openaiClient = axios.create({
  baseURL: OPENAI_BASE_URL,
  headers: {
    Authorization: `Bearer ${OPENAI_API_KEY}`,
    "Content-Type": "application/json",
  },
});

// Transcribe audio using Whisper API
export const transcribeAudio = async (audioUrl: string, language: string = "en") => {
  try {
    const response = await openaiClient.post("/audio/transcriptions", {
      model: "whisper-1",
      language,
      file: audioUrl,
    });

    return {
      transcript: response.data.text,
      language: response.data.language,
    };
  } catch (error) {
    console.error("Transcription error:", error);
    throw error;
  }
};

// Generate LinkedIn script
export const generateLinkedInScript = async (idea: string) => {
  try {
    const response = await openaiClient.post("/chat/completions", {
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a LinkedIn video script expert. Generate engaging, concise scripts optimized for LinkedIn videos.",
        },
        {
          role: "user",
          content: `Create a 60-second LinkedIn video script for this idea: "${idea}". 
          
          Return a JSON object with:
          - hook: A compelling opening line (max 20 words)
          - script: The full 60-second script
          - cta: A call-to-action (max 15 words)`,
        },
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const content = response.data.choices[0].message.content;
    return JSON.parse(content);
  } catch (error) {
    console.error("Script generation error:", error);
    throw error;
  }
};

// Analyze interview transcript
export const analyzeInterview = async (transcript: string, jobTitle: string) => {
  try {
    const response = await openaiClient.post("/chat/completions", {
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an expert HR interviewer and communication analyst. Analyze interview transcripts and provide detailed feedback.",
        },
        {
          role: "user",
          content: `Analyze this interview transcript for a ${jobTitle} position:
          
          "${transcript}"
          
          Return a JSON object with:
          - clarity_score: 0-100
          - persuasion_score: 0-100
          - emotion_score: 0-100
          - engagement_score: 0-100
          - storytelling_score: 0-100
          - feedback: Array of key feedback points
          - recommendation: Hiring recommendation`,
        },
      ],
      temperature: 0.7,
      max_tokens: 800,
    });

    const content = response.data.choices[0].message.content;
    return JSON.parse(content);
  } catch (error) {
    console.error("Interview analysis error:", error);
    throw error;
  }
};

// Generate real estate marketing script
export const generateRealEstateScript = async (propertyDescription: string) => {
  try {
    const response = await openaiClient.post("/chat/completions", {
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an expert real estate marketing specialist. Create compelling property marketing scripts and highlights.",
        },
        {
          role: "user",
          content: `Create a 30-second marketing script for this property:
          
          "${propertyDescription}"
          
          Return a JSON object with:
          - script: A compelling 30-second marketing script
          - highlights: Array of 5 key selling points
          - seo_description: SEO-optimized description (max 160 chars)`,
        },
      ],
      temperature: 0.7,
      max_tokens: 600,
    });

    const content = response.data.choices[0].message.content;
    return JSON.parse(content);
  } catch (error) {
    console.error("Real estate script generation error:", error);
    throw error;
  }
};
