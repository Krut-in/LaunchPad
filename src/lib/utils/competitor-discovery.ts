import { z } from 'zod'

export interface CompetitorDiscoveryConfig {
  maxCompetitors: number
  includeIndirect: boolean
  includeSubstitutes: boolean
  geographicScope: 'global' | 'regional' | 'local'
  fundingStageFilter: string[]
  companySizeFilter: string[]
}

export interface DiscoveredCompetitor {
  name: string
  website: string
  description: string
  category: 'direct' | 'indirect' | 'substitute'
  similarity: number // 0-1 score
  fundingInfo: {
    totalFunding: string
    lastRound: string
    lastRoundAmount: string
    investors: string[]
    stage: string
  }
  companyInfo: {
    founded: number
    employees: string
    headquarters: string
    industry: string
    businessModel: string
  }
  productInfo: {
    mainProduct: string
    keyFeatures: string[]
    targetMarket: string[]
    pricingModel: string
  }
  marketPresence: {
    marketShare: number
    customerBase: string
    geographicPresence: string[]
    partnerships: string[]
  }
  digitalFootprint: {
    website: string
    socialMedia: Record<string, string>
    appStorePresence: boolean
    seoKeywords: string[]
  }
  recentActivity: {
    news: string[]
    productUpdates: string[]
    hiring: boolean
    expansion: string[]
  }
  competitiveIntelligence: {
    strengths: string[]
    weaknesses: string[]
    opportunities: string[]
    threats: string[]
    differentiators: string[]
  }
  discoverySource: string
  confidence: number
  lastUpdated: Date
}

export interface CompetitiveLandscape {
  totalCompetitors: number
  directCompetitors: DiscoveredCompetitor[]
  indirectCompetitors: DiscoveredCompetitor[]
  substituteCompetitors: DiscoveredCompetitor[]
  marketConcentration: 'fragmented' | 'moderate' | 'concentrated'
  competitiveIntensity: 'low' | 'medium' | 'high' | 'very_high'
  barrierToEntry: 'low' | 'medium' | 'high'
  keySuccessFactors: string[]
  whitespaceOpportunities: Array<{
    opportunity: string
    description: string
    marketSize: string
    difficulty: 'low' | 'medium' | 'high'
    timeToMarket: string
  }>
  competitiveMatrix: Array<{
    competitor: string
    features: Record<string, boolean>
    score: number
  }>
}

export class CompetitorDiscoveryService {
  private config: CompetitorDiscoveryConfig
  private cache: Map<string, { data: any; expiry: number }> = new Map()

  constructor(config: Partial<CompetitorDiscoveryConfig> = {}) {
    this.config = {
      maxCompetitors: 15,
      includeIndirect: true,
      includeSubstitutes: true,
      geographicScope: 'global',
      fundingStageFilter: [],
      companySizeFilter: [],
      ...config,
    }
  }

  async discoverCompetitors(
    businessIdea: string,
    industry: string,
    keywords: string[] = []
  ): Promise<CompetitiveLandscape> {
    try {
      const cacheKey = `competitors-${this.hashString(businessIdea + industry + keywords.join(''))}`
      let landscape = this.getCachedData(cacheKey)

      if (!landscape) {
        landscape = await this.performCompetitorDiscovery(businessIdea, industry, keywords)
        this.setCachedData(cacheKey, landscape, 24 * 60 * 60 * 1000) // 24 hours
      }

      return landscape
    } catch (error) {
      console.error('Competitor discovery failed:', error)
      return this.getEmptyLandscape()
    }
  }

  async findSimilarCompanies(
    companyDescription: string,
    targetMarket: string,
    limit: number = 10
  ): Promise<DiscoveredCompetitor[]> {
    try {
      const cacheKey = `similar-${this.hashString(companyDescription + targetMarket)}`
      let competitors = this.getCachedData(cacheKey)

      if (!competitors) {
        competitors = await this.performSimilaritySearch(companyDescription, targetMarket, limit)
        this.setCachedData(cacheKey, competitors, 12 * 60 * 60 * 1000) // 12 hours
      }

      return competitors
    } catch (error) {
      console.error('Similar company search failed:', error)
      return []
    }
  }

