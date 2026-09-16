import { NextRequest, NextResponse } from 'next/server';
import { ImageGenerationClient, Config, HeaderUtils } from 'coze-coding-dev-sdk';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, size = '2K' } = body;

    if (!prompt) {
      return NextResponse.json(
        { error: '请提供图片描述提示词' },
        { status: 400 }
      );
    }

    // 自动追加负面提示词，避免生成文字、水印、AI标识
    const negativePrompt = 'no text, no watermark, no logo, no signature, no AI generated text, no "AI 生成" text, no artificial intelligence label, 无文字，无水印，无标志，无签名，无"AI 生成"字样，无 AI 标识，无右下角水印';
    const finalPrompt = `${prompt}. ${negativePrompt}`;

    const headersObj: Record<string, string> = {};
    request.headers.forEach((value, key) => {
      headersObj[key] = value;
    });
    const customHeaders = HeaderUtils.extractForwardHeaders(headersObj);

    const config = new Config();
    const client = new ImageGenerationClient(config, customHeaders);

    const response = await client.generate({
      prompt: finalPrompt,
      size,
    });

    const helper = client.getResponseHelper(response);

    if (helper.success) {
      return NextResponse.json({
        success: true,
        imageUrls: helper.imageUrls,
      });
    } else {
      return NextResponse.json(
        { error: '图片生成失败', details: helper.errorMessages },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('图片生成错误:', error);
    return NextResponse.json(
      { error: '图片生成服务异常' },
      { status: 500 }
    );
  }
}
