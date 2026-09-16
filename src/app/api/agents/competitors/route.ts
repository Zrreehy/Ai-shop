import { NextResponse } from "next/server";
import { competitorsDB, categories, platforms, priceRanges, type Competitor } from "@/lib/data/competitors";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category") || "全部";
  const platform = searchParams.get("platform") || "全部";
  const priceRange = searchParams.get("priceRange") || "全部";

  let filtered: Competitor[] = competitorsDB;

  if (category !== "全部") {
    filtered = filtered.filter((c) => c.category === category);
  }
  if (platform !== "全部") {
    filtered = filtered.filter((c) => c.platform === platform);
  }
  if (priceRange !== "全部") {
    const range = priceRanges.find((r) => r.label === priceRange);
    if (range) {
      filtered = filtered.filter((c) => c.price >= range.min && c.price < range.max);
    }
  }

  return NextResponse.json({
    success: true,
    data: filtered,
    categories,
    platforms,
    priceRanges: priceRanges.map((r) => r.label),
    lastSync: new Date().toISOString(),
  });
}

export async function POST(request: Request) {
  const body = await request.json();
  const { selectedIds } = body;

  if (!selectedIds || !Array.isArray(selectedIds)) {
    return NextResponse.json({ success: false, error: "请选择要对比的竞品" }, { status: 400 });
  }

  const selected = competitorsDB.filter((c) => selectedIds.includes(c.id));

  // Generate comparison analysis
  const analysis = {
    priceComparison: {
      min: Math.min(...selected.map((c) => c.price)),
      max: Math.max(...selected.map((c) => c.price)),
      avg: Math.round(selected.reduce((sum, c) => sum + c.price, 0) / selected.length),
    },
    salesComparison: {
      min: Math.min(...selected.map((c) => c.monthlySales)),
      max: Math.max(...selected.map((c) => c.monthlySales)),
      avg: Math.round(selected.reduce((sum, c) => sum + c.monthlySales, 0) / selected.length),
    },
    ratingComparison: {
      min: Math.min(...selected.map((c) => c.rating)),
      max: Math.max(...selected.map((c) => c.rating)),
      avg: Number((selected.reduce((sum, c) => sum + c.rating, 0) / selected.length).toFixed(1)),
    },
    commonSellingPoints: findCommonPoints(selected.map((c) => c.sellingPoints)),
    uniqueAdvantages: selected.map((c) => ({
      name: c.name,
      advantages: c.sellingPoints.filter(
        (point) => !selected.some((other) => other.id !== c.id && other.sellingPoints.includes(point))
      ),
    })),
    suggestions: generateSuggestions(selected),
  };

  return NextResponse.json({
    success: true,
    data: selected,
    analysis,
    lastSync: new Date().toISOString(),
  });
}

function findCommonPoints(pointsList: string[][]): string[] {
  if (pointsList.length === 0) return [];
  const allPoints = pointsList.flat();
  const pointCount = new Map<string, number>();
  allPoints.forEach((p) => pointCount.set(p, (pointCount.get(p) || 0) + 1));
  return Array.from(pointCount.entries())
    .filter(([, count]) => count > 1)
    .map(([point]) => point);
}

function generateSuggestions(competitors: Competitor[]): string[] {
  const suggestions: string[] = [];
  const avgPrice = competitors.reduce((sum, c) => sum + c.price, 0) / competitors.length;
  const avgSales = competitors.reduce((sum, c) => sum + c.monthlySales, 0) / competitors.length;

  if (competitors.some((c) => c.price < avgPrice * 0.8)) {
    suggestions.push("市场存在低价竞品，建议突出产品差异化卖点，避免纯价格竞争");
  }
  if (competitors.some((c) => c.monthlySales > avgSales * 1.5)) {
    suggestions.push("头部竞品销量领先，建议分析其流量来源和转化策略");
  }
  if (competitors.every((c) => c.rating >= 4.7)) {
    suggestions.push("竞品整体评分较高，需确保产品质量和服务达到同等水平");
  }
  suggestions.push("建议定期监控竞品价格变动，及时调整促销策略");
  suggestions.push("关注竞品新增卖点和功能，快速响应市场变化");

  return suggestions;
}
