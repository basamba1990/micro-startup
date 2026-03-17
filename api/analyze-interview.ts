import { VercelRequest, VercelResponse } from "@vercel/node";
import { OpenAI } from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async (req: VercelRequest, res: VercelResponse) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { transcript, jobTitle, userId } = req.body;

  if (!transcript || !jobTitle || !userId) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  if (transcript.trim().length === 0 || jobTitle.trim().length === 0) {
    return res.status(400).json({ error: "Fields cannot be empty" });
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content:
            "You are an expert HR interviewer and communication analyst. Analyze interview transcripts and provide detailed feedback. Always respond with valid JSON.",
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
          - feedback: Array of key feedback points (3-5 points)
          - recommendation: Hiring recommendation (one of: "Strong Yes", "Yes", "Maybe", "No")`,
        },
      ],
      temperature: 0.7,
      max_tokens: 800,
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No content returned from OpenAI");
    }

    const result = JSON.parse(content);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Interview analysis error:", error);

    if (error instanceof SyntaxError) {
      return res.status(500).json({
        error: "Invalid response format from AI",
      });
    }

    return res.status(500).json({
      error: "Failed to analyze interview",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
