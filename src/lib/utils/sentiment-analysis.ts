export interface SentimentResult {
  score: number // -1 (very negative) to 1 (very positive)
  magnitude: number // 0 to 1 (intensity of sentiment)
  classification: 'very_positive' | 'positive' | 'neutral' | 'negative' | 'very_negative'
  confidence: number
  emotions: {
    joy: number
    anger: number
    fear: number
    sadness: number
    surprise: number
    trust: number
  }
}

export interface PainPointAnalysis {
  painPoint: string
  severity: 'critical' | 'high' | 'medium' | 'low'
  frequency: number
  sentiment: SentimentResult
  keywords: string[]
  context: string
  sources: string[]
  affectedUserTypes: string[]
}

export interface CompetitorSentimentAnalysis {
  competitor: string
  overallSentiment: SentimentResult
  aspectSentiments: {
    product: SentimentResult
    support: SentimentResult
    pricing: SentimentResult
    usability: SentimentResult
    reliability: SentimentResult
  }
  painPoints: PainPointAnalysis[]
  positiveAspects: Array<{
    aspect: string
    sentiment: SentimentResult
    mentions: number
  }>
  trendAnalysis: {
    sentimentTrend: 'improving' | 'declining' | 'stable'
    timeframe: string
    keyEvents: Array<{
      event: string
      date: string
      sentimentImpact: number
    }>
  }
}

export class SentimentAnalysisService {
  private cache: Map<string, { data: any; expiry: number }> = new Map()

  async analyzeSentiment(text: string): Promise<SentimentResult> {
    try {
      const cacheKey = `sentiment-${this.hashString(text)}`
      let result = this.getCachedData(cacheKey)

      if (!result) {
        result = await this.performSentimentAnalysis(text)
        this.setCachedData(cacheKey, result, 60 * 60 * 1000) // 1 hour cache
      }

      return result
    } catch (error) {
      console.error('Sentiment analysis failed:', error)
      return this.getDefaultSentiment()
    }
  }

  async analyzeBulkSentiment(texts: string[]): Promise<SentimentResult[]> {
    const results = await Promise.all(
      texts.map(text => this.analyzeSentiment(text))
    )
    return results
  }

  async analyzeCompetitorSentiment(
    competitor: string,
    reviews: Array<{
      text: string
      rating: number
      aspect?: string
      date: string
      source: string
    }>
  ): Promise<CompetitorSentimentAnalysis> {
    try {
      const cacheKey = `competitor-sentiment-${competitor}`
      let analysis = this.getCachedData(cacheKey)

      if (!analysis) {
        analysis = await this.performCompetitorSentimentAnalysis(competitor, reviews)
        this.setCachedData(cacheKey, analysis, 12 * 60 * 60 * 1000) // 12 hours cache
      }

      return analysis
    } catch (error) {
      console.error('Competitor sentiment analysis failed:', error)
      return this.getDefaultCompetitorAnalysis(competitor)
    }
  }

  async extractPainPoints(
    texts: string[],
    context: string = 'general'
  ): Promise<PainPointAnalysis[]> {
    try {
      const cacheKey = `pain-points-${context}-${this.hashString(texts.join(''))}`
      let painPoints = this.getCachedData(cacheKey)

      if (!painPoints) {
        painPoints = await this.performPainPointExtraction(texts, context)
        this.setCachedData(cacheKey, painPoints, 24 * 60 * 60 * 1000) // 24 hours cache
      }

      return painPoints
    } catch (error) {
      console.error('Pain point extraction failed:', error)
      return []
    }
  }

  async analyzeMarketSentiment(
    industry: string,
    keywords: string[]
  ): Promise<{
    overallSentiment: SentimentResult
    keywordSentiments: Array<{
      keyword: string
      sentiment: SentimentResult
      mentions: number
      trend: 'rising' | 'stable' | 'declining'
    }>
    marketMood: 'optimistic' | 'cautious' | 'pessimistic'
    insights: string[]
  }> {
    try {
      const cacheKey = `market-sentiment-${industry}-${keywords.join('-')}`
      let analysis = this.getCachedData(cacheKey)

      if (!analysis) {
        analysis = await this.performMarketSentimentAnalysis(industry, keywords)
        this.setCachedData(cacheKey, analysis, 6 * 60 * 60 * 1000) // 6 hours cache
      }

      return analysis
    } catch (error) {
      console.error('Market sentiment analysis failed:', error)
      return this.getDefaultMarketSentiment()
    }
  }

