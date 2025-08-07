const { dbAsync } = require('../database/db');
const bcrypt = require('bcryptjs');
const initializeDatabase = require('./init-database');

/**
 * 完整的網站數據初始化 - 一次性創建所有動態內容
 */
async function setupCompleteData() {
  console.log('🚀 開始創建完整網站數據...\n');
  
  try {
    // 1. 首先初始化數據庫（創建表結構和基本數據）
    console.log('📋 初始化數據庫...');
    await initializeDatabase();
    console.log('✅ 數據庫初始化完成\n');

    await dbAsync.run('BEGIN TRANSACTION');

    // 1. 創建產品分類
    console.log('📁 創建產品分類...');
    const categories = [
      { name: '電子產品', slug: 'electronics', description: '各類電子科技產品', order: 1 },
      { name: '配件用品', slug: 'accessories', description: '實用配件與用品', order: 2 },
      { name: '生活用品', slug: 'lifestyle', description: '日常生活必需品', order: 3 },
      { name: '時尚潮流', slug: 'fashion', description: '時尚潮流商品', order: 4 },
      { name: '運動健身', slug: 'sports', description: '運動健身用品', order: 5 }
    ];

    for (const cat of categories) {
      const existing = await dbAsync.get('SELECT id FROM categories WHERE slug = ?', cat.slug);
      if (!existing) {
        await dbAsync.run(
          'INSERT INTO categories (name, slug, description, display_order, is_active) VALUES (?, ?, ?, ?, ?)',
          [cat.name, cat.slug, cat.description, cat.order, 1]
        );
        console.log(`✅ 創建分類: ${cat.name}`);
      }
    }

    // 2. 創建產品數據
    console.log('\n📦 創建產品數據...');
    const products = [
      {
        name: 'HAZO智能手機',
        category: 'electronics',
        brand: 'HAZO國際',
        price: 15999,
        original_price: 18999,
        description: 'HAZO國際最新智能手機，搭載先進處理器，拍照效果卓越，續航持久。',
        image_url: '/images/phone-product.jpg',
        stock: 50
      },
      {
        name: 'HAZO無線耳機',
        category: 'electronics',
        brand: 'HAZO國際',
        price: 2999,
        original_price: 3499,
        description: '降噪無線耳機，音質清晰，舒適佩戴，適合日常使用。',
        image_url: '/images/earphone-product.jpg',
        stock: 100
      },
      {
        name: 'HAZO智能手錶',
        category: 'electronics',
        brand: 'HAZO國際',
        price: 8999,
        original_price: 9999,
        description: '多功能智能手錶，健康監測，運動追蹤，時尚外觀。',
        image_url: '/images/watch-product.jpg',
        stock: 30
      },
      {
        name: 'HAZO手機殼套裝',
        category: 'accessories',
        brand: 'HAZO國際',
        price: 299,
        original_price: 399,
        description: '透明防摔手機殼，附贈鋼化膜，全方位保護您的手機。',
        image_url: '/images/case-product.jpg',
        stock: 200
      },
      {
        name: 'HAZO藍牙音箱',
        category: 'electronics',
        brand: 'HAZO國際',
        price: 1299,
        original_price: 1599,
        description: '便攜藍牙音箱，360度環繞音效，防水設計。',
        image_url: '/images/speaker-product.jpg',
        stock: 80
      },
      {
        name: 'HAZO充電寶',
        category: 'accessories',
        brand: 'HAZO國際',
        price: 899,
        original_price: 1099,
        description: '大容量行動電源，快充技術，輕薄便攜。',
        image_url: '/images/powerbank-product.jpg',
        stock: 150
      },
      {
        name: 'HAZO咖啡杯',
        category: 'lifestyle',
        brand: 'HAZO國際',
        price: 399,
        original_price: 499,
        description: '不鏽鋼保溫杯，雙層保溫，適合咖啡愛好者。',
        image_url: '/images/cup-product.jpg',
        stock: 120
      },
      {
        name: 'HAZO背包',
        category: 'fashion',
        brand: 'HAZO國際',
        price: 1899,
        original_price: 2299,
        description: '商務休閒背包，多層收納，防水材質，適合通勤使用。',
        image_url: '/images/bag-product.jpg',
        stock: 60
      },
      {
        name: 'HAZO運動毛巾',
        category: 'sports',
        brand: 'HAZO國際',
        price: 199,
        original_price: 249,
        description: '超細纖維運動毛巾，吸水快乾，抗菌防臭。',
        image_url: '/images/towel-product.jpg',
        stock: 300
      },
      {
        name: 'HAZO瑜伽墊',
        category: 'sports',
        brand: 'HAZO國際',
        price: 799,
        original_price: 999,
        description: '環保TPE瑜伽墊，防滑耐用，適合各種瑜伽練習。',
        image_url: '/images/yoga-product.jpg',
        stock: 40
      }
    ];

    for (const product of products) {
      const existing = await dbAsync.get('SELECT id FROM products WHERE name = ?', product.name);
      if (!existing) {
        await dbAsync.run(
          `INSERT INTO products (name, category, brand, price, original_price, description, image_url, stock) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [product.name, product.category, product.brand, product.price, product.original_price, 
           product.description, product.image_url, product.stock]
        );
        console.log(`✅ 創建商品: ${product.name}`);
      }
    }

    // 3. 檢查管理員賬戶
    console.log('\n👤 檢查管理員賬戶...');
    const adminExists = await dbAsync.get('SELECT username FROM admins WHERE username = ?', 'admin');
    if (adminExists) {
      console.log('✅ 管理員賬戶已存在: admin / admin123');
    } else {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await dbAsync.run(
        'INSERT INTO admins (username, password_hash) VALUES (?, ?)',
        ['admin', hashedPassword]
      );
      console.log('✅ 創建管理員: admin / admin123');
    }

    // 4. 創建公告
    console.log('\n📢 創建公告...');
    const announcements = [
      {
        title: '🎉 HAZO國際盛大開幕',
        content: '歡迎來到HAZO國際購物平台！我們提供最優質的產品和服務，享受購物樂趣！',
        type: 'info'
      },
      {
        title: '🚚 免費配送活動',
        content: '購物滿999元即享免費配送！活動期間有限，把握機會！',
        type: 'promotion'
      },
      {
        title: '🔞 年齡提醒',
        content: '本網站商品僅供18歲以上成年人購買，請確認您已達法定年齡。',
        type: 'warning'
      }
    ];

    for (const announcement of announcements) {
      const existing = await dbAsync.get('SELECT id FROM announcements WHERE title = ?', announcement.title);
      if (!existing) {
        await dbAsync.run(
          'INSERT INTO announcements (title, content, type, is_active) VALUES (?, ?, ?, ?)',
          [announcement.title, announcement.content, announcement.type, 1]
        );
        console.log(`✅ 創建公告: ${announcement.title}`);
      }
    }

    // 5. 創建優惠券
    console.log('\n🎫 創建優惠券...');
    const coupons = [
      { code: 'WELCOME100', type: 'fixed', value: 100, min_amount: 500 },
      { code: 'SAVE10', type: 'percentage', value: 10, min_amount: 1000 },
      { code: 'NEWUSER200', type: 'fixed', value: 200, min_amount: 1500 },
      { code: 'VIP15', type: 'percentage', value: 15, min_amount: 2000 }
    ];

    for (const coupon of coupons) {
      const existing = await dbAsync.get('SELECT id FROM coupons WHERE code = ?', coupon.code);
      if (!existing) {
        await dbAsync.run(
          'INSERT INTO coupons (code, type, value, min_amount, is_active) VALUES (?, ?, ?, ?, ?)',
          [coupon.code, coupon.type, coupon.value, coupon.min_amount, 1]
        );
        console.log(`✅ 創建優惠券: ${coupon.code}`);
      }
    }

    // 6. 創建系統設置
    console.log('\n⚙️ 創建系統設置...');
    const settings = [
      { key: 'site_name', value: 'HAZO國際' },
      { key: 'site_title', value: 'HAZO國際 - 專業品牌線上購物平台' },
      { key: 'site_description', value: 'HAZO國際提供各大品牌優質產品，正品保證，快速配送，優質售後服務。' },
      { key: 'site_keywords', value: 'HAZO國際,線上購物,品牌商品,優質產品,專業服務' },
      { key: 'contact_email', value: 'service@hazo.top' },
      { key: 'contact_phone', value: '02-1234-5678' },
      { key: 'business_hours', value: '週一至週五 09:00-18:00' }
    ];

    for (const setting of settings) {
      const existing = await dbAsync.get('SELECT id FROM system_settings WHERE key = ?', setting.key);
      if (!existing) {
        await dbAsync.run(
          'INSERT INTO system_settings (key, value) VALUES (?, ?)',
          [setting.key, setting.value]
        );
        console.log(`✅ 創建設置: ${setting.key}`);
      }
    }

    // 7. 創建首頁設置
    console.log('\n🏠 創建首頁設置...');
    const homepageSettings = [
      {
        section: 'hero',
        title: 'HAZO國際',
        subtitle: '品質生活 • 精選好物',
        content: '探索HAZO國際精選商品，為您帶來最優質的購物體驗。每一件商品都經過嚴格挑選，只為給您最好的。',
        image_url: '/images/hero-banner.jpg',
        button_text: '開始購物',
        button_link: '/products'
      },
      {
        section: 'featured_products',
        title: '精選推薦',
        subtitle: '為您精心挑選',
        content: '每週更新的精選商品，品質保證，優惠價格。',
        image_url: '/images/featured-banner.jpg'
      }
    ];

    for (const setting of homepageSettings) {
      const existing = await dbAsync.get('SELECT id FROM homepage_settings WHERE section = ?', setting.section);
      if (!existing) {
        await dbAsync.run(
          `INSERT INTO homepage_settings 
           (section, title, subtitle, content, image_url, button_text, button_link, display_order, is_active) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [setting.section, setting.title, setting.subtitle, setting.content, 
           setting.image_url, setting.button_text, setting.button_link, 1, 1]
        );
        console.log(`✅ 創建首頁設置: ${setting.section}`);
      }
    }

    // 8. 創建頁腳設置
    console.log('\n🦶 創建頁腳設置...');
    const footerSettings = [
      {
        section: 'company_info',
        title: 'HAZO國際',
        content: 'HAZO國際致力於提供最優質的產品與服務，讓每一位顧客都能享受到最純淨、最舒適的購物體驗。'
      },
      {
        section: 'contact_info',
        title: '聯絡我們',
        content: JSON.stringify({
          phone: '02-1234-5678',
          email: 'service@hazo.top',
          address: '台北市信義區信義路五段7號',
          hours: '週一至週五 09:00-18:00'
        })
      },
      {
        section: 'copyright',
        title: '版權聲明',
        content: '© 2025 HAZO國際 版權所有'
      }
    ];

    for (const setting of footerSettings) {
      const existing = await dbAsync.get('SELECT id FROM footer_settings WHERE section = ?', setting.section);
      if (!existing) {
        await dbAsync.run(
          'INSERT INTO footer_settings (section, title, content, display_order, is_active) VALUES (?, ?, ?, ?, ?)',
          [setting.section, setting.title, setting.content, 1, 1]
        );
        console.log(`✅ 創建頁腳設置: ${setting.section}`);
      }
    }

    await dbAsync.run('COMMIT');

    // 9. 顯示統計
    console.log('\n📊 創建完成統計:');
    const stats = {
      categories: await dbAsync.get('SELECT COUNT(*) as count FROM categories'),
      products: await dbAsync.get('SELECT COUNT(*) as count FROM products'),
      admins: await dbAsync.get('SELECT COUNT(*) as count FROM admins'),
      announcements: await dbAsync.get('SELECT COUNT(*) as count FROM announcements'),
      coupons: await dbAsync.get('SELECT COUNT(*) as count FROM coupons'),
      settings: await dbAsync.get('SELECT COUNT(*) as count FROM system_settings'),
      homepage: await dbAsync.get('SELECT COUNT(*) as count FROM homepage_settings'),
      footer: await dbAsync.get('SELECT COUNT(*) as count FROM footer_settings')
    };

    console.log(`📁 產品分類: ${stats.categories.count} 個`);
    console.log(`📦 商品數據: ${stats.products.count} 個`);
    console.log(`👤 管理員: ${stats.admins.count} 個`);
    console.log(`📢 公告: ${stats.announcements.count} 個`);
    console.log(`🎫 優惠券: ${stats.coupons.count} 個`);
    console.log(`⚙️ 系統設置: ${stats.settings.count} 個`);
    console.log(`🏠 首頁設置: ${stats.homepage.count} 個`);
    console.log(`🦶 頁腳設置: ${stats.footer.count} 個`);

    console.log('\n🎉 完整網站數據創建成功！');
    console.log('\n💡 管理員登錄信息:');
    console.log('   網址: https://hazo.top/admin');
    console.log('   用戶名: admin');
    console.log('   密碼: admin123');
    console.log('\n⚠️ 請登錄後立即修改管理員密碼！');

  } catch (error) {
    await dbAsync.run('ROLLBACK');
    console.error('❌ 創建失敗:', error);
    throw error;
  }
}

// 直接執行
if (require.main === module) {
  setupCompleteData()
    .then(() => {
      console.log('\n🚀 網站已準備就緒！');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 初始化失敗:', error);
      process.exit(1);
    });
}

module.exports = setupCompleteData;
