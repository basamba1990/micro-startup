import axios from "axios";

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
    const response = await axios.post("/api/generate-linkedin-script", {
      idea,
      userId,
    });

    if (response.data.success) {
      return response.data.data;
    }
    throw new Error(response.data.error || "Failed to generate script");
  } catch (error) {
    console.error("Script generation error:", error);
    throw error;
  }
};

// Analyze interview transcript
export const analyzeInterview = async (transcript: string, jobTitle: string, userId: string) => {
  try {
    const response = await axios.post("/api/analyze-interview", {
      transcript,
      jobTitle,
      userId,
    });

    if (response.data.success) {
      return response.data.data;
    }
    throw new Error(response.data.error || "Failed to analyze interview");
  } catch (error) {
    console.error("Interview analysis error:", error);
    throw error;
  }
};

// Generate real estate marketing script
export const generateRealEstateScript = async (description: string, userId: string) => {
  try {
    const response = await axios.post("/api/generate-realestate-script", {
      description,
      userId,
    });

    if (response.data.success) {
      return response.data.data;
    }
    throw new Error(response.data.error || "Failed to generate script");
  } catch (error) {
    console.error("Real estate script generation error:", error);
    throw error;
  }
};
