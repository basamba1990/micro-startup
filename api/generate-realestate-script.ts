import { VercelRequest, VercelResponse } from "@vercel/node";
import { OpenAI } from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async (req: VercelRequest, res: VercelResponse) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { description, userId } = req.body;

  if (!description || !userId) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  if (description.trim().length === 0) {
    return res.status(400).json({ error: "Description cannot be empty" });
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content:
            "You are an expert real estate marketing specialist. Create compelling property marketing scripts and highlights. Always respond with valid JSON.",
        },
        {
          role: "user",
          content: `Create a 30-second marketing script for this property:
          
          "${description}"
          
          Return a JSON object with:
          - script: A compelling 30-second marketing script
          - highlights: Array of 5 key selling points
          - seo_description: SEO-optimized description (max 160 chars)`,
        },
      ],
      temperature: 0.7,
      max_tokens: 600,
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
    console.error("Real estate script generation error:", error);

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
