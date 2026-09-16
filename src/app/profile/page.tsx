'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Edit2, Save, User, Package, Heart, Settings, MapPin, CreditCard, ChevronRight, Camera, Check, X } from 'lucide-react';

interface UserProfile {
  avatar: string;
  nickname: string;
  phone: string;
  email: string;
  gender: string;
  birthday: string;
}

interface Address {
  id: string;
  name: string;
  phone: string;
  province: string;
  city: string;
  district: string;
  detail: string;
  isDefault: boolean;
}

interface OrderItem {
  id: string;
  productCode: string;
  productName: string;
  imageUrl: string;
  price: number;
  quantity: number;
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
  orderTime: string;
  trackingNo?: string;
}

const initialProfile: UserProfile = {
  avatar: '',
  nickname: '智选用户',
  phone: '138****8888',
  email: 'user@example.com',
  gender: '男',
  birthday: '1990-01-01',
};

const initialAddresses: Address[] = [
  {
    id: '1',
    name: '张三',
    phone: '13888888888',
    province: '广东省',
    city: '深圳市',
    district: '南山区',
    detail: '科技园南区A栋1001室',
    isDefault: true,
  },
  {
    id: '2',
    name: '李四',
    phone: '13999999999',
    province: '北京市',
    city: '北京市',
    district: '朝阳区',
    detail: '望京SOHO T3 2001室',
    isDefault: false,
  },
];

const initialOrders: OrderItem[] = [
  {
    id: 'ORD-20250801-001',
    productCode: 'E-0001',
    productName: '无线降噪蓝牙耳机',
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop',
    price: 299,
    quantity: 1,
    status: 'delivered',
    orderTime: '2025-08-01 14:30:00',
    trackingNo: 'SF1234567890',
  },
  {
    id: 'ORD-20250803-002',
    productCode: 'F-0005',
    productName: '时尚休闲运动鞋',
    imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop',
    price: 459,
    quantity: 1,
    status: 'shipped',
    orderTime: '2025-08-03 10:15:00',
    trackingNo: 'YT9876543210',
  },
  {
    id: 'ORD-20250805-003',
    productCode: 'E-0012',
    productName: '高清智能投影仪',
    imageUrl: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=400&h=400&fit=crop',
    price: 1299,
    quantity: 1,
    status: 'paid',
    orderTime: '2025-08-05 09:00:00',
  },
  {
    id: 'ORD-20250806-004',
    productCode: 'F-0018',
    productName: '真皮商务手提包',
    imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop',
    price: 389,
    quantity: 1,
    status: 'pending',
    orderTime: '2025-08-06 16:45:00',
  },
];

