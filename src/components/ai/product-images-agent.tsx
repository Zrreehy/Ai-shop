'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Upload, Image as ImageIcon, Download, RefreshCw, Sparkles, Layers, Check } from 'lucide-react';
import Image from 'next/image';

import type { GenerateImageRequest } from '@/app/api/agents/product-images/route';

// 持久化状态钩子 - 本地存储
function useLocalStorageState<T>(key: string, initialValue: T) {
  const [state, setState] = useState<T>(() => {
    if (typeof window === 'undefined') return initialValue;
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : initialValue;
    } catch { return initialValue; }
  });
  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(state));
  }, [key, state]);
  return [state, setState] as const;
}

const sizeOptions = [
  { value: 'taobao', label: '淘宝主图 (800x800)' },
  { value: 'jd', label: '京东主图 (800x800)' },
  { value: 'pinduoduo', label: '拼多多主图 (800x800)' },
  { value: 'douyin', label: '抖音短视频图 (1080x1920)' },
  { value: 'xiaohongshu', label: '小红书种草图 (1080x1350)' },
  { value: 'banner', label: 'Banner 宣传图 (1920x800)' },
  { value: 'detail', label: '详情页长图 (800x2000)' },
];

const imageTypeOptions = [
  { value: 'all', label: '全套8张图' },
  { value: 'main', label: '主图' },
  { value: 'scene', label: '场景图' },
  { value: 'detail', label: '详情图' },
  { value: 'buyer', label: '买家秀' },
];

const styleOptions = [
  { value: 'professional', label: '专业商业摄影' },
  { value: 'casual', label: '自然生活化' },
  { value: 'luxury', label: '高端奢华' },
  { value: 'minimalist', label: '简约现代' },
];

// 新增精细化选项
const materialOptions = [
  { value: 'any', label: '不限材质' },
  { value: 'metal', label: '金属质感' },
  { value: 'fabric', label: '布艺织物' },
  { value: 'wood', label: '木质纹理' },
  { value: 'glass', label: '玻璃透明' },
  { value: 'ceramic', label: '陶瓷细腻' },
  { value: 'leather', label: '皮革高级' },
  { value: 'plastic', label: '塑料轻量' },
];

const aestheticOptions = [
  { value: 'any', label: '不限风格' },
  { value: 'ins', label: '简约INS风' },
  { value: 'business', label: '商务高级风' },
  { value: 'japanese', label: '清新日系风' },
  { value: 'minimal', label: '极简北欧风' },
  { value: 'vintage', label: '复古怀旧风' },
  { value: 'tech', label: '科技未来风' },
  { value: 'nature', label: '自然森系风' },
];

const viewOptions = [
  { value: 'any', label: '不限角度' },
  { value: 'front', label: '正面平视' },
  { value: 'side', label: '45°侧视' },
  { value: 'panorama', label: '全景俯视' },
  { value: 'closeup', label: '产品特写' },
  { value: 'lifestyle', label: '生活场景' },
];

const qualityOptions = [
  { value: '1', label: '普通 (快速生成)' },
  { value: '4', label: '高清' },
  { value: '8', label: '超高清' },
  { value: '16', label: '极致画质' },
];

