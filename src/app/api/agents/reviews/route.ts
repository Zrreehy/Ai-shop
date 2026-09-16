import { NextRequest } from "next/server";
import { LLMClient, Config, HeaderUtils, type Message } from "coze-coding-dev-sdk";

export async function POST(request: NextRequest) {
  const { reviews, productName } = await request.json();
  const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);

  const config = new Config();
  const client = new LLMClient(config, customHeaders);

  const systemPrompt = `你是一位电商评论分析专家，擅长从买家评论中提取有价值的信息来优化商品Listing。

你的任务是分析商品评论，输出以下洞察：

1. **高频好评点**：买家最常夸赞的3-5个方面
2. **高频差评痛点**：买家最常抱怨的3-5个问题
3. **高频提问**：买家最常问的问题（QA）
4. **Listing优化建议**：基于评论分析，给出具体的Listing优化方案

输出JSON格式：
{
  "positiveHighlights": [{"point": "好评点", "frequency": "高频/中频", "example": "典型评论摘录"}],
  "negativePainPoints": [{"point": "差评痛点", "frequency": "高频/中频", "example": "典型评论摘录", "listingFix": "Listing优化建议"}],
  "frequentQuestions": [{"question": "买家问题", "answer": "建议回答"}],
  "listingOptimization": [
    {"type": "标题/描述/图片/卖点", "suggestion": "具体优化建议", "priority": "高/中/低"}
  ],
  "overallSentiment": "正面/中性/负面",
  "sentimentScore": 75
}`;

  const userMessage = `请分析以下商品"${productName}"的买家评论：

${reviews}`;

  const messages: Message[] = [
    { role: "system", content: systemPrompt },
    { role: "user", content: userMessage },
  ];

  const stream = client.stream(messages, {
    model: "doubao-seed-2-0-lite-260215",
    temperature: 0.5,
  });

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          if (chunk.content) {
            controller.enqueue(encoder.encode(chunk.content.toString()));
          }
        }
        controller.close();
      } catch (error) {
        controller.error(error);
      }
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
