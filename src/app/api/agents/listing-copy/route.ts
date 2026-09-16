import { NextRequest } from "next/server";
import { createLLMStream, createSSEResponse } from "@/lib/llm-stream";

export async function POST(request: NextRequest) {
  try {
    const { productName, category, features, targetPlatform, keywords } = await request.json();

    const systemPrompt = `你是一位资深电商运营专家，擅长撰写高转化率的电商商品文案（Listing）。你精通淘宝、京东等平台的搜索算法和文案规范。
你的任务是根据用户提供的商品信息，生成完整的Listing文案方案，包括：
1. **商品标题**（30字以内，嵌入核心关键词，适配搜索算法）
2. **短标题**（15字以内，信息流展示用）
3. **卖点提炼**（5条核心卖点，每条一句话）
4. **产品短描述**（50字以内，突出核心卖点）
5. **产品长文案**（200字以内，场景化描述，激发购买欲）
6. **痛点文案**（3条，直击用户痛点）
7. **场景化话术**（3个使用场景描述）
8. **A+图文文案**（3段配图文字，适合详情页）
输出格式要求：使用JSON格式输出，字段如下：
{
  "title": "商品标题",
  "shortTitle": "短标题",
  "sellingPoints": ["卖点1", "卖点2", ...],
  "shortDesc": "短描述",
  "longDesc": "长文案",
  "painPoints": ["痛点1", ...],
  "scenarios": ["场景1", ...],
  "aplusContent": [{"title": "段落标题", "desc": "段落描述"}, ...]
}
注意：
- 标题要自然嵌入关键词，不要堆砌
- 避免使用极限词（最、第一、100%等）
- 文案要有温度，不要生硬
- 适配${targetPlatform || "淘宝"}平台风格`;

    const userMessage = `请为以下商品生成完整的Listing文案：
商品名称：${productName}
商品分类：${category}
商品特点：${features}
目标关键词：${keywords || "自动提取"}
目标平台：${targetPlatform || "淘宝"}`;

    const messages = [
      { role: "system", content: systemPrompt },
      { role: "user", content: userMessage },
    ];

    const stream = await createLLMStream(messages, {
      model: "doubao-seed-2-0-lite-260215",
      temperature: 0.7,
    });

    return createSSEResponse(stream);
  } catch (globalErr) {
    console.error("接口全局异常：", globalErr);
    return Response.json({ error: "生成失败：" + String(globalErr) }, { status: 500 });
  }
}
