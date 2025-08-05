import requests

print("🔍 驗證海量國際網站設置結果")
print("=" * 40)

base_url = "https://hazosp2p.top"

# 1. 檢查首頁內容
print("\n1. 檢查首頁...")
try:
    response = requests.get(base_url, timeout=10)
    if response.status_code == 200:
        content = response.text
        if "海量國際" in content:
            print("✅ 首頁包含海量國際品牌名稱")
        if "ocean-logo.gif" in content:
            print("✅ 首頁使用海洋logo")
        print("✅ 首頁加載正常")
    else:
        print(f"❌ 首頁訪問失敗: {response.status_code}")
except Exception as e:
    print(f"❌ 首頁檢查異常: {e}")

# 2. 檢查API數據
print("\n2. 檢查API數據...")

# 檢查公告
try:
    response = requests.get(f"{base_url}/api/announcements", timeout=10)
    if response.status_code == 200:
        announcements = response.json()
        ocean_count = sum(1 for a in announcements if "海量國際" in a.get("title", "") or "海洋" in a.get("title", "") or "鯨魚" in a.get("title", ""))
        print(f"✅ 找到 {ocean_count} 個海洋主題公告")
    else:
        print(f"❌ 公告API失敗: {response.status_code}")
except Exception as e:
    print(f"❌ 公告檢查異常: {e}")

# 檢查優惠券
try:
    session = requests.Session()
    # 先登入
    login_response = session.post(f"{base_url}/api/admin/login", 
                                json={"username": "admin", "password": "admin123"})
    if login_response.status_code == 200:
        token = login_response.json().get('token')
        session.headers.update({'Authorization': f'Bearer {token}'})
        
        response = session.get(f"{base_url}/api/coupons", timeout=10)
        if response.status_code == 200:
            coupons = response.json()
            ocean_coupons = [c for c in coupons if c.get("code") in ["OCEAN2025", "WHALE500"]]
            print(f"✅ 找到 {len(ocean_coupons)} 個海洋主題優惠券")
        else:
            print(f"⚠️ 優惠券API: {response.status_code}")
    else:
        print("⚠️ 無法登入檢查優惠券")
except Exception as e:
    print(f"❌ 優惠券檢查異常: {e}")

# 檢查頁腳設置
try:
    response = requests.get(f"{base_url}/api/footer", timeout=10)
    if response.status_code == 200:
        footer_data = response.json()
        company_info = next((f for f in footer_data if f.get("section") == "company_info"), None)
        copyright_info = next((f for f in footer_data if f.get("section") == "copyright"), None)
        
        if company_info and "海量國際" in company_info.get("title", ""):
            print("✅ 頁腳公司名稱已更新為海量國際")
        
        if copyright_info and "卉田國際旗下 子公司:海量國際" in copyright_info.get("content", ""):
            print("✅ 版權資訊已更新為卉田國際旗下海量國際")
            
    else:
        print(f"❌ 頁腳API失敗: {response.status_code}")
except Exception as e:
    print(f"❌ 頁腳檢查異常: {e}")

print("\n" + "=" * 40)
print("🌊 海量國際網站驗證完成！")
print("🎯 請手動訪問以下頁面確認效果：")
print("   🏠 首頁: https://hazosp2p.top")
print("   🛍️ 商品: https://hazosp2p.top/products") 
print("   🔧 管理: https://hazosp2p.top/admin")
print("\n📝 登入資訊：")
print("   用戶名: admin")
print("   密碼: admin123")
print("\n🏢 品牌資訊已更新：")
print("   公司: 海量國際")
print("   隸屬: 卉田國際旗下子公司")
print("   Logo: 海洋主題設計")