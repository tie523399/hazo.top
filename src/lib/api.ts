import axios from 'axios';
import { 
  mockProducts, 
  mockCategories, 
  mockBrands, 
  mockCoupons, 
  mockAnnouncements,
  searchProducts,
  getProductById,
  validateCoupon
} from './mockData';

// 動態設置 API 基礎 URL
const getApiBaseUrl = () => {
  if (import.meta.env.PROD) {
    // 生產環境：使用相同域名的 API (Railway)
    return '/api';
  } else {
    // 開發環境：使用本地後端服務器
    return 'http://localhost:3001/api';
  }
};

const API_BASE_URL = getApiBaseUrl();

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 增加超時時間到 30 秒
});

// 請求攔截器
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 響應攔截器
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.log('🔐 收到401錯誤，清除token');
      localStorage.removeItem('admin_token');
      
      // 避免重複重定向，檢查當前是否已在正確頁面
      const currentPath = window.location.pathname;
      
      if (currentPath.startsWith('/admin')) {
        // 如果已經在管理頁面且沒有token，不需要重定向
        const hasToken = localStorage.getItem('admin_token');
        if (hasToken) {
          console.log('🔄 重定向到管理登錄頁面');
          window.location.href = '/admin';
        } else {
          console.log('ℹ️ 已在管理頁面，無需重定向');
        }
      } else {
        // 如果在其他頁面，只有在需要認證的操作時才重定向
        console.log('ℹ️ 在非管理頁面收到401，繼續正常使用');
      }
    }
    return Promise.reject(error);
  }
);

