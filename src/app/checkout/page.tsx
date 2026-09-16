'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  CreditCard,
  MapPin,
  CheckCircle,
  ArrowLeft,
  ShoppingBag,
  Truck,
  Shield,
  Wallet,
} from 'lucide-react';
import { useCart } from '@/lib/cart-context';

type PaymentMethod = 'wechat' | 'alipay' | 'card';
type CheckoutStep = 'address' | 'payment' | 'success';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, totalPrice, totalItems, clearCart } = useCart();

  const [step, setStep] = useState<CheckoutStep>('address');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('wechat');
  const [orderId, setOrderId] = useState('');

  // 地址表单
  const [address, setAddress] = useState({
    name: '',
    phone: '',
    province: '',
    city: '',
    district: '',
    detail: '',
    isDefault: true,
  });

  const shipping = totalPrice >= 99 ? 0 : 15;
  const finalTotal = totalPrice + shipping;

  const handleAddressSubmit = () => {
    if (!address.name || !address.phone || !address.province || !address.city || !address.detail) {
      alert('请填写完整的收货地址信息');
      return;
    }
    setStep('payment');
  };

  const handlePayment = () => {
    // 模拟支付
    const newOrderId = `ORD-${Date.now().toString().slice(-10)}`;
    
    // 保存订单到 localStorage
    const order = {
      id: newOrderId,
      items: items.map(item => ({
        product: item.product,
        quantity: item.quantity,
      })),
      totalAmount: finalTotal,
      status: 'paid' as const,
      createdAt: new Date().toISOString(),
      address: { ...address },
      paymentMethod,
      trackingNumber: `SF${Date.now().toString().slice(-12)}`,
    };
    
    const existingOrders = JSON.parse(localStorage.getItem('orders') || '[]');
    existingOrders.unshift(order);
    localStorage.setItem('orders', JSON.stringify(existingOrders));
    
    setOrderId(newOrderId);
    setStep('success');
    clearCart();
  };

  // 购物车为空
  if (items.length === 0 && step !== 'success') {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-4">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#F5EDE6]">
          <ShoppingBag className="h-10 w-10 text-[#C8956C]" />
        </div>
        <h2 className="mb-2 text-xl font-semibold text-[#1A1A1A]">购物车为空</h2>
        <p className="mb-6 text-sm text-[#6B6B6B]">请先添加商品到购物车</p>
        <button
          onClick={() => router.push('/products')}
          className="rounded-lg bg-[#C8956C] px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#B8855C]"
        >
          去购物
        </button>
      </div>
    );
  }

  // 支付成功
  if (step === 'success') {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-4">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#2D6A4F]/10">
          <CheckCircle className="h-10 w-10 text-[#2D6A4F]" />
        </div>
        <h2 className="mb-2 text-2xl font-semibold text-[#1A1A1A]">支付成功</h2>
        <p className="mb-1 text-sm text-[#6B6B6B]">订单编号：{orderId}</p>
        <p className="mb-8 text-sm text-[#6B6B6B]">
          支付金额：¥{finalTotal.toLocaleString()}
        </p>

        <div className="mb-8 w-full max-w-sm space-y-3 rounded-xl border border-[#E8E6E1] bg-white p-5">
          <div className="flex items-center gap-3 text-sm">
            <Truck className="h-4 w-4 text-[#C8956C]" />
            <span className="text-[#6B6B6B]">预计 3-5 个工作日送达</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Shield className="h-4 w-4 text-[#C8956C]" />
            <span className="text-[#6B6B6B]">享受 7 天无理由退换保障</span>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => router.push('/products')}
            className="rounded-lg border border-[#E8E6E1] px-6 py-2.5 text-sm font-medium text-[#6B6B6B] transition-colors hover:border-[#C8956C] hover:text-[#C8956C]"
          >
            继续购物
          </button>
          <button
            onClick={() => router.push('/')}
            className="rounded-lg bg-[#C8956C] px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#B8855C]"
          >
            返回首页
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => (step === 'payment' ? setStep('address') : router.back())}
          className="mb-4 flex items-center gap-1 text-sm text-[#6B6B6B] transition-colors hover:text-[#C8956C]"
        >
          <ArrowLeft className="h-4 w-4" />
          {step === 'payment' ? '返回修改地址' : '返回'}
        </button>
        <h1 className="text-2xl font-semibold text-[#1A1A1A]">
          {step === 'address' ? '确认订单' : '选择支付方式'}
        </h1>
      </div>

      {/* Steps indicator */}
      <div className="mb-8 flex items-center gap-2">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#C8956C] text-xs font-medium text-white">
            1
          </div>
          <span className="text-sm font-medium text-[#1A1A1A]">填写地址</span>
        </div>
        <div className="h-px w-8 bg-[#E8E6E1]" />
        <div className="flex items-center gap-2">
          <div
            className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium ${
              step === 'payment'
                ? 'bg-[#C8956C] text-white'
                : 'bg-[#F5F4F1] text-[#9B9B9B]'
            }`}
          >
            2
          </div>
          <span
            className={`text-sm ${
              step === 'payment' ? 'font-medium text-[#1A1A1A]' : 'text-[#9B9B9B]'
            }`}
          >
            支付
          </span>
        </div>
        <div className="h-px w-8 bg-[#E8E6E1]" />
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#F5F4F1] text-xs font-medium text-[#9B9B9B]">
            3
          </div>
          <span className="text-sm text-[#9B9B9B]">完成</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left: Form */}
        <div className="lg:col-span-2">
          {step === 'address' ? (
            <div className="rounded-xl border border-[#E8E6E1] bg-white p-6">
              <div className="mb-5 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-[#C8956C]" />
                <h2 className="text-lg font-semibold text-[#1A1A1A]">
                  收货地址
                </h2>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[#1A1A1A]">
                    收货人 <span className="text-[#C0392B]">*</span>
                  </label>
                  <input
                    type="text"
                    value={address.name}
                    onChange={(e) =>
                      setAddress({ ...address, name: e.target.value })
                    }
                    placeholder="请输入收货人姓名"
                    className="w-full rounded-lg border border-[#E8E6E1] px-3 py-2.5 text-sm text-[#1A1A1A] outline-none transition-colors placeholder:text-[#9B9B9B] focus:border-[#C8956C]"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[#1A1A1A]">
                    手机号 <span className="text-[#C0392B]">*</span>
                  </label>
                  <input
                    type="tel"
                    value={address.phone}
                    onChange={(e) =>
                      setAddress({ ...address, phone: e.target.value })
                    }
                    placeholder="请输入手机号"
                    className="w-full rounded-lg border border-[#E8E6E1] px-3 py-2.5 text-sm text-[#1A1A1A] outline-none transition-colors placeholder:text-[#9B9B9B] focus:border-[#C8956C]"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[#1A1A1A]">
                    省份 <span className="text-[#C0392B]">*</span>
                  </label>
                  <select
                    value={address.province}
                    onChange={(e) =>
                      setAddress({ ...address, province: e.target.value })
                    }
                    className="w-full rounded-lg border border-[#E8E6E1] px-3 py-2.5 text-sm text-[#1A1A1A] outline-none transition-colors focus:border-[#C8956C]"
                  >
                    <option value="">请选择省份</option>
                    <option value="北京市">北京市</option>
                    <option value="上海市">上海市</option>
                    <option value="广东省">广东省</option>
                    <option value="浙江省">浙江省</option>
                    <option value="江苏省">江苏省</option>
                    <option value="四川省">四川省</option>
                    <option value="湖北省">湖北省</option>
                    <option value="福建省">福建省</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[#1A1A1A]">
                    城市 <span className="text-[#C0392B]">*</span>
                  </label>
                  <input
                    type="text"
                    value={address.city}
                    onChange={(e) =>
                      setAddress({ ...address, city: e.target.value })
                    }
                    placeholder="请输入城市"
                    className="w-full rounded-lg border border-[#E8E6E1] px-3 py-2.5 text-sm text-[#1A1A1A] outline-none transition-colors placeholder:text-[#9B9B9B] focus:border-[#C8956C]"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[#1A1A1A]">
                    区/县
                  </label>
                  <input
                    type="text"
                    value={address.district}
                    onChange={(e) =>
                      setAddress({ ...address, district: e.target.value })
                    }
                    placeholder="请输入区/县"
                    className="w-full rounded-lg border border-[#E8E6E1] px-3 py-2.5 text-sm text-[#1A1A1A] outline-none transition-colors placeholder:text-[#9B9B9B] focus:border-[#C8956C]"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-sm font-medium text-[#1A1A1A]">
                    详细地址 <span className="text-[#C0392B]">*</span>
                  </label>
                  <input
                    type="text"
                    value={address.detail}
                    onChange={(e) =>
                      setAddress({ ...address, detail: e.target.value })
                    }
                    placeholder="街道、楼牌号等"
                    className="w-full rounded-lg border border-[#E8E6E1] px-3 py-2.5 text-sm text-[#1A1A1A] outline-none transition-colors placeholder:text-[#9B9B9B] focus:border-[#C8956C]"
                  />
                </div>
              </div>

              <label className="mt-4 flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={address.isDefault}
                  onChange={(e) =>
                    setAddress({ ...address, isDefault: e.target.checked })
                  }
                  className="h-4 w-4 rounded border-[#E8E6E1] accent-[#C8956C]"
                />
                <span className="text-sm text-[#6B6B6B]">设为默认地址</span>
              </label>

              <button
                onClick={handleAddressSubmit}
                className="mt-6 w-full rounded-lg bg-gradient-to-r from-[#C8956C] to-[#D4A574] py-3 text-sm font-medium text-white shadow-sm transition-all hover:shadow-md active:scale-[0.99]"
              >
                下一步：选择支付方式
              </button>
            </div>
          ) : (
            <div className="rounded-xl border border-[#E8E6E1] bg-white p-6">
              <div className="mb-5 flex items-center gap-2">
                <Wallet className="h-5 w-5 text-[#C8956C]" />
                <h2 className="text-lg font-semibold text-[#1A1A1A]">
                  支付方式
                </h2>
              </div>

              <div className="space-y-3">
                {/* 微信支付 */}
                <label
                  className={`flex cursor-pointer items-center gap-4 rounded-xl border-2 p-4 transition-all ${
                    paymentMethod === 'wechat'
                      ? 'border-[#07C160] bg-[#07C160]/5'
                      : 'border-[#E8E6E1] hover:border-[#C8956C]/30'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="wechat"
                    checked={paymentMethod === 'wechat'}
                    onChange={() => setPaymentMethod('wechat')}
                    className="sr-only"
                  />
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#07C160]">
                    <span className="text-lg font-bold text-white">微</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-[#1A1A1A]">
                      微信支付
                    </p>
                    <p className="text-xs text-[#6B6B6B]">
                      推荐使用，安全快捷
                    </p>
                  </div>
                  <div
                    className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                      paymentMethod === 'wechat'
                        ? 'border-[#07C160] bg-[#07C160]'
                        : 'border-[#D1D5DB]'
                    }`}
                  >
                    {paymentMethod === 'wechat' && (
                      <CheckCircle className="h-3 w-3 text-white" />
                    )}
                  </div>
                </label>

                {/* 支付宝 */}
                <label
                  className={`flex cursor-pointer items-center gap-4 rounded-xl border-2 p-4 transition-all ${
                    paymentMethod === 'alipay'
                      ? 'border-[#1677FF] bg-[#1677FF]/5'
                      : 'border-[#E8E6E1] hover:border-[#C8956C]/30'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="alipay"
                    checked={paymentMethod === 'alipay'}
                    onChange={() => setPaymentMethod('alipay')}
                    className="sr-only"
                  />
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#1677FF]">
                    <span className="text-lg font-bold text-white">支</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-[#1A1A1A]">
                      支付宝
                    </p>
                    <p className="text-xs text-[#6B6B6B]">
                      支持花呗分期
                    </p>
                  </div>
                  <div
                    className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                      paymentMethod === 'alipay'
                        ? 'border-[#1677FF] bg-[#1677FF]'
                        : 'border-[#D1D5DB]'
                    }`}
                  >
                    {paymentMethod === 'alipay' && (
                      <CheckCircle className="h-3 w-3 text-white" />
                    )}
                  </div>
                </label>

                {/* 银行卡 */}
                <label
                  className={`flex cursor-pointer items-center gap-4 rounded-xl border-2 p-4 transition-all ${
                    paymentMethod === 'card'
                      ? 'border-[#C8956C] bg-[#F5EDE6]'
                      : 'border-[#E8E6E1] hover:border-[#C8956C]/30'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="card"
                    checked={paymentMethod === 'card'}
                    onChange={() => setPaymentMethod('card')}
                    className="sr-only"
                  />
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#1A1A1A]">
                    <CreditCard className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-[#1A1A1A]">
                      银行卡支付
                    </p>
                    <p className="text-xs text-[#6B6B6B]">
                      支持各大银行储蓄卡/信用卡
                    </p>
                  </div>
                  <div
                    className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                      paymentMethod === 'card'
                        ? 'border-[#C8956C] bg-[#C8956C]'
                        : 'border-[#D1D5DB]'
                    }`}
                  >
                    {paymentMethod === 'card' && (
                      <CheckCircle className="h-3 w-3 text-white" />
                    )}
                  </div>
                </label>
              </div>

              {/* 收货地址摘要 */}
              <div className="mt-6 rounded-lg border border-[#E8E6E1] bg-[#FAFAF8] p-4">
                <div className="mb-2 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-[#C8956C]" />
                  <span className="text-sm font-medium text-[#1A1A1A]">
                    收货地址
                  </span>
                </div>
                <p className="text-sm text-[#6B6B6B]">
                  {address.name} {address.phone}
                </p>
                <p className="text-sm text-[#6B6B6B]">
                  {address.province} {address.city} {address.district}{' '}
                  {address.detail}
                </p>
              </div>

              <button
                onClick={handlePayment}
                className="mt-6 w-full rounded-lg bg-gradient-to-r from-[#C8956C] to-[#D4A574] py-3 text-sm font-medium text-white shadow-sm transition-all hover:shadow-md active:scale-[0.99]"
              >
                确认支付 ¥{finalTotal.toLocaleString()}
              </button>
            </div>
          )}
        </div>

        {/* Right: Order Summary */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 rounded-xl border border-[#E8E6E1] bg-white p-5">
            <h3 className="mb-4 text-base font-semibold text-[#1A1A1A]">
              订单摘要
            </h3>

            <div className="mb-4 max-h-64 space-y-3 overflow-y-auto">
              {items.map((item) => (
                <div
                  key={item.product.id}
                  className="flex gap-3"
                >
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-[#F5F4F1]">
                    <Image
                      src={item.product.image}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                      sizes="56px"
                    />
                  </div>
                  <div className="flex flex-1 flex-col">
                    <p className="line-clamp-1 text-sm text-[#1A1A1A]">
                      {item.product.name}
                    </p>
                    <div className="mt-auto flex items-center justify-between">
                      <span className="text-xs text-[#6B6B6B]">
                        x{item.quantity}
                      </span>
                      <span className="text-sm font-medium text-[#C0392B]">
                        ¥{(item.product.price * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-2 border-t border-[#E8E6E1] pt-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#6B6B6B]">商品小计</span>
                <span className="text-[#1A1A1A]">
                  ¥{totalPrice.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#6B6B6B]">运费</span>
                <span className="text-[#1A1A1A]">
                  {shipping === 0 ? (
                    <span className="text-[#2D6A4F]">免运费</span>
                  ) : (
                    `¥${shipping}`
                  )}
                </span>
              </div>
              {shipping === 0 && (
                <p className="text-xs text-[#2D6A4F]">
                  已满 ¥99，享受免运费
                </p>
              )}
              <div className="flex items-center justify-between border-t border-[#E8E6E1] pt-2">
                <span className="text-sm font-medium text-[#1A1A1A]">
                  应付总额
                </span>
                <span className="text-xl font-bold text-[#C0392B]">
                  ¥{finalTotal.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2 rounded-lg bg-[#F5EDE6] p-3">
              <Shield className="h-4 w-4 text-[#C8956C]" />
              <span className="text-xs text-[#6B6B6B]">
                安全支付保障，支持 7 天无理由退换
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
