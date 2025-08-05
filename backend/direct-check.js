const sqlite3 = require('sqlite3').verbose();
const path = require('path');

console.log('🔍 開始檢查數據庫...');

// 當前數據庫
const currentDb = path.join(__dirname, 'database', 'vape_store.db');
console.log('📍 當前數據庫路徑:', currentDb);

const db = new sqlite3.Database(currentDb, sqlite3.OPEN_READONLY, (err) => {
  if (err) {
    console.error('❌ 打開數據庫失敗:', err.message);
    return;
  }
  
  console.log('✅ 數據庫打開成功');
  
  // 查看表
  db.all("SELECT name FROM sqlite_master WHERE type='table'", [], (err, tables) => {
    if (err) {
      console.error('❌ 查詢表失敗:', err.message);
      return;
    }
    
    console.log('📊 數據庫表:', tables.map(t => t.name));
    
    // 檢查產品數量
    db.get("SELECT COUNT(*) as count FROM products", [], (err, result) => {
      if (err) {
        console.log('❌ products表查詢失敗:', err.message);
      } else {
        console.log('📦 產品數量:', result.count);
      }
      
      // 檢查分類數量
      db.get("SELECT COUNT(*) as count FROM categories", [], (err, result) => {
        if (err) {
          console.log('❌ categories表查詢失敗:', err.message);
        } else {
          console.log('📂 分類數量:', result.count);
          
          // 檢查categories表結構
          db.all("PRAGMA table_info(categories)", [], (err, columns) => {
            if (err) {
              console.log('❌ 獲取categories表結構失敗:', err.message);
            } else {
              console.log('🏗️ categories表欄位:');
              columns.forEach(col => {
                console.log(`  - ${col.name} (${col.type})`);
              });
              
              const hasImageUrl = columns.some(col => col.name === 'image_url');
              console.log('🖼️ 有image_url欄位:', hasImageUrl ? '✅' : '❌');
            }
            
            db.close();
            console.log('✅ 數據庫檢查完成');
          });
        }
      });
    });
  });
});