import { NextRequest } from "next/server";
import { LLMClient, Config, HeaderUtils, type Message } from "coze-coding-dev-sdk";

export async function POST(request: NextRequest) {
  const { productName, sellingPoints, contentType } = await request.json();
  const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);

  const config = new Config();
  const client = new LLMClient(config, customHeaders);

  const contentTypes: Record<string, string> = {
    "main-image": "主图文案：简洁有力，突出核心卖点，适合800x800图片配文",
    "scene": "场景图文案：营造使用场景氛围，激发用户代入感",
    "aplus": "A+页面段落文案：图文并茂，每段配一个标题和描述",
    "video-script": "短视频脚本：15-30秒种草视频脚本，包含画面描述和旁白",
    "detail": "详情页文案：详细的产品介绍，分模块展示",
  };

  const systemPrompt = `你是一位电商视觉内容策划专家，擅长为商品详情页创作图文配套内容。

你的任务是根据商品信息，生成适配电商平台的图文内容方案。

输出JSON格式：
{
  "contents": [
    {
      "title": "内容标题",
      "copy": "配图文案",
      "imagePrompt": "建议配图描述（可用于AI生图）",
      "layout": "建议排版方式"
    }
  ],
  "overallStrategy": "整体图文策略说明"
}`;

  const userMessage = `请为以下商品生成${contentType === "video-script" ? "短视频脚本" : "图文配套内容"}：

商品名称：${productName}
核心卖点：${sellingPoints}
内容类型：${contentTypes[contentType] || contentTypes["main-image"]}
请生成3-5组内容方案。`;

  const messages: Message[] = [
    { role: "system", content: systemPrompt },
    { role: "user", content: userMessage },
  ];

  const stream = client.stream(messages, {
    model: "doubao-seed-2-0-lite-260215",
    temperature: 0.8,
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
