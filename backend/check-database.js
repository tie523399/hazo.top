const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// 查看當前數據庫
console.log('📋 查看當前數據庫: vape_store.db');
console.log('='.repeat(50));

const currentDbPath = path.join(__dirname, 'database/vape_store.db');
const backupDbPath = path.join(__dirname, 'database/vape_store.db.bak');

const checkDatabase = (dbPath, dbName) => {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
      if (err) {
        console.error(`❌ 無法打開 ${dbName}:`, err.message);
        resolve();
        return;
      }
      
      console.log(`\n🗄️ === ${dbName} ===`);
      
      // 查看所有表
      db.all("SELECT name FROM sqlite_master WHERE type='table'", [], (err, tables) => {
        if (err) {
          console.error('查詢表失敗:', err);
          db.close();
          resolve();
          return;
        }
        
        console.log('📊 表列表:', tables.map(t => t.name).join(', '));
        
        // 檢查產品表
        db.all("SELECT COUNT(*) as count FROM products", [], (err, productCount) => {
          if (err) {
            console.log('❌ products表不存在或查詢失敗');
          } else {
            console.log('📦 產品數量:', productCount[0].count);
          }
          
          // 檢查分類表
          db.all("SELECT COUNT(*) as count FROM categories", [], (err, categoryCount) => {
            if (err) {
              console.log('❌ categories表不存在或查詢失敗');
            } else {
              console.log('📂 分類數量:', categoryCount[0].count);
            }
            
            // 檢查categories表是否有image_url欄位
            db.all("PRAGMA table_info(categories)", [], (err, categoryInfo) => {
              if (err) {
                console.log('❌ 無法獲取categories表結構');
              } else {
                const hasImageUrl = categoryInfo.some(col => col.name === 'image_url');
                console.log('🖼️ categories表有image_url欄位:', hasImageUrl ? '✅ 是' : '❌ 否');
                if (hasImageUrl) {
                  // 查看有幾個分類有圖片
                  db.all("SELECT COUNT(*) as count FROM categories WHERE image_url IS NOT NULL", [], (err, imageCount) => {
                    if (!err) {
                      console.log('🖼️ 有圖片的分類數量:', imageCount[0].count);
                    }
                    db.close();
                    resolve();
                  });
                } else {
                  db.close();
                  resolve();
                }
              }
            });
          });
        });
      });
    });
  });
};

const checkBothDatabases = async () => {
  await checkDatabase(currentDbPath, 'vape_store.db');
  
  // 檢查備份文件是否存在
  const fs = require('fs');
  if (fs.existsSync(backupDbPath)) {
    await checkDatabase(backupDbPath, 'vape_store.db.bak');
  } else {
    console.log('\n❌ 備份文件 vape_store.db.bak 不存在');
  }
  
  console.log('\n✅ 數據庫檢查完成');
};

checkBothDatabases().catch(console.error);