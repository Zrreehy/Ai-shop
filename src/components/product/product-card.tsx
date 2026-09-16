'use client';

import Image from 'next/image';
import { ShoppingCart, Star, Eye } from 'lucide-react';
import Link from 'next/link';
import type { Product } from '@/lib/data/products';
import { useCart } from '@/lib/cart-context';
import { useState } from 'react';

interface ProductCardProps {
  product: Product;
  index?: number;
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const { addToCart } = useCart();
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
    setIsAdding(true);
    setTimeout(() => setIsAdding(false), 600);
  };

  const discount = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : 0;

  return (
    <Link
      href={`/products/${product.id}`}
      className="group relative flex flex-col overflow-hidden rounded-xl border border-[#E8E6E1] bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-[#C8956C]/5"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-[#F5F4F1]">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />

        {/* Badges */}
        <div className="absolute left-2 top-2 flex flex-col gap-1">
          {product.isNew && (
            <span className="rounded-md bg-[#1A1A1A] px-2 py-0.5 text-[11px] font-medium text-white">
              新品
            </span>
          )}
          {discount > 0 && (
            <span className="rounded-md bg-[#C0392B] px-2 py-0.5 text-[11px] font-medium text-white">
              -{discount}%
            </span>
          )}
        </div>

        {/* Quick view overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all duration-300 group-hover:bg-black/10 group-hover:opacity-100">
          <span className="flex items-center gap-1.5 rounded-lg bg-white/95 px-3 py-1.5 text-sm font-medium text-[#1A1A1A] shadow-sm backdrop-blur-sm">
            <Eye className="h-3.5 w-3.5" />
            查看详情
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col p-3.5">
        {/* Tags */}
        <div className="mb-2 flex flex-wrap gap-1">
          {product.tags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="rounded-md bg-[#F5F4F1] px-1.5 py-0.5 text-[11px] text-[#6B6B6B]"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Name */}
        <h3 className="mb-1 line-clamp-1 text-sm font-semibold text-[#1A1A1A] transition-colors group-hover:text-[#C8956C]">
          {product.name}
        </h3>

        {/* Rating */}
        <div className="mb-2 flex items-center gap-1">
          <Star className="h-3 w-3 fill-[#F5A623] text-[#F5A623]" />
          <span className="text-xs font-medium text-[#1A1A1A]">
            {product.rating}
          </span>
          <span className="text-xs text-[#6B6B6B]">
            ({product.reviewCount})
          </span>
        </div>

        {/* Price + Add to cart */}
        <div className="mt-auto flex items-end justify-between">
          <div className="flex items-baseline gap-1.5">
            <span className="text-lg font-bold text-[#C0392B]">
              ¥{product.price}
            </span>
            {product.originalPrice && (
              <span className="text-xs text-[#9B9B9B] line-through">
                ¥{product.originalPrice}
              </span>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            className={`flex h-8 w-8 items-center justify-center rounded-lg transition-all ${
              isAdding
                ? 'scale-110 bg-[#2D6A4F] text-white'
                : 'bg-[#F5F4F1] text-[#6B6B6B] hover:bg-[#C8956C] hover:text-white'
            }`}
          >
            <ShoppingCart className="h-4 w-4" />
          </button>
        </div>
      </div>
    </Link>
  );
}
