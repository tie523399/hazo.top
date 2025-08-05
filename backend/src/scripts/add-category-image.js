const { dbAsync } = require('../database/db');

const addCategoryImageColumn = async () => {
  console.log('🔄 正在為分類表添加圖片欄位...');
  
  try {
    // 檢查是否已經有image_url欄位
    const tableInfo = await dbAsync.all("PRAGMA table_info(categories)");
    const hasImageUrl = tableInfo.some(column => column.name === 'image_url');
    
    if (hasImageUrl) {
      console.log('✅ 分類表已有image_url欄位，跳過');
      return;
    }
    
    // 添加image_url欄位
    await dbAsync.run(`
      ALTER TABLE categories 
      ADD COLUMN image_url TEXT
    `);
    
    console.log('✅ 分類表已成功添加image_url欄位');
    
  } catch (error) {
    console.error('❌ 添加分類圖片欄位失敗:', error);
    throw error;
  }
};

// 如果直接運行這個腳本
if (require.main === module) {
  addCategoryImageColumn()
    .then(() => {
      console.log('📋 分類圖片欄位添加完成');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ 操作失敗:', error);
      process.exit(1);
    });
}

module.exports = addCategoryImageColumn;