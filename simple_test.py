import requests
import json

# 測試基本連接
print("🌊 海量國際後台功能測試開始...")

base_url = "https://hazosp2p.top"
api_url = f"{base_url}/api"

# 1. 測試網站連接
print("\n1. 測試網站連接...")
try:
    response = requests.get(base_url, timeout=10)
    print(f"✅ 網站連接成功: {response.status_code}")
except Exception as e:
    print(f"❌ 網站連接失敗: {e}")

# 2. 管理員登入
print("\n2. 管理員登入...")
session = requests.Session()
login_data = {
    "username": "admin",
    "password": "admin123"
}

try:
    response = session.post(
        f"{api_url}/admin/login",
        json=login_data,
        timeout=10
    )
    print(f"登入響應: {response.status_code}")
    if response.status_code == 200:
        result = response.json()
        token = result.get('token')
        print(f"✅ 登入成功，獲得token")
        
        # 設置授權頭
        session.headers.update({
            'Authorization': f'Bearer {token}',
            'Content-Type': 'application/json'
        })
        
        # 3. 測試系統設置更新
        print("\n3. 更新系統設置...")
        settings_data = {
            "site_title": "海量國際",
            "site_logo_url": "/images/ocean-logo.gif",
            "site_favicon_url": "/images/whale-logo.gif"
        }
        
        response = session.put(f"{api_url}/settings", json=settings_data, timeout=10)
        print(f"系統設置響應: {response.status_code}")
        if response.status_code == 200:
            print("✅ 系統設置更新成功")
        else:
            print(f"❌ 系統設置更新失敗: {response.text}")
    else:
        print(f"❌ 登入失敗: {response.text}")
        
except Exception as e:
    print(f"❌ 登入異常: {e}")

print("\n🎉 測試完成！")