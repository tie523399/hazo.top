// 網站配置
export const siteConfig = {
  // 網站基本信息
  name: 'HAZO國際',
  title: 'HAZO國際 - 專業品牌線上購物平台',
  description: 'HAZO國際是台灣專業的品牌商城，提供各大品牌優質產品與服務。正品保證，快速配送，優質售後服務。',
  
  // 域名配置
  domain: import.meta.env.VITE_SITE_URL || 'https://hazo.top',
  
  // SEO配置
  keywords: 'HAZO國際,線上購物,品牌商品,SP2,Ilia,HTA,Lana,優質產品,專業服務',
  author: 'HAZO',
  
  // 社交媒體
  social: {
    line: '@hazo',
    email: 'service@hazo.top'
  },
  
  // 圖片配置
  defaultImage: '/images/itay-kabalo-b3sel60dv8a-unsplash.jpg',
  logo: '/favicon.svg',
  
  // 聯繫信息
  contact: {
    line: '@hazo',
    email: 'service@hazo.top',
    hours: '週一至週五 10:00-18:00'
  }
};

// 獲取完整URL
export const getFullUrl = (path: string = '') => {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${siteConfig.domain}${cleanPath}`;
};

// 獲取完整圖片URL
export const getFullImageUrl = (imagePath: string) => {
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  return getFullUrl(imagePath);
};