// 產品相關API
export const productsAPI = {
  getProducts: async (params?: {
    category?: string;
    brand?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) => {
    try {
      console.log('正在請求產品數據...', { params, baseURL: API_BASE_URL });
      const response = await api.get('/products', { params });
      console.log('產品數據請求成功');
      return response;
    } catch (error: any) {
      console.error('API 請求失敗:', error.message);
      
      // 不再使用模擬數據，直接返回空結果
      return { 
        data: { 
          products: [], 
          pagination: { pages: 0, current: 1, total: 0 } 
        } 
      };
    }
  },
  
  getProduct: async (id: string) => {
    try {
      return await api.get(`/products/${id}`);
    } catch (error) {
      console.error('API 請求失敗:', error);
      throw new Error('產品不存在');
    }
  },
  
  createProduct: (data: any) => api.post('/products', data),
  
  updateProduct: (id: string, data: any) => api.put(`/products/${id}`, data),
  
  deleteProduct: (id: string) => api.delete(`/products/${id}`),
  
  getCategories: async () => {
    try {
      return await api.get('/products/categories/list');
    } catch (error: any) {
      console.error('分類 API 請求失敗:', error.message);
      return { data: [] };
    }
  },
  
  getBrands: async (category?: string) => {
    try {
      return await api.get('/products/brands/list', { params: { category } });
    } catch (error: any) {
      console.error('品牌 API 請求失敗:', error.message);
      return { data: [] };
    }
  },
};

// 購物車相關API
export const cartAPI = {
  getCart: (sessionId: string) => api.get(`/cart/${sessionId}`),
  
  addToCart: (data: {
    sessionId: string;
    productId: number;
    variantId?: number;
    quantity?: number;
  }) => api.post('/cart', data),
  
  updateCartItem: (id: string, data: { quantity: number }) => 
    api.put(`/cart/${id}`, data),
  
  removeCartItem: (id: string) => api.delete(`/cart/${id}`),
  
  clearCart: (sessionId: string) => api.delete(`/cart/clear/${sessionId}`),
};

// 優惠券相關API
export const couponsAPI = {
  validateCoupon: (data: { code: string; amount: number }) => 
    api.post('/coupons/validate', data),
  
  getCoupons: () => api.get('/coupons'),
  
  createCoupon: (data: any) => api.post('/coupons', data),
  
  updateCouponStatus: (id: string, data: { is_active: boolean }) => 
    api.put(`/coupons/${id}/status`, data),
  
  deleteCoupon: (id: string) => api.delete(`/coupons/${id}`),
};

// 公告相關API
export const announcementsAPI = {
  getAnnouncements: () => api.get('/announcements'),
  
  getAnnouncementsAdmin: () => api.get('/announcements/admin'),
  
  createAnnouncement: (data: any) => api.post('/announcements', data),
  
  updateAnnouncement: (id: string, data: any) => 
    api.put(`/announcements/${id}`, data),
  
  updateAnnouncementStatus: (id: string, data: { is_active: boolean }) => 
    api.put(`/announcements/${id}/status`, data),
  
  deleteAnnouncement: (id: string) => api.delete(`/announcements/${id}`),
};

// 首頁設置 API
export const homepageAPI = {
  // 獲取公開的首頁設置
  getSettings: () => api.get('/homepage/settings'),
  
  // 管理員功能
  getAllSettings: () => api.get('/homepage/admin'),
  
  updateSection: (section: string, data: {
    image_url?: string;
    title?: string;
    subtitle?: string;
    content?: string;
    button_text?: string;
    button_link?: string;
    display_order?: number;
    is_active?: boolean;
  }) => api.put(`/homepage/admin/${section}`, data),
  
  resetSection: (section: string) => api.post(`/homepage/admin/reset/${section}`)
};

// 分類 API
export const categoriesAPI = {
  // 獲取所有分類（公開）
  getCategories: () => api.get('/categories'),
  
  // 獲取所有分類（包含停用的，管理員專用）
  getAllCategories: () => api.get('/categories/all'),
  
  // 創建分類
  createCategory: (data: {
    name: string;
    slug: string;
    description?: string;
    display_order?: number;
    is_active?: boolean;
  }) => {
    return api.post('/categories', data);
  },
  
  // 更新分類
  updateCategory: (id: number, data: {
    name?: string;
    slug?: string;
    description?: string;
    display_order?: number;
    is_active?: boolean;
  }) => {
    return api.put(`/categories/${id}`, data);
  },
  
  // 刪除分類
  deleteCategory: (id: number) => api.delete(`/categories/${id}`),
  
  // 獲取分類統計
  getCategoryStats: () => api.get('/categories/stats')
};

// 管理員相關API
export const adminAPI = {
  login: async (data: { username: string; password: string }) => {
    try {
      console.log('🔐 嘗試管理員登入...', { baseURL: API_BASE_URL, username: data.username });
      const response = await api.post('/admin/login', data);
      console.log('✅ 登入成功');
      return response;
    } catch (error: any) {
      console.error('❌ 登入失敗:', error.response?.data || error.message);
      // 提供更詳細的錯誤信息
      if (error.response?.status === 401) {
        throw new Error(error.response.data?.error || '用戶名或密碼錯誤');
      }
      throw error;
    }
  },
  
  verify: () => api.get('/admin/verify'),
  
  getDashboard: () => api.get('/admin/dashboard'),
  
  // 產品管理
  getProducts: (params?: any) => api.get('/admin/products', { params }),
  
  createProduct: (data: any) => api.post('/admin/products', data),
  
  updateProduct: (id: number, data: any) => 
    api.put(`/admin/products/${id}`, data),
  
  deleteProduct: (id: number) => api.delete(`/admin/products/${id}`),
  
  updateBatchStock: (data: { updates: Array<{ id: number; stock: number }> }) => 
    api.put('/admin/products/batch-stock', data),
  
  // 產品變體管理
  getProductVariants: (productId: number) => 
    api.get(`/admin/products/${productId}/variants`),
  
  createProductVariant: (productId: number, data: any) => 
    api.post(`/admin/products/${productId}/variants`, data),
  
  updateProductVariant: (variantId: number, data: any) => 
    api.put(`/admin/variants/${variantId}`, data),
  
  deleteProductVariant: (variantId: number) => 
    api.delete(`/admin/variants/${variantId}`),
  
  // 優惠券管理
  getCoupons: () => api.get('/admin/coupons'),
  
  createCoupon: (data: any) => api.post('/admin/coupons', data),
  
  updateCoupon: (id: number, data: any) => 
    api.put(`/admin/coupons/${id}`, data),
  
  deleteCoupon: (id: number) => api.delete(`/admin/coupons/${id}`),
  
  // 公告管理
  getAnnouncements: () => api.get('/admin/announcements'),
  
  createAnnouncement: (data: any) => api.post('/admin/announcements', data),
  
  updateAnnouncement: (id: number, data: any) => 
    api.put(`/admin/announcements/${id}`, data),
  
  deleteAnnouncement: (id: number) => api.delete(`/admin/announcements/${id}`),
  
  // 系統設置管理
  getSettings: () => api.get('/admin/settings'),
  
  updateSetting: (data: { key: string; value: string }) => 
    api.put('/admin/settings', data),
  
  updateBatchSettings: (data: Record<string, string>) => 
    api.put('/admin/settings/batch', data),
  
  // 管理員管理
  getAdmins: () => api.get('/admin/admins'),
  
  createAdmin: (data: { username: string; password: string }) => 
    api.post('/admin/admins', data),
  
  updateAdminPassword: (id: number, data: { newPassword: string }) => 
    api.put(`/admin/admins/${id}/password`, data),
  
  deleteAdmin: (id: number) => api.delete(`/admin/admins/${id}`),
  
  // 新增：修改密碼
  changePassword: (data: any) => api.patch('/admin/change-password', data),
  
  // Telegram Bot測試
  testTelegram: (data: { botToken: string; chatId: string; message: string }) => 
    api.post('/admin/telegram-test', data),
  
  // 圖片管理
  uploadImage: (formData) => api.post('/admin/upload-image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  }),
  getImages: () => api.get('/admin/images'),
  deleteImage: (filename: string) => api.delete(`/admin/images/${filename}`),
  
  // 產品圖片管理
  getProductImages: (productId: number) => api.get(`/admin/products/${productId}/images`),
  addProductImage: (productId: number, imageData: {
    image_url: string;
    alt_text?: string;
    display_order?: number;
    is_primary?: boolean;
  }) => api.post(`/admin/products/${productId}/images`, imageData),
  updateProductImage: (productId: number, imageId: number, imageData: {
    image_url?: string;
    alt_text?: string;
    display_order?: number;
    is_primary?: boolean;
  }) => api.put(`/admin/products/${productId}/images/${imageId}`, imageData),
  deleteProductImage: (productId: number, imageId: number) => 
    api.delete(`/admin/products/${productId}/images/${imageId}`),
  reorderProductImages: (productId: number, imageOrders: Array<{id: number, display_order: number}>) =>
    api.put(`/admin/products/${productId}/images/reorder`, { imageOrders })
};

// 系統設置相關API (公開)
export const settingsAPI = {
  getPublicSettings: () => api.get('/settings/public'),
  getSettings: () => api.get('/admin/settings'),
  updateSettings: (data: Record<string, string>) => api.put('/admin/settings/batch', data),
};

// 訂單相關API
export const ordersAPI = {
  submitOrder: (orderData: any) => api.post('/orders/submit', { orderData }),
};

export async function getDashboardStats() {
  try {
    const response = await api.get('/admin/dashboard-stats');
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || '無法獲取儀表板數據');
  }
}

export async function uploadImage(file: File) {
  const formData = new FormData();
  formData.append('image', file);

  try {
    const response = await api.post('/admin/upload-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || '圖片上傳失敗');
  }
}

export async function getImages() {
  try {
    const response = await api.get('/admin/images');
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || '無法獲取圖片列表');
  }
}

export async function deleteImage(filename: string) {
  try {
    const response = await api.delete(`/admin/images/${filename}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || '刪除圖片失敗');
  }
}

// 設置相關
export async function getSettings() {
  try {
    // ... existing code ...
  } catch (error: any) {
    throw new Error(error.response?.data?.message || '無法獲取設置');
  }
}

// 頁面內容管理 API
export const pageContentsAPI = {
  // 獲取所有頁面內容（管理員）
  getAllPageContents: async () => {
    try {
      const response = await api.get('/page-contents/admin/all');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || '獲取頁面內容失敗');
    }
  },

  // 獲取特定頁面內容（公開）
  getPageContent: async (pageKey: string) => {
    try {
      const response = await api.get(`/page-contents/${pageKey}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || '獲取頁面內容失敗');
    }
  },

  // 創建頁面內容
  createPageContent: async (contentData: any) => {
    try {
      const response = await api.post('/page-contents/admin', contentData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || '創建頁面內容失敗');
    }
  },

  // 更新頁面內容
  updatePageContent: async (id: number, contentData: any) => {
    try {
      const response = await api.put(`/page-contents/admin/${id}`, contentData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || '更新頁面內容失敗');
    }
  },

  // 刪除頁面內容
  deletePageContent: async (id: number) => {
    try {
      const response = await api.delete(`/page-contents/admin/${id}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || '刪除頁面內容失敗');
    }
  }
};

// 頁腳設置相關API
export const footerAPI = {
  // 獲取所有頁腳設置（公開）
  getAllSettings: async () => {
    try {
      const response = await api.get('/footer');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || '獲取頁腳設置失敗');
    }
  },

  // 獲取所有頁腳設置（管理員，包含停用的）
  getAllSettingsAdmin: async () => {
    try {
      const response = await api.get('/footer/all');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || '獲取頁腳設置失敗');
    }
  },

  // 獲取特定區段設置
  getSection: async (section: string) => {
    try {
      const response = await api.get(`/footer/${section}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || '獲取頁腳設置失敗');
    }
  },

  // 更新特定區段設置
  updateSection: async (section: string, data: any) => {
    try {
      const response = await api.put(`/footer/${section}`, data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || '更新頁腳設置失敗');
    }
  },

  // 創建新設置
  createSetting: async (data: any) => {
    try {
      const response = await api.post('/footer', data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || '創建頁腳設置失敗');
    }
  },

  // 刪除設置
  deleteSetting: async (section: string) => {
    try {
      const response = await api.delete(`/footer/${section}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || '刪除頁腳設置失敗');
    }
  },

  // 批次更新設置
  batchUpdate: async (settings: any[]) => {
    try {
      const response = await api.post('/footer/batch-update', { settings });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || '批次更新失敗');
    }
  }
};

export default api;
