const sqlite3 = require('sqlite3');
const { promisify } = require('util');

// 數據庫連接
const db = new sqlite3.Database('./database/vape_store.db');
const dbAsync = {
  run: promisify(db.run.bind(db)),
  get: promisify(db.get.bind(db)),
  all: promisify(db.all.bind(db))
};

// 產品圖片映射 - 為每個產品添加多張圖片
const productImageMappings = {
  2: { // SP2一代主機
    name: "SP2一代主機",
    images: [
      { url: "/images/sp2_device_main_showcase.jpg", alt: "SP2一代主機正面展示", display_order: 1, is_primary: 1 },
      { url: "/images/sp2_pods_main.webp", alt: "SP2配套煙彈", display_order: 2, is_primary: 0 },
      { url: "/images/hosts/juul-1.jpg", alt: "SP2使用情境", display_order: 3, is_primary: 0 },
      { url: "/images/age_verification_icon.png", alt: "SP2產品說明", display_order: 4, is_primary: 0 }
    ]
  },
  190: { // ilia五代主機
    name: "ilia五代主機", 
    images: [
      { url: "/images/ilia5_d.jpg", alt: "ilia五代主機展示", display_order: 1, is_primary: 1 },
      { url: "/images/ilia_gen1_main_device.jpg", alt: "ilia主機細節", display_order: 2, is_primary: 0 },
      { url: "/images/ilia-pod5.jpg", alt: "ilia五代煙彈", display_order: 3, is_primary: 0 },
      { url: "/images/ilia-pods.webp", alt: "ilia煙彈組合", display_order: 4, is_primary: 0 }
    ]
  },
  191: { // ilia6500口拋棄式
    name: "ilia6500口拋棄式",
    images: [
      { url: "/images/iliabar4.jpg.webp", alt: "ilia6500拋棄式電子菸", display_order: 1, is_primary: 1 },
      { url: "/images/ilia_fabric_device_main.png", alt: "ilia設備展示", display_order: 2, is_primary: 0 },
      { url: "/images/sergey-fediv-x1w4399HA74-unsplash.jpg", alt: "ilia使用場景", display_order: 3, is_primary: 0 }
    ]
  },
  192: { // Lana 8000口拋棄式
    name: "Lana 8000口拋棄式",
    images: [
      { url: "/images/lana_a8000.webp", alt: "Lana 8000口拋棄式電子菸", display_order: 1, is_primary: 1 },
      { url: "/images/lana_ceramic_pods_main.webp", alt: "Lana陶瓷煙彈", display_order: 2, is_primary: 0 },
      { url: "/images/hosts/vaporesso-1.jpg", alt: "Lana產品細節", display_order: 3, is_primary: 0 }
    ]
  },
  193: { // HTA黑桃主機
    name: "HTA黑桃主機",
    images: [
      { url: "/images/hta_spade_device.webp", alt: "HTA黑桃主機", display_order: 1, is_primary: 1 },
      { url: "/images/hta_spade_pods.webp", alt: "HTA黑桃煙彈", display_order: 2, is_primary: 0 },
      { url: "/images/hosts/iqos-1.webp", alt: "HTA使用展示", display_order: 3, is_primary: 0 }
    ]
  },
  194: { // Ilia 一代主機
    name: "Ilia 一代主機",
    images: [
      { url: "/images/ilia_gen1_main_device.jpg", alt: "Ilia一代主機", display_order: 1, is_primary: 1 },
      { url: "/images/ilia-pods.webp", alt: "Ilia一代煙彈", display_order: 2, is_primary: 0 },
      { url: "/images/ilia5_d.jpg", alt: "Ilia產品對比", display_order: 3, is_primary: 0 }
    ]
  },
  195: { // Ilia布紋主機
    name: "Ilia布紋主機", 
    images: [
      { url: "/images/ilia_fabric_device_main.png", alt: "Ilia布紋主機", display_order: 1, is_primary: 1 },
      { url: "/images/ilia_leather_details.jpg", alt: "Ilia質感細節", display_order: 2, is_primary: 0 },
      { url: "/images/ilia-pod5.jpg", alt: "Ilia布紋配套煙彈", display_order: 3, is_primary: 0 }
    ]
  },
  196: { // Ilia皮革主機
    name: "Ilia皮革主機",
    images: [
      { url: "/images/ilia_leather_details.jpg", alt: "Ilia皮革主機細節", display_order: 1, is_primary: 1 },
      { url: "/images/ilia_fabric_device_main.png", alt: "Ilia主機對比", display_order: 2, is_primary: 0 },
      { url: "/images/ilia-pods.webp", alt: "Ilia皮革配套煙彈", display_order: 3, is_primary: 0 }
    ]
  },
  197: { // Ilia Ultra5 菸彈
    name: "Ilia Ultra5 菸彈",
    images: [
      { url: "/images/ilia-pod5.jpg", alt: "Ilia Ultra5 菸彈", display_order: 1, is_primary: 1 },
      { url: "/images/ilia-pods.webp", alt: "Ilia煙彈系列", display_order: 2, is_primary: 0 },
      { url: "/images/ilia5_d.jpg", alt: "Ilia Ultra5與主機搭配", display_order: 3, is_primary: 0 }
    ]
  },
  198: { // Lana Pods (煙彈)
    name: "Lana Pods (煙彈)",
    images: [
      { url: "/images/lana_ceramic_pods_main.webp", alt: "Lana陶瓷煙彈", display_order: 1, is_primary: 1 },
      { url: "/images/lana_a8000.webp", alt: "Lana煙彈與設備", display_order: 2, is_primary: 0 },
      { url: "/images/511951656.jpg", alt: "Lana產品展示", display_order: 3, is_primary: 0 }
    ]
  },
  199: { // HTA Pods (黑桃煙蛋)
    name: "HTA Pods (黑桃煙蛋)",
    images: [
      { url: "/images/hta_spade_pods.webp", alt: "HTA黑桃煙蛋", display_order: 1, is_primary: 1 },
      { url: "/images/hta_spade_device.webp", alt: "HTA黑桃主機配套", display_order: 2, is_primary: 0 },
      { url: "/images/hosts/iqos-1.webp", alt: "HTA使用情境", display_order: 3, is_primary: 0 }
    ]
  },
  200: { // Ilia (發光煙彈)
    name: "Ilia (發光煙彈)",
    images: [
      { url: "/images/ilia-pods.webp", alt: "Ilia發光煙彈", display_order: 1, is_primary: 1 },
      { url: "/images/ilia-pod5.jpg", alt: "Ilia煙彈細節", display_order: 2, is_primary: 0 },
      { url: "/images/ilia_gen1_main_device.jpg", alt: "Ilia發光效果與主機", display_order: 3, is_primary: 0 },
      { url: "/images/sp2_device_main_showcase.jpg", alt: "發光煙彈展示", display_order: 4, is_primary: 0 }
    ]
  }
};

