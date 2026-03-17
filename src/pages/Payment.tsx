import React, { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { PRICING_PLANS, createCheckoutSession } from "../lib/stripe";
import { getUserPlan } from "../lib/supabase";

interface PaymentProps {
  userId: string;
  onSuccess?: () => void;
}

export const Payment: React.FC<PaymentProps> = ({ userId, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<"freemium" | "pro" | "enterprise" | null>(null);
  const [userPlan, setUserPlan] = useState<any>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  useEffect(() => {
    // Check if payment was successful
    const params = new URLSearchParams(window.location.search);
    if (params.get("success") === "true") {
      setPaymentSuccess(true);
      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        onSuccess?.();
      }, 2000);
    }

    // Fetch user's current plan
    if (userId) {
      fetchUserPlan();
    }
  }, [userId, onSuccess]);

  const fetchUserPlan = async () => {
    try {
      const response = await getUserPlan(userId);
      if (response.success) {
        setUserPlan(response);
      }
    } catch (error) {
      console.error("Failed to fetch user plan:", error);
    }
  };

  const handleCheckout = async (plan: "freemium" | "pro" | "enterprise") => {
    if (plan === "freemium") {
      // Freemium doesn't require payment
      onSuccess?.();
      return;
    }

    setLoading(true);
    setSelectedPlan(plan);
    try {
      const session = await createCheckoutSession(
        userId,
        plan,
        window.location.href,
        window.location.href
      );

      if (session.url) {
        window.location.href = session.url;
      }
    } catch (error) {
      console.error("Checkout error:", error);
      alert("Failed to start checkout. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (paymentSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 flex items-center justify-center">
        <div className="max-w-md mx-auto px-4">
          <Card className="text-center">
            <div className="text-5xl mb-4">✅</div>
            <h2 className="text-2xl font-bold mb-2">Payment Successful!</h2>
            <p className="text-gray-600 mb-6">
              Your subscription has been activated. Redirecting to dashboard...
            </p>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-center mb-2">Choose Your Plan</h1>
        {userPlan && (
          <p className="text-center text-gray-600 mb-12">
            Current Plan: <span className="font-bold capitalize">{userPlan.plan}</span>
          </p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {Object.entries(PRICING_PLANS).map(([key, plan]) => (
            <Card
              key={key}
              className={`flex flex-col ${
                selectedPlan === key ? "ring-2 ring-blue-600" : ""
              } ${userPlan?.plan === key ? "ring-2 ring-green-600" : ""}`}
            >
              <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
              {userPlan?.plan === key && (
                <p className="text-sm text-green-600 font-semibold mb-2">✓ Current Plan</p>
              )}
              <p className="text-4xl font-bold text-blue-600 mb-4">
                {plan.price === 0 ? "Free" : `$${plan.price}/mo`}
              </p>

              <div className="space-y-3 mb-6 flex-grow">
                <div>
                  <p className="font-semibold text-gray-900">LinkedIn Ghost</p>
                  <p className="text-gray-600">
                    {plan.credits.linkedin_ghost === -1
                      ? "Unlimited"
                      : `${plan.credits.linkedin_ghost}/month`}
                  </p>
                  {userPlan?.credits?.linkedin_ghost && (
                    <p className="text-sm text-gray-500">
                      Used: {userPlan.credits.linkedin_ghost.used}
                    </p>
                  )}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Recruit Audit</p>
                  <p className="text-gray-600">
                    {plan.credits.recruit_audit === -1
                      ? "Unlimited"
                      : `${plan.credits.recruit_audit}/month`}
                  </p>
                  {userPlan?.credits?.recruit_audit && (
                    <p className="text-sm text-gray-500">
                      Used: {userPlan.credits.recruit_audit.used}
                    </p>
                  )}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">RealEstate Clip</p>
                  <p className="text-gray-600">
                    {plan.credits.realestate_clip === -1
                      ? "Unlimited"
                      : `${plan.credits.realestate_clip}/month`}
                  </p>
                  {userPlan?.credits?.realestate_clip && (
                    <p className="text-sm text-gray-500">
                      Used: {userPlan.credits.realestate_clip.used}
                    </p>
                  )}
                </div>
              </div>

              <Button
                onClick={() => handleCheckout(key as any)}
                loading={loading && selectedPlan === key}
                disabled={userPlan?.plan === key}
                className="w-full"
              >
                {userPlan?.plan === key
                  ? "Current Plan"
                  : key === "freemium"
                  ? "Get Started"
                  : "Subscribe"}
              </Button>
            </Card>
          ))}
        </div>

        <div className="mt-12 bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold mb-4">FAQ</h2>
          <div className="space-y-6">
            <div>
              <h3 className="font-bold text-gray-900 mb-2">Can I change my plan anytime?</h3>
              <p className="text-gray-600">Yes, you can upgrade or downgrade your plan at any time.</p>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-2">Is there a free trial?</h3>
              <p className="text-gray-600">Yes, start with Freemium and upgrade whenever you need more credits.</p>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-2">What happens to unused credits?</h3>
              <p className="text-gray-600">Credits reset monthly. Unused credits do not carry over.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
