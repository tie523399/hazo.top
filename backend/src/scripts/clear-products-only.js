const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// 簡化版清除產品數據腳本
async function clearProductsOnly() {
  const dbPath = process.env.DATABASE_PATH || path.join(__dirname, '../database/vape_store.db');
  console.log(`🗑️ 清除產品數據: ${dbPath}`);
  
  const db = new sqlite3.Database(dbPath);
  
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      try {
        console.log('🧹 開始清除產品數據...');
        
        // 清除購物車項目（如果存在）
        db.run('DELETE FROM cart_items WHERE 1=1', (err) => {
          if (err && !err.message.includes('no such table')) {
            console.error('❌ 清除購物車失敗:', err);
            return reject(err);
          }
          console.log('✅ 購物車已清除');
        });
        
        // 清除產品變體（如果存在）
        db.run('DELETE FROM product_variants WHERE 1=1', (err) => {
          if (err && !err.message.includes('no such table')) {
            console.error('❌ 清除產品變體失敗:', err);
            return reject(err);
          }
          console.log('✅ 產品變體已清除');
        });
        
        // 清除產品圖片（如果存在）
        db.run('DELETE FROM product_images WHERE 1=1', (err) => {
          if (err && !err.message.includes('no such table')) {
            console.error('❌ 清除產品圖片失敗:', err);
            return reject(err);
          }
          console.log('✅ 產品圖片已清除');
        });
        
        // 清除所有產品
        db.run('DELETE FROM products WHERE 1=1', (err) => {
          if (err) {
            console.error('❌ 清除產品失敗:', err);
            return reject(err);
          }
          console.log('✅ 所有產品已清除');
          
          // 重置自動遞增ID
          db.run('DELETE FROM sqlite_sequence WHERE name="products"', (err) => {
            if (err && !err.message.includes('no such table')) {
              console.error('❌ 重置產品ID失敗:', err);
            } else {
              console.log('✅ 產品ID計數器已重置');
            }
            
            // 驗證清除結果
            db.get('SELECT COUNT(*) as count FROM products', (err, row) => {
              if (err) {
                console.error('❌ 驗證失敗:', err);
                return reject(err);
              }
              
              console.log('\n🎉 產品數據清除完成！');
              console.log(`📊 統計結果:`);
              console.log(`   - 產品數量: ${row.count}`);
              console.log(`\n🎯 接下來請通過管理員後台添加商品:`);
              console.log(`   - 管理員網址: /admin`);
              console.log(`   - 預設帳號: admin / admin123`);
              
              db.close((closeErr) => {
                if (closeErr) {
                  console.error('❌ 數據庫關閉失敗:', closeErr);
                  return reject(closeErr);
                }
                console.log('✅ 數據庫連接已關閉');
                resolve();
              });
            });
          });
        });
        
      } catch (error) {
        console.error('❌ 清除過程失敗:', error);
        db.close();
        reject(error);
      }
    });
  });
}

// 如果直接執行此文件
if (require.main === module) {
  console.log('🚀 執行產品數據清除腳本...');
  clearProductsOnly()
    .then(() => {
      console.log('✅ 腳本執行完成');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ 腳本執行失敗:', error);
      process.exit(1);
    });
}

module.exports = clearProductsOnly;