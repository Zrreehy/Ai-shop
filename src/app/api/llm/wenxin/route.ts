import { NextRequest, NextResponse } from 'next/server';
import { LLMClient, Config, HeaderUtils, type Message } from 'coze-coding-dev-sdk';

/**
 * 文心一言大模型 API 接口
 * 支持文心系列模型：ernie-4.0, ernie-3.5, ernie-speed 等
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      prompt,
      model = 'ernie-4.0',
      temperature = 0.7,
      maxTokens = 2048,
      stream = false,
      systemPrompt,
    } = body;

    if (!prompt) {
      return NextResponse.json(
        { success: false, error: '缺少 prompt 参数' },
        { status: 400 }
      );
    }

    const config = new Config();
    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);
    const client = new LLMClient(config, customHeaders);

    // 构建消息
    const messages: Message[] = [];

    if (systemPrompt) {
      messages.push({ role: 'system', content: systemPrompt });
    }

    messages.push({ role: 'user', content: prompt });

    if (stream) {
      // 流式输出
      const streamResponse = client.stream(messages, {
        model,
        temperature,
      });

      const encoder = new TextEncoder();
      const readable = new ReadableStream({
        async start(controller) {
          try {
            for await (const chunk of streamResponse) {
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
    } else {
      // 非流式输出
      const streamResponse = client.stream(messages, {
        model,
        temperature,
      });

      let fullContent = '';
      for await (const chunk of streamResponse) {
        if (chunk.content) {
          fullContent += chunk.content.toString();
        }
      }

      return NextResponse.json({
        success: true,
        data: {
          model,
          content: fullContent,
        },
      });
    }
  } catch (error) {
    console.error('文心一言 API 调用失败:', error);
    return NextResponse.json(
      { success: false, error: '文心一言 API 调用失败' },
      { status: 500 }
    );
  }
}