function getStatusLabel(status: string) {
  const map: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
    pending: { label: '待付款', variant: 'secondary' },
    paid: { label: '已付款', variant: 'default' },
    shipped: { label: '运输中', variant: 'default' },
    delivered: { label: '已签收', variant: 'default' },
    cancelled: { label: '已取消', variant: 'destructive' },
  };
  return map[status] || { label: status, variant: 'outline' };
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile>(initialProfile);
  const [addresses, setAddresses] = useState<Address[]>(initialAddresses);
  const [orders, setOrders] = useState<OrderItem[]>(initialOrders);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isEditingAddress, setIsEditingAddress] = useState<string | null>(null);
  const [tempProfile, setTempProfile] = useState<UserProfile>(initialProfile);
  const [tempAddress, setTempAddress] = useState<Address | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    const savedProfile = localStorage.getItem('user_profile');
    const savedAddresses = localStorage.getItem('user_addresses');
    const savedOrders = localStorage.getItem('orders'); // 统一使用 'orders' key
    
    if (savedProfile) {
      const parsed = JSON.parse(savedProfile);
      setProfile(parsed);
      setTempProfile(parsed);
    }
    if (savedAddresses) {
      setAddresses(JSON.parse(savedAddresses));
    }
    if (savedOrders) {
      // 转换订单格式以匹配页面显示
      const parsedOrders = JSON.parse(savedOrders);
      const formattedOrders: OrderItem[] = parsedOrders.map((order: any) => ({
        id: order.id,
        productCode: order.items[0]?.product?.productCode || '',
        productName: order.items[0]?.product?.name || '未知商品',
        imageUrl: order.items[0]?.product?.image || '',
        price: order.items[0]?.product?.price || 0,
        quantity: order.items[0]?.quantity || 1,
        status: order.status,
        orderTime: new Date(order.createdAt).toLocaleString('zh-CN'),
        trackingNo: order.trackingNumber,
      }));
      setOrders(formattedOrders);
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('user_profile', JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem('user_addresses', JSON.stringify(addresses));
  }, [addresses]);

  useEffect(() => {
    localStorage.setItem('user_orders', JSON.stringify(orders));
  }, [orders]);

  const startEditProfile = () => {
    setTempProfile({ ...profile });
    setIsEditingProfile(true);
  };

  const saveProfile = () => {
    setProfile({ ...tempProfile });
    setIsEditingProfile(false);
  };

  const cancelEditProfile = () => {
    setTempProfile({ ...profile });
    setIsEditingProfile(false);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setTempProfile({ ...tempProfile, avatar: base64 });
      };
      reader.readAsDataURL(file);
    }
  };

  const startEditAddress = (addr: Address) => {
    setTempAddress({ ...addr });
    setIsEditingAddress(addr.id);
  };

  const saveAddress = () => {
    if (tempAddress) {
      setAddresses(prev => prev.map(a => a.id === tempAddress.id ? tempAddress : a));
      setIsEditingAddress(null);
      setTempAddress(null);
    }
  };

  const cancelEditAddress = () => {
    setIsEditingAddress(null);
    setTempAddress(null);
  };

  const addNewAddress = () => {
    const newId = Date.now().toString();
    const newAddr: Address = {
      id: newId,
      name: '',
      phone: '',
      province: '',
      city: '',
      district: '',
      detail: '',
      isDefault: false,
    };
    setAddresses(prev => [...prev, newAddr]);
    setTempAddress(newAddr);
    setIsEditingAddress(newId);
  };

  const deleteAddress = (id: string) => {
    setAddresses(prev => prev.filter(a => a.id !== id));
  };

  const setDefaultAddress = (id: string) => {
    setAddresses(prev => prev.map(a => ({
      ...a,
      isDefault: a.id === id,
    })));
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white pb-8">
      <div className="max-w-6xl mx-auto px-4 pt-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Avatar className="w-20 h-20 border-2 border-[#C8956C]">
            <AvatarImage src={profile.avatar || ''} alt={profile.nickname} />
            <AvatarFallback className="bg-[#1A1A1A] text-3xl text-[#C8956C]">
              {profile.nickname.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold">{profile.nickname}</h1>
            <p className="text-[#A0A0A0] text-sm mt-1">ID: {profile.phone}</p>
          </div>
        </div>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="bg-[#1A1A1A] border border-[#2A2A2A] p-1 rounded-lg mb-6">
            <TabsTrigger value="profile" className="data-[state=active]:bg-[#C8956C] data-[state=active]:text-black">
              <User className="w-4 h-4 mr-2" />
              个人信息
            </TabsTrigger>
            <TabsTrigger value="orders" className="data-[state=active]:bg-[#C8956C] data-[state=active]:text-black">
              <Package className="w-4 h-4 mr-2" />
              我的订单
            </TabsTrigger>
            <TabsTrigger value="addresses" className="data-[state=active]:bg-[#C8956C] data-[state=active]:text-black">
              <MapPin className="w-4 h-4 mr-2" />
              收货地址
            </TabsTrigger>
            <TabsTrigger value="favorites" className="data-[state=active]:bg-[#C8956C] data-[state=active]:text-black">
              <Heart className="w-4 h-4 mr-2" />
              我的收藏
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-[#C8956C] data-[state=active]:text-black">
              <Settings className="w-4 h-4 mr-2" />
              账户设置
            </TabsTrigger>
          </TabsList>

          {/* 个人信息 */}
          <TabsContent value="profile" className="mt-0">
            <Card className="bg-[#1A1A1A] border-[#2A2A2A]">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-white">个人信息</CardTitle>
                {!isEditingProfile && (
                  <Button variant="ghost" size="sm" onClick={startEditProfile} className="text-[#C8956C] hover:text-[#D4A574] hover:bg-[#2A2A2A]">
                    <Edit2 className="w-4 h-4 mr-2" />
                    编辑
                  </Button>
                )}
                {isEditingProfile && (
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={saveProfile} className="text-green-400 hover:text-green-300 hover:bg-[#2A2A2A]">
                      <Save className="w-4 h-4 mr-2" />
                      保存
                    </Button>
                    <Button variant="ghost" size="sm" onClick={cancelEditProfile} className="text-red-400 hover:text-red-300 hover:bg-[#2A2A2A]">
                      <X className="w-4 h-4 mr-2" />
                      取消
                    </Button>
                  </div>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4 py-4 border-b border-[#2A2A2A]">
                  <Label className="w-28 text-[#A0A0A0]">头像</Label>
                  <div className="flex items-center gap-4">
                    <Avatar className="w-16 h-16">
                      <AvatarImage src={isEditingProfile ? tempProfile.avatar : profile.avatar} alt="avatar" />
                      <AvatarFallback className="bg-[#0A0A0A] text-2xl text-[#C8956C]">
                        {(isEditingProfile ? tempProfile : profile).nickname.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    {isEditingProfile && (
                      <>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarChange}
                          className="hidden"
                          id="avatar-upload"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-[#2A2A2A] text-white hover:bg-[#2A2A2A]"
                          onClick={() => document.getElementById('avatar-upload')?.click()}
                        >
                          <Camera className="w-4 h-4 mr-2" />
                          更换头像
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[#A0A0A0]">昵称</Label>
                    {isEditingProfile ? (
                      <Input
                        value={tempProfile.nickname}
                        onChange={(e) => setTempProfile({ ...tempProfile, nickname: e.target.value })}
                        className="bg-[#0A0A0A] border-[#2A2A2A] text-white focus-visible:ring-[#C8956C]"
                      />
                    ) : (
                      <div className="py-2 px-3 text-white">{profile.nickname}</div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[#A0A0A0]">手机号</Label>
                    {isEditingProfile ? (
                      <Input
                        value={tempProfile.phone}
                        onChange={(e) => setTempProfile({ ...tempProfile, phone: e.target.value })}
                        className="bg-[#0A0A0A] border-[#2A2A2A] text-white focus-visible:ring-[#C8956C]"
                      />
                    ) : (
                      <div className="py-2 px-3 text-white">{profile.phone}</div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[#A0A0A0]">邮箱</Label>
                    {isEditingProfile ? (
                      <Input
                        value={tempProfile.email}
                        onChange={(e) => setTempProfile({ ...tempProfile, email: e.target.value })}
                        className="bg-[#0A0A0A] border-[#2A2A2A] text-white focus-visible:ring-[#C8956C]"
                      />
                    ) : (
                      <div className="py-2 px-3 text-white">{profile.email}</div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[#A0A0A0]">性别</Label>
                    {isEditingProfile ? (
                      <select
                        value={tempProfile.gender}
                        onChange={(e) => setTempProfile({ ...tempProfile, gender: e.target.value })}
                        className="w-full py-2 px-3 bg-[#0A0A0A] border border-[#2A2A2A] rounded-md text-white focus:outline-none focus:ring-1 focus:ring-[#C8956C]"
                      >
                        <option value="男">男</option>
                        <option value="女">女</option>
                        <option value="保密">保密</option>
                      </select>
                    ) : (
                      <div className="py-2 px-3 text-white">{profile.gender}</div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[#A0A0A0]">生日</Label>
                    {isEditingProfile ? (
                      <Input
                        type="date"
                        value={tempProfile.birthday}
                        onChange={(e) => setTempProfile({ ...tempProfile, birthday: e.target.value })}
                        className="bg-[#0A0A0A] border-[#2A2A2A] text-white focus-visible:ring-[#C8956C]"
                      />
                    ) : (
                      <div className="py-2 px-3 text-white">{profile.birthday}</div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 我的订单 */}
          <TabsContent value="orders" className="mt-0">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">我的订单 ({orders.length})</h2>
                <Badge variant="outline" className="border-[#2A2A2A] text-[#A0A0A0]">
                  订单数据已同步
                </Badge>
              </div>

              <ScrollArea className="h-[600px]">
                <div className="space-y-4">
                  {orders.map((order) => {
                    const statusInfo = getStatusLabel(order.status);
                    return (
                      <Card key={order.id} className="bg-[#1A1A1A] border-[#2A2A2A]">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-4">
                            <img
                              src={order.imageUrl}
                              alt={order.productName}
                              className="w-24 h-24 object-cover rounded-lg"
                            />
                            <div className="flex-1">
                              <div className="flex items-start justify-between">
                                <div>
                                  <p className="text-xs text-[#A0A0A0] mb-1">订单号：{order.id}</p>
                                  <h3 className="font-semibold text-white">{order.productName}</h3>
                                  <p className="text-xs text-[#A0A0A0] mt-1">商品编号：{order.productCode}</p>
                                </div>
                                <Badge variant={statusInfo.variant} className={statusInfo.variant === 'default' ? 'bg-[#C8956C] text-black' : ''}>
                                  {statusInfo.label}
                                </Badge>
                              </div>
                              <div className="flex items-center justify-between mt-3">
                                <div>
                                  <p className="text-[#C8956C] font-bold text-lg">¥{order.price}</p>
                                  <p className="text-xs text-[#A0A0A0]">x {order.quantity}</p>
                                </div>
                                <div className="text-right">
                                  <p className="text-xs text-[#A0A0A0]">下单时间</p>
                                  <p className="text-sm text-white">{order.orderTime}</p>
                                  {order.trackingNo && (
                                    <p className="text-xs text-[#A0A0A0] mt-1">物流单号：{order.trackingNo}</p>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </ScrollArea>
            </div>
          </TabsContent>

          {/* 收货地址 */}
          <TabsContent value="addresses" className="mt-0">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">收货地址 ({addresses.length})</h2>
                <Button
                  onClick={addNewAddress}
                  className="bg-[#C8956C] text-black hover:bg-[#D4A574]"
                >
                  <MapPin className="w-4 h-4 mr-2" />
                  添加新地址
                </Button>
              </div>

              <div className="space-y-4">
                {addresses.map((addr) => (
                  <Card key={addr.id} className="bg-[#1A1A1A] border-[#2A2A2A]">
                    <CardContent className="p-4">
                      {isEditingAddress === addr.id && tempAddress ? (
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <Label className="text-[#A0A0A0]">收货人</Label>
                              <Input
                                value={tempAddress.name}
                                onChange={(e) => setTempAddress({ ...tempAddress, name: e.target.value })}
                                className="mt-1 bg-[#0A0A0A] border-[#2A2A2A] text-white focus-visible:ring-[#C8956C]"
                              />
                            </div>
                            <div>
                              <Label className="text-[#A0A0A0]">手机号</Label>
                              <Input
                                value={tempAddress.phone}
                                onChange={(e) => setTempAddress({ ...tempAddress, phone: e.target.value })}
                                className="mt-1 bg-[#0A0A0A] border-[#2A2A2A] text-white focus-visible:ring-[#C8956C]"
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-3 gap-3">
                            <div>
                              <Label className="text-[#A0A0A0]">省份</Label>
                              <Input
                                value={tempAddress.province}
                                onChange={(e) => setTempAddress({ ...tempAddress, province: e.target.value })}
                                className="mt-1 bg-[#0A0A0A] border-[#2A2A2A] text-white focus-visible:ring-[#C8956C]"
                              />
                            </div>
                            <div>
                              <Label className="text-[#A0A0A0]">城市</Label>
                              <Input
                                value={tempAddress.city}
                                onChange={(e) => setTempAddress({ ...tempAddress, city: e.target.value })}
                                className="mt-1 bg-[#0A0A0A] border-[#2A2A2A] text-white focus-visible:ring-[#C8956C]"
                              />
                            </div>
                            <div>
                              <Label className="text-[#A0A0A0]">区县</Label>
                              <Input
                                value={tempAddress.district}
                                onChange={(e) => setTempAddress({ ...tempAddress, district: e.target.value })}
                                className="mt-1 bg-[#0A0A0A] border-[#2A2A2A] text-white focus-visible:ring-[#C8956C]"
                              />
                            </div>
                          </div>
                          <div>
                            <Label className="text-[#A0A0A0]">详细地址</Label>
                            <Input
                              value={tempAddress.detail}
                              onChange={(e) => setTempAddress({ ...tempAddress, detail: e.target.value })}
                              className="mt-1 bg-[#0A0A0A] border-[#2A2A2A] text-white focus-visible:ring-[#C8956C]"
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={saveAddress}
                              className="text-green-400 hover:text-green-300 hover:bg-[#2A2A2A]"
                            >
                              <Save className="w-4 h-4 mr-2" />
                              保存
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={cancelEditAddress}
                              className="text-red-400 hover:text-red-300 hover:bg-[#2A2A2A]"
                            >
                              <X className="w-4 h-4 mr-2" />
                              取消
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <span className="font-semibold text-white">{addr.name}</span>
                                <span className="text-[#A0A0A0]">{addr.phone}</span>
                                {addr.isDefault && (
                                  <Badge className="bg-[#C8956C] text-black text-xs">默认</Badge>
                                )}
                              </div>
                              <p className="text-[#A0A0A0] text-sm">
                                {addr.province} {addr.city} {addr.district} {addr.detail}
                              </p>
                            </div>
                            <div className="flex items-center gap-1">
                              {!addr.isDefault && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setDefaultAddress(addr.id)}
                                  className="text-[#A0A0A0] hover:text-white hover:bg-[#2A2A2A]"
                                >
                                  <Check className="w-4 h-4" />
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => startEditAddress(addr)}
                                className="text-[#A0A0A0] hover:text-[#C8956C] hover:bg-[#2A2A2A]"
                              >
                                <Edit2 className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteAddress(addr.id)}
                                className="text-red-400 hover:text-red-300 hover:bg-[#2A2A2A]"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* 我的收藏 */}
          <TabsContent value="favorites" className="mt-0">
            <Card className="bg-[#1A1A1A] border-[#2A2A2A]">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Heart className="w-5 h-5 text-[#C8956C]" />
                  我的收藏
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-[#A0A0A0]">
                  <Heart className="w-16 h-16 mx-auto mb-4 opacity-30" />
                  <p className="text-lg">暂无收藏的商品</p>
                  <p className="text-sm mt-2">浏览商品时点击❤️按钮，即可收藏到这里</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 账户设置 */}
          <TabsContent value="settings" className="mt-0">
            <div className="space-y-4">
              <Card className="bg-[#1A1A1A] border-[#2A2A2A]">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-[#C8956C]" />
                    支付方式
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between py-3 border-b border-[#2A2A2A]">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-green-600 flex items-center justify-center text-white text-xs font-bold">
                          微
                        </div>
                        <div>
                          <p className="text-white">微信支付</p>
                          <p className="text-xs text-[#A0A0A0]">已绑定</p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-[#A0A0A0]" />
                    </div>
                    <div className="flex items-center justify-between py-3 border-b border-[#2A2A2A]">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
                          支
                        </div>
                        <div>
                          <p className="text-white">支付宝</p>
                          <p className="text-xs text-[#A0A0A0]">已绑定</p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-[#A0A0A0]" />
                    </div>
                    <div className="flex items-center justify-between py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-[#C8956C] flex items-center justify-center text-black text-xs font-bold">
                          卡
                        </div>
                        <div>
                          <p className="text-white">银行卡</p>
                          <p className="text-xs text-[#A0A0A0]">未绑定</p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-[#A0A0A0]" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[#1A1A1A] border-[#2A2A2A]">
                <CardHeader>
                  <CardTitle className="text-white">安全设置</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between py-3 border-b border-[#2A2A2A]">
                      <span className="text-white">修改登录密码</span>
                      <ChevronRight className="w-5 h-5 text-[#A0A0A0]" />
                    </div>
                    <div className="flex items-center justify-between py-3 border-b border-[#2A2A2A]">
                      <span className="text-white">修改支付密码</span>
                      <ChevronRight className="w-5 h-5 text-[#A0A0A0]" />
                    </div>
                    <div className="flex items-center justify-between py-3">
                      <span className="text-white">登录设备管理</span>
                      <ChevronRight className="w-5 h-5 text-[#A0A0A0]" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="text-center pt-4">
                <Button variant="destructive" className="bg-red-600 hover:bg-red-700">
                  退出登录
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
