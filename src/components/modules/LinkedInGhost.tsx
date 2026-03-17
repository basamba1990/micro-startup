import React, { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Textarea } from "../ui/textarea";
import { generateLinkedInScript } from "../../lib/openai";
import { getCurrentUser } from "../../lib/supabase";

export const LinkedInGhost: React.FC = () => {
  const [idea, setIdea] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");
  const [userId, setUserId] = useState<string>("");

  useEffect(() => {
    const getUser = async () => {
      const user = await getCurrentUser();
      if (user) {
        setUserId(user.id);
      }
    };
    getUser();
  }, []);

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
    } catch (err) {
      setError("Failed to generate script. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  return (
    <div className="space-y-6">
      <Card>
        <h2 className="text-2xl font-bold mb-4">LinkedIn Ghost</h2>
        <p className="text-gray-600 mb-6">Generate optimized LinkedIn video scripts in seconds</p>

        <Textarea
          label="Video Idea"
          placeholder="Describe your video idea..."
          value={idea}
          onChange={(e) => setIdea(e.target.value)}
          rows={4}
          error={error}
        />

        <Button onClick={handleGenerate} loading={loading} className="mt-4 w-full">
          Generate Script
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
