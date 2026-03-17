import { VercelRequest, VercelResponse } from "@vercel/node";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2023-10-16",
});

const PRICING_PLANS = {
  freemium: {
    price: 0,
    name: "Freemium",
  },
  pro: {
    price: 2900, // $29 in cents
    priceId: process.env.STRIPE_PRICE_ID_PRO || "price_pro",
  },
  enterprise: {
    price: 29900, // $299 in cents
    priceId: process.env.STRIPE_PRICE_ID_ENTERPRISE || "price_enterprise",
  },
};

export default async (req: VercelRequest, res: VercelResponse) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { userId, plan, successUrl, cancelUrl } = req.body;

  if (!userId || !plan || !successUrl || !cancelUrl) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  if (!PRICING_PLANS[plan as keyof typeof PRICING_PLANS]) {
    return res.status(400).json({ error: "Invalid plan" });
  }

  try {
    // For freemium plan, no checkout needed
    if (plan === "freemium") {
      return res.status(200).json({
        success: true,
        message: "Freemium plan activated",
      });
    }

    const planConfig = PRICING_PLANS[plan as keyof typeof PRICING_PLANS];

    // Create checkout session for paid plans
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price: planConfig.priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}&success=true`,
      cancel_url: `${cancelUrl}?canceled=true`,
      client_reference_id: userId,
      metadata: {
        userId,
        plan,
      },
      subscription_data: {
        metadata: {
          userId,
          plan,
        },
      },
    });

    return res.status(200).json({
      success: true,
      url: session.url,
      sessionId: session.id,
    });
  } catch (error) {
    console.error("Checkout session error:", error);
    return res.status(500).json({
      error: "Failed to create checkout session",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
