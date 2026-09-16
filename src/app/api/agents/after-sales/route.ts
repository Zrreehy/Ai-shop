import { NextRequest, NextResponse } from 'next/server';
import { callLLM } from '@/lib/llm-stream';
import { mockAfterSalesOrders, mockAfterSalesRules, mockAfterSalesTickets, mockReviews, type AfterSalesOrder, type AfterSalesRule, type AfterSalesTicket, type ReviewItem } from '@/lib/data/after-sales';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const action = body.action;

    if (action === 'generate-reply') {
      const { issueType, productName } = body;
      const systemPrompt = `你是电商售后客服专家，请针对 ${productName} 商品的 "${issueType}" 问题，生成一段专业友好的回复话术，包含：安抚、致歉、解决方案三个部分。字数控制在 150-250 字。`;
      const userPrompt = `商品：${productName}，问题：${issueType}`;
      const messages = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ];
      const result = await callLLM(messages, {
        model: 'doubao-seed-2-0-lite-260215',
        temperature: 0.7,
      });
      return NextResponse.json({ success: true, data: { reply: result } });
    }

    if (action === 'detect-problem') {
      const { description } = body;
      return NextResponse.json({
        success: true,
        data: {
          issueType: description.includes('坏') || description.includes('裂') ? 'quality'
            : description.includes('收到') ? 'missing'
            : description.includes('色') ? 'color_diff'
            : description.includes('7天') ? '7days_no_reason'
            : 'quality',
        },
      });
    }

    if (action === 'review-analysis') {
      const totalCount = mockReviews.length;
      const positiveCount = mockReviews.filter((r) => r.rating >= 4).length;
      const neutralCount = mockReviews.filter((r) => r.rating === 3).length;
      const negativeCount = mockReviews.filter((r) => r.rating <= 2).length;
      const issueTags: Record<string, number> = {};
      mockReviews.forEach((r) => {
        if (r.content.includes('慢')) issueTags['物流慢'] = (issueTags['物流慢'] || 0) + 1;
        if (r.content.includes('包装')) issueTags['包装差'] = (issueTags['包装差'] || 0) + 1;
        if (r.content.includes('质量') || r.content.includes('坏')) issueTags['质量瑕疵'] = (issueTags['质量瑕疵'] || 0) + 1;
        if (r.content.includes('描述') || r.content.includes('不符')) issueTags['描述不符'] = (issueTags['描述不符'] || 0) + 1;
        if (r.content.includes('客服')) issueTags['客服态度'] = (issueTags['客服态度'] || 0) + 1;
      });
      return NextResponse.json({
        success: true,
        data: { totalCount, positiveCount, neutralCount, negativeCount, issueTags },
      });
    }

    if (action === 'malicious-check') {
      const { recentRefunds, claimAmount, orderPrice } = body;
      let warning: 'normal' | 'high_risk' | 'malicious' = 'normal';
      let reason = '';
      if (recentRefunds >= 3) {
        warning = 'malicious';
        reason = `30天内 ${recentRefunds} 次退款，疑似频繁退换货`;
      } else if (claimAmount > orderPrice * 2) {
        warning = 'malicious';
        reason = `索赔金额 ¥${claimAmount} 超过商品价格 ¥${orderPrice} 的 2 倍`;
      } else if (recentRefunds >= 2) {
        warning = 'high_risk';
        reason = `30天内 ${recentRefunds} 次退款，风险较高`;
      } else {
        reason = '行为正常，无恶意售后特征';
      }
      return NextResponse.json({ success: true, data: { warning, reason } });
    }

    if (action === 'generate-review-reply') {
      const { reviewContent, reviewRating } = body;
      const systemPrompt = `你是电商客服专家，收到一条 ${reviewRating} 分评价："${reviewContent}"。请生成一条专业礼貌的回复，感谢用户反馈，表达改进诚意，字数 80-150 字。`;
      const messages = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: reviewContent },
      ];
      const result = await callLLM(messages, {
        model: 'doubao-seed-2-0-lite-260215',
        temperature: 0.7,
      });
      return NextResponse.json({ success: true, data: { reply: result } });
    }

    if (action === 'audit-check') {
      const { orderId, issueType } = body;
      const order = mockAfterSalesOrders.find((o) => o.id === orderId);
      if (!order) return NextResponse.json({ success: false, error: '订单不存在' });
      const daysLeft = order.afterSalesDaysLeft;
      const auditPassed = daysLeft > 0;
      const auditMessage = auditPassed
        ? `✅ 售后校验通过，距售后截止还有 ${daysLeft} 天，符合售后条件`
        : `❌ 已超过售后有效期，剩余 ${daysLeft} 天，不符合售后规则`;
      return NextResponse.json({ success: true, data: { auditPassed, auditMessage, daysLeft } });
    }

    return NextResponse.json({ success: false, error: 'unknown action' }, { status: 400 });
  } catch (e) {
    console.error('售后接口异常：', e);
    return NextResponse.json({ success: false, error: String(e) }, { status: 500 });
  }
}
