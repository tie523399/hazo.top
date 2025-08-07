const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// 導入數據庫
const { testConnection } = require('./database/db');

// 導入備份系統
const { startAutoBackup, createBackup, getDatabaseStats } = require('./scripts/backup-system');

// 導入路由
const productsRouter = require('./routes/products');
const cartRouter = require('./routes/cart');
const couponsRouter = require('./routes/coupons');
const announcementsRouter = require('./routes/announcements');
const adminRouter = require('./routes/admin');
const settingsRouter = require('./routes/settings');
const ordersRouter = require('./routes/orders');
const sitemapRouter = require('./routes/sitemap');
const categoriesRouter = require('./routes/categories');
const homepageRouter = require('./routes/homepage');
const footerRouter = require('./routes/footer');
const cvsRouter = require('./routes/cvs');
const pageContentsRouter = require('./routes/page-contents');

const app = express();
const PORT = process.env.PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || 'development';

// CORS 設置
const corsOptions = {
  origin: NODE_ENV === 'production' 
    ? [process.env.FRONTEND_URL || 'https://hazovape-production.up.railway.app']
    : ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// 安全性標頭設置
app.disable('x-powered-by'); // 移除 x-powered-by 標頭

// 安全性中介軟體
app.use((req, res, next) => {
  // 移除不安全的標頭
  res.removeHeader('X-Powered-By');
  
  // 設置安全性標頭
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '0'); // 禁用舊的XSS過濾器
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Content Security Policy
  res.setHeader('Content-Security-Policy', 
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://fonts.googleapis.com; " +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
    "font-src 'self' https://fonts.gstatic.com; " +
    "img-src 'self' data: https:; " +
    "connect-src 'self'; " +
    "frame-ancestors 'none';"
  );
  
  // Cache Control 設置
  if (req.url.match(/\.(css|js)$/)) {
    // CSS 和 JS 文件長期緩存
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  } else if (req.url.match(/\.(png|jpg|jpeg|gif|ico|svg)$/) && req.url.includes('/images/')) {
    // 用戶上傳的圖片使用較短緩存，支持更新
    res.setHeader('Cache-Control', 'public, max-age=3600'); // 1小時緩存
  } else if (req.url.match(/\.(png|jpg|jpeg|gif|ico|svg)$/)) {
    // 其他靜態圖片資源正常緩存
    res.setHeader('Cache-Control', 'public, max-age=86400'); // 1天緩存
  } else if (req.url.startsWith('/api/')) {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }
  
  next();
});

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API路由 - 必須在靜態文件服務之前，確保API請求優先處理
app.use('/api/products', productsRouter);
app.use('/api/cart', cartRouter);
app.use('/api/coupons', couponsRouter);
app.use('/api/announcements', announcementsRouter);
app.use('/api/admin', adminRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/homepage', homepageRouter);
app.use('/api/footer', footerRouter);
app.use('/api/cvs', cvsRouter);
app.use('/api/page-contents', pageContentsRouter);
app.use('/api', sitemapRouter);

// 靜態文件服務 - 在API路由之後
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// 圖片服務 - 根據環境選擇正確的路徑
if (NODE_ENV === 'production') {
  // 生產環境：圖片在 dist/images 目錄
  app.use('/images', express.static(path.join(__dirname, '../../dist/images')));
} else {
  // 開發環境：圖片在 public/images 目錄
  app.use('/images', express.static(path.join(__dirname, '../../public/images')));
}

// 生產環境下服務前端靜態文件
if (NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../../dist')));
}

// robots.txt 路由
app.get('/robots.txt', (req, res) => {
  const baseUrl = NODE_ENV === 'production' 
    ? (process.env.FRONTEND_URL || 'https://hazovape-production.up.railway.app')
    : 'http://localhost:5173';
    
  const robotsTxt = `User-agent: *
Allow: /

# 網站地圖
Sitemap: ${baseUrl}/sitemap.xml

# 禁止訪問管理員區域
Disallow: /admin

# 禁止訪問 API 端點
Disallow: /api/

# 允許訪問所有產品頁面
Allow: /products
Allow: /products/*

# 允許訪問重要頁面
Allow: /shipping
Allow: /returns
Allow: /sitemap`;

  res.set('Content-Type', 'text/plain');
  res.send(robotsTxt);
});

// 根路由 - API文檔
app.get('/api', (req, res) => {
  res.json({
    message: '🌊 HAZO國際線上商店 API',
    version: '1.0.0',
    environment: NODE_ENV,
    endpoints: {
      products: '/api/products',
      cart: '/api/cart',
      coupons: '/api/coupons',
      announcements: '/api/announcements',
      admin: '/api/admin',
      settings: '/api/settings',
      orders: '/api/orders',
      sitemap: '/sitemap.xml',
      'sitemap-data': '/api/sitemap-data'
    }
  });
});

// 錯誤處理中間件
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({
    error: '服務器內部錯誤',
    message: NODE_ENV === 'development' ? err.message : '請稍後再試'
  });
});

