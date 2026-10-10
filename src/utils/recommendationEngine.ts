import { ToolDefinition, ToolCategory, ToolUsageMap, RecommendedToolItem, CategoryInfo } from "../types";

const USAGE_STORAGE_KEY = "omnitools_usage_history";

/**
 * Retrieve usage history from localStorage
 */
export function getToolUsageMap(): ToolUsageMap {
  try {
    const raw = localStorage.getItem(USAGE_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

/**
 * Record a tool visit or execution
 */
export function recordToolUsage(toolId: string): ToolUsageMap {
  try {
    const current = getToolUsageMap();
    const existing = current[toolId] || { count: 0, lastUsedAt: 0 };
    const updated: ToolUsageMap = {
      ...current,
      [toolId]: {
        count: existing.count + 1,
        lastUsedAt: Date.now(),
      },
    };
    localStorage.setItem(USAGE_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return {};
  }
}

/**
 * Reset all user usage tracking data
 */
export function clearToolUsageHistory(): void {
  try {
    localStorage.removeItem(USAGE_STORAGE_KEY);
  } catch {}
}

export interface RecommendationResult {
  mostUsed: ToolDefinition[];
  recommended: RecommendedToolItem[];
  topCategory: { category: ToolCategory; name: string; percentage: number } | null;
  categoryPercentages: { category: ToolCategory; name: string; percentage: number; count: number }[];
  totalVisits: number;
}

/**
 * Generate smart personalized recommendations based on usage history and preferences
 */
export function getPersonalizedRecommendations(
  tools: ToolDefinition[],
  categories: CategoryInfo[],
  usageMap: ToolUsageMap,
  favorites: string[]
): RecommendationResult {
  const toolMap = new Map(tools.map((t) => [t.id, t]));

  // Total visits calculation
  const totalVisits = Object.values(usageMap).reduce((acc, cur) => acc + cur.count, 0);

  // 1. Most Used Tools calculation
  // Score = count * 10 + recency bonus (within 7 days = +10, 24h = +25)
  const now = Date.now();
  const scoredUsedTools = Object.entries(usageMap)
    .map(([toolId, record]) => {
      const tool = toolMap.get(toolId);
      if (!tool) return null;

      const ageHours = (now - record.lastUsedAt) / (1000 * 60 * 60);
      let recencyBonus = 0;
      if (ageHours < 24) recencyBonus = 25;
      else if (ageHours < 168) recencyBonus = 10;

      const isFav = favorites.includes(toolId) ? 15 : 0;
      const finalScore = record.count * 10 + recencyBonus + isFav;
      return { tool, score: finalScore, count: record.count, lastUsedAt: record.lastUsedAt };
    })
    .filter((item): item is { tool: ToolDefinition; score: number; count: number; lastUsedAt: number } => item !== null)
    .sort((a, b) => b.score - a.score);

  const mostUsed = scoredUsedTools.slice(0, 6).map((item) => item.tool);

  // 2. Category Affinity Calculation
  const categoryCounts: Record<ToolCategory, number> = {
    all: 0,
    text: 0,
    file: 0,
    media: 0,
    developer: 0,
    math: 0,
    productivity: 0,
    ai: 0,
  };

  // Count visits per category
  Object.entries(usageMap).forEach(([toolId, record]) => {
    const tool = toolMap.get(toolId);
    if (tool && tool.category in categoryCounts) {
      categoryCounts[tool.category] += record.count;
    }
  });

  // Boost categories with favorites
  favorites.forEach((favId) => {
    const tool = toolMap.get(favId);
    if (tool && tool.category in categoryCounts) {
      categoryCounts[tool.category] += 2;
    }
  });

  const categoryScoreSum = Object.entries(categoryCounts)
    .filter(([k]) => k !== "all")
    .reduce((sum, [, val]) => sum + val, 0);

  const categoryPercentages = categories
    .filter((c) => c.id !== "all")
    .map((cat) => {
      const count = categoryCounts[cat.id] || 0;
      const percentage = categoryScoreSum > 0 ? Math.round((count / categoryScoreSum) * 100) : 0;
      return { category: cat.id, name: cat.name, percentage, count };
    })
    .sort((a, b) => b.percentage - a.percentage);

  const topCategory = categoryPercentages.length > 0 && categoryPercentages[0].percentage > 0 ? categoryPercentages[0] : null;

  // 3. User Tag Affinity Calculation (from used tools)
  const tagWeights: Record<string, number> = {};
  Object.entries(usageMap).forEach(([toolId, record]) => {
    const tool = toolMap.get(toolId);
    if (tool) {
      tool.tags.forEach((tag) => {
        tagWeights[tag] = (tagWeights[tag] || 0) + record.count;
      });
    }
  });

  // 4. Personalized Discovery Recommendations
  // We want to recommend tools that:
  // - The user hasn't tried or used rarely (< 2 visits)
  // - Matches their favorite categories or top tags
  // - High quality or relevant tools
  const recommended: RecommendedToolItem[] = [];
  const usedToolIds = new Set(Object.keys(usageMap).filter((id) => (usageMap[id]?.count || 0) >= 3));

  if (totalVisits === 0) {
    // Brand new user: Curated starter onboarding recommendation
    const onboardingIds = ["text-counter", "json-formatter", "qr-studio", "ai-assistant", "csv-json-converter"];
    onboardingIds.forEach((id) => {
      const t = toolMap.get(id);
      if (t) {
        recommended.push({
          tool: t,
          reason: "새로 오신 분들이 가장 먼저 만족한 추천 도구",
          score: 100,
          badgeType: "trending",
        });
      }
    });
  } else {
    // Personalized scoring for candidate tools
    const candidates = tools.filter((t) => !usedToolIds.has(t.id));

    candidates.forEach((tool) => {
      let score = 0;
      let reason = "";
      let badgeType: RecommendedToolItem["badgeType"] = "affinity";

      // Category match
      const catPercent = categoryPercentages.find((c) => c.category === tool.category)?.percentage || 0;
      if (catPercent > 0) {
        score += catPercent * 1.5;
        const catName = categories.find((c) => c.id === tool.category)?.name || "관련";
        reason = `평소 '${catName}' 카테고리 이용률(${catPercent}%) 기반 맞춤 도구`;
      }

      // Tag match
      let matchedTagsCount = 0;
      tool.tags.forEach((tag) => {
        if (tagWeights[tag]) {
          score += tagWeights[tag] * 2;
          matchedTagsCount++;
        }
      });

      if (matchedTagsCount > 0 && !reason) {
        reason = "자주 다루시는 작업 키워드와 연계되는 추천 도구";
        badgeType = "co_usage";
      }

      // Special badges
      if (tool.badge === "HOT") score += 10;
      if (tool.category === "ai") score += 15;

      // Check if user has favorited something in this category
      const hasFavInCat = favorites.some((favId) => toolMap.get(favId)?.category === tool.category);
      if (hasFavInCat) {
        score += 20;
        if (!reason) {
          reason = "즐겨찾기 보관함과 연관된 추천 유틸리티";
        }
      }

      if (score > 10) {
        recommended.push({
          tool,
          reason: reason || "당신의 작업 패턴에 맞춘 추천 도구",
          score,
          badgeType,
        });
      }
    });

    // Sort by recommendation score
    recommended.sort((a, b) => b.score - a.score);

    // Fallback if not enough candidates
    if (recommended.length < 4) {
      tools
        .filter((t) => !recommended.some((r) => r.tool.id === t.id))
        .slice(0, 4 - recommended.length)
        .forEach((fallbackTool) => {
          recommended.push({
            tool: fallbackTool,
            reason: "플랫폼 인기 유틸리티 도구",
            score: 50,
            badgeType: "trending",
          });
        });
    }
  }

  return {
    mostUsed,
    recommended: recommended.slice(0, 6),
    topCategory,
    categoryPercentages,
    totalVisits,
  };
}