  private async performSentimentAnalysis(text: string): Promise<SentimentResult> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 100))

    // Simple sentiment analysis simulation
    // In production, you would use services like Google Cloud Natural Language API,
    // AWS Comprehend, or Azure Text Analytics
    
    const positiveWords = ['good', 'great', 'excellent', 'amazing', 'love', 'perfect', 'awesome', 'fantastic']
    const negativeWords = ['bad', 'terrible', 'awful', 'hate', 'horrible', 'worst', 'disappointing', 'frustrating']
    
    const words = text.toLowerCase().split(/\s+/)
    const positiveCount = words.filter(word => positiveWords.some(pos => word.includes(pos))).length
    const negativeCount = words.filter(word => negativeWords.some(neg => word.includes(neg))).length
    
    const totalWords = words.length
    const score = (positiveCount - negativeCount) / Math.max(totalWords, 1)
    const magnitude = (positiveCount + negativeCount) / Math.max(totalWords, 1)
    
    const normalizedScore = Math.max(-1, Math.min(1, score * 5))
    const normalizedMagnitude = Math.min(1, magnitude * 10)
    
    let classification: SentimentResult['classification']
    if (normalizedScore > 0.6) classification = 'very_positive'
    else if (normalizedScore > 0.2) classification = 'positive'
    else if (normalizedScore > -0.2) classification = 'neutral'
    else if (normalizedScore > -0.6) classification = 'negative'
    else classification = 'very_negative'

    return {
      score: normalizedScore,
      magnitude: normalizedMagnitude,
      classification,
      confidence: 0.7 + Math.random() * 0.2,
      emotions: {
        joy: Math.max(0, normalizedScore * 0.8 + Math.random() * 0.2),
        anger: Math.max(0, -normalizedScore * 0.6 + Math.random() * 0.1),
        fear: Math.random() * 0.3,
        sadness: Math.max(0, -normalizedScore * 0.5 + Math.random() * 0.1),
        surprise: Math.random() * 0.4,
        trust: Math.max(0, normalizedScore * 0.7 + Math.random() * 0.2),
      }
    }
  }

  private async performCompetitorSentimentAnalysis(
    competitor: string,
    reviews: Array<{ text: string; rating: number; aspect?: string; date: string; source: string }>
  ): Promise<CompetitorSentimentAnalysis> {
    // Analyze overall sentiment
    const allTexts = reviews.map(r => r.text)
    const sentiments = await this.analyzeBulkSentiment(allTexts)
    const overallSentiment = this.aggregateSentiments(sentiments)

    // Analyze aspect-based sentiments
    const aspectSentiments = {
      product: this.getDefaultSentiment(),
      support: this.getDefaultSentiment(),
      pricing: this.getDefaultSentiment(),
      usability: this.getDefaultSentiment(),
      reliability: this.getDefaultSentiment(),
    }

    // Extract pain points
    const painPoints = await this.extractPainPoints(allTexts, competitor)

    // Analyze positive aspects
    const positiveReviews = reviews.filter(r => r.rating >= 4)
    const positiveAspects = [
      { aspect: 'User Interface', sentiment: this.getDefaultSentiment(), mentions: positiveReviews.length },
      { aspect: 'Customer Support', sentiment: this.getDefaultSentiment(), mentions: Math.floor(positiveReviews.length * 0.7) },
      { aspect: 'Performance', sentiment: this.getDefaultSentiment(), mentions: Math.floor(positiveReviews.length * 0.8) },
    ]

    // Simulate trend analysis
    const trendAnalysis = {
      sentimentTrend: 'stable' as const,
      timeframe: 'Last 6 months',
      keyEvents: [
        {
          event: 'Product update release',
          date: '2024-01-15',
          sentimentImpact: 0.1,
        }
      ]
    }

    return {
      competitor,
      overallSentiment,
      aspectSentiments,
      painPoints,
      positiveAspects,
      trendAnalysis,
    }
  }

  private async performPainPointExtraction(texts: string[], context: string): Promise<PainPointAnalysis[]> {
    // Simulate pain point extraction
    const commonPainPoints = [
      'Slow performance',
      'Poor customer support',
      'High pricing',
      'Difficult setup',
      'Limited integrations',
      'Bugs and glitches',
      'Lack of features',
      'Poor documentation'
    ]

    const painPoints: PainPointAnalysis[] = []

    for (let i = 0; i < Math.min(5, commonPainPoints.length); i++) {
      const painPoint = commonPainPoints[i]
      const mentions = Math.floor(Math.random() * texts.length) + 1
      
      painPoints.push({
        painPoint,
        severity: ['critical', 'high', 'medium', 'low'][Math.floor(Math.random() * 4)] as any,
        frequency: mentions,
        sentiment: await this.performSentimentAnalysis(`Users complain about ${painPoint.toLowerCase()}`),
        keywords: painPoint.toLowerCase().split(' '),
        context: `${context} - ${painPoint}`,
        sources: ['reviews', 'forums', 'social_media'],
        affectedUserTypes: ['new_users', 'power_users', 'enterprise_users'].slice(0, Math.floor(Math.random() * 3) + 1),
      })
    }

    return painPoints
  }

  private async performMarketSentimentAnalysis(industry: string, keywords: string[]) {
    const keywordSentiments = []
    
    for (const keyword of keywords) {
      const sentiment = await this.performSentimentAnalysis(`Market trends for ${keyword} in ${industry}`)
      keywordSentiments.push({
        keyword,
        sentiment,
        mentions: Math.floor(Math.random() * 1000) + 100,
        trend: ['rising', 'stable', 'declining'][Math.floor(Math.random() * 3)] as any,
      })
    }

    const overallSentiment = this.aggregateSentiments(keywordSentiments.map(k => k.sentiment))
    
    let marketMood: 'optimistic' | 'cautious' | 'pessimistic'
    if (overallSentiment.score > 0.3) marketMood = 'optimistic'
    else if (overallSentiment.score > -0.3) marketMood = 'cautious'
    else marketMood = 'pessimistic'

    return {
      overallSentiment,
      keywordSentiments,
      marketMood,
      insights: [
        `Market sentiment for ${industry} is generally ${marketMood}`,
        `Key growth areas identified in sentiment analysis`,
        `Consumer confidence shows ${overallSentiment.classification} trend`,
      ]
    }
  }

  private aggregateSentiments(sentiments: SentimentResult[]): SentimentResult {
    if (sentiments.length === 0) return this.getDefaultSentiment()

    const avgScore = sentiments.reduce((sum, s) => sum + s.score, 0) / sentiments.length
    const avgMagnitude = sentiments.reduce((sum, s) => sum + s.magnitude, 0) / sentiments.length
    const avgConfidence = sentiments.reduce((sum, s) => sum + s.confidence, 0) / sentiments.length

    let classification: SentimentResult['classification']
    if (avgScore > 0.6) classification = 'very_positive'
    else if (avgScore > 0.2) classification = 'positive'
    else if (avgScore > -0.2) classification = 'neutral'
    else if (avgScore > -0.6) classification = 'negative'
    else classification = 'very_negative'

    return {
      score: avgScore,
      magnitude: avgMagnitude,
      classification,
      confidence: avgConfidence,
      emotions: {
        joy: sentiments.reduce((sum, s) => sum + s.emotions.joy, 0) / sentiments.length,
        anger: sentiments.reduce((sum, s) => sum + s.emotions.anger, 0) / sentiments.length,
        fear: sentiments.reduce((sum, s) => sum + s.emotions.fear, 0) / sentiments.length,
        sadness: sentiments.reduce((sum, s) => sum + s.emotions.sadness, 0) / sentiments.length,
        surprise: sentiments.reduce((sum, s) => sum + s.emotions.surprise, 0) / sentiments.length,
        trust: sentiments.reduce((sum, s) => sum + s.emotions.trust, 0) / sentiments.length,
      }
    }
  }

  private getDefaultSentiment(): SentimentResult {
    return {
      score: 0,
      magnitude: 0.5,
      classification: 'neutral',
      confidence: 0.5,
      emotions: {
        joy: 0.2,
        anger: 0.1,
        fear: 0.1,
        sadness: 0.1,
        surprise: 0.2,
        trust: 0.3,
      }
    }
  }

  private getDefaultCompetitorAnalysis(competitor: string): CompetitorSentimentAnalysis {
    return {
      competitor,
      overallSentiment: this.getDefaultSentiment(),
      aspectSentiments: {
        product: this.getDefaultSentiment(),
        support: this.getDefaultSentiment(),
        pricing: this.getDefaultSentiment(),
        usability: this.getDefaultSentiment(),
        reliability: this.getDefaultSentiment(),
      },
      painPoints: [],
      positiveAspects: [],
      trendAnalysis: {
        sentimentTrend: 'stable',
        timeframe: 'Insufficient data',
        keyEvents: [],
      }
    }
  }

  private getDefaultMarketSentiment() {
    return {
      overallSentiment: this.getDefaultSentiment(),
      keywordSentiments: [],
      marketMood: 'cautious' as const,
      insights: ['Insufficient data for market sentiment analysis'],
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
