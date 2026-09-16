"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, FileText, Search, ShieldCheck, Shield, Eye, MessageSquare, Image, Loader2, Download, Sparkles, CheckCircle, AlertCircle, HelpCircle, Lightbulb, RefreshCw, GitCompare, Check, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import ProductImagesAgent from "@/components/ai/product-images-agent";
import AfterSalesAgent from "@/components/ai/after-sales-agent";

// Session storage key prefix
const STORAGE_PREFIX = "agent_state_";

// Hook to persist state to sessionStorage
function usePersistedState<T>(key: string, defaultValue: T): [T, (value: T | ((prev: T) => T)) => void] {
  const [state, setState] = useState<T>(() => {
    if (typeof window === "undefined") return defaultValue;
    try {
      const stored = sessionStorage.getItem(STORAGE_PREFIX + key);
      return stored ? JSON.parse(stored) : defaultValue;
    } catch {
      return defaultValue;
    }
  });

  const setStatePersisted = useCallback((value: T | ((prev: T) => T)) => {
    setState((prev) => {
      const newValue = typeof value === "function" ? (value as (prev: T) => T)(prev) : value;
      if (typeof window !== "undefined") {
        try {
          sessionStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(newValue));
        } catch {
          // Ignore storage errors
        }
      }
      return newValue;
    });
  }, [key]);

  return [state, setStatePersisted];
}

