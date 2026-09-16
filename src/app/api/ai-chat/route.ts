import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { messages, context } = await request.json();

    const apiKey = process.env.COZE_WORKLOAD_IDENTITY_API_KEY;
    const baseUrl = process.env.COZE_INTEGRATION_MODEL_BASE_URL || 'https://ark.cn-beijing.volces.com/api/v3';

    if (!apiKey) {
      console.error('AI Chat error: COZE_WORKLOAD_IDENTITY_API_KEY is not set');
      return NextResponse.json(
        { error: 'API Key 未配置' },
        { status: 500 }
      );
    }

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

    const chatMessages = [
      { role: 'system', content: systemPrompt },
      ...messages.map((msg: { role: string; content: string }) => ({
        role: msg.role,
        content: msg.content,
      })),
    ];

    // 直接调用火山引擎方舟 API（兼容 OpenAI 格式）
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'doubao-seed-2-0-lite-260215',
        messages: chatMessages,
        temperature: 0.7,
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Chat API error:', response.status, errorText);
      return NextResponse.json(
        { error: `AI 服务调用失败: ${response.status}` },
        { status: 500 }
      );
    }

    // 处理流式响应
    const reader = response.body?.getReader();
    if (!reader) {
      return NextResponse.json(
        { error: '无法读取响应流' },
        { status: 500 }
      );
    }

    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    const readable = new ReadableStream({
      async start(controller) {
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split('\n');

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6);
                if (data === '[DONE]') continue;
                try {
                  const parsed = JSON.parse(data);
                  const content = parsed.choices?.[0]?.delta?.content;
                  if (content) {
                    controller.enqueue(encoder.encode(content));
                  }
                } catch (e) {
                  // 忽略解析错误
                }
              }
            }
          }
          controller.close();
        } catch (error) {
          console.error('Stream error:', error);
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
