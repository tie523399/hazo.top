const express = require('express');
const router = express.Router();
const { dbAsync } = require('../database/db');
const { authenticateToken } = require('./admin');

// 公開路由 - 獲取啟用的首頁設置
router.get('/settings', async (req, res) => {
  try {
    const settings = await dbAsync.all(`
      SELECT * FROM homepage_settings 
      WHERE is_active = 1 
      ORDER BY display_order, section
    `);
    
    // 將數組轉換為物件，方便前端使用
    const settingsMap = {};
    settings.forEach(setting => {
      settingsMap[setting.section] = setting;
    });
    
    res.json(settingsMap);
  } catch (err) {
    console.error('獲取首頁設置錯誤:', err);
    res.status(500).json({ error: '獲取首頁設置失敗' });
  }
});

// 管理員路由 - 獲取所有首頁設置
router.get('/admin', authenticateToken, async (req, res) => {
  try {
    const settings = await dbAsync.all(`
      SELECT * FROM homepage_settings 
      ORDER BY display_order, section
    `);
    res.json(settings);
  } catch (err) {
    console.error('獲取所有首頁設置錯誤:', err);
    res.status(500).json({ error: '獲取首頁設置失敗' });
  }
});

// 管理員路由 - 更新特定區塊設置
router.put('/admin/:section', authenticateToken, async (req, res) => {
  const { section } = req.params;
  const { 
    image_url, 
    title, 
    subtitle, 
    content, 
    button_text, 
    button_link, 
    display_order, 
    is_active 
  } = req.body;
  
  try {
    // 檢查區塊是否存在
    const existing = await dbAsync.get(
      'SELECT * FROM homepage_settings WHERE section = ?', 
      section
    );
    
    if (!existing) {
      // 如果不存在，創建新的
      await dbAsync.run(
        `INSERT INTO homepage_settings 
         (section, image_url, title, subtitle, content, button_text, button_link, display_order, is_active) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [section, image_url, title, subtitle, content, button_text, button_link, display_order || 0, is_active ? 1 : 0]
      );
    } else {
      // 更新現有設置
      await dbAsync.run(
        `UPDATE homepage_settings 
         SET image_url = ?, title = ?, subtitle = ?, content = ?, 
             button_text = ?, button_link = ?, display_order = ?, 
             is_active = ?, updated_at = CURRENT_TIMESTAMP
         WHERE section = ?`,
        [
          image_url || existing.image_url,
          title !== undefined ? title : existing.title,
          subtitle !== undefined ? subtitle : existing.subtitle,
          content !== undefined ? content : existing.content,
          button_text !== undefined ? button_text : existing.button_text,
          button_link !== undefined ? button_link : existing.button_link,
          display_order !== undefined ? display_order : existing.display_order,
          is_active !== undefined ? (is_active ? 1 : 0) : existing.is_active,
          section
        ]
      );
    }
    
    // 返回更新後的設置
    const updated = await dbAsync.get(
      'SELECT * FROM homepage_settings WHERE section = ?', 
      section
    );
    res.json({ success: true, data: updated });
  } catch (err) {
    console.error('更新首頁設置錯誤:', err);
    res.status(500).json({ error: '更新首頁設置失敗' });
  }
});

// 管理員路由 - 重置為默認設置
router.post('/admin/reset/:section', authenticateToken, async (req, res) => {
  const { section } = req.params;
  
  const defaults = {
    hero: {
      image_url: '/images/sergey-fediv-x1w4399HA74-unsplash.jpg',
      title: 'HAZO',
      subtitle: '海洋品質 • 深度體驗',
      content: '探索來自深海的純淨品質，體驗如海洋般深邃的品牌科技。HAZO國際為您帶來最專業的產品與服務。',
      button_text: '探索產品',
      button_link: '/products',
      display_order: 1,
      is_active: 1
    },
    hero1: {
      image_url: '/images/sp2_device_main_showcase.jpg',
      title: 'SP2 系列',
      subtitle: '極致工藝，完美體驗',
      content: '採用航空級鋁合金材質，結合先進的溫控技術，為您帶來最純淨的霧化體驗。每一口都是享受。',
      button_text: null,
      button_link: null,
      display_order: 2,
      is_active: 1
    },
    hero2: {
      image_url: '/images/ilia_fabric_device_main.png',
      title: 'Ilia 系列',
      subtitle: '時尚設計，品味生活',
      content: '融合現代美學與頂尖科技，Ilia 系列不僅是產品，更是您生活品味的象徵。精工細作，只為懂得品味的您。',
      button_text: null,
      button_link: null,
      display_order: 3,
      is_active: 1
    }
  };
  
  const defaultSetting = defaults[section];
  if (!defaultSetting) {
    return res.status(404).json({ error: '無效的區塊' });
  }
  
  try {
    await dbAsync.run(
      `UPDATE homepage_settings 
       SET image_url = ?, title = ?, subtitle = ?, content = ?, 
           button_text = ?, button_link = ?, display_order = ?, 
           is_active = ?, updated_at = CURRENT_TIMESTAMP
       WHERE section = ?`,
      [
        defaultSetting.image_url,
        defaultSetting.title,
        defaultSetting.subtitle,
        defaultSetting.content,
        defaultSetting.button_text,
        defaultSetting.button_link,
        defaultSetting.display_order,
        defaultSetting.is_active,
        section
      ]
    );
    
    const updated = await dbAsync.get(
      'SELECT * FROM homepage_settings WHERE section = ?', 
      section
    );
    res.json({ success: true, data: updated });
  } catch (err) {
    console.error('重置首頁設置錯誤:', err);
    res.status(500).json({ error: '重置首頁設置失敗' });
  }
});

module.exports = router;