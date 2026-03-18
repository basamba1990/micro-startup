import axios from "axios";
import { supabase } from "./supabase";

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
export const generateLinkedInScript = async (idea: string, userId: string) => {
  try {
    const { data, error } = await supabase.functions.invoke("linkedin-ghost", {
      body: { idea, userId },
    });

    if (error) throw error;
    if (data.success) {
      return data.data;
    }
    throw new Error(data.error || "Failed to generate script");
  } catch (error) {
    console.error("Script generation error:", error);
    throw error;
  }
};

// Analyze interview transcript
export const analyzeInterview = async (transcript: string, jobTitle: string, userId: string) => {
  try {
    const { data, error } = await supabase.functions.invoke("recruit-audit", {
      body: { transcript, jobTitle, userId },
    });

    if (error) throw error;
    if (data.success) {
      return data.data;
    }
    throw new Error(data.error || "Failed to analyze interview");
  } catch (error) {
    console.error("Interview analysis error:", error);
    throw error;
  }
};

// Generate real estate marketing script
export const generateRealEstateScript = async (description: string, userId: string) => {
  try {
    const { data, error } = await supabase.functions.invoke("realestate-clip", {
      body: { description, userId },
    });

    if (error) throw error;
    if (data.success) {
      return data.data;
    }
    throw new Error(data.error || "Failed to generate script");
  } catch (error) {
    console.error("Real estate script generation error:", error);
    throw error;
  }
};
