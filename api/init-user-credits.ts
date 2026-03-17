import { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);

const FREEMIUM_CREDITS = {
  linkedin_ghost: 5,
  recruit_audit: 3,
  realestate_clip: 3,
};

export default async (req: VercelRequest, res: VercelResponse) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ error: "Missing userId" });
  }

  try {
    // Check if user already has subscription
    const { data: existingSubscription } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", userId)
      .limit(1);

    // If subscription already exists, don't reinitialize
    if (existingSubscription && existingSubscription.length > 0) {
      return res.status(200).json({
        success: true,
        message: "User already has subscription",
      });
    }

    // Check if user already has credits initialized
    const { data: existingCredits } = await supabase
      .from("user_credits")
      .select("*")
      .eq("user_id", userId)
      .limit(1);

    if (existingCredits && existingCredits.length > 0) {
      return res.status(200).json({
        success: true,
        message: "User credits already initialized",
      });
    }

    // Initialize freemium credits for new user
    const creditsToInsert = Object.entries(FREEMIUM_CREDITS).map(
      ([productType, credits]) => ({
        user_id: userId,
        product_type: productType,
        credits_available: credits,
        credits_used: 0,
        reset_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      })
    );

    const { error: creditsInsertError } = await supabase
      .from("user_credits")
      .insert(creditsToInsert);

    if (creditsInsertError) {
      console.error("Error initializing credits:", creditsInsertError);
      return res.status(500).json({
        error: "Failed to initialize credits",
        details: creditsInsertError.message,
      });
    }

    // Create freemium subscription record
    const { error: subError } = await supabase.from("subscriptions").insert({
      user_id: userId,
      plan: "freemium",
      status: "active",
      current_period_start: new Date(),
      current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });

    if (subError) {
      console.error("Error creating subscription:", subError);
      // Don't fail if subscription creation fails, credits were already created
    }

    return res.status(200).json({
      success: true,
      message: "User credits initialized successfully",
    });
  } catch (error) {
    console.error("Init credits error:", error);
    return res.status(500).json({
      error: "Failed to initialize user credits",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
