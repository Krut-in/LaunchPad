"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MarketMapperOutput } from "@/lib/agents/market-mapper";
import {
  FileText,
  Users,
  TrendingUp,
  Target,
  Lightbulb,
  CheckSquare,
  Download,
  RotateCcw,
  Edit,
} from "lucide-react";

interface MarketMapperResultsProps {
  results: MarketMapperOutput;
  onEdit?: () => void;
  onRegenerate?: () => void;
}

export function MarketMapperResults({
  results,
  onEdit,
  onRegenerate,
}: MarketMapperResultsProps) {
  // Normalize potential snake_case keys coming from API
  const normalizeResults = (raw: any) => {
    if (!raw || typeof raw !== 'object') return raw
    const norm: any = {}
    norm.executiveSummary = raw.executiveSummary || raw.executive_summary || raw.summary || ''
    const ta = raw.targetAudience || raw.target_audience || []
    norm.targetAudience = Array.isArray(ta)
      ? ta.map((s: any) => ({
          segment: s.segment || s.name || '',
          pain_points: s.pain_points || s.painPoints || [],
          size: s.size,
          characteristics: s.characteristics || [],
        }))
      : []
    const mo = raw.marketOpportunity || raw.market_opportunity
    norm.marketOpportunity = mo
      ? {
          size: mo.size || mo.market_size || '',
          growth: mo.growth || mo.growth_rate || '',
          trends: mo.trends || [],
        }
      : undefined
    const comp = raw.competitors || raw.competitive_landscape
    norm.competitors = Array.isArray(comp)
      ? comp.map((c: any) => ({
          name: c.name,
          strengths: c.strengths || [],
          weaknesses: c.weaknesses || [],
          marketPosition: c.marketPosition || c.market_position,
        }))
      : []
    const pos = raw.positioning || raw.market_positioning
    norm.positioning = pos
      ? {
          usp: pos.usp || pos.unique_selling_proposition || '',
          differentiation: pos.differentiation || pos.differentiation_strategies || [],
          valueProposition: pos.valueProposition || pos.value_proposition,
        }
      : undefined
    const rec = raw.recommendations || raw.strategic_recommendations
    norm.recommendations = Array.isArray(rec)
      ? rec.map((r: any) => ({
          action: r.action || r.title || '',
          priority: (r.priority || 'medium').toLowerCase(),
          reasoning: r.reasoning,
        }))
      : []
    return norm
  }

  const normalized = normalizeResults(results)

  // Convert normalized results to Markdown
  const resultsToMarkdown = (r: any): string => {
    let md = `# Market Analysis Report\n\n`
    if (r.executiveSummary) {
      md += `## Executive Summary\n\n${r.executiveSummary}\n\n`
    }
    if (r.marketOpportunity) {
      md += `## Market Opportunity\n\n- Market Size: ${r.marketOpportunity.size}\n- Growth Potential: ${r.marketOpportunity.growth}\n`
      if (r.marketOpportunity.trends && r.marketOpportunity.trends.length) {
        md += `\n### Key Trends\n\n`
        md += r.marketOpportunity.trends.map((t: string) => `- ${t}`).join('\n') + '\n\n'
      } else {
        md += '\n'
      }
    }
    if (r.targetAudience && r.targetAudience.length) {
      md += `## Target Audience\n\n`
      r.targetAudience.forEach((seg: any, idx: number) => {
        md += `### ${idx + 1}. ${seg.segment}${seg.size ? ` (${seg.size})` : ''}\n\n`
        if (seg.pain_points && seg.pain_points.length) {
          md += `Pain Points:\n`
          md += seg.pain_points.map((p: string) => `- ${p}`).join('\n') + '\n\n'
        }
        if (seg.characteristics && seg.characteristics.length) {
          md += `Characteristics:\n`
          md += seg.characteristics.map((c: string) => `- ${c}`).join('\n') + '\n\n'
        }
      })
    }
    if (r.positioning) {
      md += `## Market Positioning\n\n- Unique Selling Proposition: ${r.positioning.usp}\n`
      if (r.positioning.valueProposition) {
        md += `- Value Proposition: ${r.positioning.valueProposition}\n`
      }
      if (r.positioning.differentiation && r.positioning.differentiation.length) {
        md += `\n### Differentiation Strategies\n\n`
        md += r.positioning.differentiation.map((d: string) => `- ${d}`).join('\n') + '\n\n'
      } else {
        md += '\n'
      }
    }
    if (r.competitors && r.competitors.length) {
      md += `## Competitive Landscape\n\n`
      r.competitors.forEach((c: any, idx: number) => {
        md += `### ${idx + 1}. ${c.name}${c.marketPosition ? ` (${c.marketPosition})` : ''}\n\n`
        if (c.strengths && c.strengths.length) {
          md += `Strengths:\n`
          md += c.strengths.map((s: string) => `- ${s}`).join('\n') + '\n\n'
        }
        if (c.weaknesses && c.weaknesses.length) {
          md += `Weaknesses:\n`
          md += c.weaknesses.map((w: string) => `- ${w}`).join('\n') + '\n\n'
        }
      })
    }
    if (r.recommendations && r.recommendations.length) {
      md += `## Strategic Recommendations\n\n`
      r.recommendations.forEach((rec: any, idx: number) => {
        md += `${idx + 1}. ${rec.action} (${(rec.priority || 'medium').toUpperCase()} PRIORITY)\n`
        if (rec.reasoning) md += `   - Reasoning: ${rec.reasoning}\n`
      })
      md += `\n`
    }
    return md.trim() + '\n'
  }

  // Very simple Markdown -> HTML converter (headings, lists, bold)
  const simpleMarkdownToHtml = (markdown: string): string => {
    const lines = markdown.split(/\r?\n/)
    let html = ''
    let inList = false
    const flushList = () => {
      if (inList) {
        html += '</ul>'
        inList = false
      }
    }
    for (const line of lines) {
      if (line.startsWith('### ')) {
        flushList(); html += `<h3>${line.slice(4)}</h3>`; continue
      }
      if (line.startsWith('## ')) {
        flushList(); html += `<h2>${line.slice(3)}</h2>`; continue
      }
      if (line.startsWith('# ')) {
        flushList(); html += `<h1>${line.slice(2)}</h1>`; continue
      }
      if (line.startsWith('- ')) {
        if (!inList) { html += '<ul>'; inList = true }
        html += `<li>${line.slice(2)}</li>`
        continue
      }
      if (line.trim() === '') {
        flushList(); html += '<p></p>'
        continue
      }
      // Bold **text**
      const boldProcessed = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      html += `<p>${boldProcessed}</p>`
    }
    flushList()
    return html
  }

  const markdownReport = resultsToMarkdown(normalized)
  const htmlReport = simpleMarkdownToHtml(markdownReport)
  const getPriorityColor = (priority: "high" | "medium" | "low") => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
    }
  };

  const exportResults = () => {
    const dataStr = JSON.stringify(results, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "market-analysis.json";
    link.click();
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Header Actions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Target className="h-6 w-6 text-blue-600" />
                </div>
                Market Analysis Results
              </CardTitle>
              <CardDescription>
                Comprehensive market insights and strategic recommendations
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={exportResults}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              {onEdit && (
                <Button variant="outline" size="sm" onClick={onEdit}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              )}
              {onRegenerate && (
                <Button variant="outline" size="sm" onClick={onRegenerate}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Regenerate
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Debug: Show raw data structure */}
      {process.env.NODE_ENV === "development" && (
        <Card className="border border-gray-300 bg-gray-50">
          <CardHeader>
            <CardTitle className="text-sm">
              Debug: Results Data Structure
            </CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs overflow-auto max-h-40 bg-white p-2 rounded">
              {JSON.stringify(results, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}

      {/* Markdown Report (from JSON) */}
      <Card className="border-2 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Market Analysis Report (Markdown)
          </CardTitle>
          <CardDescription>Auto-generated from the AI JSON result</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="prose max-w-none">
            <div dangerouslySetInnerHTML={{ __html: htmlReport }} />
          </div>
        </CardContent>
      </Card>

      {/* Comprehensive Market Analysis Report */}
      <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
          <CardTitle className="flex items-center gap-2 text-xl">
            <div className="p-2 bg-white/20 rounded-lg">
              <FileText className="h-6 w-6" />
            </div>
            📊 Market Analysis Report
          </CardTitle>
          <CardDescription className="text-blue-100">
            Complete market intelligence for your business idea
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8">
          {/* Show all available data */}
          <div className="space-y-8">
            {/* Executive Summary */}
            {results.executiveSummary ? (
              <div className="mb-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-bold">📋</span>
                  </div>
                  Executive Summary
                </h3>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <div className="text-gray-700 leading-relaxed text-lg whitespace-pre-wrap">
                    {results.executiveSummary}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-yellow-800">
                  ⚠️ Executive Summary not available in results
                </p>
              </div>
            )}

            {/* Market Opportunity */}
            {results.marketOpportunity ? (
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-lg border border-green-200">
                <h4 className="text-xl font-bold text-green-900 mb-4 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  💰 Market Opportunity
                </h4>
                <div className="space-y-3">
                  <div className="text-green-800 text-lg">
                    <span className="font-semibold">Market Size:</span>{" "}
                    {results.marketOpportunity.size}
                  </div>
                  <div className="text-green-800 text-lg">
                    <span className="font-semibold">Growth Potential:</span>{" "}
                    {results.marketOpportunity.growth}
                  </div>
                  {results.marketOpportunity.trends &&
                    results.marketOpportunity.trends.length > 0 && (
                      <div>
                        <h5 className="font-semibold text-green-900 mb-2">
                          Key Trends:
                        </h5>
                        <ul className="space-y-1">
                          {results.marketOpportunity.trends.map(
                            (trend, index) => (
                              <li
                                key={index}
                                className="text-green-800 flex items-start gap-2"
                              >
                                <span className="text-green-600">•</span>
                                {trend}
                              </li>
                            )
                          )}
                        </ul>
                      </div>
                    )}
                </div>
              </div>
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-yellow-800">
                  ⚠️ Market Opportunity data not available in results
                </p>
              </div>
            )}

            {/* Target Audience */}
            {results.targetAudience && results.targetAudience.length > 0 ? (
              <div className="bg-gradient-to-br from-purple-50 to-violet-50 p-6 rounded-lg border border-purple-200">
                <h4 className="text-xl font-bold text-purple-900 mb-4 flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  🎯 Target Audience
                </h4>
                <div className="space-y-4">
                  {results.targetAudience.map((segment, index) => (
                    <div
                      key={index}
                      className="bg-white p-4 rounded-lg border border-purple-200"
                    >
                      <div className="font-bold text-lg text-purple-900 mb-2">
                        {segment.segment}{" "}
                        {segment.size && (
                          <span className="text-sm font-normal">
                            ({segment.size})
                          </span>
                        )}
                      </div>
                      <div className="mb-3">
                        <h6 className="font-semibold text-purple-800 mb-2">
                          Pain Points:
                        </h6>
                        <ul className="space-y-1">
                          {segment.pain_points.map((pain, idx) => (
                            <li
                              key={idx}
                              className="text-purple-700 flex items-start gap-2"
                            >
                              <span className="text-red-500">•</span>
                              {pain}
                            </li>
                          ))}
                        </ul>
                      </div>
                      {segment.characteristics &&
                        segment.characteristics.length > 0 && (
                          <div>
                            <h6 className="font-semibold text-purple-800 mb-2">
                              Characteristics:
                            </h6>
                            <div className="flex flex-wrap gap-2">
                              {segment.characteristics.map((char, idx) => (
                                <span
                                  key={idx}
                                  className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-sm"
                                >
                                  {char}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-yellow-800">
                  ⚠️ Target Audience data not available in results
                </p>
              </div>
            )}

            {/* Market Positioning */}
            {results.positioning ? (
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-6 rounded-lg border border-yellow-200">
                <h4 className="text-xl font-bold text-orange-900 mb-4 flex items-center gap-2">
                  <Lightbulb className="h-5 w-5" />
                  💡 Market Positioning
                </h4>
                <div className="space-y-4">
                  <div className="bg-white p-4 rounded-lg border border-orange-200">
                    <h5 className="font-bold text-orange-900 mb-2">
                      Unique Selling Proposition
                    </h5>
                    <p className="text-orange-800 text-lg">
                      {results.positioning.usp}
                    </p>
                  </div>
                  {results.positioning.valueProposition && (
                    <div className="bg-white p-4 rounded-lg border border-orange-200">
                      <h5 className="font-bold text-orange-900 mb-2">
                        Value Proposition
                      </h5>
                      <p className="text-orange-800">
                        {results.positioning.valueProposition}
                      </p>
                    </div>
                  )}
                  {results.positioning.differentiation &&
                    results.positioning.differentiation.length > 0 && (
                      <div className="bg-white p-4 rounded-lg border border-orange-200">
                        <h5 className="font-bold text-orange-900 mb-2">
                          Differentiation Strategies
                        </h5>
                        <ul className="space-y-2">
                          {results.positioning.differentiation.map(
                            (diff, index) => (
                              <li
                                key={index}
                                className="text-orange-800 flex items-start gap-2"
                              >
                                <CheckSquare className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                                {diff}
                              </li>
                            )
                          )}
                        </ul>
                      </div>
                    )}
                </div>
              </div>
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-yellow-800">
                  ⚠️ Market Positioning data not available in results
                </p>
              </div>
            )}

            {/* Competitive Landscape */}
            {results.competitors && results.competitors.length > 0 ? (
              <div className="bg-gradient-to-br from-red-50 to-pink-50 p-6 rounded-lg border border-red-200">
                <h4 className="text-xl font-bold text-red-900 mb-4 flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  🏆 Competitive Landscape
                </h4>
                <div className="space-y-4">
                  {results.competitors.map((competitor, index) => (
                    <div
                      key={index}
                      className="bg-white p-4 rounded-lg border border-red-200"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <h5 className="font-bold text-lg text-red-900">
                          {competitor.name}
                        </h5>
                        {competitor.marketPosition && (
                          <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm">
                            {competitor.marketPosition}
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h6 className="font-semibold text-green-700 mb-2">
                            Strengths
                          </h6>
                          <ul className="space-y-1">
                            {competitor.strengths.map((strength, idx) => (
                              <li
                                key={idx}
                                className="text-green-600 flex items-start gap-2 text-sm"
                              >
                                <span className="text-green-500">+</span>
                                {strength}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h6 className="font-semibold text-red-700 mb-2">
                            Weaknesses
                          </h6>
                          <ul className="space-y-1">
                            {competitor.weaknesses.map((weakness, idx) => (
                              <li
                                key={idx}
                                className="text-red-600 flex items-start gap-2 text-sm"
                              >
                                <span className="text-red-500">-</span>
                                {weakness}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-yellow-800">
                  ⚠️ Competitive Landscape data not available in results
                </p>
              </div>
            )}

            {/* Strategic Recommendations */}
            {results.recommendations && results.recommendations.length > 0 ? (
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
                <h4 className="text-xl font-bold text-blue-900 mb-4 flex items-center gap-2">
                  <CheckSquare className="h-5 w-5" />
                  🚀 Strategic Recommendations
                </h4>
                <div className="space-y-4">
                  {results.recommendations.map((rec, index) => (
                    <div
                      key={index}
                      className="bg-white p-4 rounded-lg border border-blue-200"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h5 className="font-bold text-blue-900 flex-1">
                          {rec.action}
                        </h5>
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(
                            rec.priority
                          )}`}
                        >
                          {rec.priority.toUpperCase()} PRIORITY
                        </span>
                      </div>
                      {rec.reasoning && (
                        <p className="text-blue-700 text-sm mt-2">
                          {rec.reasoning}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-yellow-800">
                  ⚠️ Strategic Recommendations not available in results
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Executive Summary */}
      {results.executiveSummary && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Executive Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none">
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {results.executiveSummary}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Target Audience */}
      {results.targetAudience && results.targetAudience.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Target Audience
            </CardTitle>
            <CardDescription>
              Key customer segments and their pain points
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {results.targetAudience.map((segment, index) => (
                <div key={index} className="p-4 border rounded-lg bg-gray-50">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-gray-900">
                      {segment.segment}
                    </h3>
                    {segment.size && (
                      <Badge variant="outline">{segment.size}</Badge>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">
                        Pain Points:
                      </h4>
                      <ul className="space-y-1">
                        {segment.pain_points.map((pain, idx) => (
                          <li
                            key={idx}
                            className="text-sm text-gray-600 flex items-start gap-2"
                          >
                            <span className="text-red-500 mt-1">•</span>
                            {pain}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {segment.characteristics &&
                      segment.characteristics.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-2">
                            Characteristics:
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {segment.characteristics.map((char, idx) => (
                              <Badge
                                key={idx}
                                variant="secondary"
                                className="text-xs"
                              >
                                {char}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Market Opportunity */}
      {results.marketOpportunity && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Market Opportunity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-semibold text-blue-900 mb-2">
                    Market Size
                  </h3>
                  <p className="text-blue-800">
                    {results.marketOpportunity.size}
                  </p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <h3 className="font-semibold text-green-900 mb-2">
                    Growth Potential
                  </h3>
                  <p className="text-green-800">
                    {results.marketOpportunity.growth}
                  </p>
                </div>
              </div>

              {results.marketOpportunity.trends &&
                results.marketOpportunity.trends.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">
                      Key Trends
                    </h3>
                    <ul className="space-y-2">
                      {results.marketOpportunity.trends.map((trend, idx) => (
                        <li
                          key={idx}
                          className="text-sm text-gray-700 flex items-start gap-2"
                        >
                          <TrendingUp className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                          {trend}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Competitors */}
      {results.competitors && results.competitors.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Competitive Landscape
            </CardTitle>
            <CardDescription>
              Key competitors and market positioning
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {results.competitors.map((competitor, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-gray-900">
                      {competitor.name}
                    </h3>
                    {competitor.marketPosition && (
                      <Badge variant="outline">
                        {competitor.marketPosition}
                      </Badge>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-green-700 mb-2">
                        Strengths
                      </h4>
                      <ul className="space-y-1">
                        {competitor.strengths.map((strength, idx) => (
                          <li
                            key={idx}
                            className="text-sm text-gray-600 flex items-start gap-2"
                          >
                            <span className="text-green-500 mt-1">+</span>
                            {strength}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-red-700 mb-2">
                        Weaknesses
                      </h4>
                      <ul className="space-y-1">
                        {competitor.weaknesses.map((weakness, idx) => (
                          <li
                            key={idx}
                            className="text-sm text-gray-600 flex items-start gap-2"
                          >
                            <span className="text-red-500 mt-1">-</span>
                            {weakness}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Positioning */}
      {results.positioning && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5" />
              Market Positioning
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-yellow-50 rounded-lg">
                <h3 className="font-semibold text-yellow-900 mb-2">
                  Unique Selling Proposition
                </h3>
                <p className="text-yellow-800">{results.positioning.usp}</p>
              </div>

              {results.positioning.valueProposition && (
                <div className="p-4 bg-purple-50 rounded-lg">
                  <h3 className="font-semibold text-purple-900 mb-2">
                    Value Proposition
                  </h3>
                  <p className="text-purple-800">
                    {results.positioning.valueProposition}
                  </p>
                </div>
              )}

              <div>
                <h3 className="font-semibold text-gray-900 mb-3">
                  Differentiation Strategies
                </h3>
                <div className="grid gap-2">
                  {results.positioning.differentiation.map((diff, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2 p-2 bg-gray-50 rounded"
                    >
                      <CheckSquare className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{diff}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      {results.recommendations && results.recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckSquare className="h-5 w-5" />
              Strategic Recommendations
            </CardTitle>
            <CardDescription>
              Prioritized action items for market validation and entry
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {results.recommendations.map((rec, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-medium text-gray-900 flex-1">
                      {rec.action}
                    </h3>
                    <Badge className={getPriorityColor(rec.priority)}>
                      {rec.priority} priority
                    </Badge>
                  </div>
                  {rec.reasoning && (
                    <p className="text-sm text-gray-600 mt-2">
                      {rec.reasoning}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
