const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

/**
 * 數據備份和恢復系統
 * 確保數據不會因為服務器重啟而遺失
 */

// 獲取正確的數據庫路徑
function getDatabasePath() {
  if (process.env.RAILWAY_DEPLOYMENT_ID) {
    return process.env.DATABASE_PATH || '/app/data/vape_store.db';
  } else {
    return path.join(__dirname, '../../database/vape_store.db');
  }
}

// 獲取備份目錄
function getBackupDir() {
  if (process.env.RAILWAY_DEPLOYMENT_ID) {
    return '/app/data/backups';
  } else {
    return path.join(__dirname, '../../backups');
  }
}

// 創建數據庫備份
async function createBackup() {
  const dbPath = getDatabasePath();
  const backupDir = getBackupDir();
  
  // 確保備份目錄存在
  if (!fs.existsSync(backupDir)) {
    try {
      fs.mkdirSync(backupDir, { recursive: true });
      console.log(`📁 創建備份目錄: ${backupDir}`);
    } catch (error) {
      console.error(`❌ 創建備份目錄失敗: ${error.message}`);
      return false;
    }
  }
  
  if (!fs.existsSync(dbPath)) {
    console.log('⚠️ 數據庫文件不存在，無法備份');
    return false;
  }
  
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFileName = `vape_store_backup_${timestamp}.db`;
    const backupPath = path.join(backupDir, backupFileName);
    
    // 複製數據庫文件
    fs.copyFileSync(dbPath, backupPath);
    
    console.log(`✅ 數據庫備份成功: ${backupPath}`);
    console.log(`📊 備份文件大小: ${(fs.statSync(backupPath).size / 1024 / 1024).toFixed(2)} MB`);
    
    // 清理舊備份（保留最近10個）
    await cleanOldBackups(backupDir);
    
    return backupPath;
  } catch (error) {
    console.error(`❌ 數據庫備份失敗: ${error.message}`);
    return false;
  }
}

// 清理舊備份文件
async function cleanOldBackups(backupDir, keepCount = 10) {
  try {
    const files = fs.readdirSync(backupDir)
      .filter(file => file.startsWith('vape_store_backup_') && file.endsWith('.db'))
      .map(file => ({
        name: file,
        path: path.join(backupDir, file),
        time: fs.statSync(path.join(backupDir, file)).mtime
      }))
      .sort((a, b) => b.time - a.time); // 按時間倒序排列
    
    if (files.length > keepCount) {
      const filesToDelete = files.slice(keepCount);
      for (const file of filesToDelete) {
        fs.unlinkSync(file.path);
        console.log(`🗑️ 刪除舊備份: ${file.name}`);
      }
    }
    
    console.log(`📊 備份管理完成，保留 ${Math.min(files.length, keepCount)} 個備份文件`);
  } catch (error) {
    console.error(`❌ 清理舊備份失敗: ${error.message}`);
  }
}

// 恢復數據庫從備份
async function restoreFromBackup(backupFileName) {
  const dbPath = getDatabasePath();
  const backupDir = getBackupDir();
  const backupPath = path.join(backupDir, backupFileName);
  
  if (!fs.existsSync(backupPath)) {
    console.error(`❌ 備份文件不存在: ${backupPath}`);
    return false;
  }
  
  try {
    // 備份當前數據庫
    if (fs.existsSync(dbPath)) {
      const currentBackupName = `current_backup_${Date.now()}.db`;
      const currentBackupPath = path.join(backupDir, currentBackupName);
      fs.copyFileSync(dbPath, currentBackupPath);
      console.log(`📋 已備份當前數據庫: ${currentBackupPath}`);
    }
    
    // 恢復備份
    fs.copyFileSync(backupPath, dbPath);
    console.log(`✅ 數據庫恢復成功: ${dbPath}`);
    
    return true;
  } catch (error) {
    console.error(`❌ 數據庫恢復失敗: ${error.message}`);
    return false;
  }
}

