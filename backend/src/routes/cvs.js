const express = require('express');
const router = express.Router();

// CVS 門市選擇 callback 處理
router.post('/callback', (req, res) => {
  try {
    console.log('🏪 收到 CVS 門市選擇回調:', req.body);
    console.log('🔍 Headers:', req.headers);
    
    // 解析門市資訊
    const storeData = {
      storeId: req.body.storeid || req.body.StoreId || req.body.STOREID,
      storeName: req.body.storename || req.body.StoreName || req.body.STORENAME,
      storeAddress: req.body.storeaddress || req.body.StoreAddress || req.body.STOREADDRESS,
      storeTel: req.body.storetel || req.body.StoreTel || req.body.STORETEL
    };
    
    console.log('📋 解析門市資訊:', storeData);
    
    // 生成結果頁面HTML，包含JavaScript來處理選擇結果
    const resultHTML = `
    <!DOCTYPE html>
    <html lang="zh-TW">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>門市選擇完成</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                margin: 0;
                padding: 20px;
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .container {
                background: white;
                border-radius: 12px;
                padding: 30px;
                box-shadow: 0 10px 30px rgba(0,0,0,0.2);
                text-align: center;
                max-width: 400px;
                width: 100%;
            }
            .success-icon {
                color: #10b981;
                font-size: 48px;
                margin-bottom: 16px;
            }
            h1 {
                color: #1f2937;
                margin-bottom: 20px;
                font-size: 24px;
            }
            .store-info {
                background: #f9fafb;
                border-radius: 8px;
                padding: 16px;
                margin: 20px 0;
                text-align: left;
            }
            .store-info p {
                margin: 8px 0;
                color: #374151;
            }
            .store-info strong {
                color: #1f2937;
            }
            .loading {
                color: #6b7280;
                font-size: 14px;
                margin-top: 20px;
            }
            .countdown {
                color: #ef4444;
                font-weight: bold;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="success-icon">✅</div>
            <h1>門市選擇完成</h1>
            
            <div class="store-info">
                <p><strong>門市代號:</strong> ${storeData.storeId || '未提供'}</p>
                <p><strong>門市名稱:</strong> ${storeData.storeName || '未提供'}</p>
                <p><strong>門市地址:</strong> ${storeData.storeAddress || '未提供'}</p>
                <p><strong>門市電話:</strong> ${storeData.storeTel || '未提供'}</p>
            </div>
            
            <div class="loading">
                正在返回結賬頁面... <span class="countdown" id="countdown">3</span>
            </div>
        </div>
        
        <script>
            // 門市資訊
            const storeData = ${JSON.stringify(storeData)};
            
            // 保存門市選擇結果到 localStorage
            localStorage.setItem('selectedStore', JSON.stringify(storeData));
            
            // 倒數計時並自動跳轉
            let countdown = 3;
            const countdownElement = document.getElementById('countdown');
            
            const timer = setInterval(() => {
                countdown--;
                countdownElement.textContent = countdown;
                
                if (countdown <= 0) {
                    clearInterval(timer);
                    
                    // 嘗試跳轉回結賬頁面
                    try {
                        if (window.opener) {
                            // 如果是彈窗開啟，通知父窗口
                            window.opener.postMessage({
                                type: 'STORE_SELECTED',
                                storeData: storeData
                            }, '*');
                            window.close();
                        } else {
                            // 直接跳轉
                            window.location.href = '/checkout';
                        }
                    } catch (error) {
                        console.log('跳轉失敗，請手動返回結賬頁面:', error);
                        window.location.href = '/checkout';
                    }
                }
            }, 1000);
            
            // 立即通知父窗口（如果存在）
            if (window.opener) {
                try {
                    window.opener.postMessage({
                        type: 'STORE_SELECTED',
                        storeData: storeData
                    }, '*');
                } catch (error) {
                    console.log('無法通知父窗口:', error);
                }
            }
        </script>
    </body>
    </html>`;
    
    res.send(resultHTML);
    
  } catch (error) {
    console.error('❌ CVS callback 處理錯誤:', error);
    
    // 錯誤頁面
    const errorHTML = `
    <!DOCTYPE html>
    <html lang="zh-TW">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>選擇門市失敗</title>
        <style>
            body { font-family: Arial, sans-serif; padding: 20px; text-align: center; }
            .error { color: #ef4444; }
        </style>
    </head>
    <body>
        <h1 class="error">門市選擇失敗</h1>
        <p>請返回結賬頁面重新選擇門市</p>
        <button onclick="window.close()">關閉頁面</button>
        <script>
            setTimeout(() => {
                window.location.href = '/checkout';
            }, 3000);
        </script>
    </body>
    </html>`;
    
    res.status(500).send(errorHTML);
  }
});

// 測試端點
router.get('/test', (req, res) => {
  res.json({
    message: 'CVS 門市選擇 API 正常運行',
    timestamp: new Date().toISOString(),
    callbackUrl: `${req.protocol}://${req.get('host')}/api/cvs/callback`
  });
});

module.exports = router;