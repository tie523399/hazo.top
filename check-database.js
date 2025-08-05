const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'backend/database/vape_store.db');
console.log('🔍 檢查數據庫:', dbPath);

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ 無法打開數據庫:', err.message);
    return;
  }
  console.log('✅ 數據庫連接成功');
});

db.serialize(() => {
  // 檢查所有表
  console.log('\n📋 檢查數據庫表結構:');
  db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, tables) => {
    if (err) {
      console.error('❌ 獲取表列表失敗:', err.message);
      return;
    }
    
    console.log('📊 找到的表:');
    tables.forEach(table => {
      console.log(`  - ${table.name}`);
    });
    
    // 檢查products表
    if (tables.find(t => t.name === 'products')) {
      console.log('\n🛍️ 檢查產品數據:');
      
      // 產品總數
      db.get('SELECT COUNT(*) as count FROM products', (err, row) => {
        if (err) {
          console.error('❌ 獲取產品計數失敗:', err.message);
        } else {
          console.log(`📦 產品總數: ${row.count}`);
          
          if (row.count > 0) {
            // 顯示前10個產品
            db.all('SELECT id, name, brand, category, image_url FROM products LIMIT 10', (err, products) => {
              if (err) {
                console.error('❌ 獲取產品列表失敗:', err.message);
              } else {
                console.log('\n📋 產品列表 (前10個):');
                products.forEach(product => {
                  console.log(`  ${product.id}: ${product.name} (${product.brand}) - ${product.category}`);
                  if (product.image_url) {
                    console.log(`      圖片: ${product.image_url}`);
                  }
                });
              }
              
              // 檢查品牌分布
              db.all('SELECT brand, COUNT(*) as count FROM products GROUP BY brand', (err, brands) => {
                if (err) {
                  console.error('❌ 獲取品牌分布失敗:', err.message);
                } else {
                  console.log('\n🏷️ 品牌分布:');
                  brands.forEach(brand => {
                    console.log(`  ${brand.brand}: ${brand.count} 個產品`);
                  });
                }
                
                db.close(() => {
                  console.log('\n✅ 數據庫檢查完成');
                });
              });
            });
          } else {
            console.log('📦 數據庫中沒有產品數據');
            db.close(() => {
              console.log('\n✅ 數據庫檢查完成');
            });
          }
        }
      });
    } else {
      console.log('❌ 未找到 products 表');
      db.close(() => {
        console.log('\n✅ 數據庫檢查完成');
      });
    }
  });
});