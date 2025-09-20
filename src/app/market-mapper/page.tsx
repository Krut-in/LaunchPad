"use client";

import { useState } from "react";
import { MarketMapperComplete } from "@/components/agents/market-mapper-complete";
import {
  MarketMapperInput,
  MarketMapperOutput,
} from "@/lib/agents/market-mapper";
import { AgentType } from "@/types";

export default function MarketMapperPage() {
  const [isLoading, setIsLoading] = useState(false);

  const handleAnalyze = async (
    input: MarketMapperInput
  ): Promise<MarketMapperOutput> => {
    setIsLoading(true);

    try {
      const response = await fetch("/api/agents/market-mapper", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(input),
      });

       const result = await response.json();
       
       if (!response.ok) {
         const errorMessage = result.error || "Failed to analyze market";
         throw new Error(errorMessage);
       }

       return result.data;
    } catch (error) {
      console.error("Market analysis error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Market Mapper
              </h1>
              <p className="text-gray-600 mt-1">
                Intelligent market analysis with dynamic questioning and
                comprehensive insights
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <MarketMapperComplete onAnalyze={handleAnalyze} isLoading={isLoading} />
      </div>
    </div>
  );
}
