import { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);

// Pricing plans configuration
const PRICING_PLANS = {
  freemium: {
    linkedin_ghost: 5,
    recruit_audit: 3,
    realestate_clip: 3,
  },
  pro: {
    linkedin_ghost: 100,
    recruit_audit: 50,
    realestate_clip: 50,
  },
  enterprise: {
    linkedin_ghost: -1, // Unlimited
    recruit_audit: -1,
    realestate_clip: -1,
  },
};

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

    // Format credits response - map product_type to credit objects
    const creditsMap: Record<string, any> = {
      linkedin_ghost: {
        available: 0,
        used: 0,
        unlimited: false,
      },
      recruit_audit: {
        available: 0,
        used: 0,
        unlimited: false,
      },
      realestate_clip: {
        available: 0,
        used: 0,
        unlimited: false,
      },
    };

    // Get plan limits
    const planLimits = PRICING_PLANS[plan as keyof typeof PRICING_PLANS] || PRICING_PLANS.freemium;

    // Process credits from database
    if (credits && credits.length > 0) {
      credits.forEach((credit: any) => {
        const productType = credit.product_type;
        if (creditsMap[productType]) {
          creditsMap[productType] = {
            available: credit.credits_available,
            used: credit.credits_used,
            unlimited: credit.credits_available === -1,
          };
        }
      });
    } else {
      // If no credits found, use plan defaults
      Object.keys(planLimits).forEach((productType) => {
        const limit = planLimits[productType as keyof typeof planLimits];
        creditsMap[productType] = {
          available: limit,
          used: 0,
          unlimited: limit === -1,
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
