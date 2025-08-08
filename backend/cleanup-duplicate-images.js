const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// 圖片上傳目錄
const NODE_ENV = process.env.NODE_ENV || 'development';
const uploadDir = NODE_ENV === 'production' 
  ? path.join(__dirname, '../dist/images')
  : path.join(__dirname, '../public/images');

console.log('🧹 開始清理重複圖片...');
console.log(`📁 檢查目錄: ${uploadDir}`);

if (!fs.existsSync(uploadDir)) {
  console.log('❌ 圖片目錄不存在');
  process.exit(1);
}

// 計算文件MD5哈希值
function getFileHash(filePath) {
  const fileBuffer = fs.readFileSync(filePath);
  const hashSum = crypto.createHash('md5');
  hashSum.update(fileBuffer);
  return hashSum.digest('hex');
}

// 獲取文件大小和時間信息
function getFileStats(filePath) {
  const stats = fs.statSync(filePath);
  return {
    size: stats.size,
    mtime: stats.mtime,
    created: stats.birthtime || stats.ctime
  };
}

async function cleanupDuplicateImages() {
  try {
    const files = fs.readdirSync(uploadDir);
    const imageFiles = files.filter(file => {
      const ext = path.extname(file).toLowerCase();
      return ['.png', '.jpg', '.jpeg', '.gif', '.webp'].includes(ext);
    });

    console.log(`📷 找到 ${imageFiles.length} 個圖片文件`);

    if (imageFiles.length === 0) {
      console.log('✅ 沒有圖片文件需要處理');
      return;
    }

    // 按哈希值分組文件
    const hashGroups = {};
    const fileInfo = {};

    for (const file of imageFiles) {
      const filePath = path.join(uploadDir, file);
      try {
        const hash = getFileHash(filePath);
        const stats = getFileStats(filePath);
        
        fileInfo[file] = { hash, ...stats, path: filePath };
        
        if (!hashGroups[hash]) {
          hashGroups[hash] = [];
        }
        hashGroups[hash].push(file);
      } catch (error) {
        console.warn(`⚠️ 無法處理文件 ${file}:`, error.message);
      }
    }

    // 找到重複文件並處理
    let duplicatesFound = 0;
    let duplicatesRemoved = 0;

    Object.keys(hashGroups).forEach(hash => {
      const duplicates = hashGroups[hash];
      if (duplicates.length > 1) {
        duplicatesFound += duplicates.length - 1;
        console.log(`\n🔍 發現重複文件組 (${duplicates.length} 個):`);
        
        // 按創建時間排序，保留最舊的（假設是原始文件）
        duplicates.sort((a, b) => {
          return new Date(fileInfo[a].created) - new Date(fileInfo[b].created);
        });

        const keepFile = duplicates[0];
        const removeFiles = duplicates.slice(1);

        console.log(`  ✅ 保留: ${keepFile} (${new Date(fileInfo[keepFile].created).toLocaleString()})`);
        
        removeFiles.forEach(file => {
          try {
            fs.unlinkSync(fileInfo[file].path);
            duplicatesRemoved++;
            console.log(`  ❌ 刪除: ${file} (${new Date(fileInfo[file].created).toLocaleString()})`);
          } catch (error) {
            console.error(`  💥 刪除失敗 ${file}:`, error.message);
          }
        });
      }
    });

    console.log('\n📊 清理統計:');
    console.log(`  總圖片數: ${imageFiles.length}`);
    console.log(`  發現重複: ${duplicatesFound}`);
    console.log(`  成功刪除: ${duplicatesRemoved}`);
    console.log(`  剩餘圖片: ${imageFiles.length - duplicatesRemoved}`);

    if (duplicatesRemoved > 0) {
      console.log('\n✅ 重複圖片清理完成！');
    } else {
      console.log('\n✅ 沒有發現重複圖片');
    }

  } catch (error) {
    console.error('❌ 清理過程中發生錯誤:', error);
    process.exit(1);
  }
}

cleanupDuplicateImages();