  async analyzeCompetitiveGaps(
    competitors: DiscoveredCompetitor[],
    targetFeatures: string[]
  ): Promise<{
    gaps: Array<{
      feature: string
      coverage: number // % of competitors offering this
      opportunity: 'high' | 'medium' | 'low'
      complexity: 'low' | 'medium' | 'high'
      marketDemand: number
    }>
    recommendations: Array<{
      feature: string
      rationale: string
      priority: 'critical' | 'high' | 'medium' | 'low'
      effort: 'low' | 'medium' | 'high'
      impact: 'low' | 'medium' | 'high'
    }>
  }> {
    const gaps = []
    const recommendations = []

    for (const feature of targetFeatures) {
      const coverage = this.calculateFeatureCoverage(competitors, feature)
      const opportunity: 'high' | 'medium' | 'low' = coverage < 0.3 ? 'high' : coverage < 0.6 ? 'medium' : 'low'
      
      gaps.push({
        feature,
        coverage,
        opportunity,
        complexity: this.estimateComplexity(feature),
        marketDemand: Math.random() * 100, // Simulated market demand
      })

      if (opportunity === 'high') {
        recommendations.push({
          feature,
          rationale: `Only ${Math.round(coverage * 100)}% of competitors offer this feature, presenting a significant opportunity`,
          priority: 'high' as const,
          effort: this.estimateComplexity(feature),
          impact: 'high' as const,
        })
      }
    }

    return { gaps, recommendations }
  }

  async generateCompetitiveMatrix(
    competitors: DiscoveredCompetitor[],
    features: string[]
  ): Promise<{
    matrix: Array<{
      competitor: string
      features: Record<string, boolean>
      score: number
    }>
    insights: string[]
    positioning: Array<{
      competitor: string
      position: { x: number; y: number }
      quadrant: 'leader' | 'challenger' | 'visionary' | 'niche'
    }>
  }> {
    const matrix = competitors.map(competitor => {
      const competitorFeatures: Record<string, boolean> = {}
      let score = 0

      for (const feature of features) {
        const hasFeature = this.checkCompetitorFeature(competitor, feature)
        competitorFeatures[feature] = hasFeature
        if (hasFeature) score += 1
      }

      return {
        competitor: competitor.name,
        features: competitorFeatures as Record<string, boolean>,
        score: score / features.length,
      }
    })

    const insights = this.generateMatrixInsights(matrix, features)
    const positioning = this.generatePositioning(competitors)

    return { matrix, insights, positioning }
  }

  private async performCompetitorDiscovery(
    businessIdea: string,
    industry: string,
    keywords: string[]
  ): Promise<CompetitiveLandscape> {
    // Simulate discovery process
    await new Promise(resolve => setTimeout(resolve, 1000))

    const directCompetitors = await this.generateMockCompetitors('direct', 5, industry)
    const indirectCompetitors = this.config.includeIndirect 
      ? await this.generateMockCompetitors('indirect', 4, industry)
      : []
    const substituteCompetitors = this.config.includeSubstitutes
      ? await this.generateMockCompetitors('substitute', 3, industry)
      : []

    const totalCompetitors = directCompetitors.length + indirectCompetitors.length + substituteCompetitors.length

    // Analyze market structure
    const marketConcentration = this.analyzeMarketConcentration(directCompetitors)
    const competitiveIntensity = this.analyzeCompetitiveIntensity(totalCompetitors, industry)
    const barrierToEntry = this.analyzeBarriersToEntry(directCompetitors)

    // Generate whitespace opportunities
    const whitespaceOpportunities = this.identifyWhitespaceOpportunities(
      [...directCompetitors, ...indirectCompetitors],
      businessIdea
    )

    // Create competitive matrix
    const features = ['AI Integration', 'Mobile App', 'API Access', 'Analytics', 'Integrations']
    const competitiveMatrix = await this.generateCompetitiveMatrix(
      [...directCompetitors, ...indirectCompetitors],
      features
    )

    return {
      totalCompetitors,
      directCompetitors,
      indirectCompetitors,
      substituteCompetitors,
      marketConcentration,
      competitiveIntensity,
      barrierToEntry,
      keySuccessFactors: this.identifyKeySuccessFactors(directCompetitors),
      whitespaceOpportunities,
      competitiveMatrix: competitiveMatrix.matrix,
    }
  }

