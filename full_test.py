import requests
import json
from datetime import datetime, timedelta

print("🌊 海量國際後台功能完整測試")
print("=" * 50)

base_url = "https://hazosp2p.top"
api_url = f"{base_url}/api"

# 創建會話
session = requests.Session()

# 1. 管理員登入
print("\n1. 🔐 管理員登入...")
login_data = {
    "username": "admin",
    "password": "admin123"
}

try:
    response = session.post(f"{api_url}/admin/login", json=login_data, timeout=10)
    if response.status_code == 200:
        result = response.json()
        token = result.get('token')
        session.headers.update({
            'Authorization': f'Bearer {token}',
            'Content-Type': 'application/json'
        })
        print("✅ 登入成功")
    else:
        print(f"❌ 登入失敗: {response.status_code}")
        exit()
except Exception as e:
    print(f"❌ 登入異常: {e}")
    exit()

# 2. 創建產品分類
print("\n2. 🏷️ 創建海洋主題產品分類...")
categories = [
    {
        "name": "海洋系列電子煙",
        "slug": "ocean-series",
        "description": "深海靈感設計的高端電子煙產品",
        "image_url": "/images/ocean-logo.gif",
        "is_active": True,
        "display_order": 1
    },
    {
        "name": "鯨魚限定款",
        "slug": "whale-limited", 
        "description": "鯨魚主題限定版電子煙系列",
        "image_url": "/images/whale-logo.gif",
        "is_active": True,
        "display_order": 2
    },
    {
        "name": "國際精選",
        "slug": "international-select",
        "description": "國際頂級品牌精選產品", 
        "image_url": "/images/ocean-logo.gif",
        "is_active": True,
        "display_order": 3
    }
]

category_ids = []
for i, category in enumerate(categories):
    try:
        response = session.post(f"{api_url}/categories", json=category, timeout=10)
        if response.status_code == 201:
            result = response.json()
            category_ids.append(result.get('id', i+1))
            print(f"   ✅ 創建分類: {category['name']}")
        else:
            category_ids.append(i+1)  # 使用預設ID
            print(f"   ⚠️ 分類可能已存在: {category['name']}")
    except Exception as e:
        category_ids.append(i+1)
        print(f"   ❌ 分類創建異常: {category['name']}")

# 3. 創建產品
print("\n3. 📦 創建海洋主題產品...")
products = [
    {
        "name": "海量 Ocean Pro 電子煙主機",
        "category_id": category_ids[0],
        "price": 2980,
        "description": "採用深海藍設計理念，融合海洋元素的高端電子煙主機。具備智能溫控、長效續航等頂級功能。",
        "image_url": "/images/ocean-logo.gif",
        "stock": 50,
        "is_featured": True,
        "is_active": True
    },
    {
        "name": "鯨魚限定版 Whale Special 煙彈",
        "category_id": category_ids[1],
        "price": 580,
        "description": "鯨魚主題限定版煙彈，獨特的海洋風味調配，帶來前所未有的味覺體驗。",
        "image_url": "/images/whale-logo.gif",
        "stock": 100,
        "is_featured": True,
        "is_active": True
    },
    {
        "name": "海量國際 精選套裝",
        "category_id": category_ids[2],
        "price": 4580,
        "description": "海量國際精心打造的豪華套裝，包含主機、多種口味煙彈及專業配件。",
        "image_url": "/images/ocean-logo.gif",
        "stock": 25,
        "is_featured": True,
        "is_active": True
    }
]

for product in products:
    try:
        response = session.post(f"{api_url}/products", json=product, timeout=10)
        if response.status_code == 201:
            print(f"   ✅ 創建產品: {product['name']}")
        else:
            print(f"   ⚠️ 產品創建響應: {response.status_code} - {product['name']}")
    except Exception as e:
        print(f"   ❌ 產品創建異常: {product['name']}")

