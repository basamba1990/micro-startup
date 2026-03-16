import React, { useState } from "react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Textarea } from "../ui/textarea";
import { generateRealEstateScript } from "../../lib/openai";

export const RealEstateClip: React.FC = () => {
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    if (!description.trim()) {
      setError("Please enter a property description");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const script = await generateRealEstateScript(description);
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
        <h2 className="text-2xl font-bold mb-4">RealEstate Clip</h2>
        <p className="text-gray-600 mb-6">Create marketing scripts for real estate properties</p>

        <Textarea
          label="Property Description"
          placeholder="Describe the property: location, features, amenities, price, etc."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={6}
          error={error}
        />

        <Button onClick={handleGenerate} loading={loading} className="mt-4 w-full">
          Generate Marketing Script
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
