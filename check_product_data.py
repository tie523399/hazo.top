#!/usr/bin/env python3
"""
檢查產品數據結構和分類信息
"""

import requests
import json

def check_product_data():
    base_url = "https://hazosp2p.top"
    api_url = f"{base_url}/api"
    
    print("🔍 檢查產品和分類數據結構")
    print("="*50)
    
    # 1. 檢查分類數據
    print("\n📂 檢查分類數據:")
    try:
        categories_response = requests.get(f"{api_url}/categories", timeout=10)
        if categories_response.status_code == 200:
            categories = categories_response.json()
            print(f"✅ 找到 {len(categories)} 個分類")
            
            for i, category in enumerate(categories[:5]):
                print(f"   {i+1}. ID: {category.get('id')}, Name: {category.get('name')}, Slug: {category.get('slug')}")
            
            if len(categories) > 5:
                print(f"   ... 還有 {len(categories) - 5} 個分類")
        else:
            print(f"❌ 分類API失敗: {categories_response.status_code}")
    except Exception as e:
        print(f"❌ 分類檢查異常: {e}")
    
    # 2. 檢查產品數據
    print("\n📦 檢查產品數據:")
    try:
        products_response = requests.get(f"{api_url}/products", timeout=10)
        if products_response.status_code == 200:
            products_data = products_response.json()
            products = products_data.get('products', [])
            
            if products:
                print(f"✅ 找到 {len(products)} 個產品")
                
                for i, product in enumerate(products[:3]):
                    print(f"\n   產品 {i+1}:")
                    print(f"     ID: {product.get('id')}")
                    print(f"     名稱: {product.get('name')}")
                    print(f"     分類ID: {product.get('category_id')}")
                    print(f"     分類: {product.get('category')}")
                    print(f"     圖片: {product.get('image_url')}")
                    print(f"     價格: {product.get('price')}")
                    print(f"     庫存: {product.get('stock')}")
            else:
                print("⚠️ 沒有產品數據")
        else:
            print(f"❌ 產品API失敗: {products_response.status_code}")
            print(f"響應內容: {products_response.text}")
    except Exception as e:
        print(f"❌ 產品檢查異常: {e}")
    
    # 3. 檢查後台產品數據
    print("\n🔧 嘗試檢查後台產品數據:")
    session = requests.Session()
    
    # 先登入
    try:
        login_response = session.post(f"{api_url}/admin/login", 
                                    json={"username": "admin", "password": "admin123"})
        if login_response.status_code == 200:
            token = login_response.json().get('token')
            session.headers.update({'Authorization': f'Bearer {token}'})
            
            # 嘗試獲取後台產品數據
            admin_products_response = session.get(f"{api_url}/admin/products", timeout=10)
            if admin_products_response.status_code == 200:
                admin_products = admin_products_response.json()
                print(f"✅ 後台產品數據: {len(admin_products.get('products', []))} 個")
            else:
                print(f"⚠️ 後台產品API: {admin_products_response.status_code}")
                
                # 嘗試其他可能的端點
                alt_response = session.get(f"{api_url}/products", timeout=10)
                if alt_response.status_code == 200:
                    print("✅ 使用標準產品端點成功")
                    
        else:
            print("❌ 管理員登入失敗")
    except Exception as e:
        print(f"❌ 後台檢查異常: {e}")
    
    print("\n" + "="*50)
    print("📋 數據結構分析完成")

if __name__ == "__main__":
    check_product_data()