// Clear all agent states when leaving page
function useClearOnUnmount() {
  const router = useRouter();
  useEffect(() => {
    return () => {
      // Clear all agent states when component unmounts (page navigation)
      if (typeof window !== "undefined") {
        const keysToRemove: string[] = [];
        for (let i = 0; i < sessionStorage.length; i++) {
          const key = sessionStorage.key(i);
          if (key && key.startsWith(STORAGE_PREFIX)) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach((key) => sessionStorage.removeItem(key));
      }
    };
  }, [router]);
}

const agents = [
  { id: "copy", name: "Listing文案生成", icon: FileText, desc: "AI生成标题、描述、卖点、A+文案" },
  { id: "keywords", name: "关键词挖掘", icon: Search, desc: "挖掘核心词、长尾词、流量词、转化词" },
  { id: "compliance", name: "合规自检", icon: ShieldCheck, desc: "扫描违规词、侵权词、虚假宣传" },
  { id: "competitors", name: "竞品监控", icon: Eye, desc: "监控竞品Listing变动、价格、主图" },
  { id: "reviews", name: "评论分析", icon: MessageSquare, desc: "提炼差评痛点、买家提问、优化建议" },
  { id: "content", name: "图文配套", icon: Image, desc: "生成主图/场景图/A+页面/短视频脚本/自由生图" },
  { id: "product-images", name: "电商套图", icon: Package, desc: "一键生成主图、场景图、详情图、买家秀全套图片" },
  { id: "after-sales", name: "AI售后", icon: Shield, desc: "自动识别订单、处理售后、生成工单、分析差评、统计报表" },
];

// ==================== Listing Copy Agent ====================
function ListingCopyAgent() {
  const [form, setForm] = usePersistedState("copy_form", { productName: "", category: "", features: "", targetPlatform: "taobao", keywords: "" });
  const [result, setResult] = usePersistedState("copy_result", "");
  const [loading, setLoading] = useState(false);
  const [imagePrompt, setImagePrompt] = usePersistedState("copy_image_prompt", "");
  const [imageUrls, setImageUrls] = usePersistedState<string[]>("copy_image_urls", []);
  const [imageLoading, setImageLoading] = useState(false);

  const handleGenerate = async () => {
    if (!form.productName) return;
    setLoading(true);
    setResult("");
    setImageUrls([]);
    try {
      const res = await fetch("/api/agents/listing-copy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const reader = res.body?.getReader();
      if (!reader) return;
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        setResult((prev) => prev + decoder.decode(value));
      }
    } catch {
      setResult("生成失败，请重试");
    }
    setLoading(false);
  };

  const handleGenerateImage = async () => {
    if (!imagePrompt) return;
    setImageLoading(true);
    setImageUrls([]);
    try {
      const res = await fetch("/api/agents/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: imagePrompt, size: "2K" }),
      });
      const data = await res.json();
      if (data.success) {
        setImageUrls(data.imageUrls);
      }
    } catch {
      console.error("图片生成失败");
    }
    setImageLoading(false);
  };

  const autoFillImagePrompt = () => {
    const prompt = `专业商品摄影，${form.productName}，${form.features}，白色背景，影棚灯光，高端商业摄影风格，4K品质`;
    setImagePrompt(prompt);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm font-medium text-muted-foreground mb-1 block">商品名称 *</label>
          <Input placeholder="如：无线降噪耳机" value={form.productName} onChange={(e) => setForm({ ...form, productName: e.target.value })} />
        </div>
        <div>
          <label className="text-sm font-medium text-muted-foreground mb-1 block">商品分类</label>
          <Input placeholder="如：数码科技" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
        </div>
      </div>
      <div>
        <label className="text-sm font-medium text-muted-foreground mb-1 block">商品特点/卖点</label>
        <Textarea placeholder="如：40dB深度降噪、蓝牙5.3、40小时续航、折叠便携" value={form.features} onChange={(e) => setForm({ ...form, features: e.target.value })} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm font-medium text-muted-foreground mb-1 block">目标关键词</label>
          <Input placeholder="如：降噪耳机、蓝牙耳机" value={form.keywords} onChange={(e) => setForm({ ...form, keywords: e.target.value })} />
        </div>
        <div>
          <label className="text-sm font-medium text-muted-foreground mb-1 block">目标平台</label>
          <Select value={form.targetPlatform} onValueChange={(v) => setForm({ ...form, targetPlatform: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="taobao">淘宝/天猫</SelectItem>
              <SelectItem value="jd">京东</SelectItem>
              <SelectItem value="douyin">抖音</SelectItem>
              <SelectItem value="pdd">拼多多</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <Button onClick={handleGenerate} disabled={loading || !form.productName} className="w-full bg-amber-600 hover:bg-amber-700">
        {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />AI 生成中...</> : "生成 Listing 文案"}
      </Button>
      {result && (
        <Card>
          <CardHeader><CardTitle className="text-base">生成结果</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {(() => {
              try {
                const data = JSON.parse(result);
                return (
                  <div className="space-y-4">
                    {data.title && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground mb-1 block">标题</label>
                        <div className="p-3 bg-muted/50 rounded-lg text-sm">{data.title}</div>
                      </div>
                    )}
                    {data.shortTitle && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground mb-1 block">短标题</label>
                        <div className="p-3 bg-muted/50 rounded-lg text-sm">{data.shortTitle}</div>
                      </div>
                    )}
                    {data.sellingPoints && data.sellingPoints.length > 0 && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground mb-1 block">卖点</label>
                        <ul className="space-y-2">
                          {data.sellingPoints.map((point: string, i: number) => (
                            <li key={i} className="flex items-start gap-2 text-sm">
                              <span className="text-amber-600 mt-0.5">•</span>
                              <span>{point}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {data.shortDesc && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground mb-1 block">短描述</label>
                        <div className="p-3 bg-muted/50 rounded-lg text-sm">{data.shortDesc}</div>
                      </div>
                    )}
                    {data.longDesc && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground mb-1 block">长描述</label>
                        <div className="p-3 bg-muted/50 rounded-lg text-sm whitespace-pre-wrap">{data.longDesc}</div>
                      </div>
                    )}
                  </div>
                );
              } catch {
                return <pre className="whitespace-pre-wrap text-sm font-mono bg-muted/50 p-4 rounded-lg max-h-[400px] overflow-y-auto">{result}</pre>;
              }
            })()}
          </CardContent>
        </Card>
      )}

      {/* Image Generation Section */}
      {result && (
        <Card className="border-amber-200 bg-amber-50/30">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Image className="w-4 h-4 text-amber-600" />
              AI 商品配图生成
            </CardTitle>
            <CardDescription>根据商品信息自动生成商品主图/场景图</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-sm font-medium text-muted-foreground">图片描述提示词</label>
                <Button variant="ghost" size="sm" onClick={autoFillImagePrompt} className="text-xs text-amber-600">
                  自动填充
                </Button>
              </div>
              <Textarea
                placeholder="描述你想生成的商品图片，如：白色背景上的无线降噪耳机，专业商品摄影风格"
                value={imagePrompt}
                onChange={(e) => setImagePrompt(e.target.value)}
                rows={2}
              />
            </div>
            <Button
              onClick={handleGenerateImage}
              disabled={imageLoading || !imagePrompt}
              className="w-full bg-amber-600 hover:bg-amber-700"
            >
              {imageLoading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />AI 生图中...</> : "生成商品配图"}
            </Button>
            {imageUrls.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium text-muted-foreground mb-2">生成的图片：</p>
                <div className="grid grid-cols-2 gap-3">
                  {imageUrls.map((url, i) => (
                    <div key={i} className="relative group">
                      <img src={url} alt={`生成图片 ${i + 1}`} className="w-full rounded-lg border" />
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100"
                      >
                        <span className="bg-white/90 text-sm px-3 py-1 rounded-full">查看大图</span>
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ==================== Keywords Agent ====================
function KeywordsAgent() {
  const [form, setForm] = usePersistedState("keywords_form", { productName: "", category: "", existingKeywords: "" });
  const [result, setResult] = usePersistedState("keywords_result", "");
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    if (!form.productName) return;
    setLoading(true);
    setResult("");
    try {
      const res = await fetch("/api/agents/keywords", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const reader = res.body?.getReader();
      if (!reader) return;
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        setResult((prev) => prev + decoder.decode(value));
      }
    } catch {
      setResult("分析失败，请重试");
    }
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm font-medium text-muted-foreground mb-1 block">商品名称 *</label>
          <Input placeholder="如：无线降噪耳机" value={form.productName} onChange={(e) => setForm({ ...form, productName: e.target.value })} />
        </div>
        <div>
          <label className="text-sm font-medium text-muted-foreground mb-1 block">商品分类</label>
          <Input placeholder="如：数码科技" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
        </div>
      </div>
      <div>
        <label className="text-sm font-medium text-muted-foreground mb-1 block">已有关键词（可选）</label>
        <Textarea placeholder="输入已有的关键词，用逗号分隔" value={form.existingKeywords} onChange={(e) => setForm({ ...form, existingKeywords: e.target.value })} />
      </div>
      <Button onClick={handleAnalyze} disabled={loading || !form.productName} className="w-full bg-amber-600 hover:bg-amber-700">
        {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />分析中...</> : "挖掘关键词"}
      </Button>
      {result && (
        <Card>
          <CardHeader><CardTitle className="text-base">关键词分析结果</CardTitle></CardHeader>
          <CardContent className="space-y-6">
            {(() => {
              try {
                const data = JSON.parse(result);
                return (
                  <div className="space-y-6">
                    {data.coreKeywords && data.coreKeywords.length > 0 && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground mb-2 block">核心关键词</label>
                        <div className="flex flex-wrap gap-2">
                          {data.coreKeywords.map((kw: { keyword: string; searchVolume: string; competition: string }, i: number) => (
                            <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-full text-sm">
                              <span className="font-medium">{kw.keyword}</span>
                              <span className="text-xs text-muted-foreground">搜索:{kw.searchVolume}</span>
                              <span className="text-xs text-muted-foreground">竞争:{kw.competition}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {data.longTailKeywords && data.longTailKeywords.length > 0 && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground mb-2 block">长尾关键词</label>
                        <div className="flex flex-wrap gap-2">
                          {data.longTailKeywords.map((kw: { keyword: string; searchVolume: string; conversionRate: string }, i: number) => (
                            <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-muted/50 border rounded-full text-sm">
                              <span>{kw.keyword}</span>
                              <span className="text-xs text-muted-foreground">搜索:{kw.searchVolume}</span>
                              <span className="text-xs text-muted-foreground">转化:{kw.conversionRate}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {data.embeddingSuggestions && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground mb-2 block">埋词建议</label>
                        <div className="p-3 bg-muted/50 rounded-lg text-sm whitespace-pre-wrap">{data.embeddingSuggestions}</div>
                      </div>
                    )}
                  </div>
                );
              } catch {
                return <pre className="whitespace-pre-wrap text-sm font-mono bg-muted/50 p-4 rounded-lg max-h-[400px] overflow-y-auto">{result}</pre>;
              }
            })()}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ==================== Compliance Agent ====================
function ComplianceAgent() {
  const [form, setForm] = usePersistedState("compliance_form", { listingText: "", platform: "taobao" });
  const [result, setResult] = usePersistedState("compliance_result", "");
  const [loading, setLoading] = useState(false);

  const handleCheck = async () => {
    if (!form.listingText) return;
    setLoading(true);
    setResult("");
    try {
      const res = await fetch("/api/agents/compliance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const reader = res.body?.getReader();
      if (!reader) return;
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        setResult((prev) => prev + decoder.decode(value));
      }
    } catch {
      setResult("检测失败，请重试");
    }
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium text-muted-foreground mb-1 block">目标平台</label>
        <Select value={form.platform} onValueChange={(v) => setForm({ ...form, platform: v })}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="taobao">淘宝/天猫</SelectItem>
            <SelectItem value="jd">京东</SelectItem>
            <SelectItem value="douyin">抖音</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <label className="text-sm font-medium text-muted-foreground mb-1 block">Listing 文案内容 *</label>
        <Textarea placeholder="粘贴你的商品标题、描述、卖点等文案内容..." className="min-h-[200px]" value={form.listingText} onChange={(e) => setForm({ ...form, listingText: e.target.value })} />
      </div>
      <Button onClick={handleCheck} disabled={loading || !form.listingText} className="w-full bg-amber-600 hover:bg-amber-700">
        {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />检测中...</> : "开始合规检测"}
      </Button>
      {result && (
        <Card>
          <CardHeader><CardTitle className="text-base">合规检测报告</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {(() => {
              try {
                const data = JSON.parse(result);
                return (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className={`text-2xl font-bold ${data.passed ? "text-green-600" : "text-red-600"}`}>
                        {data.passed ? "通过" : "未通过"}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        合规评分：<span className="font-semibold text-foreground">{data.score}</span> / 100
                      </div>
                    </div>
                    {data.risks && data.risks.length > 0 && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground mb-2 block">风险项（{data.risks.length}）</label>
                        <div className="space-y-2">
                          {data.risks.map((risk: { type: string; level: string; text: string; suggestion: string }, i: number) => (
                            <div key={i} className={`p-3 rounded-lg border ${risk.level === "高" ? "bg-red-50 border-red-200" : risk.level === "中" ? "bg-amber-50 border-amber-200" : "bg-blue-50 border-blue-200"}`}>
                              <div className="flex items-center gap-2 mb-1">
                                <Badge variant={risk.level === "高" ? "destructive" : risk.level === "中" ? "default" : "secondary"} className="text-xs">{risk.type}</Badge>
                                <span className="text-xs text-muted-foreground">风险等级：{risk.level}</span>
                              </div>
                              <div className="text-sm font-medium mb-1">「{risk.text}」</div>
                              <div className="text-xs text-muted-foreground">{risk.suggestion}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {data.summary && (
                      <div className="p-3 bg-muted/50 rounded-lg text-sm">{data.summary}</div>
                    )}
                  </div>
                );
              } catch {
                return <pre className="whitespace-pre-wrap text-sm font-mono bg-muted/50 p-4 rounded-lg max-h-[400px] overflow-y-auto">{result}</pre>;
              }
            })()}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ==================== Competitors Agent ====================
function CompetitorsAgent() {
  const [allData, setAllData] = useState<Record<string, unknown>[]>([]);
  const [filteredData, setFilteredData] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastSync, setLastSync] = useState("");
  const [category, setCategory] = usePersistedState("competitors_category", "");
  const [priceRange, setPriceRange] = usePersistedState("competitors_price_range", "all");
  const [searchTerm, setSearchTerm] = usePersistedState("competitors_search_term", "");
  const [compareIds, setCompareIds] = usePersistedState<string[]>("competitors_compare_ids", []);
  const [showCompare, setShowCompare] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/agents/competitors");
      const json = await res.json();
      setAllData(json.data);
      setFilteredData(json.data);
      setLastSync(json.lastSync);
    } catch { /* ignore */ }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    let filtered = allData;
    if (category && category !== "all") {
      filtered = filtered.filter((c) => c.category === category);
    }
    if (priceRange && priceRange !== "all") {
      const [min, max] = priceRange.split("-").map(Number);
      filtered = filtered.filter((c) => {
        const price = c.price as number;
        return max ? price >= min && price <= max : price >= min;
      });
    }
    if (searchTerm) {
      filtered = filtered.filter((c) =>
        (c.name as string).toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.title as string).toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setFilteredData(filtered);
  }, [category, priceRange, searchTerm, allData]);

  const toggleCompare = (id: string) => {
    setCompareIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : prev.length < 3 ? [...prev, id] : prev
    );
  };

  const compareProducts = allData.filter((c) => compareIds.includes(c.id as string));
  const categories = [...new Set(allData.map((c) => c.category as string))];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {lastSync ? `上次同步：${new Date(lastSync).toLocaleString("zh-CN")}` : "点击加载竞品数据"}
        </div>
        <Button variant="outline" size="sm" onClick={fetchData} disabled={loading}>
          {loading ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-1" />}刷新数据
        </Button>
      </div>

      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">搜索关键词</label>
            <Input placeholder="搜索商品名称..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">商品分类</label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger><SelectValue placeholder="全部分类" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部分类</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">价格区间</label>
            <Select value={priceRange} onValueChange={setPriceRange}>
              <SelectTrigger><SelectValue placeholder="全部价格" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部价格</SelectItem>
                <SelectItem value="0-100">&yen;0 - &yen;100</SelectItem>
                <SelectItem value="100-300">&yen;100 - &yen;300</SelectItem>
                <SelectItem value="300-500">&yen;300 - &yen;500</SelectItem>
                <SelectItem value="500-1000">&yen;500 - &yen;1000</SelectItem>
                <SelectItem value="1000-99999">&yen;1000 以上</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end">
            <Button variant="outline" size="sm" onClick={() => setShowCompare(!showCompare)} className="w-full" disabled={compareIds.length < 2}>
              <GitCompare className="w-4 h-4 mr-1" />对比 ({compareIds.length}/3)
            </Button>
          </div>
        </div>
      </Card>

      {showCompare && compareProducts.length >= 2 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">竞品对比</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setShowCompare(false)}>关闭</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">对比项</th>
                    {compareProducts.map((p) => (
                      <th key={p.id as string} className="text-left p-2">{p.name as string}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="p-2 font-medium">平台</td>
                    {compareProducts.map((p) => (
                      <td key={p.id as string} className="p-2"><Badge variant="secondary">{p.platform as string}</Badge></td>
                    ))}
                  </tr>
                  <tr className="border-b">
                    <td className="p-2 font-medium">价格</td>
                    {compareProducts.map((p) => (
                      <td key={p.id as string} className="p-2 font-bold text-amber-600">&yen;{p.price as number}</td>
                    ))}
                  </tr>
                  <tr className="border-b">
                    <td className="p-2 font-medium">月销量</td>
                    {compareProducts.map((p) => (
                      <td key={p.id as string} className="p-2">{(p.monthlySales as number).toLocaleString()}</td>
                    ))}
                  </tr>
                  <tr className="border-b">
                    <td className="p-2 font-medium">评分</td>
                    {compareProducts.map((p) => (
                      <td key={p.id as string} className="p-2">{p.rating as number}</td>
                    ))}
                  </tr>
                  <tr className="border-b">
                    <td className="p-2 font-medium">核心卖点</td>
                    {compareProducts.map((p) => (
                      <td key={p.id as string} className="p-2">
                        <div className="space-y-1">
                          {(p.sellingPoints as string[]).map((sp, i) => (
                            <div key={i} className="text-xs">&bull; {sp}</div>
                          ))}
                        </div>
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-2 font-medium">近期变动</td>
                    {compareProducts.map((p) => (
                      <td key={p.id as string} className="p-2">
                        <div className="space-y-1">
                          {(p.changes as { date: string; detail: string }[]).slice(0, 2).map((c, i) => (
                            <div key={i} className="text-xs text-muted-foreground">&bull; {c.detail}</div>
                          ))}
                        </div>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredData.map((comp) => (
          <Card key={comp.id as string} className={compareIds.includes(comp.id as string) ? "ring-2 ring-amber-500" : ""}>
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <CardTitle className="text-base">{comp.name as string}</CardTitle>
                    <Badge variant="secondary">{comp.platform as string}</Badge>
                  </div>
                  <CardDescription className="line-clamp-2">{comp.title as string}</CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleCompare(comp.id as string)}
                  className={compareIds.includes(comp.id as string) ? "bg-amber-50 text-amber-700 border-amber-300" : ""}
                >
                  {compareIds.includes(comp.id as string) ? <Check className="w-4 h-4" /> : <GitCompare className="w-4 h-4" />}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-3 mb-3">
                <div className="text-center">
                  <div className="text-lg font-bold text-amber-600">&yen;{comp.price as number}</div>
                  <div className="text-xs text-muted-foreground">价格</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold">{(comp.monthlySales as number).toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground">月销</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold">{comp.rating as number}</div>
                  <div className="text-xs text-muted-foreground">评分</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold">{(comp.reviewCount as number).toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground">评价</div>
                </div>
              </div>
              <div className="space-y-1.5">
                <div className="text-xs font-medium text-muted-foreground">核心卖点</div>
                <div className="flex flex-wrap gap-1">
                  {(comp.sellingPoints as string[]).map((sp, i) => (
                    <Badge key={i} variant="outline" className="text-[10px]">{sp}</Badge>
                  ))}
                </div>
              </div>
              <div className="space-y-1.5 mt-3">
                <div className="text-xs font-medium text-muted-foreground">近期变动</div>
                {(comp.changes as { type: string; date: string; detail: string; impact: string }[]).map((change, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <Badge variant={change.impact === "高" ? "destructive" : "secondary"} className="text-[10px] px-1.5">{change.date}</Badge>
                    <span className="text-muted-foreground">{change.detail}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      {filteredData.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">暂无符合条件的竞品数据</div>
      )}
    </div>
  );
}

// ==================== Reviews Agent ====================
function ReviewsAgent() {
  const [form, setForm] = usePersistedState("reviews_form", { productName: "", reviews: "" });
  const [result, setResult] = usePersistedState("reviews_result", "");
  const [loading, setLoading] = useState(false);

  const sampleReviews = `五星好评：降噪效果很好，戴上世界都安静了。佩戴舒适，长时间不夹头。续航很强，一周充一次。
四星：音质不错，但APP连接偶尔不稳定。做工精细，性价比高。
三星：降噪一般，没有宣传的那么好。耳罩有点闷热。
差评：用了两个月左耳没声音了。蓝牙连接经常断。头梁太紧，戴久了头疼。`;

  const handleAnalyze = async () => {
    if (!form.productName || !form.reviews) return;
    setLoading(true);
    setResult("");
    try {
      const res = await fetch("/api/agents/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const reader = res.body?.getReader();
      if (!reader) return;
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        setResult((prev) => prev + decoder.decode(value));
      }
    } catch {
      setResult("分析失败，请重试");
    }
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium text-muted-foreground mb-1 block">商品名称 *</label>
        <Input placeholder="如：无线降噪耳机" value={form.productName} onChange={(e) => setForm({ ...form, productName: e.target.value })} />
      </div>
      <div>
        <label className="text-sm font-medium text-muted-foreground mb-1 block">买家评论 *</label>
        <Textarea placeholder="粘贴买家评论..." className="min-h-[150px]" value={form.reviews} onChange={(e) => setForm({ ...form, reviews: e.target.value })} />
        <Button variant="ghost" size="sm" className="mt-1 text-xs" onClick={() => setForm({ ...form, reviews: sampleReviews })}>
          加载示例评论
        </Button>
      </div>
      <Button onClick={handleAnalyze} disabled={loading || !form.productName || !form.reviews} className="w-full bg-amber-600 hover:bg-amber-700">
        {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />分析中...</> : "分析评论"}
      </Button>
      {result && (
        <Card>
          <CardHeader><CardTitle className="text-base">评论分析报告</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {(() => {
              try {
                const data = JSON.parse(result);
                return (
                  <>
                    {data.positiveHighlights && data.positiveHighlights.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-green-700 mb-2 flex items-center gap-1"><CheckCircle className="w-4 h-4" />好评亮点</h4>
                        <div className="space-y-2">
                          {data.positiveHighlights.map((h: any, i: number) => (
                            <div key={i} className="bg-green-50 border border-green-200 rounded-lg p-3">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium text-sm">{h.point}</span>
                                <span className="text-xs bg-green-200 text-green-800 px-2 py-0.5 rounded-full">{h.frequency}</span>
                              </div>
                              {h.example && <p className="text-xs text-muted-foreground">"{h.example}"</p>}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {data.negativePainPoints && data.negativePainPoints.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-red-700 mb-2 flex items-center gap-1"><AlertCircle className="w-4 h-4" />差评痛点</h4>
                        <div className="space-y-2">
                          {data.negativePainPoints.map((p: any, i: number) => (
                            <div key={i} className="bg-red-50 border border-red-200 rounded-lg p-3">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium text-sm">{p.point}</span>
                                <span className="text-xs bg-red-200 text-red-800 px-2 py-0.5 rounded-full">{p.frequency}</span>
                              </div>
                              {p.example && <p className="text-xs text-muted-foreground mb-1">"{p.example}"</p>}
                              {p.listingFix && <p className="text-xs text-amber-700 bg-amber-50 px-2 py-1 rounded">优化建议：{p.listingFix}</p>}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {data.frequentQuestions && data.frequentQuestions.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-blue-700 mb-2 flex items-center gap-1"><HelpCircle className="w-4 h-4" />高频提问</h4>
                        <div className="space-y-2">
                          {data.frequentQuestions.map((q: any, i: number) => (
                            <div key={i} className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                              <p className="font-medium text-sm">{q.question}</p>
                              {q.answer && <p className="text-xs text-muted-foreground mt-1">{q.answer}</p>}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {data.listingOptimization && data.listingOptimization.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-amber-700 mb-2 flex items-center gap-1"><Lightbulb className="w-4 h-4" />Listing 优化建议</h4>
                        <div className="space-y-2">
                          {data.listingOptimization.map((o: any, i: number) => (
                            <div key={i} className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs bg-amber-200 text-amber-800 px-2 py-0.5 rounded-full">{o.type}</span>
                                <span className={`text-xs px-2 py-0.5 rounded-full ${o.priority === "高" ? "bg-red-200 text-red-800" : o.priority === "中" ? "bg-yellow-200 text-yellow-800" : "bg-gray-200 text-gray-800"}`}>{o.priority}优先级</span>
                              </div>
                              <p className="text-sm">{o.suggestion}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                );
              } catch {
                return <pre className="whitespace-pre-wrap text-sm font-mono bg-muted/50 p-4 rounded-lg max-h-[500px] overflow-y-auto">{result}</pre>;
              }
            })()}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ==================== Content Agent ====================
interface ContentItem {
  title: string;
  copy: string;
  imagePrompt: string;
  layout: string;
}

interface ContentResult {
  contents: ContentItem[];
}

function ContentAgent() {
  const [mode, setMode] = usePersistedState<"content" | "custom">("content_mode", "content");
  const [form, setForm] = usePersistedState("content_form", { productName: "", sellingPoints: "", contentType: "main-image" });
  const [result, setResult] = usePersistedState<ContentResult | null>("content_result", null);
  const [rawResult, setRawResult] = usePersistedState("content_raw_result", "");
  const [loading, setLoading] = useState(false);
  const [generatingImage, setGeneratingImage] = useState<number | null>(null);
  const [generatedImages, setGeneratedImages] = usePersistedState<Record<number, string>>("content_generated_images", {});

  // Custom image generation states
  const [customPrompt, setCustomPrompt] = usePersistedState("content_custom_prompt", "");
  const [customSize, setCustomSize] = usePersistedState("content_custom_size", "2K");
  const [customImages, setCustomImages] = usePersistedState<string[]>("content_custom_images", []);
  const [customLoading, setCustomLoading] = useState(false);
  const [customError, setCustomError] = useState("");

  const handleGenerate = async () => {
    if (!form.productName) return;
    setLoading(true);
    setRawResult("");
    setResult(null);
    setGeneratedImages({});
    try {
      const res = await fetch("/api/agents/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const reader = res.body?.getReader();
      if (!reader) return;
      const decoder = new TextDecoder();
      let fullText = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        fullText += chunk;
        setRawResult(fullText);
      }
      try {
        const parsed = JSON.parse(fullText);
        setResult(parsed);
      } catch {
        // Keep raw result if parsing fails
      }
    } catch {
      setRawResult("生成失败，请重试");
    }
    setLoading(false);
  };

  const handleGenerateImage = async (item: ContentItem, index: number) => {
    setGeneratingImage(index);
    try {
      const res = await fetch("/api/agents/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: item.imagePrompt, size: "2K" }),
      });
      const data = await res.json();
      if (data.success && data.imageUrls?.[0]) {
        setGeneratedImages((prev) => ({ ...prev, [index]: data.imageUrls[0] }));
      } else if (!data.success) {
        alert("生图失败：" + (data.error || "未知错误"));
      }
    } catch {
      // Error handled silently
    }
    setGeneratingImage(null);
  };

  const handleCustomGenerate = async () => {
    if (!customPrompt.trim()) return;
    setCustomLoading(true);
    setCustomError("");
    try {
      const res = await fetch("/api/agents/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: customPrompt.trim(), size: customSize }),
      });
      const data = await res.json();
      if (data.success && data.imageUrls?.length) {
        setCustomImages(data.imageUrls);
      } else {
        setCustomError(data.error || "图片生成失败，请重试");
      }
    } catch {
      setCustomError("网络错误，请重试");
    }
    setCustomLoading(false);
  };

  const handleCustomDownload = async (url: string, index: number) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `product-image-${index + 1}.png`;
      link.click();
      window.URL.revokeObjectURL(blobUrl);
    } catch {
      alert("下载失败");
    }
  };

  const presets = [
    { label: "商品白底图", prompt: "专业商品摄影，{product}，纯白色背景，影棚灯光，高端商业摄影风格，无文字无水印" },
    { label: "场景展示图", prompt: "生活方式场景图，{product}，自然光线，温馨家居环境，高端质感，无文字无水印" },
    { label: "细节特写图", prompt: "产品细节特写，{product}，微距摄影，突出材质和工艺，柔和光线，无文字无水印" },
    { label: "模特展示图", prompt: "模特使用{product}的场景，自然表情，简约背景，商业摄影风格，无文字无水印" },
  ];

  const contentTypeLabels: Record<string, string> = {
    "main-image": "主图",
    scene: "场景图",
    aplus: "A+页面",
    "video-script": "短视频",
    detail: "详情页",
  };

  return (
    <div className="space-y-6">
      {/* 模式切换 */}
      <div className="flex items-center gap-2">
        <Button
          variant={mode === "content" ? "default" : "outline"}
          size="sm"
          onClick={() => setMode("content")}
          className="flex-1"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          文案模式
        </Button>
        <Button
          variant={mode === "custom" ? "default" : "outline"}
          size="sm"
          onClick={() => setMode("custom")}
          className="flex-1"
        >
          <Image className="w-4 h-4 mr-2" />
          生图模式
        </Button>
      </div>

      {mode === "content" ? (
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-1 block">商品名称 *</label>
            <Input placeholder="如：无线降噪耳机" value={form.productName} onChange={(e) => setForm({ ...form, productName: e.target.value })} />
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-1 block">核心卖点</label>
            <Textarea placeholder="如：40dB深度降噪、40小时续航、蓝牙5.3" value={form.sellingPoints} onChange={(e) => setForm({ ...form, sellingPoints: e.target.value })} />
          </div>
      <div>
        <label className="text-sm font-medium text-muted-foreground mb-1 block">内容类型</label>
        <Select value={form.contentType} onValueChange={(v) => setForm({ ...form, contentType: v })}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="main-image">主图文案</SelectItem>
            <SelectItem value="scene">场景图文案</SelectItem>
            <SelectItem value="aplus">A+页面文案</SelectItem>
            <SelectItem value="video-script">短视频脚本</SelectItem>
            <SelectItem value="detail">详情页文案</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button onClick={handleGenerate} disabled={loading || !form.productName} className="w-full bg-amber-600 hover:bg-amber-700">
        {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />生成中...</> : "生成图文内容"}
      </Button>

      {/* Loading state */}
      {loading && !result && rawResult && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              正在生成图文方案...
            </div>
          </CardContent>
        </Card>
      )}

      {/* Parsed result cards */}
      {result && result.contents && (
        <div className="space-y-4">
          <h3 className="text-base font-semibold">图文内容方案</h3>
          {result.contents.map((item, index) => (
            <Card key={index} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{item.title}</CardTitle>
                  <Badge variant="secondary">{contentTypeLabels[form.contentType] || form.contentType}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Copy text */}
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">文案内容</label>
                  <p className="text-sm whitespace-pre-wrap bg-muted/30 p-3 rounded-lg">{item.copy}</p>
                </div>

                {/* Layout suggestion */}
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">布局建议</label>
                  <p className="text-sm text-muted-foreground">{item.layout}</p>
                </div>

                {/* Image prompt */}
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">生图提示词</label>
                  <p className="text-sm text-muted-foreground italic bg-muted/20 p-2 rounded">{item.imagePrompt}</p>
                </div>

                {/* Generated image or generate button */}
                {generatedImages[index] ? (
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground">生成的图片</label>
                    <div className="relative rounded-lg overflow-hidden border">
                      <img
                        src={generatedImages[index]}
                        alt={item.title}
                        className="w-full h-auto max-h-[400px] object-contain bg-muted/20"
                      />
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const link = document.createElement("a");
                        link.href = generatedImages[index];
                        link.download = `${form.productName}-${index + 1}.png`;
                        link.click();
                      }}
                    >
                      下载图片
                    </Button>
                  </div>
                ) : (
                  <Button
                    onClick={() => handleGenerateImage(item, index)}
                    disabled={generatingImage === index}
                    variant="outline"
                    className="w-full border-amber-200 text-amber-700 hover:bg-amber-50"
                  >
                    {generatingImage === index ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" />AI 生图中（约10-20秒）...</>
                    ) : (
                      <><Image className="w-4 h-4 mr-2" />生成商品配图</>
                    )}
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Raw fallback if parsing failed */}
      {!result && rawResult && !loading && rawResult !== "生成失败，请重试" && (
        <Card>
          <CardHeader><CardTitle className="text-base">图文内容方案</CardTitle></CardHeader>
          <CardContent>
            <pre className="whitespace-pre-wrap text-sm font-mono bg-muted/50 p-4 rounded-lg max-h-[500px] overflow-y-auto">{rawResult}</pre>
          </CardContent>
        </Card>
      )}

      {/* Error state */}
      {rawResult === "生成失败，请重试" && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-destructive">{rawResult}</p>
          </CardContent>
        </Card>
      )}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Presets */}
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-2 block">快速模板</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {presets.map((p) => (
                <Button
                  key={p.label}
                  variant="outline"
                  size="sm"
                  onClick={() => setCustomPrompt(p.prompt.replace("{product}", form.productName || "商品"))}
                >
                  {p.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Prompt Input */}
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-1 block">图片描述 *</label>
            <Textarea
              placeholder="描述你想要的图片，如：专业商品摄影，白色背景，影棚灯光"
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              rows={4}
            />
          </div>

          {/* Size Selection */}
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-1 block">图片尺寸</label>
            <div className="flex gap-2">
              {["2K", "4K"].map((s) => (
                <Button key={s} variant={customSize === s ? "default" : "outline"} size="sm" onClick={() => setCustomSize(s)}>
                  {s}
                </Button>
              ))}
            </div>
          </div>

          {/* Generate Button */}
          <Button onClick={handleCustomGenerate} disabled={customLoading || !customPrompt.trim()} className="w-full bg-amber-600 hover:bg-amber-700 text-white">
            {customLoading ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" />AI 生图中（约10-20秒）...</>
            ) : (
              <><Image className="w-4 h-4 mr-2" />生成商品配图</>
            )}
          </Button>

          {/* Error */}
          {customError && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive">{customError}</div>
          )}

          {/* Generated Images */}
          {customImages.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold">生成的图片</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {customImages.map((url, i) => (
                  <Card key={i}>
                    <CardContent className="pt-4 space-y-3">
                      <div className="relative rounded-lg overflow-hidden border">
                        <img src={url} alt={`Generated ${i + 1}`} className="w-full h-auto max-h-[400px] object-contain bg-muted/20" />
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCustomDownload(url, i)}
                        className="w-full"
                      >
                        <Download className="w-4 h-4 mr-2" />下载图片
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ==================== Main Page ====================
export default function AgentsPage() {
  const [activeTab, setActiveTab] = usePersistedState("active_tab", "copy");
  useClearOnUnmount();

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border/40 bg-card/50 backdrop-blur-sm sticky top-16 z-30">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            <Link href="/"><ArrowLeft className="w-4 h-4 text-muted-foreground" /></Link>
            <div>
              <h1 className="text-lg font-bold tracking-tight flex items-center gap-2">
                <span className="text-2xl">🐵</span>
                Listing 智能体中心
              </h1>
              <p className="text-xs text-muted-foreground">AI 驱动的商品上架全流程智能工具</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Agent Overview Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
          {agents.map((agent) => {
            const Icon = agent.icon;
            return (
              <button
                key={agent.id}
                onClick={() => setActiveTab(agent.id)}
                className={`p-3 rounded-xl border text-left transition-all duration-200 ${
                  activeTab === agent.id
                    ? "border-amber-300 bg-amber-50/50 shadow-sm"
                    : "border-border/40 bg-card hover:border-border/60 hover:shadow-sm"
                }`}
              >
                <Icon className={`w-5 h-5 mb-2 ${activeTab === agent.id ? "text-amber-600" : "text-muted-foreground"}`} />
                <div className="text-xs font-semibold">{agent.name}</div>
                <div className="text-[10px] text-muted-foreground mt-0.5 line-clamp-2">{agent.desc}</div>
              </button>
            );
          })}
        </div>

        {/* Agent Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="hidden">
            {agents.map((a) => <TabsTrigger key={a.id} value={a.id}>{a.name}</TabsTrigger>)}
          </TabsList>

          <TabsContent value="copy"><Card><CardHeader><CardTitle>Listing 文案生成智能体</CardTitle><CardDescription>AI 自动生成标题、短描述、卖点、长文案、痛点文案、场景话术、A+ 图文文案</CardDescription></CardHeader><CardContent><ListingCopyAgent /></CardContent></Card></TabsContent>
          <TabsContent value="keywords"><Card><CardHeader><CardTitle>关键词挖掘 & 埋词智能体</CardTitle><CardDescription>挖掘核心词、长尾词、流量词、转化词，自动嵌入标题和描述</CardDescription></CardHeader><CardContent><KeywordsAgent /></CardContent></Card></TabsContent>
          <TabsContent value="compliance"><Card><CardHeader><CardTitle>Listing 合规自检智能体</CardTitle><CardDescription>自动扫描违规极限词、侵权风险词、虚假宣传、医疗宣称等</CardDescription></CardHeader><CardContent><ComplianceAgent /></CardContent></Card></TabsContent>
          <TabsContent value="competitors"><Card><CardHeader><CardTitle>竞品 Listing 监控智能体</CardTitle><CardDescription>持续监控竞品标题、卖点、价格、主图变动，输出优化建议</CardDescription></CardHeader><CardContent><CompetitorsAgent /></CardContent></Card></TabsContent>
          <TabsContent value="reviews"><Card><CardHeader><CardTitle>评论分析 Listing 优化智能体</CardTitle><CardDescription>提炼高频差评痛点、买家提问，反向优化 Listing</CardDescription></CardHeader><CardContent><ReviewsAgent /></CardContent></Card></TabsContent>
          <TabsContent value="content"><Card><CardHeader><CardTitle>Listing 图文配套智能体</CardTitle><CardDescription>生成主图文案、场景图、A+ 页面、短视频脚本</CardDescription></CardHeader><CardContent><ContentAgent /></CardContent></Card></TabsContent>
          <TabsContent value="product-images"><Card><CardHeader><CardTitle>电商套图生成智能体</CardTitle><CardDescription>一键生成主图、场景图、详情图、买家秀等全套电商图片，适配多平台尺寸</CardDescription></CardHeader><CardContent><ProductImagesAgent /></CardContent></Card></TabsContent>
          <TabsContent value="after-sales"><Card><CardHeader><CardTitle>AI售后智能体</CardTitle><CardDescription>自动读取订单、识别售后诉求、生成工单、分析差评、统计报表</CardDescription></CardHeader><CardContent><AfterSalesAgent /></CardContent></Card></TabsContent>

        </Tabs>
      </div>
    </div>
  );
}
