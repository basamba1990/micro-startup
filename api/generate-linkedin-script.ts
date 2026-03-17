import { VercelRequest, VercelResponse } from "@vercel/node";
import { OpenAI } from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content:
            "You are a LinkedIn video script expert. Generate engaging, concise scripts optimized for LinkedIn videos. Always respond with valid JSON.",
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
