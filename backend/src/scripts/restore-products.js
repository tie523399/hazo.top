const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const { dbAsync } = require('../database/db');

// 使用與 db.js 相同的路徑邏輯
let dbPath;
if (process.env.NODE_ENV === 'production') {
  dbPath = process.env.DATABASE_PATH || '/app/data/vape_store.db';
} else {
  dbPath = path.join(__dirname, '../../database/vape_store.db');
}

console.log(`🔄 恢復產品數據到: ${dbPath}`);

const db = new sqlite3.Database(dbPath);

// ============================================================================
// 注意：靜態商品數據已移除，改為使用動態後台管理
// 如需恢復商品數據，請使用後台管理系統添加商品
// ============================================================================

// 空的商品數組 - 不再使用靜態數據
const products = [];

// 如果需要測試數據，請使用以下示例格式：
const exampleProduct = {
  // id: 自動生成,
  // name: '商品名稱',
  // category: 'host|cartridge|disposable',
  // brand: '品牌名稱', 
  // price: 價格,
  // description: '商品描述',
  // image_url: '/images/商品圖片.jpg',
  // stock: 庫存數量
};

// 作為模塊導出的恢復函數（僅恢復系統設置）
const restoreProductsData = async () => {
  try {
    console.log('⚙️ 開始恢復系統設置...');
    
    // 提示：不再恢復靜態商品數據
    if (products.length === 0) {
      console.log('ℹ️  商品數據已改為動態管理，跳過靜態商品恢復');
      console.log('💡 請使用後台管理系統添加商品');
    }

    // 僅恢復系統設置
    console.log('⚙️ 恢復系統設置...');
    const settings = [
      ['show_product_reviews', 'true'],
      ['show_product_preview', 'true'],
      ['free_shipping_threshold', '1000'],
      ['hero_image_url', '/images/ocean-logo-1.gif'],
      ['site_title', '海量國際'],
      ['site_logo_url', '/images/whale-company-logo.png']
    ];

    for (const [key, value] of settings) {
      await dbAsync.run(`
        INSERT OR REPLACE INTO system_settings (key, value, updated_at)
        VALUES (?, ?, datetime('now'))
      `, [key, value]);
      
      console.log(`✅ 恢復設置: ${key} = ${value}`);
    }

    console.log('✅ 系統設置恢復完成！');
    return true;
  } catch (err) {
    console.error('❌ 系統設置恢復失敗:', err);
    throw err;
  }
};

// 如果直接運行此文件，則執行恢復
if (require.main === module) {
  db.serialize(() => {
    console.log('⚙️ 開始恢復系統設置...');
    
    // 提示：不再恢復靜態商品數據
    if (products.length === 0) {
      console.log('ℹ️  商品數據已改為動態管理，跳過靜態商品恢復');
      console.log('💡 請使用後台管理系統添加商品');
    }

    // 僅恢復系統設置
    console.log('⚙️ 恢復系統設置...');
    const settings = [
      ['show_product_reviews', 'true'],
      ['show_product_preview', 'true'],
      ['free_shipping_threshold', '1000'],
      ['hero_image_url', '/images/ocean-logo-1.gif'],
      ['site_title', '海量國際'],
      ['site_logo_url', '/images/whale-company-logo.png']
    ];

    settings.forEach(([key, value]) => {
      db.run(`
        INSERT OR REPLACE INTO system_settings (key, value, updated_at)
        VALUES (?, ?, datetime('now'))
      `, [key, value], function(err) {
        if (err) {
          console.error(`❌ 設置 ${key} 失敗:`, err);
        } else {
          console.log(`✅ 恢復設置: ${key} = ${value}`);
        }
      });
    });
  });

  // 關閉數據庫連接
  setTimeout(() => {
    db.close((err) => {
      if (err) {
        console.error('❌ 關閉數據庫失敗:', err);
      } else {
        console.log('✅ 系統設置恢復完成！');
      }
    });
  }, 2000);
}

module.exports = restoreProductsData;
