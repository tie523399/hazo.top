# Railway 永久存儲設置指南

## 🎯 目標
為 HAZO P2P 電商平台在 Railway 設置永久數據存儲，確保客戶資料、訂單記錄和產品數據不會因為重新部署而丟失。

## 📋 設置步驟

### 1. 在 Railway 儀表板創建 Volume
1. 登錄到 [Railway Dashboard](https://railway.app/dashboard)
2. 選擇您的 HAZO P2P 項目
3. 點擊項目設置 (Project Settings)
4. 選擇 "Volumes" 標籤
5. 點擊 "Add Volume"
6. 設置以下配置：
   - **Volume Name**: `hazo-data`
   - **Mount Path**: `/app/data`
   - **Size**: 建議至少 1GB

### 2. 設置環境變量
在 Railway 儀表板的 "Variables" 設置：
```
DATABASE_PATH=/app/data/vape_store.db
NODE_ENV=production
```

### 3. 重新部署應用
設置完成後，重新部署應用以啟用永久存儲。

## 🔧 當前配置狀態

### 已配置的文件
- ✅ `backend/src/database/db.js` - 已配置 Volume 檢測和數據庫路徑管理
- ✅ `railway.json` - 已添加環境變量配置
- ✅ 數據庫初始化腳本支持 Volume 路徑

### 存儲邏輯
1. **檢測環境**: 自動檢測是否在 Railway 環境運行
2. **Volume 路徑**: 優先使用 `/app/data/vape_store.db`
3. **初始化**: 首次部署時從 repo 複製初始數據庫到 Volume
4. **持久化**: 後續部署使用 Volume 中的現有數據庫

## 📊 數據保護範圍

### 永久保存的數據
- 👥 客戶資料 (個人信息、地址)
- 🛒 訂單記錄 (訂單詳情、付款狀態)
- 📦 產品數據 (商品信息、庫存)
- 🎟️ 優惠券使用記錄
- 👤 管理員帳戶
- ⚙️ 系統設置
- 📄 頁面內容

### 需要手動備份的數據
- 🖼️ 用戶上傳的圖片 (建議定期備份 `/app/data/images` 目錄)

## 🚨 重要注意事項

1. **首次設置**: Volume 創建後，第一次部署會自動初始化數據庫
2. **數據遷移**: 如果已有數據需要遷移，請聯繫技術支援
3. **備份策略**: 建議定期導出數據庫備份
4. **監控**: 定期檢查 Volume 使用情況，避免空間不足

## 🔄 故障排除

### 如果數據庫連接失敗
1. 檢查 Volume 是否正確掛載到 `/app/data`
2. 確認環境變量 `DATABASE_PATH` 設置正確
3. 查看部署日誌中的數據庫初始化信息

### 如果需要重置數據庫
1. 設置環境變量 `FORCE_DB_OVERWRITE=true`
2. 重新部署
3. 部署完成後移除該環境變量

## 📞 技術支援
如需協助設置永久存儲，請提供：
- Railway 項目 ID
- 當前錯誤日誌
- 數據遷移需求

---
📅 最後更新: 2025年1月
🏢 HAZO P2P 電商平台