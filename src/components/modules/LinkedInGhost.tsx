import React, { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Textarea } from "../ui/textarea";
import { generateLinkedInScript } from "../../lib/openai";
import { getCurrentUser, getUserPlan } from "../../lib/supabase";

export const LinkedInGhost: React.FC = () => {
  const [idea, setIdea] = useState("");
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
    if (!idea.trim()) {
      setError("Please enter a video idea");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const script = await generateLinkedInScript(idea, userId);
      setResult(script);
      // Refresh credits after generation
      await fetchUserPlan(userId);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to generate script. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  const linkedInCredits = userPlan?.credits?.linkedin_ghost;
  const hasCredits =
    linkedInCredits?.unlimited || (linkedInCredits?.available && linkedInCredits.available > 0);

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-2xl font-bold">LinkedIn Ghost</h2>
            <p className="text-gray-600">Generate optimized LinkedIn video scripts in seconds</p>
          </div>
          {!creditsLoading && linkedInCredits && (
            <div className="text-right">
              <p className="text-sm text-gray-600">Credits Available</p>
              <p className="text-2xl font-bold text-blue-600">
                {linkedInCredits.unlimited ? "∞" : linkedInCredits.available}
              </p>
              {!linkedInCredits.unlimited && (
                <p className="text-xs text-gray-500">Used: {linkedInCredits.used}</p>
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
          label="Video Idea"
          placeholder="Describe your video idea..."
          value={idea}
          onChange={(e) => setIdea(e.target.value)}
          rows={4}
          error={error}
          disabled={!hasCredits && !creditsLoading}
        />

        <Button
          onClick={handleGenerate}
          loading={loading}
          disabled={!hasCredits && !creditsLoading}
          className="mt-4 w-full"
        >
          {!hasCredits && !creditsLoading ? "Upgrade to Generate" : "Generate Script"}
        </Button>
      </Card>

      {result && (
        <div className="space-y-4">
          <Card>
            <h3 className="text-lg font-bold mb-3">Hook</h3>
            <p className="text-gray-700 mb-3">{result.hook}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => copyToClipboard(result.hook)}
            >
              Copy Hook
            </Button>
          </Card>

          <Card>
            <h3 className="text-lg font-bold mb-3">Full Script (60 seconds)</h3>
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
            <h3 className="text-lg font-bold mb-3">Call-to-Action</h3>
            <p className="text-gray-700 mb-3">{result.cta}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => copyToClipboard(result.cta)}
            >
              Copy CTA
            </Button>
          </Card>
        </div>
      )}
    </div>
  );
};
