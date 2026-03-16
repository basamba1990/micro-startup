import axios from "axios";

const STRIPE_PUBLIC_KEY = import.meta.env.VITE_STRIPE_PUBLIC_KEY;
const STRIPE_API_URL = "https://api.stripe.com/v1";

// Load Stripe.js
declare global {
  interface Window {
    Stripe: any;
  }
}

export const loadStripe = async () => {
  const script = document.createElement("script");
  script.src = "https://js.stripe.com/v3/";
  script.async = true;
  document.body.appendChild(script);

  return new Promise((resolve) => {
    script.onload = () => {
      resolve(window.Stripe(STRIPE_PUBLIC_KEY));
    };
  });
};

// Create checkout session
export const createCheckoutSession = async (
  userId: string,
  plan: "freemium" | "pro" | "enterprise",
  successUrl: string,
  cancelUrl: string
) => {
  try {
    const response = await axios.post("/api/create-checkout-session", {
      userId,
      plan,
      successUrl,
      cancelUrl,
    });

    return response.data;
  } catch (error) {
    console.error("Checkout session error:", error);
    throw error;
  }
};

// Create payment intent for per-use pricing
export const createPaymentIntent = async (
  userId: string,
  productType: string,
  amount: number
) => {
  try {
    const response = await axios.post("/api/create-payment-intent", {
      userId,
      productType,
      amount,
    });

    return response.data;
  } catch (error) {
    console.error("Payment intent error:", error);
    throw error;
  }
};

// Get subscription status
export const getSubscriptionStatus = async (userId: string) => {
  try {
    const response = await axios.get(`/api/subscription-status/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Subscription status error:", error);
    throw error;
  }
};

// Cancel subscription
export const cancelSubscription = async (userId: string) => {
  try {
    const response = await axios.post("/api/cancel-subscription", {
      userId,
    });

    return response.data;
  } catch (error) {
    console.error("Cancel subscription error:", error);
    throw error;
  }
};

// Pricing plans
export const PRICING_PLANS = {
  freemium: {
    name: "Freemium",
    price: 0,
    credits: {
      linkedin_ghost: 5,
      recruit_audit: 3,
      realestate_clip: 3,
    },
  },
  pro: {
    name: "Pro",
    price: 29,
    credits: {
      linkedin_ghost: 100,
      recruit_audit: 50,
      realestate_clip: 50,
    },
  },
  enterprise: {
    name: "Enterprise",
    price: 299,
    credits: {
      linkedin_ghost: -1, // Unlimited
      recruit_audit: -1,
      realestate_clip: -1,
    },
  },
};
