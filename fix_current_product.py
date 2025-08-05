#!/usr/bin/env python3
"""
修復當前產品的圖片和資料
"""

import requests
import time

def fix_current_product():
    base_url = "https://hazosp2p.top"
    api_url = f"{base_url}/api"
    
    print("🔧 修復當前產品數據")
    print("="*40)
    
    # 管理員登入
    session = requests.Session()
    
    max_retries = 3
    for attempt in range(max_retries):
        try:
            print(f"\n🔐 登入嘗試 {attempt + 1}/{max_retries}...")
            login_response = session.post(f"{api_url}/admin/login", 
                                        json={"username": "admin", "password": "admin123"},
                                        timeout=15)
            
            if login_response.status_code == 200:
                token = login_response.json().get('token')
                session.headers.update({
                    'Authorization': f'Bearer {token}',
                    'Content-Type': 'application/json'
                })
                print("✅ 管理員登入成功")
                break
            else:
                print(f"❌ 登入失敗: {login_response.status_code}")
                if attempt < max_retries - 1:
                    time.sleep(2)
                    continue
                return False
                
        except Exception as e:
            print(f"❌ 登入異常: {str(e)[:50]}...")
            if attempt < max_retries - 1:
                time.sleep(3)
                continue
            return False
    
    # 獲取當前產品
    try:
        print("\n📦 獲取當前產品...")
        products_response = session.get(f"{api_url}/products", timeout=15)
        
        if products_response.status_code == 200:
            products_data = products_response.json()
            products = products_data.get('products', [])
            print(f"✅ 找到 {len(products)} 個產品")
        else:
            print(f"❌ 獲取產品失敗: {products_response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ 獲取產品異常: {e}")
        return False
    
    # 修復或替換測試產品
    for product in products:
        product_id = product.get('id')
        product_name = product.get('name', '')
        
        if "內褲" in product_name:
            print(f"\n🔄 轉換測試產品: {product_name}")
            
            # 將測試產品轉換為海量國際產品
            updated_data = {
                "name": "海量國際 精選套裝",
                "category_id": 6,  # 國際精選分類
                "price": 1980,
                "description": "海量國際精心打造的入門套裝，包含主機和多種口味煙彈。適合新手和進階用戶，一站式電子煙解決方案。",
                "image_url": "/images/ocean-logo.gif",
                "stock": 88,
                "is_featured": True,
                "is_active": True,
                "brand": "海量國際"
            }
            
            # 嘗試更新產品
            endpoints = [
                f"{api_url}/products/{product_id}",
                f"{api_url}/admin/products/{product_id}"
            ]
            
            updated = False
            for endpoint in endpoints:
                try:
                    print(f"   嘗試端點: {endpoint}")
                    update_response = session.put(endpoint, json=updated_data, timeout=15)
                    
                    if update_response.status_code in [200, 201]:
                        print(f"✅ 產品更新成功: {updated_data['name']}")
                        updated = True
                        break
                    else:
                        print(f"⚠️ 端點響應: {update_response.status_code}")
                        print(f"   響應內容: {update_response.text[:100]}...")
                        
                except Exception as e:
                    print(f"⚠️ 端點異常: {str(e)[:50]}...")
            
            if not updated:
                print(f"❌ 產品更新失敗: {product_name}")
        else:
            print(f"📦 保留產品: {product_name}")
    
    # 驗證結果
    print("\n🔍 驗證修復結果...")
    try:
        verify_response = session.get(f"{api_url}/products", timeout=15)
        if verify_response.status_code == 200:
            verify_data = verify_response.json()
            final_products = verify_data.get('products', [])
            
            print(f"✅ 最終產品數量: {len(final_products)}")
            
            for product in final_products:
                name = product.get('name')
                image_url = product.get('image_url')
                print(f"   📦 {name}")
                print(f"      圖片: {'✅' if image_url else '❌'} {image_url}")
        else:
            print("❌ 驗證失敗")
    except Exception as e:
        print(f"❌ 驗證異常: {e}")
    
    print("\n" + "="*40)
    print("🎊 產品修復完成！")
    print("🔄 建議重新整理瀏覽器頁面查看效果")

if __name__ == "__main__":
    fix_current_product()