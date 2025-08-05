#!/usr/bin/env python3
"""
檢查當前產品的圖片數據和修復問題
"""

import requests
import json

def check_and_fix_product():
    base_url = "https://hazosp2p.top"
    api_url = f"{base_url}/api"
    
    print("🔍 檢查當前產品圖片問題")
    print("="*50)
    
    # 1. 檢查當前產品
    print("\n📦 檢查當前產品:")
    try:
        products_response = requests.get(f"{api_url}/products", timeout=10)
        if products_response.status_code == 200:
            products_data = products_response.json()
            products = products_data.get('products', [])
            
            if products:
                print(f"✅ 找到 {len(products)} 個產品")
                
                for i, product in enumerate(products):
                    print(f"\n   產品 {i+1}:")
                    print(f"     ID: {product.get('id')}")
                    print(f"     名稱: {product.get('name')}")
                    print(f"     分類: {product.get('category')}")
                    print(f"     圖片URL: '{product.get('image_url')}'")
                    print(f"     圖片狀態: {'❌ 空白' if not product.get('image_url') else '✅ 有內容'}")
                    print(f"     價格: {product.get('price')}")
                    print(f"     庫存: {product.get('stock')}")
                    
                    # 測試圖片URL是否可訪問
                    if product.get('image_url'):
                        try:
                            img_url = f"{base_url}{product['image_url']}" if product['image_url'].startswith('/') else product['image_url']
                            img_response = requests.head(img_url, timeout=5)
                            print(f"     圖片連結測試: {img_response.status_code} - {'✅ 可訪問' if img_response.status_code == 200 else '❌ 無法訪問'}")
                        except Exception as e:
                            print(f"     圖片連結測試: ❌ 錯誤 - {str(e)}")
            else:
                print("⚠️ 沒有產品數據")
                return False
        else:
            print(f"❌ 產品API失敗: {products_response.status_code}")
            return False
    except Exception as e:
        print(f"❌ 產品檢查異常: {e}")
        return False
    
    # 2. 管理員登入準備修復
    session = requests.Session()
    try:
        login_response = session.post(f"{api_url}/admin/login", 
                                    json={"username": "admin", "password": "admin123"})
        if login_response.status_code == 200:
            token = login_response.json().get('token')
            session.headers.update({
                'Authorization': f'Bearer {token}',
                'Content-Type': 'application/json'
            })
            print("\n✅ 管理員登入成功")
        else:
            print("\n❌ 管理員登入失敗")
            return False
    except Exception as e:
        print(f"❌ 登入異常: {e}")
        return False
    
    # 3. 修復現有產品的圖片
    print("\n🔧 修復現有產品圖片...")
    try:
        for product in products:
            if not product.get('image_url') or product.get('image_url').strip() == '':
                # 修復空白圖片URL
                update_data = {
                    "name": product.get('name'),
                    "category_id": product.get('category_id', 1),
                    "price": product.get('price'),
                    "description": product.get('description', '海量國際精選產品'),
                    "image_url": "/images/ocean-logo.gif",  # 使用海洋標誌
                    "stock": product.get('stock', 50),
                    "is_featured": True,
                    "is_active": True,
                    "brand": "海量國際"
                }
                
                # 嘗試更新產品
                endpoints = [
                    f"{api_url}/products/{product['id']}",
                    f"{api_url}/admin/products/{product['id']}"
                ]
                
                updated = False
                for endpoint in endpoints:
                    try:
                        response = session.put(endpoint, json=update_data, timeout=10)
                        if response.status_code in [200, 201]:
                            print(f"✅ 產品圖片修復成功: {product['name']}")
                            updated = True
                            break
                        else:
                            print(f"⚠️ 端點 {endpoint} 響應: {response.status_code}")
                    except Exception as e:
                        print(f"⚠️ 端點 {endpoint} 異常: {str(e)}")
                
                if not updated:
                    print(f"❌ 產品圖片修復失敗: {product['name']}")
    except Exception as e:
        print(f"❌ 修復過程異常: {e}")
    
    # 4. 創建更多海量國際產品
    print("\n🛍️ 創建更多海量國際產品...")
    
    new_products = [
        {
            "name": "海量 Ocean Pro 深海主機",
            "category_id": 4,  # 海洋系列
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
            "category_id": 5,  # 鯨魚限定
            "price": 3680,
            "description": "鯨魚主題限定版電子煙，獨特的海洋風味調配，限量發行。精美包裝，收藏價值極高，帶來前所未有的味覺體驗。",
            "image_url": "/images/whale-logo.gif",
            "stock": 30,
            "is_featured": True,
            "is_active": True,
            "brand": "海量國際"
        }
    ]
    
    for product in new_products:
        try:
            # 檢查是否已存在
            existing = any(p.get('name') == product['name'] for p in products)
            if existing:
                print(f"⚠️ 產品已存在，跳過: {product['name']}")
                continue
            
            # 嘗試創建產品
            endpoints = [
                f"{api_url}/admin/products",
                f"{api_url}/products"
            ]
            
            created = False
            for endpoint in endpoints:
                try:
                    response = session.post(endpoint, json=product, timeout=15)
                    if response.status_code in [200, 201]:
                        print(f"✅ 新產品創建成功: {product['name']}")
                        created = True
                        break
                    else:
                        print(f"⚠️ 端點 {endpoint} 響應: {response.status_code}")
                        if response.status_code == 400:
                            print(f"     錯誤詳情: {response.text}")
                except Exception as e:
                    print(f"⚠️ 端點 {endpoint} 異常: {str(e)}")
            
            if not created:
                print(f"❌ 新產品創建失敗: {product['name']}")
                
        except Exception as e:
            print(f"❌ 產品創建異常: {product['name']} - {str(e)}")
    
    # 5. 最終驗證
    print("\n🔍 最終驗證結果...")
    try:
        final_response = session.get(f"{api_url}/products", timeout=10)
        if final_response.status_code == 200:
            final_data = final_response.json()
            final_products = final_data.get('products', [])
            print(f"✅ 最終產品總數: {len(final_products)}")
            
            image_ok_count = sum(1 for p in final_products if p.get('image_url') and p.get('image_url').strip())
            print(f"✅ 有圖片的產品: {image_ok_count}/{len(final_products)}")
            
            hazo_count = sum(1 for p in final_products if "海量" in p.get('name', '') or "Ocean" in p.get('name', '') or "Whale" in p.get('name', ''))
            print(f"✅ 海量國際產品: {hazo_count}")
        else:
            print("❌ 最終驗證失敗")
    except Exception as e:
        print(f"❌ 最終驗證異常: {e}")
    
    print("\n" + "="*50)
    print("🎊 產品圖片問題檢查和修復完成！")
    print("🌐 請訪問 https://hazosp2p.top/products 查看效果")

if __name__ == "__main__":
    check_and_fix_product()