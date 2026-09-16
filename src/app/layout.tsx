import type { Metadata } from 'next';
import './globals.css';
import { CartProvider } from '@/lib/cart-context';
import { Header } from '@/components/layout/header';
import { CartDrawer } from '@/components/cart/cart-drawer';
import { AIPanel, AIPanelTrigger } from '@/components/ai/ai-panel';

export const metadata: Metadata = {
  title: '智选商城 - AI 智能推荐，帮你选到最合适的',
  description:
    '智选商城是一个 AI 驱动的电商购物平台，通过智能推荐帮你快速找到最合适的商品。涵盖数码科技、家居生活、时尚穿搭、美食饮品等品类。',
  keywords: ['AI电商', '智能推荐', '网上购物', '数码科技', '家居生活'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen bg-[#FAFAF8] font-sans antialiased">
        <CartProvider>
          <Header />
          <main>{children}</main>
          <CartDrawer />
          <AIPanel />
          <AIPanelTrigger />
        </CartProvider>
      </body>
    </html>
  );
}
