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

  const handleAnalyze = async (
    input: MarketMapperInput
  ): Promise<MarketMapperOutput> => {
    const result = await onAnalyze(input);

    if (input.analysisMode === "analysis") {
      setResults(result);
      setShowResults(true);
    }

    return result;
  };

  const handleEdit = () => {
    setShowResults(false);
    setResults(null);
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
    <MarketMapperInterface onAnalyze={handleAnalyze} isLoading={isLoading} />
  );
}
