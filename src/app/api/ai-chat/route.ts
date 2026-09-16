import { NextRequest, NextResponse } from 'next/server';
import { LLMClient, Config, HeaderUtils, type Message } from 'coze-coding-dev-sdk';

export async function POST(request: NextRequest) {
  try {
    const { messages, context } = await request.json();
    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);

    const config = new Config();
    const client = new LLMClient(config, customHeaders);

    // 构建系统提示词，包含商品信息
    const systemPrompt = `你是智选商城的 AI 客服助手，一个专业、友好、智能的购物顾问。

## 你的能力
1. **商品推荐**：根据用户需求、预算、场景推荐合适的商品
2. **商品咨询**：回答关于商品特点、规格、使用方法等问题
3. **订单查询**：查询订单状态、物流信息
4. **库存查询**：查看商品库存情况
5. **售后服务**：处理退货、换货、维修等工单
6. **购物建议**：提供搭配建议、使用技巧等

## 商品信息库
以下是商城的部分商品供你参考：
${context?.products?.map((p: { name: string; price: number; category: string; features: string }) => 
  `- ${p.name}（${p.category}）：¥${p.price}，特点：${p.features}`
).join('\n') || '暂无商品信息'}

## 回复规范
- 用中文回复，语气友好专业
- 推荐商品时说明推荐理由
- 如果用户问题超出你的能力范围，礼貌引导
- 不要编造不存在的商品信息
- 适当使用表情符号增加亲和力

## 当前用户问题
请根据用户的输入，提供专业、有帮助的回答。`;

    const chatMessages: Message[] = [
      { role: 'system', content: systemPrompt },
      ...messages.map((msg: { role: string; content: string }) => ({
        role: msg.role,
        content: msg.content,
      })),
    ];

    // 调用 LLM
    const stream = client.stream(chatMessages, {
      model: 'doubao-seed-2-0-lite-260215',
      temperature: 0.7,
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
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error) {
    console.error('AI Chat API error:', error);
    return NextResponse.json(
      { error: 'AI 服务暂时不可用' },
      { status: 500 }
    );
  }
}