async function populateProductImages() {
  try {
    console.log('🚀 開始為產品添加圖片...');
    
    for (const [productId, productData] of Object.entries(productImageMappings)) {
      console.log(`\n📦 處理產品: ${productData.name} (ID: ${productId})`);
      
      // 先清除現有的產品圖片（除了主圖）
      await dbAsync.run('DELETE FROM product_images WHERE product_id = ?', [productId]);
      
      // 添加新的圖片
      for (const image of productData.images) {
        await dbAsync.run(`
          INSERT INTO product_images (product_id, image_url, alt_text, display_order, is_primary)
          VALUES (?, ?, ?, ?, ?)
        `, [productId, image.url, image.alt, image.display_order, image.is_primary]);
        
        console.log(`  ✅ 添加圖片: ${image.alt} (排序: ${image.display_order})`);
      }
      
      // 更新產品主圖
      const primaryImage = productData.images.find(img => img.is_primary);
      if (primaryImage) {
        await dbAsync.run('UPDATE products SET image_url = ? WHERE id = ?', [primaryImage.url, productId]);
        console.log(`  🌟 設置主圖: ${primaryImage.url}`);
      }
    }
    
    // 統計結果
    const totalImages = await dbAsync.get('SELECT COUNT(*) as count FROM product_images');
    const productCount = Object.keys(productImageMappings).length;
    
    console.log('\n🎉 圖片添加完成！');
    console.log(`📊 統計結果:`);
    console.log(`   - 處理產品數量: ${productCount} 個`);
    console.log(`   - 總圖片數量: ${totalImages.count} 張`);
    console.log(`   - 平均每產品: ${Math.round(totalImages.count / productCount * 10) / 10} 張圖片`);
    
  } catch (error) {
    console.error('❌ 添加圖片時發生錯誤:', error);
  } finally {
    db.close();
  }
}

populateProductImages();