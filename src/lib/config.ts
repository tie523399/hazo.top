// 網站配置
export const siteConfig = {
  // 網站基本信息
  name: 'HAZO',
  title: 'HAZO 電子煙商城 - 專業電子煙線上購物平台',
  description: 'HAZO 是台灣專業的電子煙線上商城，提供各大品牌電子煙主機、煙彈、拋棄式電子煙。正品保證，快速配送，優質售後服務。',
  
  // 域名配置
  domain: import.meta.env.VITE_SITE_URL || 'https://hazosp2p.top',
  
  // SEO配置
  keywords: '電子煙,電子煙主機,煙彈,拋棄式電子煙,IQOS,JUUL,Vaporesso,SP2,Ilia,HTA,Lana',
  author: 'HAZO',
  
  // 社交媒體
  social: {
    line: '@hazo-vape',
    email: 'service@hazo-vape.com'
  },
  
  // 圖片配置
  defaultImage: '/images/itay-kabalo-b3sel60dv8a-unsplash.jpg',
  logo: '/favicon.svg',
  
  // 聯繫信息
  contact: {
    line: '@hazo-vape',
    email: 'service@hazo-vape.com',
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
