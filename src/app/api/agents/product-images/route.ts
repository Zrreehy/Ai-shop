import { NextRequest, NextResponse } from 'next/server';
import { LLMClient, Config as LLMConfig, HeaderUtils } from 'coze-coding-dev-sdk';
import { ImageGenerationClient, Config as ImageConfig } from 'coze-coding-dev-sdk';

export interface GenerateImageRequest {
  productName: string;
  category?: string;
  features?: string;
  imageType?: string;
  style?: string;
  platform?: string;
  count?: number;
  textCard?: boolean;
  material?: string;
  colorStyle?: string;
  cameraAngle?: string;
  batchMode?: boolean;
  batchCount?: number;
  customPrompt?: string;
  aesthetic?: string;
  viewAngle?: string;
  quality?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: GenerateImageRequest = await request.json();
    const { 
      productName, category, features, imageType, style, platform, count, 
      textCard, material, colorStyle, cameraAngle, batchMode, batchCount,
      aesthetic, viewAngle, quality
    } = body;

    if (!productName?.trim()) {
      return NextResponse.json({
        success: false,
        error: '请输入商品名称'
      }, { status: 400 });
    }

    const headersObj: Record<string, string> = {};
    request.headers.forEach((value, key) => { headersObj[key] = value; });
    const customHeaders = HeaderUtils.extractForwardHeaders(headersObj);

    const imageClient = new ImageGenerationClient(new ImageConfig(), customHeaders);

    let promptBase = `专业电商商品摄影，${productName}`;
    
    if (category) promptBase += `，品类：${category}`;
    if (features) promptBase += `，特点：${features}`;
    if (material && material !== 'any') promptBase += `，材质：${material}`;
    if (aesthetic && aesthetic !== 'any') promptBase += `，色调风格：${aesthetic}`;
    if (viewAngle && viewAngle !== 'any') {
      const angleMap: Record<string, string> = {
        front: '正面视图',
        side: '侧面45度展示',
        panorama: '全景全方位展示'
      };
      promptBase += `，展示角度：${angleMap[viewAngle] || viewAngle}`;
    }
    if (style) {
      const styleMap: Record<string, string> = {
        professional: '专业商业影棚，纯白色背景，高清8K',
        casual: '生活化真实场景，自然光柔和，UGC真实感',
        luxury: '高端奢华质感，聚光光影，高级金属光泽',
        minimalist: '极简构图，留白美学，纯色高级背景'
      };
      promptBase += `，${styleMap[style] || style}`;
    }
    if (textCard) {
      promptBase += `，图片右下角配有 3-4 个深灰色胶囊形状卖点标签卡片，深灰背景白色文字，简短卖点关键词`;
    }

    const negativePrompt = 'no text, no watermark, no logo, no signature, no AI generated text, no "AI 生成" text, no artificial intelligence label, 无文字，无水印，无标志，无签名，无"AI 生成"字样，无 AI 标识';

    const generatedUrls: string[] = [];
    const targetCount = batchMode ? (batchCount || 3) : (count || 8);
    
    for (let i = 0; i < Math.min(targetCount, 10); i++) {
      const res = await imageClient.generate({
        prompt: `${promptBase}，第${i+1}张不同角度/不同场景展示。${negativePrompt}`,
        size: '2K',
      });
      const helper = imageClient.getResponseHelper(res);
      if (helper.success && helper.imageUrls?.[0]) {
        generatedUrls.push(helper.imageUrls[0]);
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        images: generatedUrls,
      },
    });
  } catch (err) {
    console.error('[Product Images API Error]', err);
    return NextResponse.json({
      success: false,
      error: '生成失败，请稍后重试',
    }, { status: 500 });
  }
}
