# HAZO 電子煙線上商店

🚀 一個現代化的電子煙線上商店系統，採用 React + TypeScript + Node.js 技術棧開發。

## 📋 專案概述

HAZO 是一個功能完整的電子煙線上商店平台，提供：
- 產品展示與管理
- 購物車功能
- 訂單處理系統
- 管理員後台
- CVS 門市選擇器
- 響應式設計

## 🛠️ 技術棧

### 前端
- **React 18** - 用戶界面框架
- **TypeScript** - 類型安全
- **Vite** - 建置工具
- **Tailwind CSS** - 樣式框架
- **Radix UI** - 組件庫
- **Zustand** - 狀態管理

### 後端
- **Node.js** - 運行環境
- **Express.js** - Web 框架
- **SQLite** - 資料庫
- **JWT** - 身份驗證
- **Bcrypt** - 密碼加密
- **Multer** - 文件上傳

### 部署
- **Railway** - 雲端平台

## 🚀 快速開始

### 環境需求
- Node.js >= 18.0.0
- npm >= 8.0.0

### 安裝依賴
```bash
# 安裝前端依賴
npm install

# 安裝後端依賴
cd backend
npm install
```

### 開發模式
```bash
# 啟動前端開發服務器
npm run dev

# 啟動後端服務器
cd backend
npm run dev
```

### 建置部署
```bash
# 建置前端
npm run build

# 啟動生產服務器
npm start
```

## 📁 專案結構

```
hazosp2p-project/
├── src/                    # 前端源碼
│   ├── components/         # React 組件
│   ├── pages/             # 頁面組件
│   ├── lib/               # 工具函數
│   └── hooks/             # 自定義 Hooks
├── backend/               # 後端源碼
│   ├── src/
│   │   ├── routes/        # API 路由
│   │   ├── database/      # 資料庫配置
│   │   └── scripts/       # 初始化腳本
│   └── database/          # 資料庫文件
├── public/                # 靜態資源
└── dist/                  # 建置輸出
```

## 🔐 管理員登入

- **帳號**: `admin`
- **密碼**: `admin123`

⚠️ **重要提醒**: 請在首次登入後立即修改密碼！

## 🌟 主要功能

### 用戶端
- ✅ 產品瀏覽與搜尋
- ✅ 產品詳細頁面
- ✅ 購物車管理
- ✅ 結帳流程
- ✅ CVS 門市選擇
- ✅ 年齡驗證
- ✅ 響應式設計

### 管理員端
- ✅ 產品管理（CRUD）
- ✅ 產品圖片管理
- ✅ 優惠券管理
- ✅ 公告系統
- ✅ 訂單管理
- ✅ 系統設置
- ✅ 數據統計

## 🔧 配置說明

### 環境變數

創建 `backend/.env` 文件：
```env
PORT=3001
JWT_SECRET=your-jwt-secret-key
ADMIN_USERNAME=admin
ADMIN_INITIAL_PASSWORD=admin123
DATABASE_PATH=./database/vape_store.db
```

### 資料庫初始化
```bash
cd backend
npm run init-db
```

## 📦 部署說明

此專案針對 Railway 平台優化，支援一鍵部署：

1. 連接 GitHub 倉庫到 Railway
2. 自動偵測並建置專案
3. 設置環境變數
4. 部署完成

## 🤝 貢獻指南

1. Fork 專案
2. 創建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交變更 (`git commit -m 'Add amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 開啟 Pull Request

## 📄 授權條款

此專案採用 MIT 授權條款 - 詳見 [LICENSE](LICENSE) 文件

## 📞 聯絡方式

如有問題或建議，請通過以下方式聯絡：
- 建立 Issue
- 發送 Pull Request

---

**Made with ❤️ by HAZO Team**