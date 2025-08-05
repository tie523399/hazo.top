const { openDb } = require('../database/db');

async function addCategoryImageField() {
  const db = await openDb();

  try {
    console.log('🔧 正在為分類表添加圖片欄位...');
    
    // 檢查是否已經有 image_url 欄位
    const tableInfo = await new Promise((resolve, reject) => {
      db.all("PRAGMA table_info(categories)", (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    const hasImageUrl = tableInfo.some(col => col.name === 'image_url');
    
    if (!hasImageUrl) {
      await new Promise((resolve, reject) => {
        db.run('ALTER TABLE categories ADD COLUMN image_url TEXT', (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
      console.log('✅ 分類圖片欄位添加成功！');
    } else {
      console.log('ℹ️ 分類圖片欄位已存在');
    }

  } catch (error) {
    console.error('❌ 添加分類圖片欄位失敗:', error);
  } finally {
    db.close();
  }
}

// 如果直接運行此腳本
if (require.main === module) {
  addCategoryImageField();
}

module.exports = { addCategoryImageField };