  private async performSimilaritySearch(
    companyDescription: string,
    targetMarket: string,
    limit: number
  ): Promise<DiscoveredCompetitor[]> {
    // Simulate similarity search
    await new Promise(resolve => setTimeout(resolve, 500))
    
    return await this.generateMockCompetitors('direct', limit, targetMarket)
  }

  private async generateMockCompetitors(
    category: 'direct' | 'indirect' | 'substitute',
    count: number,
    industry: string
  ): Promise<DiscoveredCompetitor[]> {
    const competitors: DiscoveredCompetitor[] = []

    const companyNames = [
      'TechFlow', 'DataSync', 'CloudCore', 'InnovateLab', 'SmartSolutions',
      'NextGen', 'ProActive', 'StreamLine', 'OptimalAI', 'FlexiTech'
    ]

    const businessModels = ['SaaS', 'Marketplace', 'Freemium', 'Enterprise', 'API-first']
    const fundingStages = ['Pre-seed', 'Seed', 'Series A', 'Series B', 'Series C', 'IPO']

    for (let i = 0; i < count; i++) {
      const name = companyNames[i % companyNames.length]
      const similarity = category === 'direct' ? 0.7 + Math.random() * 0.3 :
                        category === 'indirect' ? 0.4 + Math.random() * 0.3 :
                        0.2 + Math.random() * 0.3

      competitors.push({
        name,
        website: `https://${name.toLowerCase()}.com`,
        description: `${category === 'direct' ? 'Leading' : 'Alternative'} ${industry} solution provider`,
        category,
        similarity,
        fundingInfo: {
          totalFunding: `$${Math.floor(Math.random() * 100)}M`,
          lastRound: fundingStages[Math.floor(Math.random() * fundingStages.length)],
          lastRoundAmount: `$${Math.floor(Math.random() * 50)}M`,
          investors: ['Accel Partners', 'Sequoia Capital', 'Andreessen Horowitz'].slice(0, Math.floor(Math.random() * 3) + 1),
          stage: fundingStages[Math.floor(Math.random() * fundingStages.length)],
        },
        companyInfo: {
          founded: 2015 + Math.floor(Math.random() * 8),
          employees: `${Math.floor(Math.random() * 500) + 10}-${Math.floor(Math.random() * 500) + 500}`,
          headquarters: ['San Francisco', 'New York', 'London', 'Berlin', 'Tel Aviv'][Math.floor(Math.random() * 5)],
          industry,
          businessModel: businessModels[Math.floor(Math.random() * businessModels.length)],
        },
        productInfo: {
          mainProduct: `${name} Platform`,
          keyFeatures: [
            'Advanced Analytics',
            'Real-time Processing',
            'API Integration',
            'Mobile App',
            'Custom Dashboards'
          ].slice(0, Math.floor(Math.random() * 3) + 2),
          targetMarket: ['SMB', 'Enterprise', 'Mid-market'],
          pricingModel: 'Subscription-based with multiple tiers',
        },
        marketPresence: {
          marketShare: Math.random() * 20,
          customerBase: `${Math.floor(Math.random() * 10000) + 1000}+ customers`,
          geographicPresence: ['North America', 'Europe', 'Asia-Pacific'].slice(0, Math.floor(Math.random() * 3) + 1),
          partnerships: ['Microsoft', 'Salesforce', 'Google'].slice(0, Math.floor(Math.random() * 2) + 1),
        },
        digitalFootprint: {
          website: `https://${name.toLowerCase()}.com`,
          socialMedia: {
            linkedin: `https://linkedin.com/company/${name.toLowerCase()}`,
            twitter: `https://twitter.com/${name.toLowerCase()}`,
          },
          appStorePresence: Math.random() > 0.5,
          seoKeywords: [industry, 'software', 'platform', 'solution'],
        },
        recentActivity: {
          news: [`${name} raises funding`, `${name} launches new features`],
          productUpdates: ['AI integration', 'Mobile app update'],
          hiring: Math.random() > 0.5,
          expansion: ['European market', 'Asia-Pacific region'].slice(0, Math.floor(Math.random() * 2)),
        },
        competitiveIntelligence: {
          strengths: ['Strong product', 'Good customer support', 'Market presence'],
          weaknesses: ['High pricing', 'Limited integrations', 'Complex setup'],
          opportunities: ['Market expansion', 'New features', 'Partnerships'],
          threats: ['New competitors', 'Market saturation', 'Economic downturn'],
          differentiators: ['AI-powered', 'User-friendly', 'Scalable'],
        },
        discoverySource: 'Market Research Database',
        confidence: 0.8 + Math.random() * 0.2,
        lastUpdated: new Date(),
      })
    }

    return competitors
  }

