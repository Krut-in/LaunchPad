'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { MarketMapperInput, MarketMapperOutput } from '@/lib/agents/market-mapper'
import { CheckCircle, Circle, ArrowRight, RotateCcw, FileText } from 'lucide-react'

interface Question {
  id: string
  question: string
  type: 'target_customer' | 'problem_definition' | 'business_model' | 'differentiation' | 'market_scope'
  required: boolean
  answered?: boolean
}

interface MarketMapperInterfaceProps {
  onAnalyze: (input: MarketMapperInput) => Promise<MarketMapperOutput>
  isLoading?: boolean
}

export function MarketMapperInterface({ onAnalyze, isLoading = false }: MarketMapperInterfaceProps) {
  const [businessIdea, setBusinessIdea] = useState('')
  const [industry, setIndustry] = useState('')
  const [targetMarket, setTargetMarket] = useState('')
  const [currentStep, setCurrentStep] = useState<'idea' | 'questions' | 'analysis'>('idea')
  const [questions, setQuestions] = useState<Question[]>([])
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [analysisResults, setAnalysisResults] = useState<MarketMapperOutput | null>(null)

  const handleIdeaSubmit = async () => {
    if (!businessIdea.trim()) return

    try {
      const input: MarketMapperInput = {
        businessIdea,
        industry: industry || undefined,
        targetMarket: targetMarket || undefined,
        analysisMode: 'questions',
      }

      const result = await onAnalyze(input)
      if (result.questions) {
        setQuestions(result.questions.map(q => ({ ...q, answered: false })))
        setCurrentStep('questions')
      }
    } catch (error) {
      console.error('Error generating questions:', error)
    }
  }

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }))
    
    // Mark question as answered
    setQuestions(prev => 
      prev.map(q => 
        q.id === questionId 
          ? { ...q, answered: answer.trim().length > 0 }
          : q
      )
    )
  }

  const handleAnalyze = async () => {
    try {
      const input: MarketMapperInput = {
        businessIdea,
        industry: industry || undefined,
        targetMarket: targetMarket || undefined,
        answers,
        analysisMode: 'analysis',
      }

      const result = await onAnalyze(input)
      setAnalysisResults(result)
      setCurrentStep('analysis')
    } catch (error) {
      console.error('Error performing analysis:', error)
    }
  }

  const getProgress = () => {
    const totalQuestions = questions.length
    const answeredQuestions = questions.filter(q => q.answered).length
    return totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0
  }

  const canProceedToAnalysis = () => {
    const requiredQuestions = questions.filter(q => q.required)
    const answeredRequired = requiredQuestions.filter(q => q.answered)
    return answeredRequired.length === requiredQuestions.length
  }

  const resetFlow = () => {
    setCurrentStep('idea')
    setQuestions([])
    setAnswers({})
    setAnalysisResults(null)
  }

  if (currentStep === 'idea') {
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
          <div>
            <label htmlFor="businessIdea" className="block text-sm font-medium mb-2">
              Business Idea *
            </label>
            <Textarea
              id="businessIdea"
              placeholder="Describe your business idea in detail. What problem does it solve? Who are your customers? What's your unique approach?"
              value={businessIdea}
              onChange={(e) => setBusinessIdea(e.target.value)}
              rows={4}
              className="w-full"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="industry" className="block text-sm font-medium mb-2">
                Industry (Optional)
              </label>
              <Input
                id="industry"
                placeholder="e.g., SaaS, E-commerce, FinTech"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="targetMarket" className="block text-sm font-medium mb-2">
                Target Market (Optional)
              </label>
              <Input
                id="targetMarket"
                placeholder="e.g., Small businesses, Consumers"
                value={targetMarket}
                onChange={(e) => setTargetMarket(e.target.value)}
              />
            </div>
          </div>

          <Button 
            onClick={handleIdeaSubmit} 
            disabled={!businessIdea.trim() || isLoading}
            className="w-full"
          >
            {isLoading ? 'Analyzing...' : 'Generate Clarification Questions'}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (currentStep === 'questions') {
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
                <span>Progress: {questions.filter(q => q.answered).length} of {questions.length} answered</span>
                <span>{Math.round(getProgress())}% complete</span>
              </div>
              <Progress value={getProgress()} className="w-full" />
            </div>
          </CardHeader>
        </Card>

        <div className="space-y-4">
          {questions.map((question, index) => (
            <Card key={question.id} className={`transition-all ${question.answered ? 'border-green-200 bg-green-50/30' : ''}`}>
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
                      <span className="text-sm font-medium text-gray-500">Question {index + 1}</span>
                      {question.required && (
                        <Badge variant="secondary" className="text-xs">Required</Badge>
                      )}
                      <Badge variant="outline" className="text-xs capitalize">
                        {question.type.replace('_', ' ')}
                      </Badge>
                    </div>
                    <h3 className="font-medium text-gray-900 mb-3">{question.question}</h3>
                    <Textarea
                      placeholder="Enter your answer here..."
                      value={answers[question.id] || ''}
                      onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                      rows={3}
                      className="w-full"
                    />
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                {canProceedToAnalysis() ? (
                  <span className="text-green-600 font-medium">✓ Ready for analysis</span>
                ) : (
                  <span>Please answer all required questions to proceed</span>
                )}
              </div>
              <Button 
                onClick={handleAnalyze}
                disabled={!canProceedToAnalysis() || isLoading}
                size="lg"
              >
                {isLoading ? 'Analyzing Market...' : 'Generate Market Analysis'}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Analysis results view will be implemented in the results component
  return null
}
