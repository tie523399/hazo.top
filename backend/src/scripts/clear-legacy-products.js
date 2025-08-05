const { dbAsync } = require('../database/db');

/**
 * 清除舊版本的靜態產品數據
 * 這個腳本會清除所有在種子數據修改前創建的產品
 */
async function clearLegacyProducts() {
  try {
    console.log('🧹 開始清除舊版本產品數據...');
    
    // 檢查當前產品數量
    const countResult = await dbAsync.get('SELECT COUNT(*) as count FROM products');
    console.log(`📊 當前產品數量: ${countResult.count}`);
    
    if (countResult.count === 0) {
      console.log('✅ 資料庫中沒有產品，無需清除');
      return;
    }
    
    // 顯示將被清除的產品
    const products = await dbAsync.all('SELECT id, name, brand FROM products LIMIT 10');
    console.log('📋 將被清除的產品（前10個）:');
    products.forEach(product => {
      console.log(`   - ${product.id}: ${product.name} (${product.brand})`);
    });
    
    // 開始事務
    await dbAsync.run('BEGIN TRANSACTION');
    
    try {
      // 清除訂單項目（解決外鍵約束）
      const orderItemsTableExists = await dbAsync.get(`
        SELECT COUNT(*) as count 
        FROM sqlite_master 
        WHERE type='table' AND name='order_items'
      `);
      
      if (orderItemsTableExists.count > 0) {
        await dbAsync.run('DELETE FROM order_items');
        console.log('✅ 訂單項目已清除');
      }
      
      // 清除訂單表（如果存在）
      const ordersTableExists = await dbAsync.get(`
        SELECT COUNT(*) as count 
        FROM sqlite_master 
        WHERE type='table' AND name='orders'
      `);
      
      if (ordersTableExists.count > 0) {
        await dbAsync.run('DELETE FROM orders');
        console.log('✅ 訂單已清除');
      }
      
      // 清除購物車中的產品項目
      await dbAsync.run('DELETE FROM cart_items');
      console.log('✅ 購物車項目已清除');
      
      // 清除產品變體（如果存在）
      const variantCount = await dbAsync.get(`
        SELECT COUNT(*) as count 
        FROM sqlite_master 
        WHERE type='table' AND name='product_variants'
      `);
      
      if (variantCount.count > 0) {
        await dbAsync.run('DELETE FROM product_variants');
        console.log('✅ 產品變體已清除');
      }
      
      // 清除產品圖片（如果存在）
      const imageCount = await dbAsync.get(`
        SELECT COUNT(*) as count 
        FROM sqlite_master 
        WHERE type='table' AND name='product_images'
      `);
      
      if (imageCount.count > 0) {
        await dbAsync.run('DELETE FROM product_images');
        console.log('✅ 產品圖片已清除');
      }
      
      // 清除所有產品
      await dbAsync.run('DELETE FROM products');
      console.log('✅ 所有產品已清除');
      
      // 重置自動遞增ID計數器
      await dbAsync.run('DELETE FROM sqlite_sequence WHERE name="products"');
      await dbAsync.run('DELETE FROM sqlite_sequence WHERE name="product_variants"');
      await dbAsync.run('DELETE FROM sqlite_sequence WHERE name="product_images"');
      console.log('✅ ID計數器已重置');
      
      // 提交事務
      await dbAsync.run('COMMIT');
      
      // 驗證清除結果
      const finalCount = await dbAsync.get('SELECT COUNT(*) as count FROM products');
      console.log(`\n🎉 清除完成！`);
      console.log(`📊 清除後產品數量: ${finalCount.count}`);
      
      console.log(`\n🎯 接下來請通過管理員後台添加新產品:`);
      console.log(`   - 管理員網址: /admin`);
      console.log(`   - 預設帳號: admin / admin123`);
      
    } catch (error) {
      // 發生錯誤時回滾事務
      await dbAsync.run('ROLLBACK');
      throw error;
    }
    
  } catch (error) {
    console.error('❌ 清除舊產品失敗:', error);
    throw error;
  }
}

// 如果直接執行此文件
if (require.main === module) {
  console.log('🚀 執行舊產品清除腳本...');
  clearLegacyProducts()
    .then(() => {
      console.log('✅ 腳本執行完成');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ 腳本執行失敗:', error);
      process.exit(1);
    });
}

module.exports = clearLegacyProducts;