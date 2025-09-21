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

  // Very simple Markdown -> HTML converter (headings, lists, bold)
  const simpleMarkdownToHtml = (markdown: string): string => {
    const lines = markdown.split(/\r?\n/);
    let html = "";
    let inList = false;
    const flushList = () => {
      if (inList) {
        html += "</ul>";
        inList = false;
      }
    };
    for (const line of lines) {
      if (line.startsWith("### ")) {
        flushList();
        html += `<h3>${line.slice(4)}</h3>`;
        continue;
      }
      if (line.startsWith("## ")) {
        flushList();
        html += `<h2>${line.slice(3)}</h2>`;
        continue;
      }
      if (line.startsWith("# ")) {
        flushList();
        html += `<h1>${line.slice(2)}</h1>`;
        continue;
      }
      if (line.startsWith("- ")) {
        if (!inList) {
          html += "<ul>";
          inList = true;
        }
        html += `<li>${line.slice(2)}</li>`;
        continue;
      }
      if (line.trim() === "") {
        flushList();
        html += "<p></p>";
        continue;
      }
      // Bold **text**
      const boldProcessed = line.replace(
        /\*\*(.*?)\*\*/g,
        "<strong>$1</strong>"
      );
      html += `<p>${boldProcessed}</p>`;
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
      <Card className="border-2 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
            Market Analysis Report
            </CardTitle>
            <CardDescription>
            Comprehensive market intelligence for your business idea
            </CardDescription>
          </CardHeader>
          <CardContent>
          <div className="prose max-w-none">
            <div dangerouslySetInnerHTML={{ __html: htmlReport }} />
            </div>
          </CardContent>
        </Card>

    </div>
  );
}
