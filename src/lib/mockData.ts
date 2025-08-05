import { Product, CartItem, Coupon, Announcement } from './store';

// 30種口味
const flavors = [
  '草莓', '芒果', '薄荷', '煙草', '香草', '藍莓', '蘋果', '西瓜', '葡萄', '櫻桃',
  '檸檬', '橘子', '桃子', '椰子', '咖啡', '巧克力', '蜂蜜', '奶油', '玫瑰', '薰衣草',
  '青檸', '柚子', '荔枝', '龍眼', '榴蓮', '百香果', '奇異果', '鳳梨', '葡萄柚', '覆盆子'
];

// 顏色選項
const colors = ['黑色', '白色', '銀色', '藍色', '紅色', '金色'];

// 生成產品數據 - 已移除所有靜態產品，改為完全動態管理
const generateProducts = (): Product[] => {
  // 不再產生任何模擬產品，確保只顯示後台管理的真實產品
  return [];
};

// 生成分類數據 - 已移除靜態分類，改為完全動態管理
export const mockCategories: any[] = [];

// 生成品牌數據 - 已移除靜態品牌，改為完全動態管理
export const mockBrands: any[] = [];

// 生成優惠券數據
export const mockCoupons: Coupon[] = [
  {
    id: 1,
    code: 'WELCOME10',
    type: 'percentage',
    value: 10,
    min_amount: 500,
    expires_at: '2025-12-31 23:59:59',
    is_active: true
  },
  {
    id: 2,
    code: 'SAVE50',
    type: 'fixed',
    value: 50,
    min_amount: 1000,
    expires_at: '2025-12-31 23:59:59',
    is_active: true
  },
  {
    id: 3,
    code: 'NEWUSER20',
    type: 'percentage',
    value: 20,
    min_amount: 800,
    expires_at: '2025-12-31 23:59:59',
    is_active: true
  },
  {
    id: 4,
    code: 'SUMMER15',
    type: 'percentage',
    value: 15,
    min_amount: 600,
    expires_at: '2025-08-31 23:59:59',
    is_active: true
  }
];

// 生成公告數據
export const mockAnnouncements: Announcement[] = [
  {
    id: 1,
    title: '歡迎來到電子煙專賣店',
    content: '我們提供各種品牌的高品質電子煙產品，歡迎選購！',
    type: 'info',
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: 2,
    title: '新用戶優惠',
    content: '新用戶註冊即可獲得20%折扣優惠券，使用代碼：NEWUSER20',
    type: 'promotion',
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: 3,
    title: '健康提醒',
    content: '請注意：電子煙產品含有尼古丁，未成年人禁止使用。',
    type: 'warning',
    is_active: true,
    created_at: new Date().toISOString()
  }
];

// 主要的產品數據
export const mockProducts = generateProducts();

// 搜索產品 - 已停用模擬數據，只返回空結果
export const searchProducts = (params: {
  category?: string;
  brand?: string;
  search?: string;
  page?: number;
  limit?: number;
}) => {
  // 不再使用模擬產品，確保只顯示後台管理的真實產品
  return {
    products: [],
    pagination: {
      page: params.page || 1,
      limit: params.limit || 12,
      total: 0,
      pages: 0
    }
  };
};

// 根據ID獲取產品 - 已停用模擬數據
export const getProductById = (id: string): Product | undefined => {
  // 不再使用模擬產品，直接返回undefined
  return undefined;
};

// 驗證優惠券
export const validateCoupon = (code: string, amount: number) => {
  const coupon = mockCoupons.find(c => c.code === code && c.is_active);
  
  if (!coupon) {
    throw new Error('優惠碼不存在或已失效');
  }
  
  // 檢查是否過期
  if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
    throw new Error('優惠碼已過期');
  }
  
  // 檢查最低消費金額
  if (amount < coupon.min_amount) {
    throw new Error(`訂單金額需滿 $${coupon.min_amount} 才能使用此優惠碼`);
  }
  
  // 計算折扣金額
  let discountAmount = 0;
  if (coupon.type === 'percentage') {
    discountAmount = Math.round((amount * coupon.value / 100) * 100) / 100;
  } else if (coupon.type === 'fixed') {
    discountAmount = coupon.value;
  }
  
  return {
    valid: true,
    coupon: {
      id: coupon.id,
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
      min_amount: coupon.min_amount
    },
    discountAmount,
    finalAmount: Math.max(0, amount - discountAmount)
  };
};
