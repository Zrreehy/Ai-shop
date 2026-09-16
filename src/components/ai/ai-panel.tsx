'use client';

import { useState, useCallback, useRef, useEffect } from "react";
import { X, Send, Package, Search, FileText, ChevronDown, ChevronUp, CheckCircle, Clock, Truck, AlertCircle, RotateCcw, Wrench, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { products } from '@/lib/data/products';
import { cn } from '@/lib/utils';
import { useCart } from '@/lib/cart-context';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  type?: 'text' | 'order' | 'stock' | 'ticket' | 'ticket-create';
  data?: Record<string, unknown>;
};

type Order = {
  orderId: string;
  status: '待付款' | '待发货' | '运输中' | '已签收' | '已完成';
  productName: string;
  quantity: number;
  amount: number;
  date: string;
  trackingNo?: string;
};

type Ticket = {
  ticketId: string;
  type: '退货' | '换货' | '维修';
  status: '处理中' | '已完成' | '待审核';
  productName: string;
  reason: string;
  createdAt: string;
};

const mockOrders: Order[] = [
  { orderId: 'ORD-20260801-001', status: '运输中', productName: '无线降噪耳机', quantity: 1, amount: 1299, date: '2026-08-01', trackingNo: 'SF1234567890' },
  { orderId: 'ORD-20260728-002', status: '已签收', productName: '优雅气质连衣裙', quantity: 1, amount: 599, date: '2026-07-28', trackingNo: 'YT9876543210' },
  { orderId: 'ORD-20260725-003', status: '已完成', productName: '智能运动手表', quantity: 1, amount: 1599, date: '2026-07-25' },
  { orderId: 'ORD-20260802-004', status: '待发货', productName: '经典切尔西靴', quantity: 1, amount: 899, date: '2026-08-02' },
  { orderId: 'ORD-20260803-005', status: '待付款', productName: '便携蓝牙音箱', quantity: 2, amount: 998, date: '2026-08-03' },
];

const mockTickets: Ticket[] = [
  { ticketId: 'TK-20260730-001', type: '退货', status: '处理中', productName: '优雅气质连衣裙', reason: '尺码不合适，需要换小一码', createdAt: '2026-07-30' },
  { ticketId: 'TK-20260720-002', type: '维修', status: '已完成', productName: '智能运动手表', reason: '表带扣松动', createdAt: '2026-07-20' },
];

