'use client';

import Link from 'next/link';
import {
  ArrowRight,
  Sparkles,
  Star,
  TrendingUp,
  Truck,
  Shield,
  RefreshCw,
} from 'lucide-react';
import { ProductCard } from '@/components/product/product-card';
import { useCart } from '@/lib/cart-context';
import {
  getFeaturedProducts,
  getNewProducts,
  categories,
  products,
} from '@/lib/data/products';

export default function HomePage() {
  const { setIsAIPanelOpen } = useCart();
  const featured = getFeaturedProducts();
  const newArrivals = getNewProducts();

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0A0A0A] via-[#1A1A1A] to-[#0A0A0A]">
        <div className="absolute inset-0 opacity-50">
          <div className="absolute left-1/4 top-1/4 h-64 w-64 rounded-full bg-[#C8956C]/20 blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 h-48 w-48 rounded-full bg-[#D4A574]/20 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-1.5 rounded-full border border-[#C8956C]/30 bg-[#1A1A1A] px-4 py-1.5 text-sm font-medium text-[#C8956C]">
              <Sparkles className="h-4 w-4" />
              AI 智能推荐，为你精选好物
            </div>
            <h1 className="mb-6 text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
              让 AI 帮你
              <span className="bg-gradient-to-r from-[#C8956C] to-[#D4A574] bg-clip-text text-transparent">
                找到最合适
              </span>
              的
            </h1>
            <p className="mb-10 text-base text-[#A0A0A0] sm:text-lg lg:text-xl">
              告别海量浏览，AI 购物顾问理解你的需求，
              <br className="hidden sm:block" />
              从数千商品中精准推荐最适合你的选择。
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/products"
                className="flex h-12 items-center gap-2 rounded-xl bg-gradient-to-r from-[#C8956C] to-[#D4A574] px-8 text-sm font-medium text-white shadow-lg transition-all hover:shadow-xl hover:brightness-110"
              >
                开始选购
                <ArrowRight className="h-4 w-4" />
              </Link>
              <button
                onClick={() => setIsAIPanelOpen(true)}
                className="flex h-12 items-center gap-2 rounded-xl border border-[#C8956C]/50 bg-[#1A1A1A] px-8 text-sm font-medium text-[#C8956C] transition-all hover:border-[#C8956C] hover:bg-[#2A2A2A]"
              >
                <Sparkles className="h-4 w-4" />
                问问 AI 推荐
              </button>
              <Link
                href="/agents"
                className="flex h-12 items-center gap-2 rounded-xl bg-gradient-to-r from-[#C8956C] to-[#D4A574] px-8 text-sm font-bold text-white shadow-lg transition-all hover:shadow-xl hover:brightness-110"
              >
                🐵
                Listing 智能体中心
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="border-b border-[#333333] bg-[#1A1A1A]">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-6 px-4 py-5 sm:gap-12 sm:px-6 lg:px-8">
          {[
            { icon: <Truck className="h-4 w-4" />, text: '全场包邮' },
            { icon: <Shield className="h-4 w-4" />, text: '正品保障' },
            { icon: <RefreshCw className="h-4 w-4" />, text: '7天无理由退换' },
            { icon: <Star className="h-4 w-4" />, text: '品质精选' },
          ].map((item) => (
            <div
              key={item.text}
              className="flex items-center gap-2 text-sm text-[#A0A0A0]"
            >
              <span className="text-[#C8956C]">{item.icon}</span>
              {item.text}
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-10 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">
            精选分类
          </h2>
          <Link
            href="/products"
            className="flex items-center gap-1 text-sm text-[#C8956C] hover:underline"
          >
            查看全部
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:gap-6">
          {categories.map((cat) => {
            const count = products.filter((p) => p.category === cat.id).length;
            return (
              <Link
                key={cat.id}
                href={`/products?category=${cat.id}`}
                className="group flex flex-col items-center gap-4 rounded-2xl border border-[#333333] bg-[#1A1A1A] p-8 transition-all duration-300 hover:-translate-y-1 hover:border-[#C8956C]/50 hover:shadow-lg hover:shadow-[#C8956C]/10"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-[#2A2A2A] text-3xl transition-all group-hover:bg-[#C8956C] group-hover:text-white">
                  {cat.icon}
                </div>
                <div className="text-center">
                  <h3 className="text-base font-semibold text-white">
                    {cat.name}
                  </h3>
                  <p className="mt-1 text-sm text-[#A0A0A0]">{count} 件商品</p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Featured Products */}
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="mb-10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-[#C8956C]" />
            <h2 className="text-2xl font-bold text-white">
              热门推荐
            </h2>
          </div>
          <Link
            href="/products"
            className="flex items-center gap-1 text-sm text-[#C8956C] hover:underline"
          >
            更多好物
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {featured.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </div>
      </section>

      {/* New Arrivals */}
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="mb-10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-[#C8956C]" />
            <h2 className="text-2xl font-bold text-white">
              新品上架
            </h2>
          </div>
          <Link
            href="/products?sort=newest"
            className="flex items-center gap-1 text-sm text-[#C8956C] hover:underline"
          >
            查看全部
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {newArrivals.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </div>
      </section>

      {/* AI CTA */}
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-2xl border border-[#333333] bg-gradient-to-r from-[#1A1A1A] to-[#2A2A2A] p-10 sm:p-14">
          <div className="mx-auto max-w-xl text-center">
            <div className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-[#C8956C]/30 bg-[#C8956C]/10 px-4 py-1.5 text-sm font-medium text-[#C8956C]">
              <Sparkles className="h-4 w-4" />
              AI 购物助手
            </div>
            <h2 className="mb-4 text-3xl font-bold text-white sm:text-4xl">
              不知道买什么？
            </h2>
            <p className="mb-8 text-base text-[#A0A0A0]">
              告诉 AI 顾问你的需求、预算和喜好，它会从海量商品中为你精准推荐最适合的选择。
            </p>
            <button
              onClick={() => setIsAIPanelOpen(true)}
              className="inline-flex h-12 items-center gap-2 rounded-xl bg-gradient-to-r from-[#C8956C] to-[#D4A574] px-8 text-sm font-medium text-white shadow-lg transition-all hover:shadow-xl hover:brightness-110 active:scale-[0.98]"
            >
              <Sparkles className="h-4 w-4" />
              开始 AI 推荐
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#333333] bg-[#0A0A0A]">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-r from-[#C8956C] to-[#D4A574] text-white">
                <Sparkles className="h-4 w-4" />
              </div>
              <span className="text-base font-semibold text-white">
                智选商城
              </span>
            </div>
            <p className="text-sm text-[#A0A0A0]">
              AI 驱动的智能购物体验，帮你选到最合适的。
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
