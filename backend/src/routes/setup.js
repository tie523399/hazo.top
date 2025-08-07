const express = require('express');
const router = express.Router();
const setupCompleteData = require('../scripts/setup-complete-data');

// 一鍵初始化數據端點
router.post('/init-data', async (req, res) => {
  try {
    console.log('🚀 開始一鍵初始化數據...');
    
    // 執行完整數據初始化
    await setupCompleteData();
    
    res.json({
      success: true,
      message: '✅ 網站數據初始化完成！',
      details: {
        categories: '✅ 產品分類已創建',
        products: '✅ 商品數據已創建',
        admin: '✅ 管理員賬戶已創建 (admin/admin123)',
        announcements: '✅ 公告已創建',
        coupons: '✅ 優惠券已創建',
        settings: '✅ 系統設置已創建',
        homepage: '✅ 首頁設置已創建',
        footer: '✅ 頁腳設置已創建'
      },
      next_steps: [
        '1. 訪問 /admin 進入管理後台',
        '2. 使用 admin/admin123 登錄',
        '3. 立即修改管理員密碼',
        '4. 開始管理您的網站'
      ]
    });
    
  } catch (error) {
    console.error('❌ 數據初始化失敗:', error);
    res.status(500).json({
      success: false,
      message: '❌ 數據初始化失敗',
      error: error.message
    });
  }
});

// 檢查數據狀態端點
router.get('/check-data', async (req, res) => {
  try {
    const { dbAsync } = require('../database/db');
    
    const stats = {
      categories: await dbAsync.get('SELECT COUNT(*) as count FROM categories'),
      products: await dbAsync.get('SELECT COUNT(*) as count FROM products'),
      admins: await dbAsync.get('SELECT COUNT(*) as count FROM admins'),
      announcements: await dbAsync.get('SELECT COUNT(*) as count FROM announcements'),
      coupons: await dbAsync.get('SELECT COUNT(*) as count FROM coupons'),
      settings: await dbAsync.get('SELECT COUNT(*) as count FROM system_settings')
    };
    
    const isEmpty = Object.values(stats).every(stat => stat.count === 0);
    
    res.json({
      success: true,
      isEmpty,
      message: isEmpty ? '數據庫為空，需要初始化' : '數據庫已有數據',
      stats
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '檢查失敗',
      error: error.message
    });
  }
});

module.exports = router;