export default function ProductImagesAgent() {
  const [productName, setProductName] = useLocalStorageState('product-images-name', '');
  const [category, setCategory] = useState('服饰鞋包');
  const [features, setFeatures] = useLocalStorageState('product-images-features', '');
  
  // 新增精细化参数状态
  const [material, setMaterial] = useState('any');
  const [aesthetic, setAesthetic] = useState('any');
  const [viewAngle, setViewAngle] = useState('any');
  const [addTextCards, setAddTextCards] = useState(false);
  
  // 原有参数
  const [imageType, setImageType] = useState('all');
  const [style, setStyle] = useState('professional');
  const [platform, setPlatform] = useState('taobao');
  const [count, setCount] = useState('8');
  const [quality, setQuality] = useState('4');
  
  const [customPrompt, setCustomPrompt] = useLocalStorageState('product-images-prompt', '');
  const [generatedImages, setGeneratedImages] = useLocalStorageState<string[]>('product-images-results', []);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentGenIndex, setCurrentGenIndex] = useState(0);
  const totalImagesRef = useRef(0);

  // 保存状态
  const [storedName, setStoredName] = useLocalStorageState('pi-name-s', '');
  const [storedFea, setStoredFea] = useLocalStorageState('pi-fea-s', '');
  const [storedMat, setStoredMat] = useLocalStorageState('pi-mat-s', '');
  const [storedAes, setStoredAes] = useLocalStorageState('pi-aes-s', '');
  const [storedView, setStoredView] = useLocalStorageState('pi-view-s', '');
  const [storedPlat, setStoredPlat] = useLocalStorageState('pi-plat-s', '');
  const [storedStyle, setStoredStyle] = useLocalStorageState('pi-style-s', '');
  const [storedType, setStoredType] = useLocalStorageState('pi-type-s', '');
  const [storedCount, setStoredCount] = useLocalStorageState('pi-count-s', '');
  const [storedQuality, setStoredQuality] = useLocalStorageState('pi-quality-s', '');
  const [storedText, setStoredText] = useLocalStorageState('pi-text-s', false);
  const [storedCustom, setStoredCustom] = useLocalStorageState('pi-custom-s', '');

  useEffect(() => {
    setProductName(storedName);
    setFeatures(storedFea);
    setMaterial(storedMat || 'any');
    setAesthetic(storedAes || 'any');
    setViewAngle(storedView || 'any');
    setPlatform(storedPlat || 'taobao');
    setStyle(storedStyle || 'professional');
    setImageType(storedType || 'all');
    setCount(storedCount || '8');
    setQuality(storedQuality || '4');
    setAddTextCards(storedText || false);
    setCustomPrompt(storedCustom);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const saveStateToStorage = () => {
    setStoredName(productName);
    setStoredFea(features);
    setStoredMat(material);
    setStoredAes(aesthetic);
    setStoredView(viewAngle);
    setStoredPlat(platform);
    setStoredStyle(style);
    setStoredType(imageType);
    setStoredCount(count);
    setStoredQuality(quality);
    setStoredText(addTextCards);
    setStoredCustom(customPrompt);
  };

  const handleGenerate = useCallback(async () => {
    if (!productName.trim()) return;
    saveStateToStorage();

    setIsGenerating(true);
    setProgress(0);
    setCurrentGenIndex(0);

    const countNum = parseInt(count) || 8;
    totalImagesRef.current = countNum;
    const newGeneratedImages: string[] = [];

    try {
      const reqBody: GenerateImageRequest = {
        productName,
        category,
        features,
        material,
        aesthetic,
        viewAngle,
        imageType,
        style,
        platform,
        count: countNum,
        textCard: addTextCards,
        customPrompt,
      };

      const res = await fetch('/api/agents/product-images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reqBody),
      });

      if (!res.ok) throw new Error('生成失败');
      const data = await res.json();
      
      if (data.success && data.data?.images) {
        newGeneratedImages.push(...data.data.images);
        setGeneratedImages(newGeneratedImages);
        setProgress(100);
        setCurrentGenIndex(countNum);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productName, category, features, material, aesthetic, viewAngle, imageType, style, platform, count, quality, addTextCards, customPrompt]);

  const handleDownloadAll = async () => {
    for (let i = 0; i < generatedImages.length; i++) {
      try {
        const res = await fetch(generatedImages[i]);
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${productName.replace(/\s+/g, '-')}-${i+1}.png`;
        a.click();
        URL.revokeObjectURL(url);
        await new Promise(r => setTimeout(r, 300));
      } catch {}
    }
  };

  const handleDownloadSingle = async (url: string, index: number) => {
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const dlUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = dlUrl;
      a.download = `${productName.replace(/\s+/g, '-')}-${index+1}.png`;
      a.click();
      URL.revokeObjectURL(dlUrl);
    } catch {}
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Layers className="w-7 h-7 text-amber-500" />
          电商套图智能体
        </h2>
        <p className="text-gray-400 mt-1">AI 自动生成高清商品效果图，多材质/多风格/多角度精准控制，支持多版本批量生成对比</p>
      </div>

      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid grid-cols-2 bg-neutral-800 border border-neutral-700 rounded-lg mb-6">
          <TabsTrigger value="basic" className="data-[state=active]:bg-amber-600 data-[state=active]:text-white text-gray-300">
            基础模式
          </TabsTrigger>
          <TabsTrigger value="advance" className="data-[state=active]:bg-amber-600 data-[state=active]:text-white text-gray-300">
            精细化高级模式
          </TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="mt-0">
          <Card className="bg-neutral-900 border border-neutral-800 rounded-xl">
            <CardContent className="p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-gray-200">商品名称 *</Label>
                  <Input
                    value={productName}
                    onChange={e => setProductName(e.target.value)}
                    placeholder="如：无线降噪耳机 / 复古针织毛衣"
                    className="bg-neutral-800 border-neutral-700 text-white placeholder:text-gray-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-200">商品分类</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="bg-neutral-800 border-neutral-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-neutral-800 border-neutral-700">
                      <SelectItem value="服饰鞋包">服饰鞋包</SelectItem>
                      <SelectItem value="家电数码">家电数码</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-200">商品特点/卖点</Label>
                <Input
                  value={features}
                  onChange={e => setFeatures(e.target.value)}
                  placeholder="如：40dB深度降噪、蓝牙5.3、40小时续航、折叠便携"
                  className="bg-neutral-800 border-neutral-700 text-white placeholder:text-gray-500"
                />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label className="text-gray-300 text-sm">图片类型</Label>
                  <Select value={imageType} onValueChange={setImageType}>
                    <SelectTrigger className="bg-neutral-800 border-neutral-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-neutral-800 border-neutral-700">
                      {imageTypeOptions.map(o => (
                        <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300 text-sm">视觉风格</Label>
                  <Select value={style} onValueChange={setStyle}>
                    <SelectTrigger className="bg-neutral-800 border-neutral-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-neutral-800 border-neutral-700">
                      {styleOptions.map(o => (
                        <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300 text-sm">适配平台</Label>
                  <Select value={platform} onValueChange={setPlatform}>
                    <SelectTrigger className="bg-neutral-800 border-neutral-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-neutral-800 border-neutral-700">
                      {sizeOptions.map(o => (
                        <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300 text-sm">生成数量</Label>
                  <Select value={count} onValueChange={setCount}>
                    <SelectTrigger className="bg-neutral-800 border-neutral-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-neutral-800 border-neutral-700">
                      {[1,2,4,6,8,12].map(n => (
                        <SelectItem key={n} value={String(n)}>{n} 张图</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advance" className="mt-0">
          <Card className="bg-neutral-900 border border-neutral-800 rounded-xl">
            <CardContent className="p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-gray-200">商品名称 *</Label>
                  <Input
                    value={productName}
                    onChange={e => setProductName(e.target.value)}
                    placeholder="如：无线降噪耳机 / 复古针织毛衣"
                    className="bg-neutral-800 border-neutral-700 text-white placeholder:text-gray-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-200">商品分类</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="bg-neutral-800 border-neutral-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-neutral-800 border-neutral-700">
                      <SelectItem value="服饰鞋包">服饰鞋包</SelectItem>
                      <SelectItem value="家电数码">家电数码</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-200">商品特点/卖点</Label>
                <Input
                  value={features}
                  onChange={e => setFeatures(e.target.value)}
                  placeholder="如：40dB深度降噪、蓝牙5.3、40小时续航、折叠便携"
                  className="bg-neutral-800 border-neutral-700 text-white placeholder:text-gray-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-gray-300 text-sm">产品材质</Label>
                  <Select value={material} onValueChange={setMaterial}>
                    <SelectTrigger className="bg-neutral-800 border-neutral-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-neutral-800 border-neutral-700">
                      {materialOptions.map(o => (
                        <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300 text-sm">色调美学风格</Label>
                  <Select value={aesthetic} onValueChange={setAesthetic}>
                    <SelectTrigger className="bg-neutral-800 border-neutral-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-neutral-800 border-neutral-700">
                      {aestheticOptions.map(o => (
                        <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300 text-sm">展示拍摄角度</Label>
                  <Select value={viewAngle} onValueChange={setViewAngle}>
                    <SelectTrigger className="bg-neutral-800 border-neutral-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-neutral-800 border-neutral-700">
                      {viewOptions.map(o => (
                        <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label className="text-gray-300 text-sm">图片类型</Label>
                  <Select value={imageType} onValueChange={setImageType}>
                    <SelectTrigger className="bg-neutral-800 border-neutral-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-neutral-800 border-neutral-700">
                      {imageTypeOptions.map(o => (
                        <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300 text-sm">平台尺寸</Label>
                  <Select value={platform} onValueChange={setPlatform}>
                    <SelectTrigger className="bg-neutral-800 border-neutral-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-neutral-800 border-neutral-700">
                      {sizeOptions.map(o => (
                        <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300 text-sm">生成数量</Label>
                  <Select value={count} onValueChange={setCount}>
                    <SelectTrigger className="bg-neutral-800 border-neutral-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-neutral-800 border-neutral-700">
                      {[1,2,4,6,8,12].map(n => (
                        <SelectItem key={n} value={String(n)}>{n} 张图</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300 text-sm">画质质量</Label>
                  <Select value={quality} onValueChange={setQuality}>
                    <SelectTrigger className="bg-neutral-800 border-neutral-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-neutral-800 border-neutral-700">
                      {qualityOptions.map(o => (
                        <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  variant={addTextCards ? 'default' : 'secondary'}
                  onClick={() => setAddTextCards(!addTextCards)}
                  className={addTextCards ? 'bg-amber-600 text-white' : ''}
                >
                  {addTextCards && <Check className="w-4 h-4 mr-2" />}
                  添加卖点文字卡片
                </Button>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-200">自定义提示词（补充描述）</Label>
                <Input
                  value={customPrompt}
                  onChange={e => setCustomPrompt(e.target.value)}
                  placeholder="例如：白色柔光影棚、大理石台面、暖金色灯光、高级品牌质感..."
                  className="bg-neutral-800 border-neutral-700 text-white placeholder:text-gray-500"
                />
              </div>

              <div className="bg-neutral-800/50 rounded-lg p-4 border border-neutral-700">
                <div className="flex items-center gap-2 text-amber-400 text-sm mb-2 font-medium">
                  <Sparkles className="w-4 h-4" />
                  AI 已组合参数生成完整提示词
                </div>
                <p className="text-gray-400 text-xs leading-relaxed">
                  {productName || '【商品名称】'} | {features || '【卖点】'} | 
                  材质:{material==='any'?'自动匹配':materialOptions.find(o=>o.value===material)?.label} | 
                  风格:{aesthetic==='any'?'自动适配':aestheticOptions.find(o=>o.value===aesthetic)?.label} | 
                  角度:{viewAngle==='any'?'自由环绕':viewOptions.find(o=>o.value===viewAngle)?.label} | 
                  {addTextCards?'带卖点标签卡片':'纯净产品图'}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-6 flex items-center gap-4">
        <Button
          onClick={handleGenerate}
          disabled={isGenerating || !productName.trim()}
          className="bg-gradient-to-r from-amber-500 to-amber-700 text-white px-8 py-6 text-lg font-medium hover:from-amber-600 hover:to-amber-800 disabled:opacity-50"
        >
          {isGenerating ? (
            <>
              <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
              生成中 {Math.round(progress)}% ... ({currentGenIndex}/{totalImagesRef.current})
            </>
          ) : (
            <>
              <ImageIcon className="w-5 h-5 mr-2" />
              生成全套商品效果图
            </>
          )}
        </Button>
      </div>

      {generatedImages.length > 0 && (
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-amber-500" />
              生成结果 ({generatedImages.length} 张图)
            </h3>
            <Button onClick={handleDownloadAll} className="bg-amber-700 text-white hover:bg-amber-800">
              <Download className="w-4 h-4 mr-2" />
              批量下载全部
            </Button>
          </div>

          <ScrollArea className="w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-4">
              {generatedImages.map((url, idx) => (
                <Card key={idx} className="bg-neutral-900 border border-neutral-800 overflow-hidden group">
                  <div className="relative aspect-square bg-neutral-800">
                    <Image src={url} alt={`Generated ${idx+1}`} fill className="object-contain" />
                    <Button
                      size="sm"
                      onClick={() => handleDownloadSingle(url, idx)}
                      className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                  <CardContent className="p-3">
                    <p className="text-gray-300 text-sm">商品效果图 #{idx+1}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
}
