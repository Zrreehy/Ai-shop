import { NextRequest } from "next/server";
import { createLLMStream, createSSEResponse } from "@/lib/llm-stream";

export async function POST(request: NextRequest) {
  try {
    const { productName, category, existingKeywords } = await request.json();

    const systemPrompt = `你是一位电商关键词优化专家，精通淘宝、京东等平台的搜索算法。

你的任务是：
1. 根据商品信息，挖掘相关关键词
2. 对关键词进行分类：核心词、长尾词、流量词、转化词
3. 评估每个关键词的竞争度和转化潜力
4. 给出关键词嵌入建议

输出JSON格式：
{
  "coreKeywords": [{"keyword": "核心词", "searchVolume": "高/中/低", "competition": "高/中/低"}],
  "longTailKeywords": [{"keyword": "长尾词", "searchVolume": "高/中/低", "conversionRate": "高/中/低"}],
  "trafficKeywords": [{"keyword": "流量词", "searchVolume": "高/中/低", "relevance": "高/中/低"}],
  "conversionKeywords": [{"keyword": "转化词", "searchVolume": "高/中/低", "conversionRate": "高/中/低"}],
  "titleSuggestion": "建议标题（嵌入关键词）",
  "embeddingStrategy": "关键词嵌入策略说明"
}`;

    const userMessage = `请为以下商品进行关键词挖掘和分析：

商品名称：${productName}
商品分类：${category}
已有关键词：${existingKeywords || "无"}`;

    const messages = [
      { role: "system", content: systemPrompt },
      { role: "user", content: userMessage },
    ];

    const stream = await createLLMStream(messages, {
      model: "doubao-seed-2-0-lite-260215",
      temperature: 0.5,
    });

    return createSSEResponse(stream);
  } catch (error) {
    console.error("关键词挖掘失败：", error);
    return Response.json({ error: "生成失败：" + String(error) }, { status: 500 });
  }
}