  private calculateFeatureCoverage(competitors: DiscoveredCompetitor[], feature: string): number {
    const competitorsWithFeature = competitors.filter(c => 
      c.productInfo.keyFeatures.some(f => 
        f.toLowerCase().includes(feature.toLowerCase())
      )
    ).length
    
    return competitorsWithFeature / competitors.length
  }

  private estimateComplexity(feature: string): 'low' | 'medium' | 'high' {
    const complexFeatures = ['ai', 'machine learning', 'blockchain', 'real-time', 'analytics']
    const mediumFeatures = ['api', 'integration', 'mobile', 'dashboard', 'reporting']
    
    const featureLower = feature.toLowerCase()
    if (complexFeatures.some(cf => featureLower.includes(cf))) return 'high'
    if (mediumFeatures.some(mf => featureLower.includes(mf))) return 'medium'
    return 'low'
  }

  private checkCompetitorFeature(competitor: DiscoveredCompetitor, feature: string): boolean {
    return competitor.productInfo.keyFeatures.some(f => 
      f.toLowerCase().includes(feature.toLowerCase())
    )
  }

  private analyzeMarketConcentration(competitors: DiscoveredCompetitor[]): 'fragmented' | 'moderate' | 'concentrated' {
    const totalMarketShare = competitors.reduce((sum, c) => sum + c.marketPresence.marketShare, 0)
    const topThreeShare = competitors
      .sort((a, b) => b.marketPresence.marketShare - a.marketPresence.marketShare)
      .slice(0, 3)
      .reduce((sum, c) => sum + c.marketPresence.marketShare, 0)
    
    const concentration = topThreeShare / totalMarketShare
    
    if (concentration > 0.7) return 'concentrated'
    if (concentration > 0.4) return 'moderate'
    return 'fragmented'
  }

  private analyzeCompetitiveIntensity(totalCompetitors: number, industry: string): 'low' | 'medium' | 'high' | 'very_high' {
    // Simple heuristic based on number of competitors
    if (totalCompetitors > 15) return 'very_high'
    if (totalCompetitors > 10) return 'high'
    if (totalCompetitors > 5) return 'medium'
    return 'low'
  }

  private analyzeBarriersToEntry(competitors: DiscoveredCompetitor[]): 'low' | 'medium' | 'high' {
    const avgFunding = competitors.reduce((sum, c) => {
      const funding = parseFloat(c.fundingInfo.totalFunding.replace(/[$M]/g, ''))
      return sum + (isNaN(funding) ? 0 : funding)
    }, 0) / competitors.length

    if (avgFunding > 50) return 'high'
    if (avgFunding > 20) return 'medium'
    return 'low'
  }

