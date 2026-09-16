'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertCircle, CheckCircle, Shield, Package, Truck, FileText, Upload, Image as ImageIcon, Download, BarChart3, MessageSquare, Settings, ShieldAlert, RefreshCw, Sparkles } from 'lucide-react';
import { mockAfterSalesOrders, mockAfterSalesTickets, mockReviews, type AfterSalesOrder, type AfterSalesTicket, type ReviewItem } from '@/lib/data/after-sales';

type Tab = 'orders' | 'create' | 'tickets' | 'reviews' | 'malicious';

export default function AfterSalesAgent() {
  const [activeTab, setActiveTab] = useState<Tab>('orders');
  const [orders, setOrders] = useState<AfterSalesOrder[]>(mockAfterSalesOrders);
  const [tickets, setTickets] = useState<AfterSalesTicket[]>(mockAfterSalesTickets);
  const [reviews, setReviews] = useState<ReviewItem[]>(mockReviews);
  const [loading, setLoading] = useState(false);

  const [selectedOrderId, setSelectedOrderId] = useState('');
  const [problemDescription, setProblemDescription] = useState('');
  const [issueType, setIssueType] = useState<any>('quality');
  const [suggestedSolution, setSuggestedSolution] = useState<'resend' | 'partial_refund' | 'return_refund' | 'deny' | 'consult'>('return_refund');
  const [replyResult, setReplyResult] = useState<any>(null);
  const [ticketResult, setTicketResult] = useState<any>(null);
  const [reviewAnalysisResult, setReviewAnalysisResult] = useState<any>(null);
  const [maliciousResult, setMaliciousResult] = useState<any>(null);
  const [auditResult, setAuditResult] = useState<any>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);

  const activeOrder = orders.find(o => o.id === selectedOrderId);

  const tabs = [
    { key: 'orders' as Tab, label: '订单列表', icon: <Package className="w-4 h-4" /> },
    { key: 'create' as Tab, label: '创建工单', icon: <FileText className="w-4 h-4" /> },
    { key: 'tickets' as Tab, label: '工单管理', icon: <Settings className="w-4 h-4" /> },
    { key: 'reviews' as Tab, label: '评价分析', icon: <BarChart3 className="w-4 h-4" /> },
    { key: 'malicious' as Tab, label: '风险预警', icon: <ShieldAlert className="w-4 h-4" /> },
  ];

  const handlePhotoUpload = () => {
    fileInputRef.current?.click();
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = (ev) => {
          setUploadedPhotos(prev => [...prev, ev.target?.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleGenerateReply = async () => {
    if (!activeOrder) return;
    setLoading(true);
    setReplyResult(null);
    try {
      const res = await fetch('/api/agents/after-sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate-reply',
          issueType,
          productName: activeOrder.productName,
        }),
      });
      const data = await res.json();
      setReplyResult(data.success ? data.data : null);
    } finally {
      setLoading(false);
    }
  };

  const handleDetectProblem = async () => {
    if (!problemDescription) return;
    setLoading(true);
    try {
      const res = await fetch('/api/agents/after-sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'detect-problem', description: problemDescription }),
      });
      const data = await res.json();
      if (data.success) {
        setIssueType(data.data.issueType);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTicket = async () => {
    if (!activeOrder) return;
    setLoading(true);
    setTicketResult(null);
    try {
      const newTicket: AfterSalesTicket = {
        id: `TK-${Date.now()}`,
        orderId: activeOrder.id,
        productSku: activeOrder.productCode,
        customerName: `客户${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
        description: problemDescription,
        photos: uploadedPhotos,
        issueType,
        status: 'pending',
        statusText: '待处理',
        suggestedSolution,
        createdAt: new Date().toISOString(),
      };
      setTickets(prev => [newTicket, ...prev]);
      setTicketResult({ success: true, ticket: newTicket });
    } finally {
      setLoading(false);
    }
  };

  const handleReviewAnalysis = async () => {
    setLoading(true);
    setReviewAnalysisResult(null);
    try {
      const res = await fetch('/api/agents/after-sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'review-analysis', reviews }),
      });
      const data = await res.json();
      setReviewAnalysisResult(data.success ? data.data : null);
    } finally {
      setLoading(false);
    }
  };

  const handleAuditCheck = async () => {
    if (!activeOrder) return;
    setLoading(true);
    setAuditResult(null);
    try {
      const res = await fetch('/api/agents/after-sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'audit-check', orderId: activeOrder.id, issueType }),
      });
      const data = await res.json();
      setAuditResult(data.success ? data.data : null);
    } finally {
      setLoading(false);
    }
  };

  const handleMaliciousCheck = async () => {
    setLoading(true);
    setMaliciousResult(null);
    const totalRefunds = Math.floor(Math.random() * 5);
    try {
      const res = await fetch('/api/agents/after-sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'malicious-check',
          recentRefunds: totalRefunds,
          claimAmount: 300,
          orderPrice: 120,
        }),
      });
      const data = await res.json();
      setMaliciousResult(data.success ? data.data : null);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReviewReply = async (r: ReviewItem) => {
    setLoading(true);
    try {
      const res = await fetch('/api/agents/after-sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate-review-reply',
          reviewContent: r.content,
          reviewRating: r.rating,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setReviews(prev => prev.map(x => x.id === r.id ? { ...x, suggestedReply: data.data.reply } : x));
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (s: string) => {
    const map: Record<string, string> = {
      pending: 'text-yellow-400',
      processing: 'text-blue-400',
      approved: 'text-green-400',
      denied: 'text-red-400',
      resolved: 'text-gray-400',
    };
    return map[s] || 'text-gray-400';
  };

  const getLogisticsStatusColor = (s: string) => {
    const map: Record<string, string> = {
      pending: 'text-yellow-400',
      shipping: 'text-blue-400',
      delivered: 'text-cyan-400',
      signed: 'text-green-400',
    };
    return map[s] || 'text-gray-400';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Shield className="w-7 h-7 text-amber-500" />
        <div>
          <h2 className="text-2xl font-bold text-white">AI 售后智能体</h2>
          <p className="text-sm text-gray-400">自动读取订单、识别诉求、生成工单、风险预警、评价分析</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {tabs.map(tab => (
          <Button
            key={tab.key}
            variant={activeTab === tab.key ? 'default' : 'secondary'}
            onClick={() => setActiveTab(tab.key)}
            className={`gap-2 ${activeTab === tab.key ? 'bg-amber-600 hover:bg-amber-700 text-white' : 'bg-gray-800 text-gray-300'}`}
            size="sm"
          >
            {tab.icon}
            {tab.label}
          </Button>
        ))}
      </div>

      {/* 订单列表 */}
      {activeTab === 'orders' && (
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Package className="w-5 h-5 text-amber-500" />
              全部订单（{orders.length}）
            </CardTitle>
            <CardDescription className="text-gray-400">
              AI 自动读取订单、物流、售后规则，无需人工反复复制粘贴
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-3">
                {orders.map((o) => (
                  <div
                    key={o.id}
                    onClick={() => setSelectedOrderId(o.id)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      selectedOrderId === o.id ? 'border-amber-500 bg-amber-500/10' : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-mono text-sm text-amber-400">{o.id}</div>
                      <div className={`text-xs px-2 py-0.5 rounded ${getLogisticsStatusColor(o.logisticsStatus)} bg-gray-800`}>
                        {o.logisticsStatusText}
                      </div>
                    </div>
                    <div className="text-white font-medium">{o.productName}</div>
                    <div className="text-sm text-gray-400 mt-1">
                      {o.productCode} · ¥{o.price} · {o.orderDate}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">售后截止：{o.afterSalesDeadline} · 剩余 {o.afterSalesDaysLeft} 天</div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* 创建工单 */}
      {activeTab === 'create' && (
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-amber-500" />
              创建售后工单
            </CardTitle>
            <CardDescription className="text-gray-400">
              上传破损/开裂/少件/色差照片，AI 自动识别问题、打标签、生成工单
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-gray-300">关联订单</Label>
                <Select value={selectedOrderId} onValueChange={setSelectedOrderId}>
                  <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                    <SelectValue placeholder="选择订单" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    {orders.map(o => (
                      <SelectItem key={o.id} value={o.id}>{o.id} - {o.productName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300">问题类型</Label>
                <Select value={issueType} onValueChange={setIssueType}>
                  <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="damaged">物流破损</SelectItem>
                    <SelectItem value="cracked">开裂</SelectItem>
                    <SelectItem value="missing">少件</SelectItem>
                    <SelectItem value="color_diff">色差</SelectItem>
                    <SelectItem value="quality">质量问题</SelectItem>
                    <SelectItem value="mismatch">发错货</SelectItem>
                    <SelectItem value="slow_logistics">物流慢</SelectItem>
                    <SelectItem value="package">包装差</SelectItem>
                    <SelectItem value="7days_no_reason">7天无理由</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-gray-300">问题描述</Label>
              <Textarea
                value={problemDescription}
                onChange={(e) => setProblemDescription(e.target.value)}
                placeholder="描述您遇到的售后问题..."
                className="bg-gray-800 border-gray-700 text-white min-h-24"
              />
              <Button variant="secondary" size="sm" onClick={handleDetectProblem} disabled={!problemDescription || loading} className="gap-2 bg-gray-800">
                <Sparkles className="w-3 h-3" />
                AI 识别问题类型
              </Button>
            </div>

            <div className="space-y-2">
              <Label className="text-gray-300">上传凭证照片</Label>
              <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={onFileChange} className="hidden" />
              <div className="flex flex-wrap gap-3">
                {uploadedPhotos.map((p, i) => (
                  <div key={i} className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-700">
                    <img src={p} alt="" className="w-full h-full object-cover" />
                  </div>
                ))}
                <Button variant="secondary" onClick={handlePhotoUpload} className="w-24 h-24 border-dashed border-gray-600 flex flex-col gap-1 bg-gray-800">
                  <Upload className="w-5 h-5" />
                  <span className="text-xs">上传</span>
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-gray-300">建议处理方案</Label>
              <Select value={suggestedSolution} onValueChange={(v) => setSuggestedSolution(v as any)}>
                <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem value="resend">补发</SelectItem>
                  <SelectItem value="partial_refund">部分退款</SelectItem>
                  <SelectItem value="return_refund">退货退款</SelectItem>
                  <SelectItem value="deny">婉拒</SelectItem>
                  <SelectItem value="consult">先协商</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button onClick={handleGenerateReply} disabled={!activeOrder || loading} className="bg-amber-600 hover:bg-amber-700 gap-2">
                <MessageSquare className="w-4 h-4" />
                生成回复话术
              </Button>
              <Button onClick={handleAuditCheck} disabled={!activeOrder || loading} variant="secondary" className="gap-2 bg-gray-800">
                <Shield className="w-4 h-4" />
                售后规则校验
              </Button>
              <Button onClick={handleCreateTicket} disabled={!activeOrder || !problemDescription || loading} className="bg-green-600 hover:bg-green-700 gap-2">
                <CheckCircle className="w-4 h-4" />
                创建工单
              </Button>
            </div>

            {replyResult && (
              <div className="p-4 rounded-xl bg-blue-900/40 border border-blue-700">
                <div className="text-sm font-semibold text-blue-200 mb-2 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  生成回复话术
                </div>
                <p className="text-blue-100 text-sm leading-relaxed whitespace-pre-wrap">{replyResult.reply}</p>
              </div>
            )}

            {auditResult && (
              <div className={`p-4 rounded-xl ${auditResult.auditPassed ? 'bg-green-900/40 border border-green-700' : 'bg-red-900/40 border border-red-700'}`}>
                <div className={`text-sm font-semibold mb-2 flex items-center gap-2 ${auditResult.auditPassed ? 'text-green-200' : 'text-red-200'}`}>
                  {auditResult.auditPassed ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                  售后校验结果
                </div>
                <p className={`text-sm ${auditResult.auditPassed ? 'text-green-100' : 'text-red-100'}`}>
                  {auditResult.auditMessage}
                </p>
                {auditResult.daysLeft !== undefined && (
                  <p className="text-xs text-gray-300 mt-2">剩余售后天数：{auditResult.daysLeft} 天</p>
                )}
              </div>
            )}

            {ticketResult && (
              <div className="p-4 rounded-xl bg-green-900/40 border border-green-700">
                <div className="text-sm font-semibold text-green-200 mb-2 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  工单创建成功
                </div>
                <div className="text-sm text-green-100 space-y-1">
                  <p>工单编号：{ticketResult.ticket.id}</p>
                  <p>问题标签：{ticketResult.ticket.issueType}</p>
                  <p>处理方案：{ticketResult.ticket.suggestedSolution}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* 工单管理 */}
      {activeTab === 'tickets' && (
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Settings className="w-5 h-5 text-amber-500" />
              售后工单管理（{tickets.length}）
            </CardTitle>
            <CardDescription className="text-gray-400">
              AI 自动抓取订单号、SKU、问题描述，生成工单并打标签
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-3">
                {tickets.map((t) => (
                  <div key={t.id} className="p-4 rounded-xl border border-gray-700 bg-gray-800/50">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-mono text-sm text-amber-400">{t.id}</div>
                      <div className={`text-xs px-2 py-0.5 rounded ${getStatusColor(t.status)} bg-gray-800`}>
                        {t.statusText}
                      </div>
                    </div>
                    <p className="text-sm text-gray-300 line-clamp-1">{t.description}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-gray-500">{t.createdAt.slice(0, 10)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* 评价分析 */}
      {activeTab === 'reviews' && (
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-amber-500" />
              评价分析与报表
            </CardTitle>
            <CardDescription className="text-gray-400">
              AI 抓取全部评价，区分好评/中评/差评，打标签生成统计报表
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <Button onClick={handleReviewAnalysis} disabled={loading} className="bg-amber-600 hover:bg-amber-700 gap-2">
              <Sparkles className="w-4 h-4" />
              生成分析报表
            </Button>

            {reviewAnalysisResult && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="p-4 rounded-xl bg-gray-800 text-center">
                  <div className="text-3xl font-bold text-white">{reviewAnalysisResult.totalCount}</div>
                  <div className="text-xs text-gray-400 mt-1">总评价</div>
                </div>
                <div className="p-4 rounded-xl bg-green-900/40 text-center">
                  <div className="text-3xl font-bold text-green-400">{reviewAnalysisResult.positiveCount}</div>
                  <div className="text-xs text-green-300 mt-1">好评</div>
                </div>
                <div className="p-4 rounded-xl bg-yellow-900/40 text-center">
                  <div className="text-3xl font-bold text-yellow-400">{reviewAnalysisResult.neutralCount}</div>
                  <div className="text-xs text-yellow-300 mt-1">中评</div>
                </div>
                <div className="p-4 rounded-xl bg-red-900/40 text-center">
                  <div className="text-3xl font-bold text-red-400">{reviewAnalysisResult.negativeCount}</div>
                  <div className="text-xs text-red-300 mt-1">差评</div>
                </div>
              </div>
            )}

            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-3">
                {reviews.map((r) => (
                  <div key={r.id} className="p-4 rounded-xl border border-gray-700 bg-gray-800/50">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-0.5 rounded ${
                          r.status === 'positive' ? 'bg-green-900 text-green-300' :
                          r.status === 'neutral' ? 'bg-yellow-900 text-yellow-300' :
                          'bg-red-900 text-red-300'
                        }`}>
                          {r.status === 'positive' ? '好评' : r.status === 'neutral' ? '中评' : '差评'}
                        </span>
                        <span className="text-amber-400 text-sm">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                      </div>
                      <span className="text-xs text-gray-500">{r.createdAt}</span>
                    </div>
                    <p className="text-sm text-gray-200">{r.content}</p>
                    <div className="mt-3 flex items-center justify-between">
                      {!(r as any).suggestedReply ? (
                        <Button variant="secondary" size="sm" onClick={() => handleGenerateReviewReply(r)} disabled={loading} className="bg-gray-700 gap-1">
                          <RefreshCw className="w-3 h-3" />
                          AI 生成回复
                        </Button>
                      ) : (
                        <div className="flex-1 p-3 bg-blue-900/30 rounded-lg border border-blue-800 text-blue-200 text-sm">
                          <span className="font-semibold text-xs text-blue-300">AI 回复：</span> {(r as any).suggestedReply}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* 风险预警 */}
      {activeTab === 'malicious' && (
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-500" />
              恶意售后 & 物流拦截预警
            </CardTitle>
            <CardDescription className="text-gray-400">
              识别频繁退款、大量索赔、职业索赔特征，标记预警；未签收订单自动触发拦截
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <Button onClick={handleMaliciousCheck} disabled={loading} className="bg-amber-600 hover:bg-amber-700 gap-2">
              <ShieldAlert className="w-4 h-4" />
              风险检测
            </Button>

            {maliciousResult && (
              <div className={`p-5 rounded-xl ${
                maliciousResult.warning === 'malicious' ? 'bg-red-900/40 border border-red-700' :
                maliciousResult.warning === 'high_risk' ? 'bg-yellow-900/40 border border-yellow-700' :
                'bg-green-900/40 border border-green-700'
              }`}>
                <div className="text-xl mb-2 flex items-center gap-2">
                  {maliciousResult.warning === 'malicious' && <ShieldAlert className="w-6 h-6 text-red-400" />}
                  {maliciousResult.warning === 'high_risk' && <AlertCircle className="w-6 h-6 text-yellow-400" />}
                  {maliciousResult.warning === 'normal' && <CheckCircle className="w-6 h-6 text-green-400" />}
                  <span className={`font-bold ${
                    maliciousResult.warning === 'malicious' ? 'text-red-200' :
                    maliciousResult.warning === 'high_risk' ? 'text-yellow-200' : 'text-green-200'
                  }`}>
                    {maliciousResult.warning === 'malicious' ? '⚠️ 恶意售后预警' :
                     maliciousResult.warning === 'high_risk' ? '⚡ 高风险提醒' : '✅ 正常用户'}
                  </span>
                </div>
                {maliciousResult.reason && (
                  <p className="text-sm text-gray-200">{maliciousResult.reason}</p>
                )}
              </div>
            )}

            <div className="p-4 rounded-xl bg-gray-800/50 border border-gray-700">
              <h4 className="text-sm font-semibold text-gray-200 mb-3">恶意售后判定规则</h4>
              <ul className="text-yellow-100 text-sm space-y-1">
                <li>• 频繁退款（30天内 ≥3 次退款）</li>
                <li>• 大量索赔（单笔索赔金额 大于 商品价格 2 倍）</li>
                <li>• 职业索赔特征（重复售后、同一地址多账号）</li>
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-blue-900/30 border border-blue-800">
              <h4 className="text-sm font-semibold text-blue-200 mb-3 flex items-center gap-2">
                <Truck className="w-4 h-4" />
                物流拦截机制
              </h4>
              <p className="text-blue-100 text-sm">
                未签收订单客户申请退款时，AI 自动触发物流拦截，减少来回运费损耗。
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
