'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MarketMapperOutput } from '@/types'
import { formatCurrency, formatNumber } from '@/lib/utils'
import { TrendingUp, Target, AlertTriangle, Lightbulb } from 'lucide-react'

interface MarketMapperResultsProps {
  results: MarketMapperOutput
}

export function MarketMapperResults({ results }: MarketMapperResultsProps) {
  const getImpactColor = (impact: 'high' | 'medium' | 'low') => {
    switch (impact) {
      case 'high': return 'bg-red-100 text-red-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
    }
  }

  const getPotentialColor = (potential: 'high' | 'medium' | 'low') => {
    switch (potential) {
      case 'high': return 'bg-green-100 text-green-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-red-100 text-red-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Market Size */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Market Size Analysis
          </CardTitle>
          <CardDescription>
            Total addressable market breakdown
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {formatCurrency(results.marketSize.tam)}
              </div>
              <div className="text-sm text-blue-600 font-medium">TAM</div>
              <div className="text-xs text-gray-600">Total Addressable Market</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(results.marketSize.sam)}
              </div>
              <div className="text-sm text-green-600 font-medium">SAM</div>
              <div className="text-xs text-gray-600">Serviceable Addressable Market</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {formatCurrency(results.marketSize.som)}
              </div>
              <div className="text-sm text-purple-600 font-medium">SOM</div>
              <div className="text-xs text-gray-600">Serviceable Obtainable Market</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Market Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Market Trends
          </CardTitle>
          <CardDescription>
            Current trends affecting your market
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {results.trends.map((trend, index) => (
              <div key={index} className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium">{trend.trend}</h4>
                  <p className="text-sm text-gray-600 mt-1">{trend.timeframe}</p>
                </div>
                <Badge className={getImpactColor(trend.impact)}>
                  {trend.impact} impact
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Opportunities */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Market Opportunities
          </CardTitle>
          <CardDescription>
            Potential opportunities for your business
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {results.opportunities.map((opportunity, index) => (
              <div key={index} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium flex-1">{opportunity.opportunity}</h4>
                  <div className="flex gap-2">
                    <Badge className={getPotentialColor(opportunity.potential)}>
                      {opportunity.potential} potential
                    </Badge>
                    <Badge variant="outline">
                      {opportunity.difficulty} difficulty
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Threats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Market Threats
          </CardTitle>
          <CardDescription>
            Potential risks and challenges in the market
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {results.threats.map((threat, index) => (
              <div key={index} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium flex-1">{threat.threat}</h4>
                  <div className="flex gap-2">
                    <Badge className={getImpactColor(threat.severity)}>
                      {threat.severity} severity
                    </Badge>
                    <Badge variant="outline">
                      {threat.likelihood} likelihood
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
