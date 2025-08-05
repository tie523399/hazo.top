// =================================================================================================
// 警告：此腳本會清空並重置整個資料庫！
// 執行前請務必確認您了解其後果。
// 如果您確實需要重置資料庫，請手動移除下方清理數據區塊的註解。
// =================================================================================================

const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');
const { db, dbAsync } = require('../database/db');

// 商品相關的靜態資料已移除，改為動態管理
// 如需要口味和顏色選項，請通過後台管理系統的產品變體功能添加

// ============================================================================
// 注意：靜態商品數據已移除，改為使用動態後台管理
// 如需添加商品，請使用後台管理系統
// ============================================================================

const products = [];

const seed = async () => {
  try {
    console.log('⏳ 開始填充種子數據...');
    await dbAsync.run('BEGIN TRANSACTION');

    // 商品數據已完全改為動態管理 - 移除靜態商品邏輯
    console.log('ℹ️  商品和分類已改為完全動態管理');
    console.log('💡 請使用後台管理系統添加商品和分類');

    // ... (其他數據填充邏輯保持不變)

    await dbAsync.run('COMMIT');
    console.log('🎉 所有種子數據填充成功！');
  } catch (err) {
    await dbAsync.run('ROLLBACK');
    console.error('❌ 填充種子數據失敗:', err);
    throw err;
  }
};

// 如果直接運行此文件，則執行填充
if (require.main === module) {
  console.log('作為獨立腳本運行: seed-data.js');
  db.serialize(async () => {
    try {
      await seed();
    } catch (err) {
      console.error("Seed failed:", err);
    } finally {
      db.close((err) => {
        if (err) {
          return console.error('關閉數據庫連接失敗:', err.message);
        }
        console.log('✅ 數據庫連接已關閉');
      });
    }
  });
}
