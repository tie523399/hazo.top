const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { db, dbAsync } = require('../database/db');
const bcrypt = require('bcryptjs');

// `db` is already imported, so we don't create a new connection here.

const createTables = async () => {
  console.log('正在創建數據庫表...');
  try {
    await dbAsync.run('BEGIN TRANSACTION');

    // 產品分類表
    await dbAsync.run(`
      CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        slug TEXT NOT NULL UNIQUE,
        description TEXT,
        display_order INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 產品表（移除 category 的 CHECK 約束）
    await dbAsync.run(`
      CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        category TEXT NOT NULL,
        brand TEXT NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        original_price DECIMAL(10,2),
        description TEXT,
        image_url TEXT,
        stock INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 產品變體表
    await dbAsync.run(`
      CREATE TABLE IF NOT EXISTS product_variants (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_id INTEGER NOT NULL,
        variant_type TEXT NOT NULL,
        variant_value TEXT NOT NULL,
        stock INTEGER DEFAULT 0,
        price_modifier DECIMAL(10,2) DEFAULT 0,
        FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE
      )
    `);

    // 產品圖片表
    await dbAsync.run(`
      CREATE TABLE IF NOT EXISTS product_images (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_id INTEGER NOT NULL,
        image_url TEXT NOT NULL,
        alt_text TEXT,
        display_order INTEGER DEFAULT 0,
        is_primary BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE
      )
    `);

    // 購物車表
    await dbAsync.run(`
      CREATE TABLE IF NOT EXISTS cart_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id TEXT NOT NULL,
        product_id INTEGER NOT NULL,
        variant_id INTEGER,
        quantity INTEGER NOT NULL DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE,
        FOREIGN KEY (variant_id) REFERENCES product_variants (id) ON DELETE CASCADE
      )
    `);

    // 優惠券表
    await dbAsync.run(`
      CREATE TABLE IF NOT EXISTS coupons (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        code TEXT UNIQUE NOT NULL,
        type TEXT NOT NULL CHECK(type IN ('percentage', 'fixed')),
        value DECIMAL(10,2) NOT NULL,
        min_amount DECIMAL(10,2) DEFAULT 0,
        expires_at DATETIME,
        is_active INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 公告表
    await dbAsync.run(`
      CREATE TABLE IF NOT EXISTS announcements (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        type TEXT NOT NULL CHECK(type IN ('info', 'warning', 'promotion')),
        is_active INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 管理員表
    await dbAsync.run(`
      CREATE TABLE IF NOT EXISTS admins (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 系統設置表
    await dbAsync.run(`
      CREATE TABLE IF NOT EXISTS system_settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        key TEXT UNIQUE NOT NULL,
        value TEXT NOT NULL,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 插入默認系統設置
    await dbAsync.run(`
      INSERT OR IGNORE INTO system_settings (key, value) VALUES
      ('free_shipping_threshold', '1000'),
      ('telegram_bot_token', ''),
      ('telegram_chat_id', ''),
      ('hero_image_url', '/images/itay-kabalo-b3sel60dv8a-unsplash.jpg'),
      ('show_product_reviews', 'true'),
      ('show_product_preview', 'true'),
      ('site_logo_url', '/images/logo-simple.svg'),
      ('site_favicon_url', '/favicon.svg'),
      ('site_title', '海量國際')
    `);

    // 首頁設置表
    await dbAsync.run(`
      CREATE TABLE IF NOT EXISTS homepage_settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        section TEXT NOT NULL UNIQUE,
        image_url TEXT,
        title TEXT,
        subtitle TEXT,
        content TEXT,
        button_text TEXT,
        button_link TEXT,
        display_order INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 頁腳設置表
    await dbAsync.run(`
      CREATE TABLE IF NOT EXISTS footer_settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        section TEXT NOT NULL UNIQUE,
        title TEXT,
        content TEXT,
        link_url TEXT,
        image_url TEXT,
        icon_name TEXT,
        display_order INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 頁面內容管理表
    await dbAsync.run(`
      CREATE TABLE IF NOT EXISTS page_contents (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        page_key TEXT NOT NULL UNIQUE,
        page_name TEXT NOT NULL,
        title TEXT,
        subtitle TEXT,
        content TEXT,
        metadata TEXT,
        is_active BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 訂單表
    await dbAsync.run(`
      CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_number TEXT,
        customer_name TEXT NOT NULL,
        customer_phone TEXT NOT NULL,
        customer_line_id TEXT,
        shipping_method TEXT,
        shipping_store_name TEXT,
        shipping_store_number TEXT,
        subtotal DECIMAL(10, 2) NOT NULL,
        shipping_fee DECIMAL(10, 2) NOT NULL,
        discount DECIMAL(10, 2) DEFAULT 0,
        total_amount DECIMAL(10, 2) NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        coupon_code TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 訂單項目表
    await dbAsync.run(`
      CREATE TABLE IF NOT EXISTS order_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id INTEGER NOT NULL,
        product_id INTEGER NOT NULL,
        variant_id INTEGER,
        quantity INTEGER NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        product_name TEXT NOT NULL,
        variant_value TEXT,
        FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE SET NULL,
        FOREIGN KEY (variant_id) REFERENCES product_variants (id) ON DELETE SET NULL
      )
    `);

    // 添加遷移：為產品表添加 original_price 字段（如果不存在）
    try {
      await dbAsync.run(`ALTER TABLE products ADD COLUMN original_price DECIMAL(10,2)`);
      console.log('✅ 已添加 original_price 字段');
    } catch (error) {
      // 如果字段已存在，忽略錯誤
      if (!error.message.includes('duplicate column name')) {
        console.log('⚠️ original_price 字段已存在');
      }
    }

    await dbAsync.run('COMMIT');
    console.log('✅ 數據庫表創建成功！');
  } catch (err) {
    await dbAsync.run('ROLLBACK');
    console.error('❌ 創建數據庫表失敗:', err);
    throw err; // 拋出錯誤以便上層捕獲
  }
};

const initializeDatabase = async () => {
  try {
    await createTables();
    
    // 檢查並創建默認管理員
    const adminRow = await dbAsync.get('SELECT COUNT(*) as count FROM admins');
    if (adminRow.count === 0) {
      console.log('👤 檢測到無管理員帳戶，正在創建默認管理員...');
      const hashedPassword = await bcrypt.hash(process.env.ADMIN_INITIAL_PASSWORD || 'admin123', 10);
      await dbAsync.run(
        'INSERT INTO admins (username, password_hash) VALUES (?, ?)',
        [process.env.ADMIN_USERNAME || 'admin', hashedPassword]
      );
      console.log('✅ 默認管理員已創建。');
    }
    
    // 商品分類改為完全動態管理 - 不再創建默認分類
    console.log('📁 商品分類已改為動態管理，請通過後台添加分類');
    
    // 檢查並創建默認首頁設置
    const homepageRow = await dbAsync.get('SELECT COUNT(*) as count FROM homepage_settings');
    if (homepageRow.count === 0) {
      console.log('🏠 檢測到無首頁設置，正在創建默認設置...');
      const defaultSettings = [
        {
          section: 'hero',
          image_url: '/images/ocean-logo-1.gif',
          title: '海量國際',
          subtitle: '海洋品質 • 深度體驗',
          content: '探索來自深海的純淨品質，體驗如海洋般深邃的電子煙科技。海量國際為您帶來最專業的電子煙產品與服務。',
          button_text: '探索產品',
          button_link: '/products',
          display_order: 1,
          is_active: 1
        },
        {
          section: 'hero1',
          image_url: '/images/whale-company-logo.png',
          title: '海量品質',
          subtitle: '極致工藝，完美體驗',
          content: '採用航空級品質標準，結合先進的技術工藝，為您帶來最純淨的產品體驗。每一個細節都是品質的保證。',
          button_text: '立即探索',
          button_link: '/products',
          display_order: 2,
          is_active: 1
        },
        {
          section: 'hero2',
          image_url: '/images/ocean-logo-2.gif',
          title: '國際品牌',
          subtitle: '時尚設計，品味生活',
          content: '融合現代美學與頂尖科技，海量國際不僅提供優質產品，更是您生活品味的象徵。精工細作，只為懂得品味的您。',
          button_text: '立即探索',
          button_link: '/products',
          display_order: 3,
          is_active: 1
        },
        {
          section: 'hero_main',
          image_url: '/images/ocean-logo-1.gif',
          title: '海量國際 主圖',
          subtitle: '首頁主要展示圖片',
          content: '首頁輪播主圖設置',
          button_text: null,
          button_link: null,
          display_order: 0,
          is_active: 1
        },
        {
          section: 'features',
          image_url: null,
          title: '特色功能',
          subtitle: '我們的服務特色',
          content: JSON.stringify([
            {
              icon: 'Zap',
              title: '極速配送',
              description: '24小時內快速配送，讓您儘快享受',
              gradient: 'from-amber-400 to-orange-500',
              delay: '0ms'
            },
            {
              icon: 'Shield',
              title: '品質保證',
              description: '正品保證，所有產品均通過品質檢測',
              gradient: 'from-emerald-400 to-teal-500',
              delay: '100ms'
            },
            {
              icon: 'Truck',
              title: '免費配送',
              description: '滿額免運費，全台配送服務',
              gradient: 'from-blue-400 to-cyan-500',
              delay: '200ms'
            },
            {
              icon: 'HeartHandshake',
              title: '售後服務',
              description: '專業客服團隊，提供完善售後服務',
              gradient: 'from-pink-400 to-rose-500',
              delay: '300ms'
            }
          ]),
          button_text: null,
          button_link: null,
          display_order: 4,
          is_active: 1
        }
      ];
      
      for (const setting of defaultSettings) {
        await dbAsync.run(
          `INSERT INTO homepage_settings (section, image_url, title, subtitle, content, button_text, button_link, display_order, is_active) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [setting.section, setting.image_url, setting.title, setting.subtitle, setting.content, 
           setting.button_text, setting.button_link, setting.display_order, setting.is_active]
        );
      }
      console.log('✅ 默認首頁設置已創建。');
    }

    // 檢查並創建默認頁腳設置
    const footerRow = await dbAsync.get('SELECT COUNT(*) as count FROM footer_settings');
    if (footerRow.count === 0) {
      console.log('🦶 檢測到無頁腳設置，正在創建默認設置...');
      const defaultFooterSettings = [
        {
          section: 'company_info',
          title: '海量國際',
          content: '海量國際致力於提供最優質的電子煙產品與服務，讓每一位顧客都能享受到最純淨、最舒適的使用體驗。',
          image_url: '/images/whale-company-logo.png',
          display_order: 1,
          is_active: 1
        },
        {
          section: 'feature_1',
          title: '正品保證',
          icon_name: 'Shield',
          display_order: 2,
          is_active: 1
        },
        {
          section: 'feature_2', 
          title: '快速配送',
          icon_name: 'Clock',
          display_order: 3,
          is_active: 1
        },
        {
          section: 'social_facebook',
          title: 'Facebook',
          link_url: '#',
          icon_name: 'Facebook',
          display_order: 4,
          is_active: 1
        },
        {
          section: 'social_twitter',
          title: 'Twitter', 
          link_url: '#',
          icon_name: 'Twitter',
          display_order: 5,
          is_active: 1
        },
        {
          section: 'social_instagram',
          title: 'Instagram',
          link_url: '#', 
          icon_name: 'Instagram',
          display_order: 6,
          is_active: 1
        },
        {
          section: 'contact_phone',
          title: '聯絡電話',
          content: '02-1234-5678',
          icon_name: 'Phone',
          display_order: 7,
          is_active: 1
        },
        {
          section: 'contact_email',
          title: '電子郵箱',
          content: 'service@oceanic-intl.com.tw',
          icon_name: 'Mail',
          display_order: 8,
          is_active: 1
        },
        {
          section: 'contact_address',
          title: '聯絡地址',
          content: '台北市信義區松高路',
          icon_name: 'MapPin',
          display_order: 9,
          is_active: 1
        },
        {
          section: 'business_hours',
          title: '營業時間',
          content: JSON.stringify({
            weekdays: '週一至週五：09:00-18:00',
            weekends: '週六週日：10:00-17:00'
          }),
          display_order: 10,
          is_active: 1
        },
        {
          section: 'copyright',
          title: '版權資訊',
          content: '© 2024 海量國際. 版權所有。',
          display_order: 11,
          is_active: 1
        },
        {
          section: 'age_notice',
          title: '年齡提醒',
          content: '本網站僅供18歲以上成年人使用。電子煙含有尼古丁，使用前請詳閱產品說明。',
          display_order: 12,
          is_active: 1
        }
      ];
      
      for (const setting of defaultFooterSettings) {
        await dbAsync.run(
          `INSERT INTO footer_settings (section, title, content, link_url, image_url, icon_name, display_order, is_active) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [setting.section, setting.title, setting.content, setting.link_url, 
           setting.image_url, setting.icon_name, setting.display_order, setting.is_active]
        );
      }
      console.log('✅ 默認頁腳設置已創建。');
    }
    
    // 檢查並創建默認頁面內容
    const pageContentRow = await dbAsync.get('SELECT COUNT(*) as count FROM page_contents');
    if (pageContentRow.count === 0) {
      console.log('📄 檢測到無頁面內容，正在創建默認內容...');
      const defaultPageContents = [
        {
          page_key: 'shipping',
          page_name: '配送說明',
          title: '配送說明',
          subtitle: '簡單三步驟，輕鬆完成購物流程',
          content: JSON.stringify({
            steps: [
              {
                step: 1,
                title: '選擇商品',
                description: '瀏覽我們精選的電子煙產品，加入購物車',
                icon: 'ShoppingCart'
              },
              {
                step: 2,
                title: '結帳付款',
                description: '選擇便利商店取貨，填寫資料並完成付款',
                icon: 'CreditCard'
              },
              {
                step: 3,
                title: '取貨享受',
                description: '3-5個工作天後，前往指定便利商店取貨',
                icon: 'Truck'
              }
            ],
            notes: [
              '支援7-11、全家便利商店取貨',
              '單筆訂單滿1000元免運費',
              '取貨期限為7天，逾期將退回'
            ]
          }),
          is_active: 1
        },
        {
          page_key: 'returns',
          page_name: '退換貨政策',
          title: '退換貨政策',
          subtitle: '保障您的購物權益，安心購買',
          content: JSON.stringify({
            returnPolicy: {
              title: '退貨政策',
              description: '為保障消費者權益，我們提供以下退貨服務：',
              items: [
                '商品收到後7天內，如有品質問題可申請退貨',
                '退貨商品需保持原包裝完整，未使用且無人為損壞',
                '電子煙主機需附上所有配件及包裝盒',
                '煙彈類產品一經拆封恕不接受退貨（品質問題除外）',
                '退貨運費由消費者負擔，品質問題則由本公司承擔'
              ]
            },
            exchangePolicy: {
              title: '換貨政策',
              description: '提供便利的換貨服務：',
              items: [
                '商品收到後7天內可申請換貨',
                '僅限相同產品不同規格的換貨',
                '換貨商品需保持原包裝完整',
                '換貨運費由消費者負擔'
              ]
            },
            warrantyPolicy: {
              title: '保固政策',
              description: '電子煙主機享有保固服務：',
              items: [
                '電子煙主機提供3個月保固',
                '保固期內非人為損壞可免費維修',
                '保固不包含配件及煙彈',
                '保固期間需出示購買憑證'
              ]
            },
            contactInfo: {
              title: '聯絡資訊',
              description: '如有任何問題，歡迎聯絡我們：',
              email: 'service@oceanic-intl.com.tw',
              phone: '02-1234-5678',
              hours: '週一至週五 9:00-18:00'
            }
          }),
          is_active: 1
        }
      ];
      
      for (const pageContent of defaultPageContents) {
        await dbAsync.run(
          `INSERT INTO page_contents (page_key, page_name, title, subtitle, content, is_active) 
           VALUES (?, ?, ?, ?, ?, ?)`,
          [pageContent.page_key, pageContent.page_name, pageContent.title, 
           pageContent.subtitle, pageContent.content, pageContent.is_active]
        );
      }
      console.log('✅ 默認頁面內容已創建。');
    }
  } catch (err) {
    console.error('❌ 數據庫初始化檢查失敗:', err);
    throw err;
  }
};

module.exports = initializeDatabase;

if (require.main === module) {
  console.log('作為獨立腳本運行: init-database.js');
  db.serialize(async () => {
    await initializeDatabase();
    
    // 直接運行時，可以關閉連接
    db.close((err) => {
      if (err) {
        return console.error('關閉數據庫連接失敗:', err.message);
      }
      console.log('✅ 數據庫連接已關閉');
    });
  });
}
