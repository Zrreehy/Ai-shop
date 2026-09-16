'use client';

import { X, Plus, Minus, ShoppingBag, Trash2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/lib/cart-context';

export function CartDrawer() {
  const {
    items,
    removeFromCart,
    updateQuantity,
    clearCart,
    totalItems,
    totalPrice,
    isCartOpen,
    setIsCartOpen,
  } = useCart();

  if (!isCartOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E8E6E1] px-5 py-4">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-[#C8956C]" />
            <h2 className="text-lg font-semibold text-[#1A1A1A]">
              购物车
            </h2>
            <span className="rounded-full bg-[#F5EDE6] px-2 py-0.5 text-xs font-medium text-[#C8956C]">
              {totalItems} 件
            </span>
          </div>
          <button
            onClick={() => setIsCartOpen(false)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#6B6B6B] hover:bg-[#F5F4F1]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#F5F4F1]">
                <ShoppingBag className="h-8 w-8 text-[#9B9B9B]" />
              </div>
              <p className="mb-1 text-sm font-medium text-[#1A1A1A]">
                购物车是空的
              </p>
              <p className="text-xs text-[#6B6B6B]">
                去挑选心仪的商品吧
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.product.id}
                  className="flex gap-3 rounded-xl border border-[#E8E6E1] p-3 transition-colors hover:border-[#C8956C]/20"
                >
                  {/* Image */}
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-[#F5F4F1]">
                    <Image
                      src={item.product.image}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex flex-1 flex-col">
                    <h3 className="line-clamp-1 text-sm font-medium text-[#1A1A1A]">
                      {item.product.name}
                    </h3>
                    <p className="text-sm font-bold text-[#C0392B]">
                      ¥{item.product.price}
                    </p>

                    <div className="mt-auto flex items-center justify-between">
                      {/* Quantity */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() =>
                            updateQuantity(item.product.id, item.quantity - 1)
                          }
                          className="flex h-6 w-6 items-center justify-center rounded-md border border-[#E8E6E1] text-[#6B6B6B] hover:border-[#C8956C] hover:text-[#C8956C]"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-8 text-center text-sm font-medium text-[#1A1A1A]">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(item.product.id, item.quantity + 1)
                          }
                          className="flex h-6 w-6 items-center justify-center rounded-md border border-[#E8E6E1] text-[#6B6B6B] hover:border-[#C8956C] hover:text-[#C8956C]"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>

                      {/* Remove */}
                      <button
                        onClick={() => removeFromCart(item.product.id)}
                        className="flex h-6 w-6 items-center justify-center rounded-md text-[#9B9B9B] hover:bg-red-50 hover:text-[#C0392B]"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-[#E8E6E1] px-5 py-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm text-[#6B6B6B]">
                共 {totalItems} 件商品
              </span>
              <div className="text-right">
                <span className="text-sm text-[#6B6B6B]">合计：</span>
                <span className="text-xl font-bold text-[#C0392B]">
                  ¥{totalPrice.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={clearCart}
                className="flex h-10 items-center justify-center rounded-lg border border-[#E8E6E1] px-4 text-sm font-medium text-[#6B6B6B] transition-colors hover:border-[#C0392B] hover:text-[#C0392B]"
              >
                清空
              </button>
              <Link
                href="/checkout"
                onClick={() => setIsCartOpen(false)}
                className="flex h-10 flex-1 items-center justify-center rounded-lg bg-gradient-to-r from-[#C8956C] to-[#D4A574] text-sm font-medium text-white shadow-sm transition-all hover:shadow-md active:scale-[0.99]"
              >
                去结算
              </Link>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
