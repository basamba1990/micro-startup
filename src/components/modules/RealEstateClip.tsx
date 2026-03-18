import React, { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Textarea } from "../ui/textarea";
import { generateRealEstateScript } from "../../lib/openai";
import { getCurrentUser, getUserPlan } from "../../lib/supabase";

export const RealEstateClip: React.FC = () => {
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");
  const [userId, setUserId] = useState<string>("");
  const [userPlan, setUserPlan] = useState<any>(null);
  const [creditsLoading, setCreditsLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      const user = await getCurrentUser();
      if (user) {
        setUserId(user.id);
        fetchUserPlan(user.id);
      }
    };
    getUser();
  }, []);

  const fetchUserPlan = async (userId: string) => {
    try {
      const response = await getUserPlan(userId);
      if (response.success) {
        setUserPlan(response);
      }
    } catch (error) {
      console.error("Failed to fetch user plan:", error);
    } finally {
      setCreditsLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!description.trim()) {
      setError("Please enter a property description");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const script = await generateRealEstateScript(description, userId);
      if (script) {
        setResult(script);
        // Refresh credits after generation
        await fetchUserPlan(userId);
      } else {
        throw new Error("Received empty response from server");
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || "Failed to generate script. Please try again.";
      setError(errorMessage);
      console.error("Generation error:", err);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  const realEstateCredits = userPlan?.credits?.realestate_clip;
  const hasCredits =
    realEstateCredits?.unlimited || (realEstateCredits?.available && realEstateCredits.available > 0);

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-2xl font-bold">RealEstate Clip</h2>
            <p className="text-gray-600">Create marketing scripts for real estate properties</p>
          </div>
          {!creditsLoading && realEstateCredits && (
            <div className="text-right">
              <p className="text-sm text-gray-600">Credits Available</p>
              <p className="text-2xl font-bold text-green-600">
                {realEstateCredits.unlimited ? "∞" : realEstateCredits.available}
              </p>
              {!realEstateCredits.unlimited && (
                <p className="text-xs text-gray-500">Used: {realEstateCredits.used}</p>
              )}
            </div>
          )}
        </div>

        {!hasCredits && !creditsLoading && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 rounded text-red-700">
            <p className="font-semibold">No credits available</p>
            <p className="text-sm">Please upgrade your plan to generate more scripts.</p>
          </div>
        )}

        <Textarea
          label="Property Description"
          placeholder="Describe the property: location, features, amenities, price, etc."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={6}
          error={error}
          disabled={!hasCredits && !creditsLoading}
        />

        <Button
          onClick={handleGenerate}
          loading={loading}
          disabled={!hasCredits && !creditsLoading}
          className="mt-4 w-full"
        >
          {!hasCredits && !creditsLoading ? "Upgrade to Generate" : "Generate Marketing Script"}
        </Button>
      </Card>

      {result && (
        <div className="space-y-4">
          <Card>
            <h3 className="text-lg font-bold mb-3">30-Second Marketing Script</h3>
            <p className="text-gray-700 whitespace-pre-wrap mb-3">{result.script}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => copyToClipboard(result.script)}
            >
              Copy Script
            </Button>
          </Card>

          <Card>
            <h3 className="text-lg font-bold mb-3">Key Highlights</h3>
            <ul className="space-y-2">
              {result.highlights?.map((highlight: string, idx: number) => (
                <li key={idx} className="text-gray-700 flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  {highlight}
                </li>
              ))}
            </ul>
          </Card>

          <Card>
            <h3 className="text-lg font-bold mb-3">SEO Description</h3>
            <p className="text-gray-700 text-sm mb-3">{result.seo_description}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => copyToClipboard(result.seo_description)}
            >
              Copy SEO Description
            </Button>
          </Card>
        </div>
      )}
    </div>
  );
};
