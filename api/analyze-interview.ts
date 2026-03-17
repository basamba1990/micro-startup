import { VercelRequest, VercelResponse } from "@vercel/node";
import { OpenAI } from "openai";
import { createClient } from "@supabase/supabase-js";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const supabase = createClient(
  process.env.SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);

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

  // Check user credits
  try {
    const { data: credits, error: creditError } = await supabase
      .from("user_credits")
      .select("*")
      .eq("user_id", userId)
      .eq("product_type", "recruit_audit")
      .single();

    if (creditError || !credits) {
      return res.status(403).json({
        error: "No credits available. Please upgrade your plan.",
      });
    }

    // Check if user has unlimited credits or available credits
    if (credits.credits_available !== -1 && credits.credits_available <= 0) {
      return res.status(403).json({
        error: "Insufficient credits. Please upgrade your plan.",
      });
    }
  } catch (error) {
    console.error("Credit check error:", error);
    return res.status(500).json({ error: "Failed to verify credits" });
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

    // Deduct credit after successful analysis
    const { data: credits } = await supabase
      .from("user_credits")
      .select("*")
      .eq("user_id", userId)
      .eq("product_type", "recruit_audit")
      .single();

    if (credits && credits.credits_available !== -1) {
      await supabase
        .from("user_credits")
        .update({
          credits_used: credits.credits_used + 1,
          credits_available: credits.credits_available - 1,
        })
        .eq("user_id", userId)
        .eq("product_type", "recruit_audit");
    }

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