// 列出可用的備份文件
function listBackups() {
  const backupDir = getBackupDir();
  
  if (!fs.existsSync(backupDir)) {
    console.log('📁 備份目錄不存在');
    return [];
  }
  
  try {
    const backups = fs.readdirSync(backupDir)
      .filter(file => file.startsWith('vape_store_backup_') && file.endsWith('.db'))
      .map(file => {
        const filePath = path.join(backupDir, file);
        const stats = fs.statSync(filePath);
        return {
          fileName: file,
          path: filePath,
          size: `${(stats.size / 1024 / 1024).toFixed(2)} MB`,
          created: stats.mtime.toISOString(),
          age: `${Math.floor((Date.now() - stats.mtime.getTime()) / (1000 * 60 * 60 * 24))} 天前`
        };
      })
      .sort((a, b) => new Date(b.created) - new Date(a.created));
    
    console.log(`📋 找到 ${backups.length} 個備份文件:`);
    backups.forEach((backup, index) => {
      console.log(`${index + 1}. ${backup.fileName} (${backup.size}, ${backup.age})`);
    });
    
    return backups;
  } catch (error) {
    console.error(`❌ 列出備份失敗: ${error.message}`);
    return [];
  }
}

// 檢查數據庫完整性
async function checkDatabaseIntegrity() {
  const dbPath = getDatabasePath();
  
  if (!fs.existsSync(dbPath)) {
    console.error('❌ 數據庫文件不存在');
    return false;
  }
  
  return new Promise((resolve) => {
    const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY);
    
    db.run('PRAGMA integrity_check', (err) => {
      if (err) {
        console.error(`❌ 數據庫完整性檢查失敗: ${err.message}`);
        resolve(false);
      } else {
        console.log('✅ 數據庫完整性檢查通過');
        resolve(true);
      }
      db.close();
    });
  });
}

// 數據庫統計信息
async function getDatabaseStats() {
  const dbPath = getDatabasePath();
  
  if (!fs.existsSync(dbPath)) {
    console.error('❌ 數據庫文件不存在');
    return null;
  }
  
  return new Promise((resolve) => {
    const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY);
    const stats = {};
    
    // 查詢各表的記錄數
    const tables = ['products', 'categories', 'coupons', 'announcements', 'admins', 'settings', 'homepage_settings', 'page_contents'];
    let completed = 0;
    
    tables.forEach(table => {
      db.get(`SELECT COUNT(*) as count FROM ${table}`, (err, row) => {
        if (!err) {
          stats[table] = row.count;
        } else {
          stats[table] = 'Error';
        }
        
        completed++;
        if (completed === tables.length) {
          // 獲取數據庫文件大小
          const fileStats = fs.statSync(dbPath);
          stats.fileSize = `${(fileStats.size / 1024 / 1024).toFixed(2)} MB`;
          stats.lastModified = fileStats.mtime.toISOString();
          
          console.log('📊 數據庫統計信息:');
          console.log(`   文件大小: ${stats.fileSize}`);
          console.log(`   最後修改: ${stats.lastModified}`);
          console.log('   記錄數量:');
          Object.entries(stats).forEach(([key, value]) => {
            if (key !== 'fileSize' && key !== 'lastModified') {
              console.log(`     ${key}: ${value}`);
            }
          });
          
          db.close();
          resolve(stats);
        }
      });
    });
  });
}

// 自動備份定時器
function startAutoBackup(intervalHours = 6) {
  console.log(`🕒 啟動自動備份，間隔: ${intervalHours} 小時`);
  
  // 立即創建一次備份
  createBackup();
  
  // 設置定時備份
  setInterval(async () => {
    console.log('🔄 執行自動備份...');
    await createBackup();
  }, intervalHours * 60 * 60 * 1000);
}

module.exports = {
  createBackup,
  restoreFromBackup,
  listBackups,
  checkDatabaseIntegrity,
  getDatabaseStats,
  startAutoBackup,
  cleanOldBackups
};

// 如果直接運行此腳本
if (require.main === module) {
  const command = process.argv[2];
  
  switch (command) {
    case 'backup':
      createBackup();
      break;
    case 'list':
      listBackups();
      break;
    case 'restore':
      const backupFile = process.argv[3];
      if (backupFile) {
        restoreFromBackup(backupFile);
      } else {
        console.log('❌ 請指定要恢復的備份文件名');
        console.log('用法: node backup-system.js restore <backup_file_name>');
      }
      break;
    case 'check':
      checkDatabaseIntegrity();
      break;
    case 'stats':
      getDatabaseStats();
      break;
    case 'auto':
      const hours = parseInt(process.argv[3]) || 6;
      startAutoBackup(hours);
      break;
    default:
      console.log('📋 可用命令:');
      console.log('  backup  - 創建數據庫備份');
      console.log('  list    - 列出所有備份');
      console.log('  restore <file> - 從備份恢復');
      console.log('  check   - 檢查數據庫完整性');
      console.log('  stats   - 顯示數據庫統計');
      console.log('  auto [hours] - 啟動自動備份');
  }
}