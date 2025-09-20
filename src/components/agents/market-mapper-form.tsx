'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { MarketMapperInput } from '@/lib/agents/market-mapper'

const MarketMapperFormSchema = z.object({
  industry: z.string().min(1, 'Industry is required'),
  targetMarket: z.string().min(1, 'Target market is required'),
  businessIdea: z.string().min(10, 'Business idea must be at least 10 characters'),
})

type MarketMapperFormData = z.infer<typeof MarketMapperFormSchema>

interface MarketMapperFormProps {
  onSubmit: (data: MarketMapperInput) => void
  isLoading?: boolean
  initialData?: Partial<MarketMapperInput>
}

export function MarketMapperForm({ 
  onSubmit, 
  isLoading = false,
  initialData 
}: MarketMapperFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<MarketMapperFormData>({
    resolver: zodResolver(MarketMapperFormSchema),
    defaultValues: initialData,
  })

  const handleFormSubmit = (formData: MarketMapperFormData) => {
    const marketMapperInput: MarketMapperInput = {
      businessIdea: formData.businessIdea,
      industry: formData.industry || undefined,
      targetMarket: formData.targetMarket || undefined,
      analysisMode: 'questions' as const,
    }
    onSubmit(marketMapperInput)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Market Mapper Analysis</CardTitle>
        <CardDescription>
          Provide details about your business idea to get comprehensive market insights
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div>
            <label htmlFor="industry" className="block text-sm font-medium mb-2">
              Industry
            </label>
            <Input
              id="industry"
              placeholder="e.g., SaaS, E-commerce, FinTech"
              {...register('industry')}
            />
            {errors.industry && (
              <p className="text-red-500 text-sm mt-1">{errors.industry.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="targetMarket" className="block text-sm font-medium mb-2">
              Target Market
            </label>
            <Input
              id="targetMarket"
              placeholder="e.g., Small businesses, Enterprise clients, Consumers"
              {...register('targetMarket')}
            />
            {errors.targetMarket && (
              <p className="text-red-500 text-sm mt-1">{errors.targetMarket.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="businessIdea" className="block text-sm font-medium mb-2">
              Business Idea
            </label>
            <Textarea
              id="businessIdea"
              placeholder="Describe your business idea in detail. What problem does it solve? Who are your customers? What's your unique value proposition?"
              rows={4}
              {...register('businessIdea')}
            />
            {errors.businessIdea && (
              <p className="text-red-500 text-sm mt-1">{errors.businessIdea.message}</p>
            )}
          </div>

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? 'Analyzing Market...' : 'Start Market Analysis'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
