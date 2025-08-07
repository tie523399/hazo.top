const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { promisify } = require('util');

// 數據庫連接
const dbPath = process.env.DATABASE_PATH || path.join(__dirname, '../../database/vape_store.db');
const db = new sqlite3.Database(dbPath);
const dbRun = promisify(db.run.bind(db));
const dbGet = promisify(db.get.bind(db));
const dbAll = promisify(db.all.bind(db));

console.log('🧪 開始全面測試後台功能...');
console.log('📁 數據庫路徑:', dbPath);

async function testAllFeatures() {
  try {
    // 1. 更新系統設置
    console.log('\n🔧 測試系統設置...');
    await dbRun(`UPDATE system_settings SET value = ? WHERE key = ?`, ['/images/ocean-logo.gif', 'site_logo_url']);
    await dbRun(`UPDATE system_settings SET value = ? WHERE key = ?`, ['/images/whale-logo.gif', 'site_favicon_url']);
    await dbRun(`UPDATE system_settings SET value = ? WHERE key = ?`, ['海量國際', 'site_title']);
    console.log('✅ 系統設置已更新');

    // 2. 更新頁腳設置
    console.log('\n🦶 測試頁腳設置...');
    await dbRun(`UPDATE footer_settings SET title = ?, content = ?, image_url = ? WHERE section = ?`, 
      ['HAZO國際', 'HAZO國際致力於提供最優質的產品與服務，讓每一位顧客都能享受到最純淨、最舒適的使用體驗。', '/images/ocean-logo.gif', 'company_info']);
    
    await dbRun(`UPDATE footer_settings SET content = ? WHERE section = ?`, 
      ['© 2025卉田國際旗下 子公司:海量國際 版權所有', 'copyright']);
    console.log('✅ 頁腳設置已更新');

    // 3. 測試分類管理功能
    console.log('\n🏷️ 測試產品分類...');
    console.log('ℹ️ 分類現在由管理員動態創建，不再使用預設分類');
    console.log('💡 請使用後台管理系統 /admin 來創建和管理分類');
    
    // 檢查是否有現有分類
    const existingCategories = await dbAll('SELECT COUNT(*) as count FROM categories');
    console.log(`📋 當前分類數量: ${existingCategories[0].count}`);

    // 4. 測試產品管理功能
    console.log('\n📦 測試產品管理...');
    console.log('ℹ️ 產品現在需要先創建分類，然後通過管理員後台創建');
    console.log('💡 請使用後台管理系統 /admin 來創建分類和產品');
    
    // 檢查是否有現有產品
    const existingProducts = await dbAll('SELECT COUNT(*) as count FROM products');
    console.log(`📋 當前產品數量: ${existingProducts[0].count}`);



    // 5. 創建測試公告
    console.log('\n📢 測試公告管理...');
    const announcements = [
      {
        title: '🌊 HAZO國際新品上市',
        content: '全新海洋系列產品隆重登場！融合深海靈感與頂級工藝，為您帶來非凡體驗。',
        type: 'info',
        is_active: 1
      },
      {
        title: '🐋 鯨魚限定版現正預購',
        content: '限量發行的鯨魚主題產品，獨特設計與卓越品質的完美結合。預購享85折優惠！',
        type: 'promotion',
        is_active: 1
      }
    ];

    for (const announcement of announcements) {
      await dbRun(`INSERT OR REPLACE INTO announcements (title, content, type, is_active) 
                   VALUES (?, ?, ?, ?)`, 
                   [announcement.title, announcement.content, announcement.type, announcement.is_active]);
    }
    console.log('✅ 測試公告已創建');

    // 6. 創建測試優惠券
    console.log('\n🎫 測試優惠券管理...');
    const coupons = [
      {
        code: 'OCEAN2025',
        type: 'percentage',
        value: 15,
        min_amount: 1000,
        max_uses: 100,
        description: '海洋系列專享15%折扣券'
      },
      {
        code: 'WHALE500',
        type: 'fixed',
        value: 500,
        min_amount: 2000,
        max_uses: 50,
        description: '鯨魚限定版滿2000減500'
      },
      {
        code: 'INTERNATIONAL',
        type: 'percentage',
        value: 20,
        min_amount: 3000,
        max_uses: 30,
        description: '國際精選系列VIP折扣20%'
      }
    ];

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    for (const coupon of coupons) {
      await dbRun(`INSERT OR REPLACE INTO coupons 
                   (code, type, value, min_amount, max_uses, used_count, description, start_date, end_date, is_active) 
                   VALUES (?, ?, ?, ?, ?, 0, ?, ?, ?, 1)`, 
                   [coupon.code, coupon.type, coupon.value, coupon.min_amount, coupon.max_uses, 
                    coupon.description, tomorrow.toISOString(), nextMonth.toISOString()]);
    }
    console.log('✅ 測試優惠券已創建');

    // 7. 更新首頁設置
    console.log('\n🏠 測試首頁設置...');
    const homepageSettings = [
      {
        section: 'hero',
        title: 'HAZO國際 - 深海品質體驗',
        content: '探索來自深海的純淨品質，體驗如海洋般深邃的品牌科技。HAZO國際為您帶來最專業的產品與服務。',
        image_url: '/images/ocean-logo.gif'
      },
      {
        section: 'featured_products',
        title: '精選推薦',
        content: '海洋系列與鯨魚限定版，頂級工藝與創新設計的完美融合',
        image_url: '/images/whale-logo.gif'
      },
      {
        section: 'brand_story',
        title: '品牌故事',
        content: 'HAZO國際，專注於為全球用戶提供高品質產品。我們將海洋的純淨與深邃融入每一件產品中。',
        image_url: '/images/ocean-logo.gif'
      }
    ];

    for (const setting of homepageSettings) {
      await dbRun(`UPDATE homepage_settings SET title = ?, content = ?, image_url = ? WHERE section = ?`, 
                   [setting.title, setting.content, setting.image_url, setting.section]);
    }
    console.log('✅ 首頁設置已更新');

    // 8. 測試查詢結果
    console.log('\n📊 驗證測試結果...');
    const systemSettings = await dbAll(`SELECT * FROM system_settings WHERE key IN ('site_logo_url', 'site_favicon_url', 'site_title')`);
    const categoryCount = await dbGet(`SELECT COUNT(*) as count FROM categories WHERE is_active = 1`);
    const productCount = await dbGet(`SELECT COUNT(*) as count FROM products WHERE is_active = 1`);
    const announcementCount = await dbGet(`SELECT COUNT(*) as count FROM announcements WHERE is_active = 1`);
    const couponCount = await dbGet(`SELECT COUNT(*) as count FROM coupons WHERE is_active = 1`);

    console.log('\n📋 測試結果統計:');
    console.log(`✅ 系統設置: ${systemSettings.length} 項已配置`);
    console.log(`✅ 產品分類: ${categoryCount.count} 個活躍分類`);
    console.log(`✅ 測試產品: ${productCount.count} 個活躍產品`);
    console.log(`✅ 公告消息: ${announcementCount.count} 個活躍公告`);
    console.log(`✅ 優惠券碼: ${couponCount.count} 個活躍優惠券`);

    console.log('\n🎉 所有後台功能測試完成！');
    console.log('🌊 使用的圖片: ocean-logo.gif, whale-logo.gif');
    console.log('🏢 公司資訊: © 2025卉田國際旗下 子公司:海量國際 版權所有');
    console.log('🚀 現在可以在管理後台查看和管理這些測試數據');

  } catch (error) {
    console.error('❌ 測試過程中發生錯誤:', error);
  } finally {
    db.close();
  }
}

// 執行測試
testAllFeatures();