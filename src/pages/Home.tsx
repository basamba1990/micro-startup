import React from "react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";

interface HomeProps {
  onSignIn: () => void;
}

export const Home: React.FC<HomeProps> = ({ onSignIn }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-600">
      <nav className="bg-white/10 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-white">Smoovebox AI</h1>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-white mb-4">Transform Your Videos with AI</h2>
          <p className="text-xl text-white/90 mb-8">
            Generate scripts, analyze interviews, and create marketing content in seconds
          </p>
          <Button
            onClick={onSignIn}
            className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 text-lg"
          >
            Get Started Free
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="bg-white/95 backdrop-blur-sm">
            <div className="text-4xl mb-4">🎬</div>
            <h3 className="text-xl font-bold mb-2">LinkedIn Ghost</h3>
            <p className="text-gray-600 mb-4">
              Generate optimized LinkedIn video scripts that engage your audience
            </p>
            <p className="text-sm text-gray-500">5 scripts/month on Freemium</p>
          </Card>

          <Card className="bg-white/95 backdrop-blur-sm">
            <div className="text-4xl mb-4">👥</div>
            <h3 className="text-xl font-bold mb-2">Recruit Audit</h3>
            <p className="text-gray-600 mb-4">
              Analyze interview videos with AI-powered communication scoring
            </p>
            <p className="text-sm text-gray-500">3 analyses/month on Freemium</p>
          </Card>

          <Card className="bg-white/95 backdrop-blur-sm">
            <div className="text-4xl mb-4">🏠</div>
            <h3 className="text-xl font-bold mb-2">RealEstate Clip</h3>
            <p className="text-gray-600 mb-4">
              Create compelling marketing scripts for real estate properties
            </p>
            <p className="text-sm text-gray-500">3 clips/month on Freemium</p>
          </Card>
        </div>

        <div className="mt-16 bg-white/10 backdrop-blur-md rounded-lg p-8 text-white">
          <h3 className="text-2xl font-bold mb-4">Pricing Plans</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="text-lg font-bold mb-2">Freemium</h4>
              <p className="text-3xl font-bold mb-4">Free</p>
              <ul className="space-y-2 text-sm">
                <li>✓ 5 LinkedIn scripts/month</li>
                <li>✓ 3 Interview analyses/month</li>
                <li>✓ 3 Real estate clips/month</li>
              </ul>
            </div>
            <div className="border-2 border-white rounded-lg p-4">
              <h4 className="text-lg font-bold mb-2">Pro</h4>
              <p className="text-3xl font-bold mb-4">$29/mo</p>
              <ul className="space-y-2 text-sm">
                <li>✓ 100 LinkedIn scripts/month</li>
                <li>✓ 50 Interview analyses/month</li>
                <li>✓ 50 Real estate clips/month</li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-bold mb-2">Enterprise</h4>
              <p className="text-3xl font-bold mb-4">$299/mo</p>
              <ul className="space-y-2 text-sm">
                <li>✓ Unlimited scripts</li>
                <li>✓ Unlimited analyses</li>
                <li>✓ Unlimited clips</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
