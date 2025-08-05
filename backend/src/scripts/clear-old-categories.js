const { dbAsync } = require('../database/db');

const clearOldCategories = async () => {
  console.log('🧹 開始清除舊的預設分類數據...');
  
  try {
    await dbAsync.run('BEGIN TRANSACTION');

    // 檢查現有分類
    const existingCategories = await dbAsync.all('SELECT id, name, slug FROM categories');
    console.log('📋 當前分類:');
    existingCategories.forEach(cat => {
      console.log(`  - ${cat.name} (${cat.slug})`);
    });

    // 檢查是否有產品使用這些分類
    const productsWithCategories = await dbAsync.all(`
      SELECT p.*, c.name as category_name 
      FROM products p 
      LEFT JOIN categories c ON p.category = c.slug 
      WHERE p.category IS NOT NULL
    `);

    if (productsWithCategories.length > 0) {
      console.log('⚠️ 發現有產品使用現有分類:');
      productsWithCategories.forEach(product => {
        console.log(`  - ${product.name} (分類: ${product.category})`);
      });
      
      // 詢問是否繼續
      console.log('\n❓ 是否要繼續清除分類？這會影響現有產品的分類顯示。');
      console.log('💡 建議：先在管理後台創建新分類，然後手動重新分配產品分類');
      
      // 在實際使用中，這裡可以加入確認邏輯
      // 現在我們只顯示警告，不自動刪除
      console.log('🛑 為安全起見，跳過分類清除');
      console.log('🔧 請手動在管理後台管理分類');
      
      await dbAsync.run('ROLLBACK');
      return;
    }

    // 如果沒有產品使用分類，可以安全清除
    const deleteResult = await dbAsync.run('DELETE FROM categories');
    console.log(`✅ 已清除 ${deleteResult.changes} 個分類`);

    // 重置分類ID計數器
    await dbAsync.run("DELETE FROM sqlite_sequence WHERE name='categories'");
    console.log('🔄 已重置分類ID計數器');

    await dbAsync.run('COMMIT');
    console.log('✅ 舊分類數據清除完成');

  } catch (error) {
    await dbAsync.run('ROLLBACK');
    console.error('❌ 清除分類失敗:', error);
    throw error;
  }
};

// 如果直接運行這個腳本
if (require.main === module) {
  clearOldCategories()
    .then(() => {
      console.log('\n📋 清除操作完成');
      console.log('💡 現在可以通過管理後台 /admin 創建新的分類');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ 操作失敗:', error);
      process.exit(1);
    });
}

module.exports = clearOldCategories;