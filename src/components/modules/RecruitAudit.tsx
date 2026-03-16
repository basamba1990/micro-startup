import React, { useState } from "react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Textarea } from "../ui/textarea";
import { Input } from "../ui/input";
import { analyzeInterview } from "../../lib/openai";

export const RecruitAudit: React.FC = () => {
  const [jobTitle, setJobTitle] = useState("");
  const [transcript, setTranscript] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  const handleAnalyze = async () => {
    if (!jobTitle.trim() || !transcript.trim()) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const analysis = await analyzeInterview(transcript, jobTitle);
      setResult(analysis);
    } catch (err) {
      setError("Failed to analyze interview. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <h2 className="text-2xl font-bold mb-4">Recruit Audit</h2>
        <p className="text-gray-600 mb-6">Analyze interview videos with AI-powered scoring</p>

        <Input
          label="Job Title"
          placeholder="e.g., Senior Software Engineer"
          value={jobTitle}
          onChange={(e) => setJobTitle(e.target.value)}
        />

        <Textarea
          label="Interview Transcript"
          placeholder="Paste the interview transcript here..."
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
          rows={6}
          className="mt-4"
          error={error}
        />

        <Button onClick={handleAnalyze} loading={loading} className="mt-4 w-full">
          Analyze Interview
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
