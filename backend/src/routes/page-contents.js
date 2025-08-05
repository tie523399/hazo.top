const express = require('express');
const { dbAsync } = require('../database/db');
const jwt = require('jsonwebtoken');
const router = express.Router();

// JWT 認證中間件
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: '未提供認證令牌' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
    if (err) return res.status(403).json({ error: '無效的認證令牌' });

    req.user = user;
    next();
  });
};

// 獲取所有頁面內容（公開端點）
router.get('/', async (req, res) => {
  try {
    const pageContents = await dbAsync.all(`
      SELECT * FROM page_contents 
      WHERE is_active = 1 
      ORDER BY page_name
    `);
    
    // 解析 JSON 內容
    const parsedContents = pageContents.map(content => ({
      ...content,
      content: content.content ? JSON.parse(content.content) : null,
      metadata: content.metadata ? JSON.parse(content.metadata) : null
    }));
    
    res.json(parsedContents);
  } catch (err) {
    console.error('獲取頁面內容失敗:', err);
    res.status(500).json({ error: '獲取頁面內容失敗' });
  }
});

// 根據 page_key 獲取特定頁面內容（公開端點）
router.get('/:pageKey', async (req, res) => {
  try {
    const { pageKey } = req.params;
    
    const pageContent = await dbAsync.get(`
      SELECT * FROM page_contents 
      WHERE page_key = ? AND is_active = 1
    `, [pageKey]);
    
    if (!pageContent) {
      return res.status(404).json({ error: '頁面內容不存在' });
    }
    
    // 解析 JSON 內容
    const parsedContent = {
      ...pageContent,
      content: pageContent.content ? JSON.parse(pageContent.content) : null,
      metadata: pageContent.metadata ? JSON.parse(pageContent.metadata) : null
    };
    
    res.json(parsedContent);
  } catch (err) {
    console.error('獲取頁面內容失敗:', err);
    res.status(500).json({ error: '獲取頁面內容失敗' });
  }
});

// === 管理員 API ===

// 獲取所有頁面內容（管理員）
router.get('/admin/all', authenticateToken, async (req, res) => {
  try {
    const pageContents = await dbAsync.all(`
      SELECT * FROM page_contents 
      ORDER BY page_name
    `);
    
    // 解析 JSON 內容
    const parsedContents = pageContents.map(content => ({
      ...content,
      content: content.content ? JSON.parse(content.content) : null,
      metadata: content.metadata ? JSON.parse(content.metadata) : null
    }));
    
    res.json(parsedContents);
  } catch (err) {
    console.error('獲取頁面內容失敗:', err);
    res.status(500).json({ error: '獲取頁面內容失敗' });
  }
});

// 創建新頁面內容
router.post('/admin', authenticateToken, async (req, res) => {
  try {
    const { page_key, page_name, title, subtitle, content, metadata, is_active } = req.body;
    
    if (!page_key || !page_name) {
      return res.status(400).json({ error: '頁面標識符和名稱為必填' });
    }
    
    // 檢查頁面標識符是否已存在
    const existing = await dbAsync.get('SELECT id FROM page_contents WHERE page_key = ?', [page_key]);
    if (existing) {
      return res.status(400).json({ error: '頁面標識符已存在' });
    }
    
    const result = await dbAsync.run(
      `INSERT INTO page_contents (page_key, page_name, title, subtitle, content, metadata, is_active) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        page_key, 
        page_name, 
        title, 
        subtitle, 
        content ? JSON.stringify(content) : null,
        metadata ? JSON.stringify(metadata) : null,
        is_active ? 1 : 0
      ]
    );
    
    const newPageContent = await dbAsync.get('SELECT * FROM page_contents WHERE id = ?', result.lastID);
    res.json({ success: true, pageContent: newPageContent });
  } catch (err) {
    console.error('創建頁面內容錯誤:', err);
    res.status(500).json({ error: '創建頁面內容失敗' });
  }
});

// 更新頁面內容
router.put('/admin/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { page_key, page_name, title, subtitle, content, metadata, is_active } = req.body;
    
    if (!page_key || !page_name) {
      return res.status(400).json({ error: '頁面標識符和名稱為必填' });
    }
    
    // 檢查是否有其他頁面使用了相同的 page_key
    const existing = await dbAsync.get('SELECT id FROM page_contents WHERE page_key = ? AND id != ?', [page_key, id]);
    if (existing) {
      return res.status(400).json({ error: '頁面標識符已被其他頁面使用' });
    }
    
    const result = await dbAsync.run(
      `UPDATE page_contents 
       SET page_key = ?, page_name = ?, title = ?, subtitle = ?, content = ?, metadata = ?, 
           is_active = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [
        page_key, 
        page_name, 
        title, 
        subtitle, 
        content ? JSON.stringify(content) : null,
        metadata ? JSON.stringify(metadata) : null,
        is_active ? 1 : 0,
        id
      ]
    );
    
    if (result.changes === 0) {
      return res.status(404).json({ error: '頁面內容不存在' });
    }
    
    res.json({ message: '頁面內容更新成功' });
  } catch (err) {
    console.error('更新頁面內容失敗:', err);
    res.status(500).json({ error: '更新頁面內容失敗' });
  }
});

// 刪除頁面內容
router.delete('/admin/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await dbAsync.run('DELETE FROM page_contents WHERE id = ?', [id]);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: '頁面內容不存在' });
    }
    
    res.json({ message: '頁面內容刪除成功' });
  } catch (error) {
    console.error('刪除頁面內容失敗:', error);
    res.status(500).json({ error: '刪除頁面內容失敗' });
  }
});

module.exports = router;