#!/usr/bin/env python3
"""
檢查當前分類數據，找出正確的分類slug
"""

import requests
import time

def check_categories():
    base_url = "https://hazosp2p.top"
    api_url = f"{base_url}/api"
    
    print("📂 檢查分類數據")
    print("="*40)
    
    max_retries = 3
    for attempt in range(max_retries):
        try:
            print(f"\n🔄 嘗試 {attempt + 1}/{max_retries}...")
            categories_response = requests.get(f"{api_url}/categories", timeout=15)
            
            if categories_response.status_code == 200:
                categories = categories_response.json()
                print(f"✅ 找到 {len(categories)} 個分類")
                
                print("\n📋 分類列表:")
                for category in categories:
                    print(f"   ID: {category.get('id')}")
                    print(f"   名稱: {category.get('name')}")
                    print(f"   Slug: {category.get('slug')}")
                    print(f"   描述: {category.get('description', 'N/A')}")
                    print(f"   -" * 30)
                
                # 找出適合的預設分類
                host_category = None
                cartridge_category = None
                
                for category in categories:
                    name = category.get('name', '').lower()
                    slug = category.get('slug', '').lower()
                    
                    if 'host' in slug or '主機' in category.get('name', ''):
                        host_category = slug
                    elif 'cartridge' in slug or '煙彈' in category.get('name', ''):
                        cartridge_category = slug
                
                print(f"\n🔧 建議的預設值:")
                print(f"   主機分類: {host_category or '未找到'}")
                print(f"   煙彈分類: {cartridge_category or '未找到'}")
                
                return categories
                
            else:
                print(f"⚠️ API響應: {categories_response.status_code}")
                if attempt < max_retries - 1:
                    time.sleep(2)
                    continue
                
        except Exception as e:
            print(f"❌ 嘗試 {attempt + 1} 失敗: {str(e)[:50]}...")
            if attempt < max_retries - 1:
                time.sleep(3)
                continue
    
    print("❌ 所有嘗試都失敗了")
    return []

if __name__ == "__main__":
    categories = check_categories()
    print("\n" + "="*40)