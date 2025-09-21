"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  MarketMapperInput,
  MarketMapperOutput,
} from "@/lib/agents/market-mapper";
import {
  CheckCircle,
  Circle,
  ArrowRight,
  RotateCcw,
  FileText,
  AlertCircle,
} from "lucide-react";

interface Question {
  id: string;
  question: string;
  type:
    | "target_customer"
    | "problem_definition"
    | "business_model"
    | "differentiation"
    | "market_scope"
    | "competitive_landscape"
    | "validation"
    | "strategy";
  priority: "critical" | "high" | "medium" | "low";
  required: boolean;
  context?: string;
  followUpQuestions?: string[];
  industrySpecific: boolean;
  answered?: boolean;
}

interface MarketMapperInterfaceProps {
  onAnalyze: (input: MarketMapperInput) => Promise<MarketMapperOutput>;
  isLoading?: boolean;
  savedFormData?: {
    businessIdea: string;
    industry?: string;
    targetMarket?: string;
    questions: any[];
    answers: Record<string, string>;
  } | null;
}

export function MarketMapperInterface({
  onAnalyze,
  isLoading = false,
  savedFormData,
}: MarketMapperInterfaceProps) {
  const [businessIdea, setBusinessIdea] = useState(
    savedFormData?.businessIdea || ""
  );
  const [industry, setIndustry] = useState(savedFormData?.industry || "");
  const [targetMarket, setTargetMarket] = useState(
    savedFormData?.targetMarket || ""
  );
  const [currentStep, setCurrentStep] = useState<
    "idea" | "questions" | "analysis"
  >(savedFormData?.questions ? "questions" : "idea");
  const [questions, setQuestions] = useState<Question[]>(
    savedFormData?.questions?.map(q => ({
      ...q,
      answered: !!savedFormData.answers[q.id],
    })) || []
  );
  const [answers, setAnswers] = useState<Record<string, string>>(
    savedFormData?.answers || {}
  );
  const [analysisResults, setAnalysisResults] =
    useState<MarketMapperOutput | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleIdeaSubmit = async () => {
    if (!businessIdea.trim()) return;

    if (businessIdea.trim().length < 10) {
      setError("Business idea must be at least 10 characters");
      return;
    }

    setError(null);
    try {
      const input: MarketMapperInput = {
        businessIdea,
        industry: industry || undefined,
        targetMarket: targetMarket || undefined,
        processingMode: "questions",
        researchDepth: "basic",
        competitorLimit: 10,
        includeWebResearch: true,
        includeSentimentAnalysis: true,
      };

      const result = await onAnalyze(input);
      if (result.questions) {
        setQuestions(result.questions.map(q => ({ ...q, answered: false })));
        setCurrentStep("questions");
      }
    } catch (error) {
      console.error("Error generating questions:", error);
      setError(
        error instanceof Error ? error.message : "Failed to generate questions"
      );
    }
  };

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));

    // Mark question as answered
    setQuestions(prev =>
      prev.map(q =>
        q.id === questionId ? { ...q, answered: answer.trim().length > 0 } : q
      )
    );
  };

  const handleAnalyze = async () => {
    setError(null);
    try {
      const input: MarketMapperInput = {
        businessIdea,
        industry: industry || undefined,
        targetMarket: targetMarket || undefined,
        answers,
        processingMode: "deep_analysis",
        researchDepth: "comprehensive",
        competitorLimit: 10,
        includeWebResearch: true,
        includeSentimentAnalysis: true,
      };

      const result = await onAnalyze(input);
      setAnalysisResults(result);
      setCurrentStep("analysis");
    } catch (error) {
      console.error("Error performing analysis:", error);
      setError(
        error instanceof Error ? error.message : "Failed to perform analysis"
      );
    }
  };

  const getProgress = () => {
    const totalQuestions = questions.length;
    const answeredQuestions = questions.filter(q => q.answered).length;
    return totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0;
  };

  const canProceedToAnalysis = () => {
    const requiredQuestions = questions.filter(q => q.required);
    const answeredRequired = requiredQuestions.filter(q => q.answered);
    return answeredRequired.length === requiredQuestions.length;
  };

  const resetFlow = () => {
    setCurrentStep("idea");
    setQuestions([]);
    setAnswers({});
    setAnalysisResults(null);
    setError(null);
  };

  if (currentStep === "idea") {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            Market Mapper - Business Idea
          </CardTitle>
          <CardDescription>
            Describe your startup idea to begin comprehensive market analysis
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div>
            <label
              htmlFor="businessIdea"
              className="block text-sm font-medium mb-2"
            >
              Business Idea *
            </label>
            <Textarea
              id="businessIdea"
              placeholder="Describe your business idea in detail. What problem does it solve? Who are your customers? What's your unique approach?"
              value={businessIdea}
              onChange={e => setBusinessIdea(e.target.value)}
              rows={4}
              className="w-full"
            />
            <div className="flex justify-between items-center mt-1">
              <div
                className={`text-xs ${
                  businessIdea.length < 10 ? "text-red-500" : "text-gray-500"
                }`}
              >
                {businessIdea.length < 10
                  ? `${10 - businessIdea.length} more characters needed`
                  : `${businessIdea.length} characters`}
              </div>
              <div className="text-xs text-gray-400">Minimum 10 characters</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="industry"
                className="block text-sm font-medium mb-2"
              >
                Industry (Optional)
              </label>
              <Input
                id="industry"
                placeholder="e.g., SaaS, E-commerce, FinTech"
                value={industry}
                onChange={e => setIndustry(e.target.value)}
              />
            </div>

            <div>
              <label
                htmlFor="targetMarket"
                className="block text-sm font-medium mb-2"
              >
                Target Market (Optional)
              </label>
              <Input
                id="targetMarket"
                placeholder="e.g., Small businesses, Consumers"
                value={targetMarket}
                onChange={e => setTargetMarket(e.target.value)}
              />
            </div>
          </div>

          <Button
            onClick={handleIdeaSubmit}
            disabled={
              !businessIdea.trim() ||
              businessIdea.trim().length < 10 ||
              isLoading
            }
            className="w-full"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                AI is analyzing your idea...
              </>
            ) : (
              <>
                Generate Clarification Questions
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>

          {isLoading && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-3">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                <div className="text-sm text-blue-800">
                  <p className="font-medium">AI Agent is working...</p>
                  <p className="text-blue-600">
                    Generating personalized questions based on your business
                    idea
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  if (currentStep === "questions") {
    return (
      <div className="w-full max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Clarification Questions</CardTitle>
                <CardDescription>
                  Answer these questions to provide deeper market insights
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={resetFlow}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Start Over
              </Button>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>
                  Progress: {questions.filter(q => q.answered).length} of{" "}
                  {questions.length} answered
                </span>
                <span>{Math.round(getProgress())}% complete</span>
              </div>
              <Progress value={getProgress()} className="w-full" />
            </div>
          </CardHeader>
        </Card>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          {questions?.length === 0 ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-center text-gray-500">
                  No questions generated
                </CardTitle>
                <CardDescription className="text-center">
                  Please try again or provide more details about your business
                  idea.
                </CardDescription>
              </CardHeader>
            </Card>
          ) : (
            questions
              ?.filter(q => q && q.id && q.question && q.type)
              ?.map((question, index) => (
                <Card
                  key={question.id}
                  className={`transition-all ${
                    question.answered ? "border-green-200 bg-green-50/30" : ""
                  }`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start gap-3">
                      <div className="mt-1">
                        {question.answered ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <Circle className="h-5 w-5 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm font-medium text-gray-500">
                            Question {index + 1}
                          </span>
                          {question.required && (
                            <Badge variant="secondary" className="text-xs">
                              Required
                            </Badge>
                          )}
                          <Badge
                            variant="outline"
                            className="text-xs capitalize"
                          >
                            {question.type?.replace("_", " ") || "General"}
                          </Badge>
                        </div>
                        <h3 className="font-medium text-gray-900 mb-3">
                          {question.question}
                        </h3>
                        <Textarea
                          placeholder="Enter your answer here..."
                          value={answers[question.id] || ""}
                          onChange={e =>
                            handleAnswerChange(question.id, e.target.value)
                          }
                          rows={3}
                          className="w-full"
                        />
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))
          )}
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                {canProceedToAnalysis() ? (
                  <span className="text-green-600 font-medium">
                    ✓ Ready for analysis
                  </span>
                ) : (
                  <span>Please answer all required questions to proceed</span>
                )}
              </div>
              <Button
                onClick={handleAnalyze}
                disabled={!canProceedToAnalysis() || isLoading}
                size="lg"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    AI is analyzing market...
                  </>
                ) : (
                  <>
                    Generate Market Analysis
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>

            {isLoading && (
              <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-3">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                  <div className="text-sm">
                    <p className="font-medium text-blue-900">
                      Market Mapper AI is working hard...
                    </p>
                    <p className="text-blue-700">
                      Analyzing market trends, competitors, and opportunities
                      based on your responses
                    </p>
                  </div>
                </div>
                <div className="mt-3 space-y-1">
                  <div className="flex items-center gap-2 text-xs text-blue-600">
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                    Processing your business insights
                  </div>
                  <div className="flex items-center gap-2 text-xs text-blue-600">
                    <div
                      className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"
                      style={{ animationDelay: "0.5s" }}
                    ></div>
                    Researching market opportunities
                  </div>
                  <div className="flex items-center gap-2 text-xs text-blue-600">
                    <div
                      className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"
                      style={{ animationDelay: "1s" }}
                    ></div>
                    Generating strategic recommendations
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Analysis results view will be implemented in the results component
  return null;
}