  private identifyKeySuccessFactors(competitors: DiscoveredCompetitor[]): string[] {
    const factors = new Set<string>()
    
    competitors.forEach(c => {
      c.competitiveIntelligence.strengths.forEach(s => factors.add(s))
      c.competitiveIntelligence.differentiators.forEach(d => factors.add(d))
    })
    
    return Array.from(factors).slice(0, 5)
  }

  private identifyWhitespaceOpportunities(
    competitors: DiscoveredCompetitor[],
    businessIdea: string
  ): Array<{
    opportunity: string
    description: string
    marketSize: string
    difficulty: 'low' | 'medium' | 'high'
    timeToMarket: string
  }> {
    return [
      {
        opportunity: 'AI-First Approach',
        description: 'Most competitors lack comprehensive AI integration',
        marketSize: '$500M+',
        difficulty: 'high',
        timeToMarket: '12-18 months',
      },
      {
        opportunity: 'SMB Focus',
        description: 'Gap in solutions designed specifically for small businesses',
        marketSize: '$200M+',
        difficulty: 'medium',
        timeToMarket: '6-12 months',
      },
      {
        opportunity: 'Mobile-First Design',
        description: 'Limited mobile optimization among competitors',
        marketSize: '$300M+',
        difficulty: 'low',
        timeToMarket: '3-6 months',
      },
    ]
  }

  private generateMatrixInsights(
    matrix: Array<{ competitor: string; features: Record<string, boolean>; score: number }>,
    features: string[]
  ): string[] {
    const insights = []
    
    // Find feature gaps
    for (const feature of features) {
      const coverage = matrix.filter(m => m.features[feature]).length / matrix.length
      if (coverage < 0.5) {
        insights.push(`${feature} is underrepresented in the market (${Math.round(coverage * 100)}% coverage)`)
      }
    }
    
    // Find leaders
    const leader = matrix.reduce((max, current) => 
      current.score > max.score ? current : max
    )
    insights.push(`${leader.competitor} leads in feature completeness with ${Math.round(leader.score * 100)}% coverage`)
    
    return insights
  }

  private generatePositioning(competitors: DiscoveredCompetitor[]): Array<{
    competitor: string
    position: { x: number; y: number }
    quadrant: 'leader' | 'challenger' | 'visionary' | 'niche'
  }> {
    return competitors.map(c => {
      const x = Math.random() // Market execution
      const y = Math.random() // Vision completeness
      
      let quadrant: 'leader' | 'challenger' | 'visionary' | 'niche'
      if (x > 0.5 && y > 0.5) quadrant = 'leader'
      else if (x > 0.5) quadrant = 'challenger'
      else if (y > 0.5) quadrant = 'visionary'
      else quadrant = 'niche'
      
      return {
        competitor: c.name,
        position: { x, y },
        quadrant,
      }
    })
  }

  private getEmptyLandscape(): CompetitiveLandscape {
    return {
      totalCompetitors: 0,
      directCompetitors: [],
      indirectCompetitors: [],
      substituteCompetitors: [],
      marketConcentration: 'fragmented',
      competitiveIntensity: 'low',
      barrierToEntry: 'low',
      keySuccessFactors: [],
      whitespaceOpportunities: [],
      competitiveMatrix: [],
    }
  }

  private getCachedData(key: string): any {
    const cached = this.cache.get(key)
    if (cached && cached.expiry > Date.now()) {
      return cached.data
    }
    this.cache.delete(key)
    return null
  }

  private setCachedData(key: string, data: any, ttl: number): void {
    this.cache.set(key, {
      data,
      expiry: Date.now() + ttl,
    })
  }

  private hashString(str: string): string {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32bit integer
    }
    return Math.abs(hash).toString(36)
  }
}
