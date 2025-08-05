const express = require('express');
const router = express.Router();
const { dbAsync } = require('../database/db');

// 簡單的認證中間件
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: '缺少訪問令牌' });
  }
  
  const jwt = require('jsonwebtoken');
  const JWT_SECRET = process.env.JWT_SECRET || 'vape-store-secret-key';
  
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: '無效的訪問令牌' });
    }
    req.user = user;
    next();
  });
};

// 獲取所有頁腳設置（公開端點）
router.get('/', async (req, res) => {
  try {
    const settings = await dbAsync.all(`
      SELECT * FROM footer_settings 
      WHERE is_active = 1 
      ORDER BY display_order, section
    `);
    res.json({ success: true, data: settings });
  } catch (err) {
    console.error('獲取頁腳設置錯誤:', err);
    res.status(500).json({ error: '獲取頁腳設置失敗' });
  }
});

// 獲取所有頁腳設置（管理員專用，包含停用的）
router.get('/all', authenticateToken, async (req, res) => {
  try {
    const settings = await dbAsync.all(`
      SELECT * FROM footer_settings 
      ORDER BY display_order, section
    `);
    res.json({ success: true, data: settings });
  } catch (err) {
    console.error('獲取所有頁腳設置錯誤:', err);
    res.status(500).json({ error: '獲取頁腳設置失敗' });
  }
});

// 獲取特定區段設置
router.get('/:section', async (req, res) => {
  try {
    const { section } = req.params;
    const setting = await dbAsync.get(
      'SELECT * FROM footer_settings WHERE section = ?',
      [section]
    );
    
    if (!setting) {
      return res.status(404).json({ error: '設置不存在' });
    }
    
    res.json({ success: true, data: setting });
  } catch (err) {
    console.error('獲取頁腳設置錯誤:', err);
    res.status(500).json({ error: '獲取頁腳設置失敗' });
  }
});

// 更新特定區段設置
router.put('/:section', authenticateToken, async (req, res) => {
  try {
    const { section } = req.params;
    const { title, content, link_url, image_url, icon_name, display_order, is_active } = req.body;
    
    // 檢查設置是否存在
    const existingSetting = await dbAsync.get(
      'SELECT * FROM footer_settings WHERE section = ?',
      [section]
    );
    
    if (existingSetting) {
      // 更新現有設置
      await dbAsync.run(
        `UPDATE footer_settings 
         SET title = ?, content = ?, link_url = ?, image_url = ?, icon_name = ?, 
             display_order = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP
         WHERE section = ?`,
        [title, content, link_url, image_url, icon_name, display_order, is_active ? 1 : 0, section]
      );
    } else {
      // 創建新設置
      await dbAsync.run(
        `INSERT INTO footer_settings 
         (section, title, content, link_url, image_url, icon_name, display_order, is_active) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [section, title, content, link_url, image_url, icon_name, display_order, is_active ? 1 : 0]
      );
    }
    
    // 返回更新後的設置
    const updatedSetting = await dbAsync.get(
      'SELECT * FROM footer_settings WHERE section = ?',
      [section]
    );
    
    res.json({ success: true, data: updatedSetting });
  } catch (err) {
    console.error('更新頁腳設置錯誤:', err);
    res.status(500).json({ error: '更新頁腳設置失敗' });
  }
});

// 創建新設置
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { section, title, content, link_url, image_url, icon_name, display_order = 0, is_active = true } = req.body;
    
    if (!section) {
      return res.status(400).json({ error: '區段名稱為必填' });
    }
    
    // 檢查是否已存在
    const existing = await dbAsync.get('SELECT id FROM footer_settings WHERE section = ?', [section]);
    if (existing) {
      return res.status(400).json({ error: '該區段已存在' });
    }
    
    const result = await dbAsync.run(
      `INSERT INTO footer_settings 
       (section, title, content, link_url, image_url, icon_name, display_order, is_active) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [section, title, content, link_url, image_url, icon_name, display_order, is_active ? 1 : 0]
    );
    
    const newSetting = await dbAsync.get('SELECT * FROM footer_settings WHERE id = ?', result.lastID);
    res.json({ success: true, data: newSetting });
  } catch (err) {
    console.error('創建頁腳設置錯誤:', err);
    res.status(500).json({ error: '創建頁腳設置失敗' });
  }
});

// 刪除設置
router.delete('/:section', authenticateToken, async (req, res) => {
  try {
    const { section } = req.params;
    
    const result = await dbAsync.run('DELETE FROM footer_settings WHERE section = ?', [section]);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: '設置不存在' });
    }
    
    res.json({ success: true, message: '設置已刪除' });
  } catch (err) {
    console.error('刪除頁腳設置錯誤:', err);
    res.status(500).json({ error: '刪除頁腳設置失敗' });
  }
});

// 批次更新設置
router.post('/batch-update', authenticateToken, async (req, res) => {
  try {
    const { settings } = req.body;
    
    if (!Array.isArray(settings)) {
      return res.status(400).json({ error: '設置必須是陣列格式' });
    }
    
    // 使用事務處理批次更新
    await dbAsync.run('BEGIN TRANSACTION');
    
    try {
      for (const setting of settings) {
        const { section, title, content, link_url, image_url, icon_name, display_order, is_active } = setting;
        
        await dbAsync.run(
          `INSERT OR REPLACE INTO footer_settings 
           (section, title, content, link_url, image_url, icon_name, display_order, is_active, updated_at) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
          [section, title, content, link_url, image_url, icon_name, display_order, is_active ? 1 : 0]
        );
      }
      
      await dbAsync.run('COMMIT');
      res.json({ success: true, message: '批次更新成功' });
    } catch (error) {
      await dbAsync.run('ROLLBACK');
      throw error;
    }
  } catch (err) {
    console.error('批次更新頁腳設置錯誤:', err);
    res.status(500).json({ error: '批次更新失敗' });
  }
});

module.exports = router;