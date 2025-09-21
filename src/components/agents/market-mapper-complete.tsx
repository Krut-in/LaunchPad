"use client";

import { useState } from "react";
import { MarketMapperInterface } from "./market-mapper-interface";
import { MarketMapperResults } from "./market-mapper-results";
import {
  MarketMapperInput,
  MarketMapperOutput,
} from "@/lib/agents/market-mapper";

interface MarketMapperCompleteProps {
  onAnalyze: (input: MarketMapperInput) => Promise<MarketMapperOutput>;
  isLoading?: boolean;
}

export function MarketMapperComplete({
  onAnalyze,
  isLoading = false,
}: MarketMapperCompleteProps) {
  const [results, setResults] = useState<MarketMapperOutput | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [savedFormData, setSavedFormData] = useState<{
    businessIdea: string;
    industry?: string;
    targetMarket?: string;
    questions: any[];
    answers: Record<string, string>;
  } | null>(null);

  const handleAnalyze = async (
    input: MarketMapperInput
  ): Promise<MarketMapperOutput> => {
    const result = await onAnalyze(input);

    // Save form data when we get questions or do analysis
    if (input.processingMode === "questions" && result.questions) {
      setSavedFormData({
        businessIdea: input.businessIdea,
        industry: input.industry,
        targetMarket: input.targetMarket,
        questions: result.questions,
        answers: {},
      });
    } else if (
      input.processingMode === "deep_analysis" ||
      input.processingMode === "discovery"
    ) {
      // Update saved form data with answers
      setSavedFormData(prev =>
        prev
          ? {
              ...prev,
              answers: input.answers || {},
            }
          : null
      );

      setResults(result);
      setShowResults(true);
    }

    return result;
  };

  const handleEdit = () => {
    // Go back to questions step, not the main business idea step
    setShowResults(false);
    // Keep results and savedFormData so user can return to questions
  };

  const handleRegenerate = async () => {
    // This would regenerate the analysis with the same inputs
    // For now, we'll just hide results and let user restart
    setShowResults(false);
    setResults(null);
  };

  if (showResults && results) {
    return (
      <MarketMapperResults
        results={results}
        onEdit={handleEdit}
        onRegenerate={handleRegenerate}
      />
    );
  }

  return (
    <MarketMapperInterface
      onAnalyze={handleAnalyze}
      isLoading={isLoading}
      savedFormData={savedFormData}
    />
  );
}
