import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// 格式化價格
export function formatPrice(price: number): string {
  return price.toLocaleString('zh-TW', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

// 格式化日期
export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

// 動態分類映射 - 由管理員後台管理，不再使用硬編碼
export const categoryMap: Record<string, string> = {}

// 獲取分類中文名稱 - 現在直接返回分類slug，由後端動態提供分類名稱
export function getCategoryName(category: string): string {
  // 不再使用硬編碼映射，直接返回原始值
  // 分類顯示名稱應該由後端API提供
  return category
}

// 公告類型映射
export const announcementTypeMap = {
  info: { name: '資訊', color: 'bg-blue-500' },
  warning: { name: '警告', color: 'bg-orange-500' },
  promotion: { name: '促銷', color: 'bg-green-500' }
}

// 獲取公告類型樣式
export function getAnnouncementStyle(type: string) {
  return announcementTypeMap[type as keyof typeof announcementTypeMap] || 
         { name: type, color: 'bg-gray-500' }
}

// 防抖函數
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func(...args), delay)
  }
}

// 節流函數
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let lastCall = 0
  return (...args: Parameters<T>) => {
    const now = Date.now()
    if (now - lastCall >= delay) {
      lastCall = now
      func(...args)
    }
  }
}

// 生成隨機ID
export function generateId(): string {
  return Math.random().toString(36).substr(2, 9)
}

// 圖片錯誤處理 - 使用內聯 SVG 作為默認 placeholder
export function getImageUrl(imagePath: string): string {
  // 如果沒有圖片路徑，返回內聯 SVG placeholder
  if (!imagePath) {
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwIDIwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cmVjdCB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIGZpbGw9IiNGM0Y0RjYiLz4KPHA+YXRoIGZpbGwtcnVsZT0iZXZlbm9kZCIgY2xpcC1ydWxlPSJldmVub2RkIiBkPSJNNCAzQTIgMiAwIDAwMiA1VjE1QTIgMiAwIDAwNCAzSDRabTEyIDEySDBsNC04IDMgNiAyLTQgMyA2WiIgZmlsbD0iIzlDQTNBRiIvPgo8L3N2Zz4K';
  }
  
  // 如果是完整URL，直接返回
  if (imagePath.startsWith('http')) return imagePath
  
  // 如果是相對路徑，添加基礎路徑
  return imagePath.startsWith('/') ? imagePath : `/${imagePath}`
}

// 庫存狀態
export function getStockStatus(stock: number): {
  status: 'in-stock' | 'low-stock' | 'out-of-stock'
  text: string
  color: string
} {
  if (stock === 0) {
    return {
      status: 'out-of-stock',
      text: '缺貨',
      color: 'text-red-500'
    }
  } else if (stock < 10) {
    return {
      status: 'low-stock',
      text: `庫存不足 (${stock}件)`,
      color: 'text-orange-500'
    }
  } else {
    return {
      status: 'in-stock',
      text: '有庫存',
      color: 'text-green-500'
    }
  }
}

// 計算折扣
export function calculateDiscount(
  originalPrice: number,
  discountType: 'percentage' | 'fixed',
  discountValue: number
): { discountAmount: number; finalPrice: number } {
  let discountAmount = 0
  
  if (discountType === 'percentage') {
    discountAmount = (originalPrice * discountValue) / 100
  } else {
    discountAmount = discountValue
  }
  
  const finalPrice = Math.max(0, originalPrice - discountAmount)
  
  return { discountAmount, finalPrice }
}

// 驗證email
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// 驗證手機號碼
export function validatePhone(phone: string): boolean {
  const phoneRegex = /^09\d{8}$/
  return phoneRegex.test(phone)
}

// 本地存儲工具
export const storage = {
  get: (key: string) => {
    if (typeof window === 'undefined') return null
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : null
    } catch {
      return null
    }
  },
  
  set: (key: string, value: any) => {
    if (typeof window === 'undefined') return
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // 忽略錯誤
    }
  },
  
  remove: (key: string) => {
    if (typeof window === 'undefined') return
    try {
      localStorage.removeItem(key)
    } catch {
      // 忽略錯誤
    }
  }
}

// 錯誤處理
export function handleApiError(error: any): string {
  if (error.response?.data?.error) {
    return error.response.data.error
  }
  
  if (error.message) {
    return error.message
  }
  
  return '發生未知錯誤，請稍後再試'
}

/**
 * 確保值是數組，如果不是則返回空數組
 * @param value - 要檢查的值
 * @returns 確保是數組的值
 */
export function ensureArray<T>(value: T[] | any): T[] {
  return Array.isArray(value) ? value : [];
}
