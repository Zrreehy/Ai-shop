export type LogisticsStatus = 'pending' | 'shipping' | 'delivered' | 'signed';
export type AfterSalesTag = 'damaged' | 'cracked' | 'missing' | 'color_diff' | 'quality' | 'mismatch' | 'slow_logistics' | 'package' | '7days_no_reason' | 'other';
export type AfterSalesStatus = 'pending' | 'processing' | 'approved' | 'denied' | 'resolved';
export type SuggestedSolution = 'resend' | 'partial_refund' | 'return_refund' | 'deny' | 'consult';

export interface AfterSalesOrder {
  id: string;
  productName: string;
  productCode: string;
  category: string;
  price: number;
  quantity: number;
  totalPrice: number;
  logisticsStatus: LogisticsStatus;
  logisticsStatusText: string;
  logisticsNumber?: string;
  orderDate: string;
  afterSalesDeadline: string;
  afterSalesDaysLeft: number;
}

export interface AfterSalesRule {
  id: string;
  ruleName: string;
  description: string;
  daysLimit: number;
  excludedCategories: string[];
  autoApprovedTags: AfterSalesTag[];
  returnAddress: string;
}

export interface AfterSalesTicket {
  id: string;
  orderId: string;
  productSku: string;
  customerName: string;
  description: string;
  photos: string[];
  issueType: AfterSalesTag;
  status: AfterSalesStatus;
  statusText: string;
  suggestedSolution: SuggestedSolution;
  createdAt: string;
}

export interface ReviewItem {
  id: string;
  productName: string;
  userName: string;
  content: string;
  rating: number;
  status: 'positive' | 'neutral' | 'negative';
  createdAt: string;
  suggestedReply?: string;
}

export const mockAfterSalesOrders: AfterSalesOrder[] = [
  { id: 'ORDER-20260001', productName: '无线蓝牙耳机', productCode: 'E-0001', category: '电子产品', price: 199, quantity: 1, totalPrice: 199, logisticsStatus: 'signed', logisticsStatusText: '已签收', logisticsNumber: 'SF1234567890', orderDate: '2026-07-28', afterSalesDeadline: '2026-08-04', afterSalesDaysLeft: 1 },
  { id: 'ORDER-20260002', productName: '男士纯棉T恤', productCode: 'F-0005', category: '服饰', price: 89, quantity: 2, totalPrice: 178, logisticsStatus: 'shipping', logisticsStatusText: '运输中', logisticsNumber: 'YT9876543210', orderDate: '2026-07-30', afterSalesDeadline: '2026-08-06', afterSalesDaysLeft: 3 },
  { id: 'ORDER-20260003', productName: '便携投影仪', productCode: 'E-0012', category: '电子产品', price: 1299, quantity: 1, totalPrice: 1299, logisticsStatus: 'pending', logisticsStatusText: '待发货', orderDate: '2026-08-02', afterSalesDeadline: '2026-08-09', afterSalesDaysLeft: 6 },
  { id: 'ORDER-20260004', productName: '女士休闲运动鞋', productCode: 'F-0015', category: '服饰', price: 299, quantity: 1, totalPrice: 299, logisticsStatus: 'delivered', logisticsStatusText: '已送达', logisticsNumber: 'ZT1122334455', orderDate: '2026-07-25', afterSalesDeadline: '2026-08-01', afterSalesDaysLeft: -1 },
  { id: 'ORDER-20260005', productName: '桌面音箱', productCode: 'E-0022', category: '电子产品', price: 499, quantity: 1, totalPrice: 499, logisticsStatus: 'signed', logisticsStatusText: '已签收', logisticsNumber: 'EMS66778899', orderDate: '2026-07-29', afterSalesDeadline: '2026-08-05', afterSalesDaysLeft: 2 },
];

export const mockAfterSalesRules: AfterSalesRule[] = [
  { id: 'R-001', ruleName: '7天无理由退换', description: '签收后7天内可无理由退换，商品需保持完好，包装完整', daysLimit: 7, excludedCategories: [], autoApprovedTags: ['7days_no_reason'], returnAddress: '广东省广州市天河区电商产业园A座101' },
  { id: 'R-002', ruleName: '15天质量问题包退', description: '15天内出现质量问题，提供照片可直接退货退款', daysLimit: 15, excludedCategories: ['贴身衣物', '食品'], autoApprovedTags: ['quality', 'damaged'], returnAddress: '广东省广州市白云区物流中心B仓' },
  { id: 'R-003', ruleName: '电子产品售后', description: '30天质量问题换新，1年保修，人为损坏不在保修范围', daysLimit: 30, excludedCategories: [], autoApprovedTags: [], returnAddress: '深圳市南山区科技园售后维修中心' },
];

export const mockAfterSalesTickets: AfterSalesTicket[] = [
  { id: 'TK-20260001', orderId: 'ORDER-20260001', productSku: 'E-0001', customerName: '张三', description: '耳机右耳没声音，无法开机', photos: [], issueType: 'quality', status: 'processing', statusText: '处理中', suggestedSolution: 'return_refund', createdAt: '2026-08-03 14:30:00' },
  { id: 'TK-20260002', orderId: 'ORDER-20260002', productSku: 'F-0005', customerName: '李四', description: '衣服尺码偏小，想换大一码', photos: [], issueType: '7days_no_reason', status: 'approved', statusText: '已批准', suggestedSolution: 'resend', createdAt: '2026-08-03 10:15:00' },
];

export const mockReviews: ReviewItem[] = [
  { id: 'R-001', productName: '无线蓝牙耳机', userName: '小明', content: '音质还可以，但包装太简陋了，收到的时候盒子都压变形了', rating: 3, status: 'neutral', createdAt: '2026-08-01' },
  { id: 'R-002', productName: '无线蓝牙耳机', userName: '小红', content: '物流太慢了，等了5天才收到，体验很差', rating: 2, status: 'negative', createdAt: '2026-07-31' },
  { id: 'R-003', productName: '男士纯棉T恤', userName: '小刚', content: '非常满意！面料很舒服，穿着很有型，下次还会再来！', rating: 5, status: 'positive', createdAt: '2026-07-30' },
  { id: 'R-004', productName: '便携投影仪', userName: '阿强', content: '画面有黑点，看起来像是质量瑕疵，希望商家处理', rating: 2, status: 'negative', createdAt: '2026-07-29' },
  { id: 'R-005', productName: '女士休闲运动鞋', userName: '小美', content: '描述的是米白色，收到发的是纯白色，色差有点大', rating: 3, status: 'neutral', createdAt: '2026-07-28' },
  { id: 'R-006', productName: '桌面音箱', userName: '老王', content: '音质很棒，低音很震撼，性价比很高，推荐购买！', rating: 5, status: 'positive', createdAt: '2026-07-27' },
];
