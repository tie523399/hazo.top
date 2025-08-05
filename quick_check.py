#!/usr/bin/env python3
"""
快速檢查手動添加後的產品狀況
"""

import requests
import time

def quick_check():
    base_url = "https://hazosp2p.top"
    api_url = f"{base_url}/api"
    
    print("⚡ 快速檢查手動添加的產品")
    print("="*40)
    
    # 增加重試機制
    for attempt in range(3):
        try:
            print(f"\n🔄 嘗試 {attempt + 1}/3...")
            products_response = requests.get(f"{api_url}/products", timeout=15)
            
            if products_response.status_code == 200:
                products_data = products_response.json()
                products = products_data.get('products', [])
                
                print(f"✅ 成功！找到 {len(products)} 個產品")
                
                for i, product in enumerate(products):
                    print(f"\n📦 產品 {i+1}:")
                    print(f"   名稱: {product.get('name')}")
                    print(f"   分類: {product.get('category')}")
                    print(f"   圖片: {product.get('image_url')}")
                    print(f"   品牌: {product.get('brand', 'N/A')}")
                    
                    # 檢查圖片連結
                    if product.get('image_url'):
                        img_url = product['image_url']
                        if img_url.startswith('/'):
                            full_img_url = f"{base_url}{img_url}"
                        else:
                            full_img_url = img_url
                        
                        print(f"   完整圖片URL: {full_img_url}")
                        
                        try:
                            img_check = requests.head(full_img_url, timeout=5)
                            status = "✅ 可訪問" if img_check.status_code == 200 else f"❌ {img_check.status_code}"
                            print(f"   圖片狀態: {status}")
                        except:
                            print(f"   圖片狀態: ❌ 無法連接")
                    else:
                        print(f"   圖片狀態: ❌ 無圖片URL")
                
                return products
                
            else:
                print(f"⚠️ API響應: {products_response.status_code}")
                if attempt < 2:
                    time.sleep(2)
                    continue
                
        except Exception as e:
            print(f"❌ 嘗試 {attempt + 1} 失敗: {str(e)[:50]}...")
            if attempt < 2:
                time.sleep(3)
                continue
    
    print("❌ 所有嘗試都失敗了")
    return []

if __name__ == "__main__":
    products = quick_check()
    
    if products:
        print(f"\n📊 總結: {len(products)} 個產品")
        hazo_count = sum(1 for p in products if "海量" in p.get('name', '') or "Ocean" in p.get('name', '') or "Whale" in p.get('name', ''))
        print(f"🌊 海量國際產品: {hazo_count}")
        
        image_issues = [p for p in products if not p.get('image_url') or not p.get('image_url').strip()]
        if image_issues:
            print(f"⚠️ 圖片問題產品: {len(image_issues)}")
            for p in image_issues:
                print(f"   - {p.get('name')}")
        else:
            print("✅ 所有產品都有圖片URL")
    
    print("\n" + "="*40)