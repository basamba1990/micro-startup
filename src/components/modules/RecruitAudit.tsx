import React, { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Textarea } from "../ui/textarea";
import { Input } from "../ui/input";
import { analyzeInterview } from "../../lib/openai";
import { getCurrentUser, getUserPlan } from "../../lib/supabase";

export const RecruitAudit: React.FC = () => {
  const [jobTitle, setJobTitle] = useState("");
  const [transcript, setTranscript] = useState("");
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

  const handleAnalyze = async () => {
    if (!jobTitle.trim() || !transcript.trim()) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const analysis = await analyzeInterview(transcript, jobTitle, userId);
      setResult(analysis);
      // Refresh credits after analysis
      await fetchUserPlan(userId);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to analyze interview. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const recruitCredits = userPlan?.credits?.recruit_audit;
  const hasCredits =
    recruitCredits?.unlimited || (recruitCredits?.available && recruitCredits.available > 0);

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-2xl font-bold">Recruit Audit</h2>
            <p className="text-gray-600">Analyze interview videos with AI-powered scoring</p>
          </div>
          {!creditsLoading && recruitCredits && (
            <div className="text-right">
              <p className="text-sm text-gray-600">Credits Available</p>
              <p className="text-2xl font-bold text-purple-600">
                {recruitCredits.unlimited ? "∞" : recruitCredits.available}
              </p>
              {!recruitCredits.unlimited && (
                <p className="text-xs text-gray-500">Used: {recruitCredits.used}</p>
              )}
            </div>
          )}
        </div>

        {!hasCredits && !creditsLoading && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 rounded text-red-700">
            <p className="font-semibold">No credits available</p>
            <p className="text-sm">Please upgrade your plan to analyze more interviews.</p>
          </div>
        )}

        <Input
          label="Job Title"
          placeholder="e.g., Senior Software Engineer"
          value={jobTitle}
          onChange={(e) => setJobTitle(e.target.value)}
          disabled={!hasCredits && !creditsLoading}
        />

        <Textarea
          label="Interview Transcript"
          placeholder="Paste the interview transcript here..."
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
          rows={6}
          className="mt-4"
          error={error}
          disabled={!hasCredits && !creditsLoading}
        />

        <Button
          onClick={handleAnalyze}
          loading={loading}
          disabled={!hasCredits && !creditsLoading}
          className="mt-4 w-full"
        >
          {!hasCredits && !creditsLoading ? "Upgrade to Analyze" : "Analyze Interview"}
        </Button>
      </Card>

      {result && (
        <div className="space-y-4">
          <Card>
            <h3 className="text-lg font-bold mb-4">Communication Scores</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-600 text-sm">Clarity</p>
                <p className="text-2xl font-bold text-blue-600">{result.clarity_score}/100</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Persuasion</p>
                <p className="text-2xl font-bold text-blue-600">{result.persuasion_score}/100</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Emotion</p>
                <p className="text-2xl font-bold text-blue-600">{result.emotion_score}/100</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Engagement</p>
                <p className="text-2xl font-bold text-blue-600">{result.engagement_score}/100</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Storytelling</p>
                <p className="text-2xl font-bold text-blue-600">{result.storytelling_score}/100</p>
              </div>
            </div>
          </Card>

          <Card>
            <h3 className="text-lg font-bold mb-3">Feedback</h3>
            <ul className="space-y-2">
              {result.feedback?.map((point: string, idx: number) => (
                <li key={idx} className="text-gray-700 flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  {point}
                </li>
              ))}
            </ul>
          </Card>

          <Card>
            <h3 className="text-lg font-bold mb-3">Recommendation</h3>
            <p className="text-gray-700">{result.recommendation}</p>
          </Card>
        </div>
      )}
    </div>
  );
};
