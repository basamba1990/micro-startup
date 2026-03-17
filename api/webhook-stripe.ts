import { VercelRequest, VercelResponse } from "@vercel/node";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2023-10-16",
});

const supabase = createClient(
  process.env.SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);

const CREDIT_PLANS = {
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
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const sig = req.headers["stripe-signature"];
  if (!sig) {
    return res.status(400).json({ error: "Missing stripe signature" });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET || ""
    );
  } catch (error) {
    console.error("Webhook signature verification failed:", error);
    return res.status(400).json({ error: "Invalid signature" });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.client_reference_id;
        const plan = (session.metadata?.plan || "freemium") as
          | "freemium"
          | "pro"
          | "enterprise";

        if (!userId) {
          console.error("No userId in checkout session");
          return res.status(400).json({ error: "Missing userId" });
        }

        // Create subscription record
        const { error: subError } = await supabase
          .from("subscriptions")
          .upsert(
            {
              user_id: userId,
              stripe_subscription_id: session.subscription as string,
              plan,
              status: "active",
              current_period_start: new Date(),
              current_period_end: new Date(
                Date.now() + 30 * 24 * 60 * 60 * 1000
              ),
            },
            { onConflict: "user_id" }
          );

        if (subError) {
          console.error("Error creating subscription:", subError);
          return res.status(500).json({ error: "Failed to create subscription" });
        }

        // Initialize or update user credits
        const credits =
          CREDIT_PLANS[plan as keyof typeof CREDIT_PLANS] || {};

        for (const [productType, creditAmount] of Object.entries(credits)) {
          const { error: creditError } = await supabase
            .from("user_credits")
            .upsert(
              {
                user_id: userId,
                product_type: productType,
                credits_available: creditAmount,
                credits_used: 0,
                reset_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
              },
              { onConflict: "user_id,product_type" }
            );

          if (creditError) {
            console.error("Error updating credits:", creditError);
          }
        }

        // Record payment
        const { error: paymentError } = await supabase
          .from("payments")
          .insert({
            user_id: userId,
            stripe_payment_id: session.payment_intent as string,
            amount: (session.amount_total || 0) / 100,
            status: "succeeded",
            subscription_plan: plan,
            product_type: "subscription",
          });

        if (paymentError) {
          console.error("Error recording payment:", paymentError);
        }

        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.userId;

        if (!userId) {
          console.error("No userId in subscription");
          break;
        }

        const { error } = await supabase
          .from("subscriptions")
          .update({
            status: subscription.status,
            current_period_start: new Date(
              subscription.current_period_start * 1000
            ),
            current_period_end: new Date(
              subscription.current_period_end * 1000
            ),
          })
          .eq("stripe_subscription_id", subscription.id);

        if (error) {
          console.error("Error updating subscription:", error);
        }

        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.userId;

        if (!userId) {
          console.error("No userId in subscription");
          break;
        }

        const { error } = await supabase
          .from("subscriptions")
          .update({ status: "canceled" })
          .eq("stripe_subscription_id", subscription.id);

        if (error) {
          console.error("Error canceling subscription:", error);
        }

        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return res.status(500).json({
      error: "Webhook processing failed",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