// 404處理（僅用於API路由）
app.use('/api/*', (req, res) => {
  res.status(404).json({
    error: '找不到請求的API資源',
    path: req.originalUrl
  });
});

// 開發環境的根路由
if (NODE_ENV !== 'production') {
  app.get('/', (req, res) => {
    res.json({
      message: '🌊 HAZO國際線上商店 API',
      version: '1.0.0',
      environment: NODE_ENV,
      endpoints: {
        products: '/api/products',
        cart: '/api/cart',
        coupons: '/api/coupons',
        announcements: '/api/announcements',
        admin: '/api/admin',
        settings: '/api/settings',
        orders: '/api/orders',
        sitemap: '/sitemap.xml',
        'sitemap-data': '/api/sitemap-data'
      }
    });
  });
}

// 生產環境下，所有非API路由都返回index.html（SPA路由支持）
// 這必須放在最後，因為它是通配符路由
if (NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    // 其他路由返回前端應用
    res.sendFile(path.join(__dirname, '../../dist/index.html'));
  });
}

// 添加進程錯誤處理
process.on('uncaughtException', (error) => {
  console.error('❌ 未捕獲的異常:', error);
  // 不要立即退出，記錄錯誤但繼續運行
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ 未處理的 Promise 拒絕:', reason);
  // 不要立即退出，記錄錯誤但繼續運行
});

// 優雅關閉處理
process.on('SIGTERM', () => {
  console.log('📡 收到 SIGTERM 信號，正在優雅關閉...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('📡 收到 SIGINT 信號，正在優雅關閉...');
  process.exit(0);
});

// 啟動服務器
const server = app.listen(PORT, '0.0.0.0', async () => {
  console.log(`🚀 服務器運行在 http://localhost:${PORT}`);
  console.log(`📁 API文檔: http://localhost:${PORT}/api`);
  console.log(`🌍 環境: ${NODE_ENV}`);

  // 初始化數據庫（確保表結構存在）
  try {
    console.log('🔧 初始化數據庫表結構...');
    const initDb = require('./scripts/init-database.js');
    await initDb();
    console.log('✅ 數據庫初始化完成');
    
    // 檢查是否需要強制重設管理員
    if (process.env.FORCE_ADMIN_RESET === 'true') {
      console.log('🚨 檢測到強制管理員重設標記，執行重設...');
      const forceAdminReset = require('./scripts/force-admin-reset.js');
      await forceAdminReset();
    }

    // 檢查是否需要清除舊產品數據（一次性操作）
    if (process.env.CLEAR_LEGACY_PRODUCTS === 'true') {
      console.log('🧹 檢測到清除舊產品標記，執行清除...');
      const clearLegacyProducts = require('./scripts/clear-legacy-products.js');
      await clearLegacyProducts();
      console.log('🎯 舊產品清除完成，請設置 CLEAR_LEGACY_PRODUCTS=false 防止重複清除');
    }



    // 檢查是否需要創建示例商品（生產環境一次性操作）
    if (process.env.SETUP_DEMO_PRODUCTS === 'true') {
      console.log('🌊 檢測到示例商品創建標記，執行創建...');
      const setupDemo = require('./scripts/setup-basic-demo.js');
      await setupDemo();
      console.log('🎯 示例商品創建完成，請設置 SETUP_DEMO_PRODUCTS=false 防止重複創建');
    }

    // 檢查產品數據狀態（僅顯示信息，不自動恢復）
    const { dbAsync } = require('./database/db');
    const row = await dbAsync.get('SELECT COUNT(*) as count FROM products');
    if (row.count === 0) {
      console.log('📦 產品表為空 - 請通過管理員後台添加商品');
      console.log('🎯 管理員網址: /admin');
      console.log('👤 預設帳號: admin / admin123');
    } else {
      console.log(`✅ 產品數據已存在 (${row.count} 個產品)`);
    }
  } catch (err) {
    console.error('❌ 數據庫初始化失敗:', err);
    console.log('⚠️ 服務器將繼續運行，但某些功能可能不可用');
    // 不要退出，讓服務器繼續運行
  }

  // 測試數據庫連接
  await testConnection();
  
  // 啟動數據備份系統
  console.log('🔄 啟動數據備份系統...');
  try {
    // 立即創建一次備份
    await createBackup();
    
    // 顯示數據庫統計信息
    await getDatabaseStats();
    
    // 啟動自動備份（每6小時一次）
    const backupInterval = process.env.BACKUP_INTERVAL_HOURS || 6;
    startAutoBackup(parseInt(backupInterval));
    
    console.log(`✅ 數據備份系統已啟動，備份間隔: ${backupInterval} 小時`);
  } catch (error) {
    console.error('❌ 備份系統啟動失敗:', error.message);
    console.log('⚠️ 服務器將繼續運行，但自動備份功能不可用');
  }
});

module.exports = app;
