/**
 * 動態更新favicon的工具函數
 */

export const updateFavicon = (faviconUrl: string) => {
  // 移除現有的favicon link
  const existingLinks = document.querySelectorAll('link[rel="icon"], link[rel="shortcut icon"]');
  existingLinks.forEach(link => link.remove());

  // 創建新的favicon link
  const link = document.createElement('link');
  link.rel = 'icon';
  link.type = faviconUrl.endsWith('.svg') ? 'image/svg+xml' : 'image/x-icon';
  link.href = faviconUrl;

  // 添加到head中
  document.head.appendChild(link);
};

/**
 * 動態更新頁面標題
 */
export const updatePageTitle = (title: string, suffix?: string) => {
  const fullTitle = suffix ? `${title} - ${suffix}` : title;
  document.title = fullTitle;
};

/**
 * 初始化網站品牌設置
 */
export const initializeBrandSettings = (settings: {
  site_title?: string;
  site_favicon_url?: string;
}) => {
  // 更新favicon
  if (settings.site_favicon_url) {
    updateFavicon(settings.site_favicon_url);
  }

  // 更新頁面標題
  if (settings.site_title) {
    updatePageTitle(settings.site_title, 'HAZO國際');
  }
};