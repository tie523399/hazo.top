#!/usr/bin/env python3
"""
創建海量國際產品數據，修復圖片和分類問題
"""

import requests
import json

def create_hazo_products():
    base_url = "https://hazosp2p.top"
    api_url = f"{base_url}/api"
    
    # 管理員登入
    session = requests.Session()
    login_response = session.post(f"{api_url}/admin/login", 
                                json={"username": "admin", "password": "admin123"})
    
    if login_response.status_code != 200:
        print("❌ 管理員登入失敗")
        return False
    
    token = login_response.json().get('token')
    session.headers.update({
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json'
    })
    
    print("🌊 創建海量國際產品數據")
    print("="*50)
    
    # 1. 先清理測試數據 (刪除"內褲"產品)
    print("\n🧹 清理測試數據...")
    try:
        # 獲取現有產品
        products_response = session.get(f"{api_url}/products", timeout=10)
        if products_response.status_code == 200:
            products_data = products_response.json()
            products = products_data.get('products', [])
            
            for product in products:
                if "內褲" in product.get('name', ''):
                    delete_response = session.delete(f"{api_url}/products/{product['id']}", timeout=10)
                    if delete_response.status_code == 200:
                        print(f"✅ 已刪除測試產品: {product['name']}")
                    else:
                        print(f"⚠️ 刪除產品失敗: {product['name']}")
    except Exception as e:
        print(f"清理過程出現問題: {e}")
    
    # 2. 獲取分類ID映射
    print("\n📂 獲取分類映射...")
    categories_response = session.get(f"{api_url}/categories", timeout=10)
    if categories_response.status_code != 200:
        print("❌ 無法獲取分類")
        return False
    
    categories = categories_response.json()
    category_map = {}
    
    for category in categories:
        name = category.get('name', '')
        if "海洋" in name:
            category_map['ocean'] = category['id']
            print(f"✅ 海洋系列分類ID: {category['id']}")
        elif "鯨魚" in name:
            category_map['whale'] = category['id']
            print(f"✅ 鯨魚限定分類ID: {category['id']}")
        elif "國際" in name:
            category_map['international'] = category['id']
            print(f"✅ 國際精選分類ID: {category['id']}")
        elif name == "主機":
            category_map['host'] = category['id']
            print(f"✅ 主機分類ID: {category['id']}")
        elif name == "煙彈":
            category_map['cartridge'] = category['id']
            print(f"✅ 煙彈分類ID: {category['id']}")
    
    # 3. 創建海量國際產品
    print("\n🛍️ 創建海量國際產品...")
    
    hazo_products = [
        {
            "name": "海量 Ocean Pro 深海主機",
            "category_id": category_map.get('ocean', 1),
            "price": 2980,
            "description": "海量國際旗艦產品，採用深海藍設計理念，融合海洋元素的高端電子煙主機。具備智能溫控、長效續航、防水設計等頂級功能。",
            "image_url": "/images/ocean-logo.gif",
            "stock": 50,
            "is_featured": True,
            "is_active": True,
            "brand": "海量國際"
        },
        {
            "name": "鯨魚限定版 Whale Special",
            "category_id": category_map.get('whale', 2), 
            "price": 3680,
            "description": "鯨魚主題限定版電子煙，獨特的海洋風味調配，限量發行。精美包裝，收藏價值極高，帶來前所未有的味覺體驗。",
            "image_url": "/images/whale-logo.gif",
            "stock": 30,
            "is_featured": True,
            "is_active": True,
            "brand": "海量國際"
        },
        {
            "name": "海量國際 經典套裝",
            "category_id": category_map.get('international', 3),
            "price": 4580,
            "description": "海量國際精心打造的豪華套裝，包含主機、多種口味煙彈及專業配件。一站式電子煙解決方案，適合新手和進階用戶。",
            "image_url": "/images/ocean-logo.gif",
            "stock": 25,
            "is_featured": True,
            "is_active": True,
            "brand": "海量國際"
        },
        {
            "name": "Ocean 深海藍煙彈",
            "category_id": category_map.get('cartridge', 2),
            "price": 580,
            "description": "專為海洋系列設計的高級煙彈，深海藍包裝，多種口味選擇。採用陶瓷芯技術，保證純正口感。",
            "image_url": "/images/ocean-logo.gif",
            "stock": 100,
            "is_featured": False,
            "is_active": True,
            "brand": "海量國際"
        },
        {
            "name": "Whale 鯨魚煙彈組合",
            "category_id": category_map.get('whale', 2),
            "price": 680,
            "description": "鯨魚限定系列煙彈，三種海洋風味：深海薄荷、珊瑚果香、海風清香。每一口都是深海的呼喚。",
            "image_url": "/images/whale-logo.gif",
            "stock": 80,
            "is_featured": False,
            "is_active": True,
            "brand": "海量國際"
        },
        {
            "name": "海量 入門者主機",
            "category_id": category_map.get('host', 1),
            "price": 1280,
            "description": "適合新手的入門級主機，操作簡單，安全可靠。海量國際品質保證，三個月保固服務。",
            "image_url": "/images/ocean-logo.gif",
            "stock": 60,
            "is_featured": False,
            "is_active": True,
            "brand": "海量國際"
        }
    ]
    
    success_count = 0
    for product in hazo_products:
        try:
            # 嘗試多個端點
            endpoints = [
                f"{api_url}/products",
                f"{api_url}/admin/products"
            ]
            
            created = False
            for endpoint in endpoints:
                response = session.post(endpoint, json=product, timeout=15)
                if response.status_code in [200, 201]:
                    success_count += 1
                    print(f"✅ 產品創建成功: {product['name']}")
                    created = True
                    break
                else:
                    print(f"⚠️ 端點 {endpoint} 響應: {response.status_code}")
            
            if not created:
                print(f"❌ 產品創建失敗: {product['name']}")
                
        except Exception as e:
            print(f"❌ 產品創建異常: {product['name']} - {str(e)}")
    
    print(f"\n📊 產品創建結果: {success_count}/{len(hazo_products)}")
    
    # 4. 驗證創建結果
    print("\n🔍 驗證創建結果...")
    try:
        verify_response = session.get(f"{api_url}/products", timeout=10)
        if verify_response.status_code == 200:
            verify_data = verify_response.json()
            products = verify_data.get('products', [])
            print(f"✅ 當前產品總數: {len(products)}")
            
            hazo_products_count = sum(1 for p in products if "海量" in p.get('name', '') or "Ocean" in p.get('name', '') or "Whale" in p.get('name', ''))
            print(f"✅ 海量國際產品: {hazo_products_count}")
            
            # 顯示產品信息
            for product in products[:3]:
                print(f"   📦 {product.get('name')} - 圖片: {'✅' if product.get('image_url') else '❌'}")
        else:
            print("❌ 無法驗證產品")
    except Exception as e:
        print(f"❌ 驗證異常: {e}")
    
    print("\n" + "="*50)
    print("🎊 海量國際產品數據創建完成！")
    print("🌐 請訪問 https://hazosp2p.top/products 查看效果")
    
    return success_count > 0

if __name__ == "__main__":
    create_hazo_products()