const { dbAsync } = require('../database/db');

/**
 * 創建基礎演示數據：1分類 + 1商品 + 1變數
 */
async function setupBasicDemo() {
  console.log('🚀 開始設置基礎演示數據...');
  
  try {
    // 1. 檢查並創建分類
    console.log('📁 檢查示例分類...');
    const existingCategory = await dbAsync.get('SELECT id FROM categories WHERE slug = ?', 'host');
    
    if (!existingCategory) {
      await dbAsync.run(
        `INSERT INTO categories (name, slug, description, display_order, is_active) 
         VALUES (?, ?, ?, ?, ?)`,
        ['海量國際主機', 'host', '海量國際品牌主機設備', 1, 1]
      );
      console.log('✅ 已創建分類: 海量國際主機');
    } else {
      console.log('ℹ️ 分類已存在: 海量國際主機');
    }

    // 2. 檢查並創建商品
    console.log('📦 檢查示例商品...');
    const existingProduct = await dbAsync.get('SELECT id FROM products WHERE name = ?', '海量國際旗艦產品');
    
    if (!existingProduct) {
      await dbAsync.run(
        `INSERT INTO products (
          name, brand, category, description, price, stock, image_url
        ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          '海量國際旗艦產品',
          '海量國際', 
          'host',
          '海量國際品牌旗艦產品，品質卓越，值得信賴。',
          1999,
          100,
          '/images/ocean-international.gif'
        ]
      );
      console.log('✅ 已創建商品: 海量國際旗艦產品');
    } else {
      console.log('ℹ️ 商品已存在: 海量國際旗艦產品');
    }

    // 3. 統計
    const categoryCount = await dbAsync.get('SELECT COUNT(*) as count FROM categories');
    const productCount = await dbAsync.get('SELECT COUNT(*) as count FROM products');
    
    console.log('\n🎯 設置完成:');
    console.log(`📁 分類: ${categoryCount.count} 個`);
    console.log(`📦 商品: ${productCount.count} 個`);
    console.log('\n💡 現在可以訪問 /admin 修改這些內容');

  } catch (error) {
    console.error('❌ 設置失敗:', error);
    throw error;
  }
}

// 直接執行
if (require.main === module) {
  setupBasicDemo()
    .then(() => {
      console.log('🎉 基礎演示數據設置完成！');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 設置失敗:', error);
      process.exit(1);
    });
}

module.exports = setupBasicDemo;