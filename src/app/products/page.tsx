'use client';

import { useState, useMemo, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  SlidersHorizontal,
  Grid3X3,
  LayoutList,
  ChevronDown,
  Search,
  X,
} from 'lucide-react';
import { ProductCard } from '@/components/product/product-card';
import {
  products,
  categories,
  searchProducts,
  getProductsByCategory,
} from '@/lib/data/products';
import { cn } from '@/lib/utils';

type SortOption = 'default' | 'price-asc' | 'price-desc' | 'rating' | 'reviews';
type ViewMode = 'grid' | 'list';

function ProductsContent() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get('category');
  const searchParam = searchParams.get('search');

  const [selectedCategory, setSelectedCategory] = useState<string>(
    categoryParam || 'all'
  );
  const [sortBy, setSortBy] = useState<SortOption>('default');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchQuery, setSearchQuery] = useState(searchParam || '');
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000]);

  useEffect(() => {
    if (categoryParam) setSelectedCategory(categoryParam);
  }, [categoryParam]);

  useEffect(() => {
    if (searchParam) setSearchQuery(searchParam);
  }, [searchParam]);

  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Filter by search
    if (searchQuery.trim()) {
      result = searchProducts(searchQuery.trim());
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      result = result.filter((p) => p.category === selectedCategory);
    }

    // Filter by price range
    result = result.filter(
      (p) => p.price >= priceRange[0] && p.price <= priceRange[1]
    );

    // Sort
    switch (sortBy) {
      case 'price-asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'reviews':
        result.sort((a, b) => b.reviewCount - a.reviewCount);
        break;
    }

    return result;
  }, [selectedCategory, sortBy, searchQuery, priceRange]);

  const clearFilters = () => {
    setSelectedCategory('all');
    setSearchQuery('');
    setSortBy('default');
    setPriceRange([0, 5000]);
  };

  const hasActiveFilters =
    selectedCategory !== 'all' ||
    searchQuery.trim() !== '' ||
    priceRange[0] !== 0 ||
    priceRange[1] !== 5000;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1A1A1A]">
          {selectedCategory !== 'all'
            ? categories.find((c) => c.id === selectedCategory)?.name || '全部商品'
            : searchQuery
              ? `搜索: "${searchQuery}"`
              : '全部商品'}
        </h1>
        <p className="mt-1 text-sm text-[#6B6B6B]">
          共 {filteredProducts.length} 件商品
        </p>
      </div>

      {/* Toolbar */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          {/* Category pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            <button
              onClick={() => setSelectedCategory('all')}
              className={cn(
                'shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
                selectedCategory === 'all'
                  ? 'bg-[#1A1A1A] text-white'
                  : 'bg-[#F5F4F1] text-[#6B6B6B] hover:bg-[#E8E6E1]'
              )}
            >
              全部
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={cn(
                  'shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
                  selectedCategory === cat.id
                    ? 'bg-[#1A1A1A] text-white'
                    : 'bg-[#F5F4F1] text-[#6B6B6B] hover:bg-[#E8E6E1]'
                )}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Filter toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              'flex h-8 items-center gap-1.5 rounded-lg border px-3 text-xs font-medium transition-colors',
              showFilters || hasActiveFilters
                ? 'border-[#C8956C] text-[#C8956C]'
                : 'border-[#E8E6E1] text-[#6B6B6B] hover:border-[#C8956C]'
            )}
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            筛选
            {hasActiveFilters && (
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#C8956C] text-[10px] text-white">
                !
              </span>
            )}
          </button>

          {/* Sort */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="h-8 appearance-none rounded-lg border border-[#E8E6E1] bg-white py-0 pl-3 pr-8 text-xs text-[#6B6B6B] focus:border-[#C8956C] focus:outline-none"
            >
              <option value="default">默认排序</option>
              <option value="price-asc">价格从低到高</option>
              <option value="price-desc">价格从高到低</option>
              <option value="rating">评分最高</option>
              <option value="reviews">评价最多</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#6B6B6B]" />
          </div>

          {/* View mode */}
          <div className="hidden items-center rounded-lg border border-[#E8E6E1] sm:flex">
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-l-lg transition-colors',
                viewMode === 'grid'
                  ? 'bg-[#1A1A1A] text-white'
                  : 'text-[#6B6B6B] hover:bg-[#F5F4F1]'
              )}
            >
              <Grid3X3 className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-r-lg transition-colors',
                viewMode === 'list'
                  ? 'bg-[#1A1A1A] text-white'
                  : 'text-[#6B6B6B] hover:bg-[#F5F4F1]'
              )}
            >
              <LayoutList className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="mb-6 rounded-xl border border-[#E8E6E1] bg-white p-4">
          <div className="flex flex-wrap items-start gap-6">
            {/* Search */}
            <div className="w-full sm:w-auto sm:flex-1">
              <label className="mb-1.5 block text-xs font-medium text-[#1A1A1A]">
                搜索
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B6B6B]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="搜索商品名称、标签..."
                  className="h-9 w-full rounded-lg border border-[#E8E6E1] bg-[#FAFAF8] pl-9 pr-3 text-sm focus:border-[#C8956C] focus:outline-none"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-[#6B6B6B] hover:text-[#1A1A1A]"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Category */}
            <div className="w-40">
              <label className="mb-1.5 block text-xs font-medium text-[#1A1A1A]">
                商品分类
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="h-9 w-full appearance-none rounded-lg border border-[#E8E6E1] bg-[#FAFAF8] px-3 pr-8 text-sm focus:border-[#C8956C] focus:outline-none"
              >
                <option value="">全部分类</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Price Range */}
            <div className="w-48">
              <label className="mb-1.5 block text-xs font-medium text-[#1A1A1A]">
                价格范围
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={priceRange[0]}
                  onChange={(e) =>
                    setPriceRange([Number(e.target.value), priceRange[1]])
                  }
                  className="h-9 w-full rounded-lg border border-[#E8E6E1] bg-[#FAFAF8] px-2 text-sm focus:border-[#C8956C] focus:outline-none"
                  placeholder="最低"
                  min={0}
                />
                <span className="text-[#6B6B6B]">-</span>
                <input
                  type="number"
                  value={priceRange[1]}
                  onChange={(e) =>
                    setPriceRange([priceRange[0], Number(e.target.value)])
                  }
                  className="h-9 w-full rounded-lg border border-[#E8E6E1] bg-[#FAFAF8] px-2 text-sm focus:border-[#C8956C] focus:outline-none"
                  placeholder="最高"
                  min={0}
                />
              </div>
            </div>

            {/* Clear */}
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="mt-5 text-xs text-[#C8956C] hover:underline"
              >
                清除所有筛选
              </button>
            )}
          </div>
        </div>
      )}

      {/* Products Grid */}
      {filteredProducts.length > 0 ? (
        <div
          className={cn(
            viewMode === 'grid'
              ? 'grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4'
              : 'flex flex-col gap-4'
          )}
        >
          {filteredProducts.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#F5F4F1]">
            <Search className="h-8 w-8 text-[#9B9B9B]" />
          </div>
          <p className="mb-1 text-sm font-medium text-[#1A1A1A]">
            没有找到匹配的商品
          </p>
          <p className="mb-4 text-xs text-[#6B6B6B]">
            试试调整筛选条件或搜索关键词
          </p>
          <button
            onClick={clearFilters}
            className="rounded-lg bg-[#C8956C] px-4 py-2 text-sm font-medium text-white hover:bg-[#B8855C]"
          >
            清除筛选
          </button>
        </div>
      )}
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#C8956C] border-t-transparent" />
        </div>
      }
    >
      <ProductsContent />
    </Suspense>
  );
}
