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
      ('show_product_preview', 'true')
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
    
    // 檢查並創建默認分類
    const categoryRow = await dbAsync.get('SELECT COUNT(*) as count FROM categories');
    if (categoryRow.count === 0) {
      console.log('📁 檢測到無產品分類，正在創建默認分類...');
      const defaultCategories = [
        { name: '主機', slug: 'host', description: '電子煙主機設備', display_order: 1 },
        { name: '煙彈', slug: 'cartridge', description: '替換煙彈', display_order: 2 },
        { name: '拋棄式', slug: 'disposable', description: '一次性電子煙', display_order: 3 }
      ];
      
      for (const category of defaultCategories) {
        await dbAsync.run(
          'INSERT INTO categories (name, slug, description, display_order) VALUES (?, ?, ?, ?)',
          [category.name, category.slug, category.description, category.display_order]
        );
      }
      console.log('✅ 默認分類已創建。');
    }
    
    // 檢查並創建默認首頁設置
    const homepageRow = await dbAsync.get('SELECT COUNT(*) as count FROM homepage_settings');
    if (homepageRow.count === 0) {
      console.log('🏠 檢測到無首頁設置，正在創建默認設置...');
      const defaultSettings = [
        {
          section: 'hero',
          image_url: '/images/sergey-fediv-x1w4399HA74-unsplash.jpg',
          title: 'HAZO',
          subtitle: '海洋品質 • 深度體驗',
          content: '探索來自深海的純淨品質，體驗如海洋般深邃的電子煙科技。HAZO 為您帶來最專業的電子煙產品與服務。',
          button_text: '探索產品',
          button_link: '/products',
          display_order: 1,
          is_active: 1
        },
        {
          section: 'hero1',
          image_url: '/images/sp2_device_main_showcase.jpg',
          title: 'SP2 系列',
          subtitle: '極致工藝，完美體驗',
          content: '採用航空級鋁合金材質，結合先進的溫控技術，為您帶來最純淨的霧化體驗。每一口都是享受。',
          button_text: null,
          button_link: null,
          display_order: 2,
          is_active: 1
        },
        {
          section: 'hero2',
          image_url: '/images/ilia_fabric_device_main.png',
          title: 'Ilia 系列',
          subtitle: '時尚設計，品味生活',
          content: '融合現代美學與頂尖科技，Ilia 系列不僅是電子煙，更是您生活品味的象徵。精工細作，只為懂得品味的您。',
          button_text: null,
          button_link: null,
          display_order: 3,
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
