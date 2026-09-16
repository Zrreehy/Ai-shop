import { NextRequest } from "next/server";
import { LLMClient, Config, HeaderUtils, type Message } from "coze-coding-dev-sdk";

export async function POST(request: NextRequest) {
  const { listingText, platform } = await request.json();
  const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);

  const config = new Config();
  const client = new LLMClient(config, customHeaders);

  const systemPrompt = `你是一位电商合规审核专家，精通各平台（淘宝、京东、抖音等）的广告法和商品发布规范。

你的任务是审核商品Listing文案，检测以下违规风险：

1. **极限词检测**：最、第一、唯一、100%、绝对、全网最低等
2. **虚假宣传**：无法证实的功效宣称、夸大描述
3. **侵权风险**：未授权品牌词、专利描述、名人代言暗示
4. **医疗宣称**：治愈、治疗、药效等医疗相关表述
5. **违规承诺**：无效退款、永久、终身等绝对化承诺
6. **版权风险**：他人图片/文案盗用暗示

输出JSON格式：
{
  "passed": true/false,
  "score": 85,
  "risks": [
    {
      "type": "极限词/虚假宣传/侵权/医疗/违规承诺/版权",
      "level": "高/中/低",
      "text": "问题文本片段",
      "suggestion": "修改建议"
    }
  ],
  "summary": "整体审核结论"
}`;

  const userMessage = `请审核以下${platform || "淘宝"}商品Listing文案的合规性：

${listingText}`;

  const messages: Message[] = [
    { role: "system", content: systemPrompt },
    { role: "user", content: userMessage },
  ];

  const stream = client.stream(messages, {
    model: "doubao-seed-2-0-lite-260215",
    temperature: 0.3,
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