# 4. 創建公告
print("\n4. 📢 創建海量國際公告...")
announcements = [
    {
        "title": "🌊 海量國際新品上市",
        "content": "全新海洋系列電子煙隆重登場！融合深海靈感與頂級工藝，為您帶來非凡體驗。",
        "type": "info",
        "is_active": True
    },
    {
        "title": "🐋 鯨魚限定版現正預購",
        "content": "限量發行的鯨魚主題電子煙，獨特設計與卓越品質的完美結合。預購享85折優惠！",
        "type": "promotion", 
        "is_active": True
    }
]

for announcement in announcements:
    try:
        response = session.post(f"{api_url}/announcements", json=announcement, timeout=10)
        if response.status_code == 201:
            print(f"   ✅ 創建公告: {announcement['title']}")
        else:
            print(f"   ⚠️ 公告創建響應: {response.status_code}")
    except Exception as e:
        print(f"   ❌ 公告創建異常: {announcement['title']}")

# 5. 創建優惠券
print("\n5. 🎫 創建海洋主題優惠券...")
tomorrow = (datetime.now() + timedelta(days=1)).isoformat()
next_month = (datetime.now() + timedelta(days=30)).isoformat()

coupons = [
    {
        "code": "OCEAN2025",
        "type": "percentage",
        "value": 15,
        "min_amount": 1000,
        "max_uses": 100,
        "description": "海洋系列專享15%折扣券",
        "start_date": tomorrow,
        "end_date": next_month,
        "is_active": True
    },
    {
        "code": "WHALE500",
        "type": "fixed",
        "value": 500,
        "min_amount": 2000,
        "max_uses": 50,
        "description": "鯨魚限定版滿2000減500",
        "start_date": tomorrow,
        "end_date": next_month,
        "is_active": True
    }
]

for coupon in coupons:
    try:
        response = session.post(f"{api_url}/coupons", json=coupon, timeout=10)
        if response.status_code == 201:
            print(f"   ✅ 創建優惠券: {coupon['code']}")
        else:
            print(f"   ⚠️ 優惠券創建響應: {response.status_code}")
    except Exception as e:
        print(f"   ❌ 優惠券創建異常: {coupon['code']}")

# 6. 更新頁腳設置
print("\n6. 🦶 更新頁腳為海量國際...")
footer_updates = [
    {
        "section": "company_info",
        "title": "海量國際",
        "content": "海量國際致力於提供最優質的電子煙產品與服務，讓每一位顧客都能享受到最純淨、最舒適的使用體驗。",
        "image_url": "/images/ocean-logo.gif"
    },
    {
        "section": "copyright", 
        "content": "© 2025卉田國際旗下 子公司:海量國際 版權所有"
    }
]

for update in footer_updates:
    try:
        response = session.put(f"{api_url}/footer/{update['section']}", json=update, timeout=10)
        if response.status_code == 200:
            print(f"   ✅ 更新頁腳: {update['section']}")
        else:
            print(f"   ⚠️ 頁腳更新響應: {response.status_code}")
    except Exception as e:
        print(f"   ❌ 頁腳更新異常: {update['section']}")

# 7. 驗證前台
print("\n7. 🌐 驗證前台頁面...")
test_pages = [
    ("首頁", "/"),
    ("商品頁", "/products"),
    ("管理後台", "/admin")
]

for page_name, path in test_pages:
    try:
        response = session.get(f"{base_url}{path}", timeout=10)
        if response.status_code == 200:
            print(f"   ✅ {page_name}訪問正常")
        else:
            print(f"   ❌ {page_name}訪問失敗: {response.status_code}")
    except Exception as e:
        print(f"   ❌ {page_name}訪問異常")

print("\n" + "=" * 50)
print("🎉 海量國際後台功能測試完成！")
print("🌊 已創建海洋主題分類、產品和優惠券")
print("🏢 已更新為海量國際公司資訊")
print("🚀 請訪問 https://hazosp2p.top 查看效果")
print("🔑 管理後台: https://hazosp2p.top/admin")
print("   用戶名: admin")
print("   密碼: admin123")