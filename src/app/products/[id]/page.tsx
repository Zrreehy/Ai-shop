"use client";

import { useState, useCallback, useEffect, use } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { products, type Product } from "@/lib/data/products";
import { useCart } from "@/lib/cart-context";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ShoppingCart, Heart, Star, CheckCircle, X, RefreshCw, ZoomIn, ZoomOut } from "lucide-react";
import Image from "next/image";

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export default function ProductDetailPage({ params }: Props) {
  const resolvedParams = use(params);
  const product: Product | undefined = products.find((p) => p.id === resolvedParams.id);

  if (!product) {
    notFound();
  }

  const cart = useCart();
  const [quantity, setQuantity] = useState(1);
  const [isFavorited, setIsFavorited] = useState(false);
  const [viewMode, setViewMode] = useState<"2d" | "3d">("3d");
  const [rotationY, setRotationY] = useState(0);
  const [rotationX, setRotationX] = useState(0);
  const [scale, setScale] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragStartY, setDragStartY] = useState(0);
  const [startRotationY, setStartRotationY] = useState(0);
  const [startRotationX, setStartRotationX] = useState(0);
  const [isAutoRotating, setIsAutoRotating] = useState(false);
  const normalizeAngle = useCallback((angle: number) => ((angle % 360) + 360) % 360, []);

  const handleAddToCart = () => {
    cart.addToCart(product, quantity);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (viewMode !== "3d") return;
    setIsDragging(true);
    setDragStartX(e.clientX);
    setDragStartY(e.clientY);
    setStartRotationY(rotationY);
    setStartRotationX(rotationX);
    e.preventDefault();
  };

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - dragStartX;
      const deltaY = e.clientY - dragStartY;
      setRotationY(normalizeAngle(startRotationY + deltaX * 0.5));
      setRotationX(Math.max(-30, Math.min(30, startRotationX - deltaY * 0.3)));
    },
    [isDragging, dragStartX, dragStartY, startRotationY, startRotationX, normalizeAngle]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  useEffect(() => {
    if (!isAutoRotating || viewMode !== "3d" || isDragging) return;
    const interval = setInterval(() => {
      setRotationY((prev) => normalizeAngle(prev + 0.8));
    }, 30);
    return () => clearInterval(interval);
  }, [isAutoRotating, viewMode, isDragging, normalizeAngle]);

  const resetView = () => {
    setRotationY(0);
    setRotationX(0);
    setScale(1);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
          <Link href="/" className="hover:text-[#C8956C] transition-colors">首页</Link>
          <span>/</span>
          <Link href="/products" className="hover:text-[#C8956C] transition-colors">全部商品</Link>
          <span>/</span>
          <span className="text-white">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Image Area */}
          <div className="space-y-4">
            {/* 3D View Container */}
            <div className="relative bg-gradient-to-br from-[#1A1A1A] to-[#0A0A0A] rounded-2xl overflow-hidden select-none">
              {/* Mode Tabs */}
              <div className="absolute top-4 left-4 z-10 flex gap-2">
                <Button
                  size="sm"
                  variant={viewMode === "2d" ? "default" : "secondary"}
                  onClick={() => { setViewMode("2d"); setIsAutoRotating(false); }}
                  className="text-xs rounded-full"
                >
                  2D 查看
                </Button>
                <Button
                  size="sm"
                  variant={viewMode === "3d" ? "default" : "secondary"}
                  onClick={() => { setViewMode("3d"); }}
                  className="text-xs rounded-full bg-[#C8956C] hover:bg-[#D4A574]"
                >
                  3D 立体
                </Button>
              </div>

              {/* Control Buttons */}
              <div className="absolute top-4 right-4 z-10 flex gap-2">
                <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full bg-black/50 hover:bg-black/70" onClick={() => setScale((s) => Math.min(3, s + 0.2))}>
                  <ZoomIn size={14} />
                </Button>
                <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full bg-black/50 hover:bg-black/70" onClick={() => setScale((s) => Math.max(0.5, s - 0.2))}>
                  <ZoomOut size={14} />
                </Button>
                <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full bg-black/50 hover:bg-black/70" onClick={resetView}>
                  <RefreshCw size={14} />
                </Button>
              </div>

              {/* Scale Indicator */}
              <div className="absolute top-14 right-4 z-10 text-xs text-gray-400 bg-black/40 px-2 py-1 rounded">
                {Math.round(scale * 100)}%
              </div>

              {/* 3D Product Scene - No extra geometry, just the product itself */}
              <div
                className="relative w-full h-[500px] overflow-hidden cursor-grab active:cursor-grabbing"
                style={{ perspective: "1200px" }}
                onMouseDown={handleMouseDown}
              >
                {/* Soft ambient glow */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/30 pointer-events-none" />

                {/* Ground shadow */}
                <div
                  className="absolute bottom-0 left-1/2 w-48 h-6 rounded-full blur-2xl bg-black/40"
                  style={{
                    transform: `translateX(-50%) translateY(${Math.abs(rotationY) > 10 ? Math.abs(rotationY) / 8 : 0}px) scale(${0.85 + (1 - Math.min(Math.abs(rotationY), 180) / 180) * 0.3})`
                  }}
                />

                {/* ONLY the product itself in pure 3D space, NO black cubes/geometry */}
                <div
                  className="absolute top-1/2 left-1/2"
                  style={{
                    transformStyle: "preserve-3d",
                    transformOrigin: "50% 50%",
                    transform: `translate(-50%, -50%) rotateY(${rotationY}deg) rotateX(${rotationX}deg) scale(${scale})`,
                    transition: isDragging ? "none" : "transform 0.05s ease-out"
                  }}
                >
                  <Image
                    src={product.image}
                    alt={product.name}
                    width={420}
                    height={420}
                    className="object-contain pointer-events-none"
                    draggable={false}
                    priority
                  />
                </div>
              </div>

              {/* Mode Control Bar */}
              <div className="p-4 border-t border-white/10 flex items-center justify-between">
                {viewMode === "3d" ? (
                  <>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="bg-[#1A1A1A] text-gray-300">
                        🖱️ 拖动鼠标 360° 旋转产品
                      </Badge>
                      {Math.abs(rotationY) > 0.5 && (
                        <span className="text-xs text-gray-500">Y: {Math.round(rotationY)}°</span>
                      )}
                      {Math.abs(rotationX) > 0.5 && (
                        <span className="text-xs text-gray-500">X: {Math.round(rotationX)}°</span>
                      )}
                    </div>
                    <Button
                      size="sm"
                      variant={isAutoRotating ? "default" : "secondary"}
                      onClick={() => setIsAutoRotating(!isAutoRotating)}
                      className={isAutoRotating ? "bg-[#C8956C] hover:bg-[#D4A574]" : ""}
                    >
                      {isAutoRotating ? <X size={14} className="mr-1" /> : <RefreshCw size={14} className="mr-1" />}
                      {isAutoRotating ? "停止旋转" : "360° 自动展示"}
                    </Button>
                  </>
                ) : (
                  <div className="flex items-center justify-center w-full">
                    <span className="text-sm text-gray-400">2D 图片预览模式</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Product Info Area */}
          <ScrollArea className="h-auto max-h-[calc(100vh-180px)] pr-2">
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold tracking-tight mb-2">{product.name}</h1>
                {("productCode" in product) && product.productCode && (
                  <p className="text-sm text-gray-500 mb-2">商品编号：{product.productCode}</p>
                )}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold">{product.rating}</span>
                  </div>
                  <span className="text-gray-500">({product.reviewCount} 条评价)</span>
                  <Separator orientation="vertical" className="h-5 bg-white/10" />
                  <Badge className="bg-[#1A1A1A] text-gray-300">{product.category}</Badge>
                </div>
              </div>

              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-[#C8956C]">¥{product.price}</span>
              </div>

              <p className="text-gray-400 leading-relaxed">{product.description}</p>

              <Separator className="bg-white/10" />

              {/* Quantity */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-300">数量</label>
                <div className="flex items-center gap-3">
                  <Button size="icon" variant="secondary" onClick={() => setQuantity(Math.max(1, quantity - 1))} className="h-10 w-10 bg-[#1A1A1A] border-white/10">-</Button>
                  <span className="w-12 text-center font-medium text-lg">{quantity}</span>
                  <Button size="icon" variant="secondary" onClick={() => setQuantity(quantity + 1)} className="h-10 w-10 bg-[#1A1A1A] border-white/10">+</Button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <Button size="lg" className="flex-1 bg-[#C8956C] hover:bg-[#D4A574] text-black font-semibold text-base" onClick={handleAddToCart}>
                  <ShoppingCart className="mr-2 h-5 w-5" /> 加入购物车
                </Button>
                <Button size="icon" variant="secondary" className="h-14 w-14 rounded-full bg-[#1A1A1A] border-white/10" onClick={() => setIsFavorited(!isFavorited)}>
                  <Heart className={`h-5 w-5 ${isFavorited ? "fill-red-500 text-red-500" : "text-gray-400"}`} />
                </Button>
              </div>

              {/* Service Info */}
              <Card className="bg-[#1A1A1A] border-white/10 p-4">
                <div className="space-y-3">
                  {[
                    { icon: CheckCircle, label: "正品保障" },
                    { icon: CheckCircle, label: "7天无理由退换" },
                    { icon: CheckCircle, label: "全场包邮" }
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm text-gray-400">
                      <item.icon size={16} className="text-[#C8956C]" />
                      {item.label}
                    </div>
                  ))}
                </div>
              </Card>

              <Separator className="bg-white/10" />

              {/* Features */}
              {product.features && product.features.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3">产品特点</h3>
                  <ul className="space-y-2">
                    {product.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-400">
                        <CheckCircle size={14} className="mt-0.5 text-[#C8956C] shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}