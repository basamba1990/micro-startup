import { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);

export default async (req: VercelRequest, res: VercelResponse) => {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { userId } = req.query;

  if (!userId || typeof userId !== "string") {
    return res.status(400).json({ error: "Missing or invalid userId" });
  }

  try {
    // Get user subscription
    const { data: subscription, error: subError } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (subError && subError.code !== "PGRST116") {
      console.error("Error fetching subscription:", subError);
      return res.status(500).json({ error: "Failed to fetch subscription" });
    }

    const plan = subscription?.plan || "freemium";

    // Get user credits
    const { data: credits, error: creditsError } = await supabase
      .from("user_credits")
      .select("*")
      .eq("user_id", userId);

    if (creditsError) {
      console.error("Error fetching credits:", creditsError);
      return res.status(500).json({ error: "Failed to fetch credits" });
    }

    // Format credits response
    const creditsMap: Record<string, any> = {};
    if (credits) {
      credits.forEach((credit) => {
        creditsMap[credit.product_type] = {
          available: credit.credits_available,
          used: credit.credits_used,
          unlimited: credit.credits_available === -1,
        };
      });
    }

    return res.status(200).json({
      success: true,
      plan,
      credits: creditsMap,
      subscription: subscription || null,
    });
  } catch (error) {
    console.error("Get user plan error:", error);
    return res.status(500).json({
      error: "Failed to get user plan",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
