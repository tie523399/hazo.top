const express = require('express');
const router = express.Router();
const { dbAsync } = require('../database/db');

// 簡單的認證中間件（暫時用於categories路由）
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

// 獲取所有分類（公開端點）
router.get('/', async (req, res) => {
  try {
    const categories = await dbAsync.all(`
      SELECT * FROM categories 
      WHERE is_active = 1 
      ORDER BY display_order, name
    `);
    res.json(categories);
  } catch (err) {
    console.error('獲取分類錯誤:', err);
    res.status(500).json({ error: '獲取分類失敗' });
  }
});

// 獲取所有分類（包含停用的，管理員專用）
router.get('/all', authenticateToken, async (req, res) => {
  try {
    const categories = await dbAsync.all(`
      SELECT * FROM categories 
      ORDER BY display_order, name
    `);
    res.json(categories);
  } catch (err) {
    console.error('獲取所有分類錯誤:', err);
    res.status(500).json({ error: '獲取分類失敗' });
  }
});

// 創建新分類
router.post('/', authenticateToken, async (req, res) => {
  const { name, slug, description, display_order = 0, is_active = true } = req.body;
  
  if (!name || !slug) {
    return res.status(400).json({ error: '名稱和標識符為必填' });
  }
  
  try {
    // 檢查名稱是否已存在
    const existing = await dbAsync.get('SELECT id FROM categories WHERE name = ? OR slug = ?', [name, slug]);
    if (existing) {
      return res.status(400).json({ error: '分類名稱或標識符已存在' });
    }
    
    const result = await dbAsync.run(
      `INSERT INTO categories (name, slug, description, display_order, is_active) 
       VALUES (?, ?, ?, ?, ?)`,
      [name, slug, description, display_order, is_active ? 1 : 0]
    );
    
    const newCategory = await dbAsync.get('SELECT * FROM categories WHERE id = ?', result.lastID);
    res.json({ success: true, category: newCategory });
  } catch (err) {
    console.error('創建分類錯誤:', err);
    res.status(500).json({ error: '創建分類失敗' });
  }
});

// 更新分類
router.put('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { name, slug, description, display_order, is_active } = req.body;
  
  try {
    const category = await dbAsync.get('SELECT * FROM categories WHERE id = ?', id);
    if (!category) {
      return res.status(404).json({ error: '分類不存在' });
    }
    
    // 檢查名稱是否重複（排除自己）
    if (name || slug) {
      const existing = await dbAsync.get(
        'SELECT id FROM categories WHERE (name = ? OR slug = ?) AND id != ?',
        [name || category.name, slug || category.slug, id]
      );
      if (existing) {
        return res.status(400).json({ error: '分類名稱或標識符已存在' });
      }
    }
    
    await dbAsync.run(
      `UPDATE categories 
       SET name = ?, slug = ?, description = ?, display_order = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [
        name || category.name,
        slug || category.slug,
        description !== undefined ? description : category.description,
        display_order !== undefined ? display_order : category.display_order,
        is_active !== undefined ? (is_active ? 1 : 0) : category.is_active,
        id
      ]
    );
    
    const updatedCategory = await dbAsync.get('SELECT * FROM categories WHERE id = ?', id);
    res.json({ success: true, category: updatedCategory });
  } catch (err) {
    console.error('更新分類錯誤:', err);
    res.status(500).json({ error: '更新分類失敗' });
  }
});

// 刪除分類
router.delete('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  
  try {
    // 檢查是否有產品使用此分類
    const productCount = await dbAsync.get(
      'SELECT COUNT(*) as count FROM products WHERE category = (SELECT slug FROM categories WHERE id = ?)',
      id
    );
    
    if (productCount.count > 0) {
      return res.status(400).json({ 
        error: `無法刪除分類，還有 ${productCount.count} 個產品使用此分類` 
      });
    }
    
    const result = await dbAsync.run('DELETE FROM categories WHERE id = ?', id);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: '分類不存在' });
    }
    
    res.json({ success: true, message: '分類已刪除' });
  } catch (err) {
    console.error('刪除分類錯誤:', err);
    res.status(500).json({ error: '刪除分類失敗' });
  }
});

// 獲取分類統計
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const stats = await dbAsync.all(`
      SELECT 
        c.id,
        c.name,
        c.slug,
        c.is_active,
        COUNT(p.id) as product_count
      FROM categories c
      LEFT JOIN products p ON p.category = c.slug
      GROUP BY c.id
      ORDER BY c.display_order, c.name
    `);
    
    res.json(stats);
  } catch (err) {
    console.error('獲取分類統計錯誤:', err);
    res.status(500).json({ error: '獲取分類統計失敗' });
  }
});

module.exports = router;