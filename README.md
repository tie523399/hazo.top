# 🌊 HAZO 商城 - 全端電商平台

一個現代化的線上商城系統，採用 React + Node.js 全端技術堆棧，提供完整的電商功能和管理後台。

## ✨ 功能特色

### 🛍️ 前台功能
- **商品展示**: 響應式商品卡片設計，支持圖片輪播
- **分類篩選**: 動態商品分類系統
- **購物車**: 會話管理購物車，支持變體選擇
- **商品搜索**: 實時搜索商品名稱和描述
- **商品詳情**: 完整的商品信息展示
- **訂單系統**: 完整的訂單處理流程
- **響應式設計**: 支持桌面和手機端瀏覽

### 🎛️ 管理後台
- **儀表板**: 銷售統計和數據分析
- **商品管理**: CRUD 操作，圖片管理，變體管理
- **分類管理**: 動態分類創建和管理
- **訂單管理**: 訂單狀態追蹤和處理
- **優惠券系統**: 折扣碼管理
- **用戶管理**: 客戶信息管理
- **內容管理**: 首頁、頁腳內容編輯
- **圖片管理**: 多圖片上傳，主圖設置

## 🚀 技術堆棧

### 前端
- **React 18** - 現代化 React 框架
- **TypeScript** - 類型安全的 JavaScript
- **Vite** - 快速的建構工具
- **Tailwind CSS** - 實用優先的 CSS 框架
- **React Router** - 客戶端路由
- **Zustand** - 輕量級狀態管理
- **Radix UI** - 無障礙的 UI 組件庫

### 後端
- **Node.js** - JavaScript 運行環境
- **Express.js** - Web 應用框架
- **SQLite** - 輕量級關係型資料庫
- **JWT** - JSON Web Token 認證
- **Multer** - 文件上傳處理
- **bcryptjs** - 密碼加密

### 部署
- **Railway** - 雲端部署平台
- **GitHub** - 版本控制和 CI/CD

## 📁 專案結構

```
hazosp2p-project/
├── backend/                    # 後端 Node.js 應用
│   ├── src/
│   │   ├── database/          # 資料庫配置和初始化
│   │   ├── routes/            # API 路由
│   │   │   ├── admin.js       # 管理員 API
│   │   │   ├── products.js    # 商品 API
│   │   │   ├── categories.js  # 分類 API
│   │   │   ├── cart.js        # 購物車 API
│   │   │   └── orders.js      # 訂單 API
│   │   ├── scripts/           # 資料庫腳本
│   │   └── server.js          # 主服務器
│   └── package.json
├── src/                       # 前端 React 應用
│   ├── components/            # React 組件
│   │   ├── admin/            # 管理後台組件
│   │   ├── layout/           # 佈局組件
│   │   └── ui/               # UI 組件庫
│   ├── pages/                # 頁面組件
│   ├── lib/                  # 工具函數和配置
│   │   ├── api.ts            # API 客戶端
│   │   ├── store.ts          # 狀態管理
│   │   └── utils.ts          # 工具函數
│   └── hooks/                # 自定義 Hooks
├── public/                   # 靜態資源
│   └── images/              # 圖片資源
├── package.json
└── README.md
```

## 🛠️ 安裝和運行

### 環境要求
- Node.js 18.0+
- npm 9.0+

### 1. 克隆專案
```bash
git clone https://github.com/tie523399/hazo-vape.git
cd hazo-vape
```

### 2. 安裝依賴
```bash
# 安裝前端依賴
npm install

# 安裝後端依賴
cd backend
npm install
cd ..
```

### 3. 環境配置
創建 `backend/.env` 文件：
```env
NODE_ENV=development
PORT=3001
JWT_SECRET=your-secret-key
DATABASE_PATH=./database/vape_store.db
```

### 4. 初始化資料庫
```bash
cd backend
npm run init-db
cd ..
```

### 5. 運行開發伺服器
```bash
# 同時運行前端和後端
npm run dev

# 或分別運行
npm run dev:frontend  # 前端: http://localhost:5173
npm run dev:backend   # 後端: http://localhost:3001
```

## 🌐 部署

### Railway 部署
專案已配置 Railway 自動部署：

1. 連接 GitHub 倉庫到 Railway
2. 設置環境變數
3. 自動部署: `https://hazo.top`

### 手動部署
```bash
# 建構專案
npm run build

# 啟動生產服務器
npm start
```

## 📚 API 文檔

### 認證
- `POST /api/admin/login` - 管理員登入
- `POST /api/admin/logout` - 登出

### 商品管理
- `GET /api/products` - 獲取商品列表
- `GET /api/products/:id` - 獲取商品詳情
- `POST /api/admin/products` - 創建商品
- `PUT /api/admin/products/:id` - 更新商品
- `DELETE /api/admin/products/:id` - 刪除商品

### 分類管理
- `GET /api/categories` - 獲取分類列表
- `POST /api/admin/categories` - 創建分類
- `PUT /api/admin/categories/:id` - 更新分類
- `DELETE /api/admin/categories/:id` - 刪除分類

### 圖片管理
- `POST /api/admin/upload-image` - 上傳圖片
- `GET /api/admin/products/:id/images` - 獲取商品圖片
- `POST /api/admin/products/:id/images` - 添加商品圖片
- `PUT /api/admin/products/:id/images/:imageId` - 更新圖片
- `DELETE /api/admin/products/:id/images/:imageId` - 刪除圖片

## 🔧 最近修復

### 圖片顯示問題修復 (2024-01-19)
- ✅ 修復新增商品圖片顯示錯誤的問題
- ✅ 同步更新商品表 `image_url` 字段
- ✅ 優化圖片緩存策略
- ✅ 添加唯一文件名生成，防止命名衝突
- ✅ 改善圖片上傳和管理邏輯

### 分類管理修復 (2024-01-19)
- ✅ 修復新增商品分類失敗問題
- ✅ 移除類型檢查繞過 (`as any`)
- ✅ 添加前端表單驗證
- ✅ 改善錯誤處理和用戶反饋

### 部署修復 (2024-01-19)
- ✅ 修復 PostCSS 配置兼容性問題
- ✅ 修復 Windows 建構問題
- ✅ 優化 Railway 部署配置

## 👨‍💻 開發指南

### 代碼規範
- 使用 TypeScript 進行類型檢查
- 遵循 ESLint 配置規範
- 使用 Prettier 格式化代碼
- 組件大小控制在 1000 行以內

### 新增功能
1. 創建對應的 API 路由
2. 實現資料庫操作
3. 創建前端組件
4. 添加必要的測試
5. 更新 API 文檔

### 資料庫遷移
```bash
cd backend
npm run clear-db    # 清除現有資料
npm run init-db     # 重新初始化
npm run seed-data   # 添加測試資料
```

## 🔒 安全性

- JWT Token 認證
- 密碼 bcrypt 加密
- SQL 參數化查詢防止注入
- CORS 跨域保護
- 文件上傳安全檢查

## 📝 默認管理員帳戶

```
用戶名: admin
密碼: admin123
```

⚠️ **生產環境請立即修改默認密碼！**

## 🐛 問題回報

如有問題請在 [GitHub Issues](https://github.com/tie523399/hazo-vape/issues) 回報。

## 📄 許可證

MIT License - 詳見 [LICENSE](LICENSE) 文件。

## 🙏 致謝

感謝所有為這個專案做出貢獻的開發者！

---

**🌊 HAZO 商城** - 打造最佳的電商體驗