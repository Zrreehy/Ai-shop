/**
 * 直接调用火山引擎方舟 API 的 LLM 流式工具
 * 绕开 coze-coding-dev-sdk，避免线上环境变量读取问题
 */

export interface LLMMessage {
  role: string;
  content: string;
}

export interface LLMStreamOptions {
  model?: string;
  temperature?: number;
}

/**
 * 创建火山引擎方舟 API 的流式响应
 */
export async function createLLMStream(
  messages: LLMMessage[],
  options: LLMStreamOptions = {}
): Promise<ReadableStream> {
  const apiKey = process.env.COZE_WORKLOAD_IDENTITY_API_KEY;
  const baseUrl = process.env.COZE_INTEGRATION_MODEL_BASE_URL || 'https://ark.cn-beijing.volces.com/api/v3';

  if (!apiKey) {
    throw new Error('COZE_WORKLOAD_IDENTITY_API_KEY is not set');
  }

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: options.model || 'doubao-seed-2-0-lite-260215',
      messages,
      temperature: options.temperature ?? 0.7,
      stream: true,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('LLM API error:', response.status, errorText);
    throw new Error(`LLM API error: ${response.status} - ${errorText}`);
  }

  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error('Cannot read response stream');
  }

  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  return new ReadableStream({
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
              } catch {
                // 忽略解析错误
              }
            }
          }
        }
        controller.close();
      } catch (error) {
        console.error('LLM stream error:', error);
        controller.error(error);
      }
    },
  });
}

/**
 * 返回 SSE 格式的 Response
 */
export function createSSEResponse(stream: ReadableStream): Response {
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}

/**
 * 非流式调用，返回完整文本
 */
export async function callLLM(
  messages: LLMMessage[],
  options: LLMStreamOptions = {}
): Promise<string> {
  const stream = await createLLMStream(messages, options);
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let result = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    result += decoder.decode(value, { stream: true });
  }

  return result.trim();
}
