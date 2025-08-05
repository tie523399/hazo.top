const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database', 'vape_store.db');
const db = new sqlite3.Database(dbPath);

// 添加image_url欄位到categories表
db.serialize(() => {
  // 檢查欄位是否已存在
  db.all("PRAGMA table_info(categories)", (err, rows) => {
    if (err) {
      console.error('檢查表結構失敗:', err);
      return;
    }
    
    const hasImageUrl = rows.some(col => col.name === 'image_url');
    
    if (!hasImageUrl) {
      console.log('🔧 正在為categories表添加image_url欄位...');
      db.run('ALTER TABLE categories ADD COLUMN image_url TEXT DEFAULT ""', (err) => {
        if (err) {
          console.error('❌ 添加欄位失敗:', err);
        } else {
          console.log('✅ 成功為categories表添加image_url欄位！');
        }
        db.close();
      });
    } else {
      console.log('ℹ️ categories表已經有image_url欄位');
      db.close();
    }
  });
});