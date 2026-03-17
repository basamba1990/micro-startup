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

  const { idea, userId } = req.body;

  if (!idea || !userId) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  if (idea.trim().length === 0) {
    return res.status(400).json({ error: "Idea cannot be empty" });
  }

  // Check user credits
  try {
    const { data: credits, error: creditError } = await supabase
      .from("user_credits")
      .select("*")
      .eq("user_id", userId)
      .eq("product_type", "linkedin_ghost")
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
            "You are a LinkedIn video script expert. Generate engaging, concise scripts optimized for LinkedIn videos. You MUST respond ONLY with a valid JSON object.",
        },
        {
          role: "user",
          content: `Create a 60-second LinkedIn video script for this idea: "${idea}". 
          
          Return a JSON object with:
          {
            "hook": "A compelling opening line (max 20 words)",
            "script": "The full 60-second script",
            "cta": "A call-to-action (max 15 words)"
          }`,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 500,
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No content returned from OpenAI");
    }

    const result = JSON.parse(content);

    // Deduct credit after successful generation
    const { data: credits } = await supabase
      .from("user_credits")
      .select("*")
      .eq("user_id", userId)
      .eq("product_type", "linkedin_ghost")
      .single();

    if (credits && credits.credits_available !== -1) {
      await supabase
        .from("user_credits")
        .update({
          credits_used: credits.credits_used + 1,
          credits_available: credits.credits_available - 1,
        })
        .eq("user_id", userId)
        .eq("product_type", "linkedin_ghost");
    }

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Script generation error:", error);

    if (error instanceof SyntaxError) {
      return res.status(500).json({
        error: "Invalid response format from AI",
      });
    }

    return res.status(500).json({
      error: "Failed to generate script",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
