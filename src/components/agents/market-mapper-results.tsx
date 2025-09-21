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
  results: rawResults,
  onEdit,
  onRegenerate,
}: MarketMapperResultsProps) {
  // Normalize potential snake_case and UPPERCASE keys coming from API
  const normalizeResults = (raw: any) => {
    if (!raw || typeof raw !== "object") return raw;
    const norm: any = {};

    // Executive Summary - handle UPPERCASE keys
    norm.executiveSummary =
      raw.executiveSummary ||
      raw.executive_summary ||
      raw.EXECUTIVE_SUMMARY ||
      raw.summary ||
      "";

    // Target Audience - handle UPPERCASE and different field names
    const ta =
      raw.targetAudience || raw.target_audience || raw.TARGET_AUDIENCE || [];
    norm.targetAudience = Array.isArray(ta)
      ? ta.map((s: any) => ({
          segment: s.segment || s.segment_name || s.name || "",
          pain_points: s.pain_points || s.painPoints || [],
          size: s.size,
          characteristics: Array.isArray(s.characteristics)
            ? s.characteristics
            : s.characteristics
            ? [s.characteristics]
            : [],
        }))
      : [];

    // Market Opportunity - handle UPPERCASE and nested structure
    const mo =
      raw.marketOpportunity || raw.market_opportunity || raw.MARKET_OPPORTUNITY;
    norm.marketOpportunity = mo
      ? {
          size:
            mo.size ||
            mo.market_size ||
            (mo.estimates
              ? `TAM: ${
                  mo.estimates.TAM_total_students_US?.toLocaleString?.() ||
                  mo.estimates.TAM_total_students_US
                }, SAM: ${
                  mo.estimates.SAM_students_interested?.toLocaleString?.() ||
                  mo.estimates.SAM_students_interested
                }`
              : ""),
          growth:
            mo.growth ||
            mo.growth_rate ||
            mo.explanation_and_growth_potential ||
            "",
          trends: mo.trends || mo.key_trends || [],
        }
      : undefined;

    // Competitors - handle UPPERCASE
    const comp =
      raw.competitors || raw.competitive_landscape || raw.COMPETITORS;
    norm.competitors = Array.isArray(comp)
      ? comp.map((c: any) => ({
          name: c.name,
          strengths: c.strengths || [],
          weaknesses: c.weaknesses || [],
          marketPosition: c.marketPosition || c.market_position,
        }))
      : [];

    // Positioning - handle UPPERCASE and different field names
    const pos = raw.positioning || raw.market_positioning || raw.POSITIONING;
    norm.positioning = pos
      ? {
          usp: pos.usp || pos.unique_selling_proposition || "",
          differentiation:
            pos.differentiation ||
            pos.differentiation_strategies ||
            pos.key_differentiation_strategies ||
            [],
          valueProposition: pos.valueProposition || pos.value_proposition,
        }
      : undefined;

    // Recommendations - handle UPPERCASE and numeric priorities
    const rec =
      raw.recommendations ||
      raw.strategic_recommendations ||
      raw.RECOMMENDATIONS;
    norm.recommendations = Array.isArray(rec)
      ? rec.map((r: any) => ({
          action: r.action || r.title || "",
          priority:
            typeof r.priority === "number"
              ? r.priority <= 2
                ? "high"
                : r.priority <= 3
                ? "medium"
                : "low"
              : (r.priority || "medium").toString().toLowerCase(),
          reasoning: r.reasoning || r.why || "",
        }))
      : [];

    return norm;
  };

  const normalized = normalizeResults(rawResults);

  // Convert normalized results to Markdown
  const resultsToMarkdown = (r: any): string => {
    let md = `# Market Analysis Report\n\n`;
    if (r.executiveSummary) {
      md += `## Executive Summary\n\n${r.executiveSummary}\n\n`;
    }
    if (r.marketOpportunity) {
      md += `## Market Opportunity\n\n- Market Size: ${r.marketOpportunity.size}\n- Growth Potential: ${r.marketOpportunity.growth}\n`;
      if (r.marketOpportunity.trends && r.marketOpportunity.trends.length) {
        md += `\n### Key Trends\n\n`;
        md +=
          r.marketOpportunity.trends.map((t: string) => `- ${t}`).join("\n") +
          "\n\n";
      } else {
        md += "\n";
      }
    }
    if (r.targetAudience && r.targetAudience.length) {
      md += `## Target Audience\n\n`;
      r.targetAudience.forEach((seg: any, idx: number) => {
        md += `### ${idx + 1}. ${seg.segment}${
          seg.size ? ` (${seg.size})` : ""
        }\n\n`;
        if (seg.pain_points && seg.pain_points.length) {
          md += `Pain Points:\n`;
          md +=
            seg.pain_points.map((p: string) => `- ${p}`).join("\n") + "\n\n";
        }
        if (seg.characteristics && seg.characteristics.length) {
          md += `Characteristics:\n`;
          md +=
            seg.characteristics.map((c: string) => `- ${c}`).join("\n") +
            "\n\n";
        }
      });
    }
    if (r.positioning) {
      md += `## Market Positioning\n\n- Unique Selling Proposition: ${r.positioning.usp}\n`;
      if (r.positioning.valueProposition) {
        md += `- Value Proposition: ${r.positioning.valueProposition}\n`;
      }
      if (
        r.positioning.differentiation &&
        r.positioning.differentiation.length
      ) {
        md += `\n### Differentiation Strategies\n\n`;
        md +=
          r.positioning.differentiation
            .map((d: string) => `- ${d}`)
            .join("\n") + "\n\n";
      } else {
        md += "\n";
      }
    }
    if (r.competitors && r.competitors.length) {
      md += `## Competitive Landscape\n\n`;
      r.competitors.forEach((c: any, idx: number) => {
        md += `### ${idx + 1}. ${c.name}${
          c.marketPosition ? ` (${c.marketPosition})` : ""
        }\n\n`;
        if (c.strengths && c.strengths.length) {
          md += `Strengths:\n`;
          md += c.strengths.map((s: string) => `- ${s}`).join("\n") + "\n\n";
        }
        if (c.weaknesses && c.weaknesses.length) {
          md += `Weaknesses:\n`;
          md += c.weaknesses.map((w: string) => `- ${w}`).join("\n") + "\n\n";
        }
      });
    }
    if (r.recommendations && r.recommendations.length) {
      md += `## Strategic Recommendations\n\n`;
      r.recommendations.forEach((rec: any, idx: number) => {
        md += `${idx + 1}. ${rec.action} (${(
          rec.priority || "medium"
        ).toUpperCase()} PRIORITY)\n`;
        if (rec.reasoning) md += `   - Reasoning: ${rec.reasoning}\n`;
      });
      md += `\n`;
    }
    return md.trim() + "\n";
  };

  // Enhanced Markdown -> HTML converter with beautiful styling
  const simpleMarkdownToHtml = (markdown: string): string => {
    const lines = markdown.split(/\r?\n/);
    let html = "";
    let inList = false;
    let sectionCount = 0;
    
    const flushList = () => {
      if (inList) {
        html += "</ul>";
        inList = false;
      }
    };
    
    const sectionColors = [
      'from-blue-500 to-indigo-500',
      'from-green-500 to-emerald-500', 
      'from-purple-500 to-violet-500',
      'from-orange-500 to-red-500',
      'from-pink-500 to-rose-500',
      'from-teal-500 to-cyan-500'
    ];
    
    for (const line of lines) {
      if (line.startsWith("### ")) {
        flushList();
        html += `<h3 class="text-xl font-semibold text-gray-700 mt-6 mb-3 flex items-center gap-2">
          <div class="w-2 h-6 bg-gradient-to-b ${sectionColors[sectionCount % sectionColors.length]} rounded-full"></div>
          ${line.slice(4)}
        </h3>`;
        continue;
      }
      if (line.startsWith("## ")) {
        flushList();
        sectionCount++;
        const colorClass = sectionColors[(sectionCount - 1) % sectionColors.length];
        html += `<div class="mt-8 mb-6">
          <h2 class="text-2xl font-bold bg-gradient-to-r ${colorClass} bg-clip-text text-transparent mb-2 flex items-center gap-3">
            <div class="w-8 h-8 bg-gradient-to-br ${colorClass} rounded-lg flex items-center justify-center text-white text-sm font-bold shadow-lg">
              ${sectionCount}
            </div>
            ${line.slice(3)}
          </h2>
          <div class="h-1 w-24 bg-gradient-to-r ${colorClass} rounded-full mb-4"></div>
        </div>`;
        continue;
      }
      if (line.startsWith("# ")) {
        flushList();
        html += `<h1 class="text-4xl font-bold text-center mb-8 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
          ${line.slice(2)}
        </h1>`;
        continue;
      }
      if (line.startsWith("- ")) {
        if (!inList) {
          html += '<ul class="space-y-2 ml-4">';
          inList = true;
        }
        html += `<li class="flex items-start gap-2 text-gray-700">
          <div class="w-2 h-2 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full mt-2 flex-shrink-0"></div>
          <span>${line.slice(2)}</span>
        </li>`;
        continue;
      }
      if (line.trim() === "") {
        flushList();
        continue;
      }
      // Bold **text** and enhanced paragraph styling
      const boldProcessed = line.replace(
        /\*\*(.*?)\*\*/g,
        '<strong class="font-semibold text-gray-800 bg-yellow-100 px-1 rounded">$1</strong>'
      );
      html += `<p class="text-gray-700 leading-relaxed mb-4">${boldProcessed}</p>`;
    }
    flushList();
    return html;
  };

  const markdownReport = resultsToMarkdown(normalized);
  const htmlReport = simpleMarkdownToHtml(markdownReport);
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
    const dataStr = JSON.stringify(rawResults, null, 2);
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

      {/* Market Analysis Report */}
      <Card className="border-2 border-gradient-to-r from-blue-200 to-indigo-200 shadow-xl">
        <CardHeader className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white rounded-t-lg relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 backdrop-blur-sm"></div>
          <div className="relative z-10">
            <CardTitle className="flex items-center gap-3 text-2xl font-bold">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm shadow-lg">
                <FileText className="h-7 w-7 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                  📊 Market Analysis Report
                </span>
                <div className="h-1 w-32 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full mt-2"></div>
              </div>
            </CardTitle>
            <CardDescription className="text-blue-100 mt-4 text-lg font-medium">
              ✨ Comprehensive market intelligence for your business idea
            </CardDescription>
          </div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>
          </CardHeader>
        <CardContent className="p-8 bg-gradient-to-br from-gray-50 to-blue-50">
          <div className="prose prose-lg max-w-none prose-headings:text-gray-800 prose-h1:text-3xl prose-h1:font-bold prose-h1:text-center prose-h1:mb-8 prose-h1:text-transparent prose-h1:bg-clip-text prose-h1:bg-gradient-to-r prose-h1:from-blue-600 prose-h1:to-indigo-600 prose-h2:text-2xl prose-h2:font-semibold prose-h2:text-gray-700 prose-h2:border-b-2 prose-h2:border-gradient-to-r prose-h2:from-blue-300 prose-h2:to-transparent prose-h2:pb-2 prose-h2:mb-4 prose-h3:text-xl prose-h3:font-medium prose-h3:text-gray-600 prose-p:text-gray-700 prose-p:leading-relaxed prose-li:text-gray-600 prose-strong:text-gray-800 prose-strong:font-semibold">
            <div 
              dangerouslySetInnerHTML={{ __html: htmlReport }} 
              className="space-y-6"
            />
            </div>
          </CardContent>
        </Card>
    </div>
  );
}
