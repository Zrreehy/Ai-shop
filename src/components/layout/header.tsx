'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingCart, Sparkles, Search, Menu, X, User } from 'lucide-react';
import { useState } from 'react';
import { useCart } from '@/lib/cart-context';
import { cn } from '@/lib/utils';

export function Header() {
  const { totalItems, setIsCartOpen, setIsAIPanelOpen } = useCart();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const navLinks = [
    { href: '/', label: '首页' },
    { href: '/products', label: '全部商品' },
    { href: '/products?category=clothing', label: '服饰鞋包' },
    { href: '/products?category=electronics', label: '家电数码' },
  ];

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname?.startsWith(href.split('?')[0]);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-[#333333] bg-[#0A0A0A]/95 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex shrink-0 items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#C8956C] text-white">
              <Sparkles className="h-4 w-4" />
            </div>
            <span className="text-lg font-semibold text-white">
              智选商城
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive(link.href)
                    ? 'bg-[#C8956C]/20 text-[#C8956C]'
                    : 'text-[#A0A0A0] hover:bg-[#1A1A1A] hover:text-white'
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Search + Actions */}
          <div className="flex items-center gap-2">
            {/* Search */}
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#A0A0A0]" />
              <input
                type="text"
                placeholder="搜索商品..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && searchQuery.trim()) {
                    window.location.href = `/products?search=${encodeURIComponent(searchQuery.trim())}`;
                  }
                }}
                className="h-9 w-48 rounded-lg border border-[#333333] bg-[#1A1A1A] pl-9 pr-3 text-sm text-white placeholder:text-[#A0A0A0] focus:border-[#C8956C] focus:outline-none focus:ring-1 focus:ring-[#C8956C]/30 lg:w-56"
              />
            </div>

            {/* AI Button */}
            <button
              onClick={() => setIsAIPanelOpen(true)}
              className="flex h-9 items-center gap-1.5 rounded-lg bg-gradient-to-r from-[#C8956C] to-[#D4A574] px-3 text-sm font-medium text-white shadow-sm transition-all hover:shadow-md active:scale-[0.98]"
            >
              <Sparkles className="h-4 w-4" />
              <span className="hidden sm:inline">AI 推荐</span>
            </button>

            {/* Listing Agents */}
            <Link
              href="/agents"
              className="relative flex h-9 w-9 items-center justify-center rounded-lg text-xl transition-colors hover:bg-[#1A1A1A]"
              title="Listing 智能体中心"
            >
              🐵
            </Link>

            {/* Profile */}
            <Link
              href="/profile"
              className="relative flex h-9 w-9 items-center justify-center rounded-lg text-[#A0A0A0] transition-colors hover:bg-[#1A1A1A] hover:text-[#C8956C]"
              title="个人中心"
            >
              <User className="h-5 w-5" />
            </Link>

            {/* Cart */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative flex h-9 w-9 items-center justify-center rounded-lg text-[#A0A0A0] transition-colors hover:bg-[#1A1A1A] hover:text-white"
            >
              <ShoppingCart className="h-5 w-5" />
              {totalItems > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#C8956C] text-[10px] font-bold text-white">
                  {totalItems > 99 ? '99+' : totalItems}
                </span>
              )}
            </button>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-[#A0A0A0] md:hidden"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileMenuOpen && (
          <div className="border-t border-[#333333] py-3 md:hidden">
            <div className="mb-3 sm:hidden">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#A0A0A0]" />
                <input
                  type="text"
                  placeholder="搜索商品..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && searchQuery.trim()) {
                      window.location.href = `/products?search=${encodeURIComponent(searchQuery.trim())}`;
                    }
                  }}
                  className="h-9 w-full rounded-lg border border-[#333333] bg-[#1A1A1A] pl-9 pr-3 text-sm text-white placeholder:text-[#A0A0A0]"
                />
              </div>
            </div>
            <nav className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    'rounded-lg px-3 py-2 text-sm font-medium',
                    isActive(link.href)
                      ? 'bg-[#C8956C]/20 text-[#C8956C]'
                      : 'text-[#A0A0A0] hover:bg-[#1A1A1A]'
                  )}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/agents"
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  'rounded-lg px-3 py-2 text-sm font-medium',
                  isActive('/agents')
                    ? 'bg-[#C8956C]/20 text-[#C8956C]'
                    : 'text-[#A0A0A0] hover:bg-[#1A1A1A]'
                )}
              >
                Listing 智能体
              </Link>
              <Link
                href="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  'rounded-lg px-3 py-2 text-sm font-medium',
                  isActive('/profile')
                    ? 'bg-[#C8956C]/20 text-[#C8956C]'
                    : 'text-[#A0A0A0] hover:bg-[#1A1A1A]'
                )}
              >
                个人中心
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
