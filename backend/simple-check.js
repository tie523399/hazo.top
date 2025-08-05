const { dbAsync } = require('./src/database/db');

const checkDatabase = async () => {
  try {
    console.log('📋 檢查當前數據庫內容...\n');
    
    // 檢查表
    const tables = await dbAsync.all("SELECT name FROM sqlite_master WHERE type='table'");
    console.log('📊 數據庫表:', tables.map(t => t.name).join(', '));
    
    // 檢查產品
    try {
      const productCount = await dbAsync.get("SELECT COUNT(*) as count FROM products");
      console.log('📦 產品數量:', productCount.count);
      
      if (productCount.count > 0) {
        const products = await dbAsync.all("SELECT id, name, brand, price FROM products LIMIT 5");
        console.log('🔍 前5個產品:');
        products.forEach(p => console.log(`  - ${p.name} (${p.brand}) - $${p.price}`));
      }
    } catch (err) {
      console.log('❌ products表:', err.message);
    }
    
    // 檢查分類
    try {
      const categoryCount = await dbAsync.get("SELECT COUNT(*) as count FROM categories");
      console.log('📂 分類數量:', categoryCount.count);
      
      if (categoryCount.count > 0) {
        const categories = await dbAsync.all("SELECT id, name, slug, image_url FROM categories");
        console.log('🔍 所有分類:');
        categories.forEach(c => console.log(`  - ${c.name} (${c.slug}) ${c.image_url ? '🖼️' : '⚪'}`));
      }
    } catch (err) {
      console.log('❌ categories表:', err.message);
    }
    
    // 檢查分類表結構
    try {
      const categorySchema = await dbAsync.all("PRAGMA table_info(categories)");
      const hasImageUrl = categorySchema.some(col => col.name === 'image_url');
      console.log('🖼️ categories表有image_url欄位:', hasImageUrl ? '✅' : '❌');
    } catch (err) {
      console.log('❌ 檢查categories表結構失敗:', err.message);
    }
    
  } catch (error) {
    console.error('❌ 檢查數據庫失敗:', error);
  }
};

checkDatabase();