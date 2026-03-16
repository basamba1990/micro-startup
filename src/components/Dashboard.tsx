import React, { useState } from "react";
import { LinkedInGhost } from "./modules/LinkedInGhost";
import { RecruitAudit } from "./modules/RecruitAudit";
import { RealEstateClip } from "./modules/RealEstateClip";
import { Button } from "./ui/button";
import { Card } from "./ui/card";

export const Dashboard: React.FC = () => {
  const [activeModule, setActiveModule] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

  const modules = [
    {
      id: "linkedin-ghost",
      name: "LinkedIn Ghost",
      description: "Generate optimized LinkedIn video scripts",
      icon: "🎬",
      color: "bg-blue-100",
    },
    {
      id: "recruit-audit",
      name: "Recruit Audit",
      description: "Analyze interview videos with AI scoring",
      icon: "👥",
      color: "bg-purple-100",
    },
    {
      id: "realestate-clip",
      name: "RealEstate Clip",
      description: "Create marketing scripts for properties",
      icon: "🏠",
      color: "bg-green-100",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Smoovebox AI</h1>
          <div className="space-x-4">
            <Button variant="outline" size="sm">
              Profile
            </Button>
            <Button variant="outline" size="sm">
              Logout
            </Button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {!activeModule ? (
          <div>
            <h2 className="text-3xl font-bold mb-8">Select a Module</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {modules.map((module) => (
                <Card key={module.id} className={`cursor-pointer hover:shadow-lg transition-shadow ${module.color}`}>
                  <div className="text-4xl mb-4">{module.icon}</div>
                  <h3 className="text-xl font-bold mb-2">{module.name}</h3>
                  <p className="text-gray-600 mb-4">{module.description}</p>
                  <Button
                    onClick={() => setActiveModule(module.id)}
                    className="w-full"
                  >
                    Open Module
                  </Button>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          <div>
            <Button
              variant="outline"
              onClick={() => setActiveModule(null)}
              className="mb-6"
            >
              ← Back to Dashboard
            </Button>

            {activeModule === "linkedin-ghost" && <LinkedInGhost />}
            {activeModule === "recruit-audit" && <RecruitAudit />}
            {activeModule === "realestate-clip" && <RealEstateClip />}
          </div>
        )}
      </main>
    </div>
  );
};
