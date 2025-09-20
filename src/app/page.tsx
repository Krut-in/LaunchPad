import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Brain, TrendingUp, Users, Zap } from 'lucide-react'
import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Brain className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">LaunchPad</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/auth/signin">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link href="/auth/signin">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Validate Your Startup Idea with
            <span className="text-blue-600"> AI Agents</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Get comprehensive market research, MVP architecture, and competitive analysis 
            powered by advanced AI agents. Make data-driven decisions for your startup journey.
          </p>
          <div className="flex items-center justify-center space-x-4">
            <Link href="/auth/signin">
              <Button size="lg" className="px-8">
                Start Validation
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="px-8">
              Watch Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Powered by Specialized AI Agents
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Each agent is designed to provide expert-level analysis in their domain, 
              giving you comprehensive insights into your startup opportunity.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardHeader>
                <TrendingUp className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <CardTitle>Market Mapper</CardTitle>
                <CardDescription>
                  Comprehensive market analysis with TAM, SAM, SOM calculations, 
                  trend identification, and opportunity assessment.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Market size analysis</li>
                  <li>• Industry trends & forecasts</li>
                  <li>• Risk assessment</li>
                  <li>• Growth opportunities</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Zap className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <CardTitle>MVP Architect</CardTitle>
                <CardDescription>
                  Technical architecture planning with feature prioritization, 
                  tech stack recommendations, and development roadmaps.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Feature prioritization</li>
                  <li>• Tech stack selection</li>
                  <li>• Timeline planning</li>
                  <li>• Budget estimation</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Users className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                <CardTitle>Competitor GPT</CardTitle>
                <CardDescription>
                  Competitive landscape analysis with direct/indirect competitor 
                  identification and strategic positioning recommendations.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Competitor analysis</li>
                  <li>• Market positioning</li>
                  <li>• Competitive advantages</li>
                  <li>• Strategic recommendations</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              How LaunchPad Works
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Simple 3-step process to get comprehensive startup validation
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-semibold mb-2">Describe Your Idea</h3>
              <p className="text-gray-600">
                Tell us about your startup idea, target market, and industry. 
                Our platform will guide you through the process.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-semibold mb-2">AI Analysis</h3>
              <p className="text-gray-600">
                Our specialized AI agents analyze your idea from multiple angles: 
                market, competition, and technical feasibility.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-semibold mb-2">Get Insights</h3>
              <p className="text-gray-600">
                Receive comprehensive reports with actionable insights, 
                recommendations, and a clear roadmap for your startup.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Validate Your Startup Idea?
          </h2>
          <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
            Join hundreds of entrepreneurs who have used LaunchPad to make 
            informed decisions about their startup journey.
          </p>
          <Link href="/auth/signin">
            <Button size="lg" variant="secondary" className="px-8">
              Start Free Validation
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-gray-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Brain className="h-6 w-6" />
            <span className="text-lg font-semibold">LaunchPad</span>
          </div>
          <p className="text-gray-400">
            © 2024 LaunchPad. All rights reserved. Built with Next.js 15 & OpenAI GPT-5.
          </p>
        </div>
      </footer>
    </div>
  )
}