const statusConfig: Record<string, { icon: typeof CheckCircle; color: string; bg: string }> = {
  '待付款': { icon: AlertCircle, color: 'text-amber-600', bg: 'bg-amber-50' },
  '待发货': { icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50' },
  '运输中': { icon: Truck, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  '已签收': { icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  '已完成': { icon: CheckCircle, color: 'text-gray-600', bg: 'bg-gray-50' },
  '处理中': { icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50' },
  '待审核': { icon: AlertCircle, color: 'text-amber-600', bg: 'bg-amber-50' },
};

type QuickAction = {
  label: string;
  value: string;
  icon: typeof Package;
};

const quickActions: QuickAction[] = [
  { label: '查询订单', value: 'query_order', icon: Package },
  { label: '查库存', value: 'query_stock', icon: Search },
  { label: '售后工单', value: 'query_ticket', icon: FileText },
  { label: '申请退货', value: 'create_return', icon: RotateCcw },
  { label: '申请维修', value: 'create_repair', icon: Wrench },
];

export function AIPanel() {
  const { isAIPanelOpen, setIsAIPanelOpen } = useCart();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      type: 'text',
      content: '您好！我是智选商城的 AI 客服助手 \n\n 我可以帮您：\n• 推荐适合您的商品\n• 解答商品相关问题\n• 查询订单和物流\n• 处理售后工单\n\n 请问有什么可以帮您的？',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());

  const toggleOrder = useCallback((orderId: string) => {
    setExpandedOrders((prev) => {
      const next = new Set(prev);
      if (next.has(orderId)) next.delete(orderId);
      else next.add(orderId);
      return next;
    });
  }, []);

  const addAssistantMessage = useCallback((content: string, type: Message['type'] = 'text', data?: Record<string, unknown>) => {
    setIsTyping(true);
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { id: `assistant-${Date.now()}`, role: 'assistant', content, type, data },
      ]);
      setIsTyping(false);
    }, 600 + Math.random() * 400);
  }, []);

  const handleSend = useCallback(async (text?: string) => {
    const msgText = text ?? inputText.trim();
    if (!msgText) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: msgText,
      type: 'text',
    };
    setMessages((prev) => [...prev, userMsg]);
    setInputText('');

    const lower = msgText.toLowerCase();

    // 特殊功能仍然使用本地处理
    if (lower === 'query_order' || lower.includes('查订单') || lower.includes('我的订单')) {
      addAssistantMessage('为您查询到以下订单信息：', 'order', { orders: mockOrders });
      return;
    }
    if (lower === 'query_stock' || lower.includes('查库存') || lower.includes('库存情况')) {
      const stockData = products.slice(0, 10).map((p) => ({
        name: p.name,
        stock: p.stock,
        status: p.stock > 100 ? '充足' : p.stock > 30 ? '正常' : '紧张',
      }));
      addAssistantMessage('以下是热门商品的库存情况：', 'stock', { items: stockData });
      return;
    }
    if (lower === 'query_ticket' || lower.includes('售后工单') || lower.includes('我的工单')) {
      addAssistantMessage('为您查询到以下售后工单：', 'ticket', { tickets: mockTickets });
      return;
    }
    if (lower === 'create_return' || lower.includes('申请退货')) {
      addAssistantMessage('好的，我已为您创建退货申请工单：', 'ticket-create', {
        ticketId: `TK-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${String(Math.floor(Math.random() * 999)).padStart(3, '0')}`,
        type: '退货',
        status: '待审核',
        reason: '用户申请退货',
      });
      return;
    }
    if (lower === 'create_repair' || lower.includes('申请维修')) {
      addAssistantMessage('好的，我已为您创建维修工单：', 'ticket-create', {
        ticketId: `TK-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${String(Math.floor(Math.random() * 999)).padStart(3, '0')}`,
        type: '维修',
        status: '待审核',
        reason: '用户申请维修',
      });
      return;
    }

    // 其他问题调用 LLM 智能回答
    setIsTyping(true);
    try {
      const response = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            ...messages.map((m) => ({ role: m.role, content: m.content })),
            { role: 'user', content: msgText },
          ],
          context: {
            products: products.slice(0, 20).map((p) => ({
              name: p.name,
              price: p.price,
              category: p.category,
              features: p.features.join('、'),
            })),
          },
        }),
      });

      if (!response.ok) {
        throw new Error('AI 服务暂时不可用');
      }

      // 流式读取响应
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullContent = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          fullContent += chunk;
        }
      }

      // 添加 AI 回复
      setMessages((prev) => [
        ...prev,
        { id: `assistant-${Date.now()}`, role: 'assistant', content: fullContent, type: 'text' },
      ]);
    } catch (error) {
      addAssistantMessage('抱歉，AI 服务暂时不可用，请稍后重试。');
    } finally {
      setIsTyping(false);
    }
  }, [inputText, messages, addAssistantMessage]);

  const handleQuickAction = useCallback((action: string) => {
    const actionLabels: Record<string, string> = {
      query_order: '帮我查询订单',
      query_stock: '帮我查一下库存',
      query_ticket: '查看我的售后工单',
      create_return: '我想申请退货',
      create_repair: '我想申请维修',
    };
    handleSend(actionLabels[action] ?? action);
  }, [handleSend]);

  if (!isAIPanelOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      <div
        className="absolute inset-0 bg-black/20 backdrop-blur-sm"
        onClick={() => setIsAIPanelOpen(false)}
      />
      <div className="relative ml-auto flex h-full w-full max-w-md flex-col bg-white shadow-2xl animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-amber-600">
              <span className="text-sm font-bold text-white">AI</span>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900">AI 客服助手</h3>
              <p className="text-xs text-gray-500">订单查询 / 库存 / 售后</p>
            </div>
          </div>
          <button
            onClick={() => setIsAIPanelOpen(false)}
            className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          <div className="space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  'flex',
                  msg.role === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                {msg.role === 'assistant' && (
                  <div className="mr-2 mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-amber-600">
                    <span className="text-[10px] font-bold text-white">AI</span>
                  </div>
                )}
                <div
                  className={cn(
                    'max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed',
                    msg.role === 'user'
                      ? 'bg-gray-900 text-white'
                      : 'bg-gray-50 text-gray-700'
                  )}
                >
                  {msg.type === 'text' && (
                    <p className="whitespace-pre-line">{msg.content}</p>
                  )}

                  {msg.type === 'order' && !!msg.data?.orders && (
                    <div className="space-y-2">
                      <p className="mb-3">{msg.content}</p>
                      {(msg.data.orders as Order[]).map((order: Order) => {
                        const config = statusConfig[order.status] || statusConfig['处理中'];
                        const StatusIcon = config.icon;
                        const isExpanded = expandedOrders.has(order.orderId);
                        return (
                          <div key={order.orderId} className="rounded-xl bg-white p-3 shadow-sm ring-1 ring-gray-100">
                            <button
                              className="flex w-full items-center justify-between text-left"
                              onClick={() => toggleOrder(order.orderId)}
                            >
                              <div className="flex items-center gap-2">
                                <span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium', config.bg, config.color)}>
                                  <StatusIcon className="h-3 w-3" />
                                  {order.status}
                                </span>
                                <span className="text-xs text-gray-500">{order.orderId}</span>
                              </div>
                              {isExpanded ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
                            </button>
                            {isExpanded && (
                              <div className="mt-2 space-y-1 border-t border-gray-50 pt-2 text-xs text-gray-600">
                                <p>商品：{order.productName} x{order.quantity}</p>
                                <p>金额：<span className="font-medium text-gray-900">¥{order.amount.toLocaleString()}</span></p>
                                <p>下单时间：{order.date}</p>
                                {order.trackingNo && <p>物流单号：{order.trackingNo}</p>}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {msg.type === 'stock' && !!msg.data?.items && (
                    <div className="space-y-2">
                      <p className="mb-3">{msg.content}</p>
                      <div className="rounded-xl bg-white shadow-sm ring-1 ring-gray-100">
                        {(msg.data.items as Array<{ name: string; stock: number; status: string }>).map((item, i) => (
                          <div key={i} className={cn('flex items-center justify-between px-3 py-2 text-xs', i > 0 && 'border-t border-gray-50')}>
                            <span className="text-gray-700 truncate mr-2">{item.name}</span>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className={cn(
                                'rounded-full px-2 py-0.5 font-medium',
                                item.status === '充足' ? 'bg-emerald-50 text-emerald-600' :
                                item.status === '正常' ? 'bg-blue-50 text-blue-600' :
                                'bg-amber-50 text-amber-600'
                              )}>
                                {item.status}
                              </span>
                              <span className="text-gray-500 w-8 text-right">{item.stock}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {msg.type === 'ticket' && !!msg.data?.tickets && (
                    <div className="space-y-2">
                      <p className="mb-3">{msg.content}</p>
                      {(msg.data.tickets as Ticket[]).map((ticket) => {
                        const config = statusConfig[ticket.status] || statusConfig['处理中'];
                        const StatusIcon = config.icon;
                        return (
                          <div key={ticket.ticketId} className="rounded-xl bg-white p-3 shadow-sm ring-1 ring-gray-100">
                            <div className="flex items-center justify-between">
                              <span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium', config.bg, config.color)}>
                                <StatusIcon className="h-3 w-3" />
                                {ticket.status}
                              </span>
                              <span className="text-xs text-gray-400">{ticket.ticketId}</span>
                            </div>
                            <div className="mt-2 space-y-1 text-xs text-gray-600">
                              <p>类型：<span className="font-medium text-gray-800">{ticket.type}</span></p>
                              <p>商品：{ticket.productName}</p>
                              <p>原因：{ticket.reason}</p>
                              <p>创建时间：{ticket.createdAt}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {msg.type === 'ticket-create' && !!msg.data && (
                    <div className="space-y-2">
                      <p className="mb-3">{msg.content}</p>
                      <div className="rounded-xl bg-white p-3 shadow-sm ring-1 ring-gray-100">
                        <div className="flex items-center justify-between">
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-600">
                            <AlertCircle className="h-3 w-3" />
                            {msg.data.status as string}
                          </span>
                          <span className="text-xs text-gray-400">{msg.data.ticketId as string}</span>
                        </div>
                        <div className="mt-2 space-y-1 text-xs text-gray-600">
                          <p>类型：<span className="font-medium text-gray-800">{msg.data.type as string}</span></p>
                          <p>原因：{msg.data.reason as string}</p>
                          <p>创建时间：{new Date().toISOString().slice(0, 10)}</p>
                        </div>
                        <p className="mt-2 text-xs text-emerald-600">工单已提交，预计 1-3 个工作日内处理。</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-amber-600">
                  <span className="text-[10px] font-bold text-white">AI</span>
                </div>
                <div className="rounded-2xl bg-gray-50 px-4 py-3">
                  <div className="flex gap-1">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-gray-300" style={{ animationDelay: '0ms' }} />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-gray-300" style={{ animationDelay: '150ms' }} />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-gray-300" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="border-t border-gray-100 px-4 py-2">
          <div className="flex flex-wrap gap-1.5">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.value}
                  onClick={() => handleQuickAction(action.value)}
                  className="inline-flex items-center gap-1 rounded-full bg-gray-50 px-3 py-1.5 text-xs text-gray-600 transition-colors hover:bg-amber-50 hover:text-amber-700"
                >
                  <Icon className="h-3 w-3" />
                  {action.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Input */}
        <div className="border-t border-gray-100 px-4 py-3">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="输入您的问题..."
              className="flex-1 rounded-full bg-gray-50 px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 outline-none ring-1 ring-gray-200 transition-shadow focus:ring-2 focus:ring-amber-400"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-900 text-white transition-colors hover:bg-gray-800 disabled:opacity-40"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export function AIPanelTrigger() {
  const { isAIPanelOpen, setIsAIPanelOpen } = useCart();

  return (
    <>
      <div className="fixed bottom-6 right-6 z-40 flex flex-col gap-3">
        {/* 智能体中心按钮 - 上面 */}
        <Link
          href="/agents"
          className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-amber-700 text-white shadow-lg shadow-amber-300/30 transition-all hover:scale-105 hover:shadow-xl hover:shadow-amber-300/40"
          title="智能体中心"
        >
          <span className="text-2xl">🐵</span>
        </Link>

        {/* AI 客服助手按钮 - 下面 */}
        <button
          onClick={() => setIsAIPanelOpen(true)}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-orange-600 text-white shadow-lg shadow-orange-300/30 transition-all hover:scale-105 hover:shadow-xl hover:shadow-orange-300/40"
          title="AI 客服助手"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.18 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
          </svg>
        </button>
      </div>
    </>
  );
}
