#!/usr/bin/env python3
"""
海量國際後台功能全面自動化測試腳本
使用HTTPS API直接測試所有管理功能
"""

import requests
import json
import time
from datetime import datetime, timedelta

class HazoAdminTester:
    def __init__(self):
        self.base_url = "https://hazosp2p.top"
        self.api_url = f"{self.base_url}/api"
        self.session = requests.Session()
        self.token = None
        
        # 海洋主題資源
        self.ocean_logo = "/images/ocean-logo.gif"
        self.whale_logo = "/images/whale-logo.gif"
        
        # 公司資訊
        self.company_info = {
            "name": "海量國際",
            "description": "海量國際致力於提供最優質的電子煙產品與服務，讓每一位顧客都能享受到最純淨、最舒適的使用體驗。",
            "copyright": "© 2025卉田國際旗下 子公司:海量國際 版權所有"
        }
        
    def log(self, message, level="INFO"):
        """日誌輸出"""
        timestamp = datetime.now().strftime("%H:%M:%S")
        print(f"[{timestamp}] {level}: {message}")
        
    def admin_login(self):
        """管理員登入"""
        self.log("🔐 開始管理員登入...")
        
        login_data = {
            "username": "admin",
            "password": "admin123"
        }
        
        try:
            response = self.session.post(
                f"{self.api_url}/admin/login",
                json=login_data,
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code == 200:
                result = response.json()
                self.token = result.get('token')
                self.session.headers.update({
                    'Authorization': f'Bearer {self.token}'
                })
                self.log("✅ 管理員登入成功")
                return True
            else:
                self.log(f"❌ 登入失敗: {response.status_code} - {response.text}", "ERROR")
                return False
                
        except Exception as e:
            self.log(f"❌ 登入異常: {str(e)}", "ERROR")
            return False
    
    def test_system_settings(self):
        """測試系統設置"""
        self.log("🔧 測試系統設置...")
        
        settings_data = {
            "site_title": self.company_info["name"],
            "site_logo_url": self.ocean_logo,
            "site_favicon_url": self.whale_logo,
            "free_shipping_threshold": "1000",
            "show_product_reviews": "true",
            "show_product_preview": "true"
        }
        
        try:
            response = self.session.put(
                f"{self.api_url}/settings",
                json=settings_data,
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code == 200:
                self.log("✅ 系統設置更新成功")
                self.log(f"   📝 網站標題: {settings_data['site_title']}")
                self.log(f"   🖼️ 網站Logo: {settings_data['site_logo_url']}")
                self.log(f"   🎯 Favicon: {settings_data['site_favicon_url']}")
                return True
            else:
                self.log(f"❌ 系統設置失敗: {response.status_code} - {response.text}", "ERROR")
                return False
                
        except Exception as e:
            self.log(f"❌ 系統設置異常: {str(e)}", "ERROR")
            return False
    
    def test_footer_settings(self):
        """測試頁腳設置"""
        self.log("🦶 測試頁腳設置...")
        
        footer_settings = [
            {
                "section": "company_info",
                "title": self.company_info["name"],
                "content": self.company_info["description"],
                "image_url": self.ocean_logo,
                "display_order": 1,
                "is_active": True
            },
            {
                "section": "copyright",
                "content": self.company_info["copyright"],
                "display_order": 10,
                "is_active": True
            }
        ]
        
        try:
            response = self.session.post(
                f"{self.api_url}/footer/batch-update",
                json={"settings": footer_settings},
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code == 200:
                self.log("✅ 頁腳設置更新成功")
                self.log(f"   🏢 公司名稱: {self.company_info['name']}")
                self.log(f"   📄 版權資訊: {self.company_info['copyright']}")
                return True
            else:
                self.log(f"❌ 頁腳設置失敗: {response.status_code} - {response.text}", "ERROR")
                return False
                
        except Exception as e:
            self.log(f"❌ 頁腳設置異常: {str(e)}", "ERROR")
            return False
    
    def test_categories(self):
        """測試產品分類"""
        self.log("🏷️ 測試產品分類創建...")
        
        categories = [
            {
                "name": "海洋系列電子煙",
                "slug": "ocean-series",
                "description": "深海靈感設計的高端電子煙產品",
                "image_url": self.ocean_logo,
                "is_active": True,
                "display_order": 1
            },
            {
                "name": "鯨魚限定款",
                "slug": "whale-limited",
                "description": "鯨魚主題限定版電子煙系列",
                "image_url": self.whale_logo,
                "is_active": True,
                "display_order": 2
            },
            {
                "name": "國際精選",
                "slug": "international-select",
                "description": "國際頂級品牌精選產品",
                "image_url": self.ocean_logo,
                "is_active": True,
                "display_order": 3
            }
        ]
        
        success_count = 0
        for category in categories:
            try:
                response = self.session.post(
                    f"{self.api_url}/categories",
                    json=category,
                    headers={"Content-Type": "application/json"}
                )
                
                if response.status_code == 201:
                    success_count += 1
                    self.log(f"   ✅ 分類創建成功: {category['name']}")
                else:
                    self.log(f"   ❌ 分類創建失敗: {category['name']} - {response.status_code}")
                    
            except Exception as e:
                self.log(f"   ❌ 分類創建異常: {category['name']} - {str(e)}", "ERROR")
        
        self.log(f"✅ 產品分類創建完成: {success_count}/{len(categories)}")
        return success_count == len(categories)
    
    def test_products(self):
        """測試產品管理"""
        self.log("📦 測試產品創建...")
        
        products = [
            {
                "name": "海量 Ocean Pro 電子煙主機",
                "category_id": 1,
                "price": 2980,
                "description": "採用深海藍設計理念，融合海洋元素的高端電子煙主機。具備智能溫控、長效續航等頂級功能。",
                "image_url": self.ocean_logo,
                "stock": 50,
                "is_featured": True,
                "is_active": True
            },
            {
                "name": "鯨魚限定版 Whale Special 煙彈",
                "category_id": 2,
                "price": 580,
                "description": "鯨魚主題限定版煙彈，獨特的海洋風味調配，帶來前所未有的味覺體驗。",
                "image_url": self.whale_logo,
                "stock": 100,
                "is_featured": True,
                "is_active": True
            },
            {
                "name": "海量國際 精選套裝",
                "category_id": 3,
                "price": 4580,
                "description": "海量國際精心打造的豪華套裝，包含主機、多種口味煙彈及專業配件。",
                "image_url": self.ocean_logo,
                "stock": 25,
                "is_featured": True,
                "is_active": True
            }
        ]
        
        success_count = 0
        for product in products:
            try:
                response = self.session.post(
                    f"{self.api_url}/products",
                    json=product,
                    headers={"Content-Type": "application/json"}
                )
                
                if response.status_code == 201:
                    success_count += 1
                    self.log(f"   ✅ 產品創建成功: {product['name']}")
                else:
                    self.log(f"   ❌ 產品創建失敗: {product['name']} - {response.status_code}")
                    
            except Exception as e:
                self.log(f"   ❌ 產品創建異常: {product['name']} - {str(e)}", "ERROR")
        
        self.log(f"✅ 產品創建完成: {success_count}/{len(products)}")
        return success_count == len(products)
    
    def test_homepage_settings(self):
        """測試首頁設置"""
        self.log("🏠 測試首頁設置...")
        
        homepage_settings = [
            {
                "section": "hero",
                "title": "海量國際 - 深海品質體驗",
                "content": "探索來自深海的純淨品質，體驗如海洋般深邃的電子煙科技。海量國際為您帶來最專業的產品與服務。",
                "image_url": self.ocean_logo,
                "display_order": 1,
                "is_active": True
            },
            {
                "section": "featured_products",
                "title": "精選推薦",
                "content": "海洋系列與鯨魚限定版，頂級工藝與創新設計的完美融合",
                "image_url": self.whale_logo,
                "display_order": 2,
                "is_active": True
            },
            {
                "section": "brand_story",
                "title": "品牌故事",
                "content": "海量國際，卉田國際旗下子公司，專注於為全球用戶提供高品質電子煙產品。我們將海洋的純淨與深邃融入每一件產品中。",
                "image_url": self.ocean_logo,
                "display_order": 3,
                "is_active": True
            }
        ]
        
        success_count = 0
        for setting in homepage_settings:
            try:
                response = self.session.put(
                    f"{self.api_url}/homepage/{setting['section']}",
                    json=setting,
                    headers={"Content-Type": "application/json"}
                )
                
                if response.status_code == 200:
                    success_count += 1
                    self.log(f"   ✅ 首頁區塊更新成功: {setting['section']}")
                else:
                    self.log(f"   ❌ 首頁區塊更新失敗: {setting['section']} - {response.status_code}")
                    
            except Exception as e:
                self.log(f"   ❌ 首頁區塊更新異常: {setting['section']} - {str(e)}", "ERROR")
        
        self.log(f"✅ 首頁設置完成: {success_count}/{len(homepage_settings)}")
        return success_count == len(homepage_settings)
    
    def test_announcements(self):
        """測試公告管理"""
        self.log("📢 測試公告創建...")
        
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
        
        success_count = 0
        for announcement in announcements:
            try:
                response = self.session.post(
                    f"{self.api_url}/announcements",
                    json=announcement,
                    headers={"Content-Type": "application/json"}
                )
                
                if response.status_code == 201:
                    success_count += 1
                    self.log(f"   ✅ 公告創建成功: {announcement['title']}")
                else:
                    self.log(f"   ❌ 公告創建失敗: {announcement['title']} - {response.status_code}")
                    
            except Exception as e:
                self.log(f"   ❌ 公告創建異常: {announcement['title']} - {str(e)}", "ERROR")
        
        self.log(f"✅ 公告創建完成: {success_count}/{len(announcements)}")
        return success_count == len(announcements)
    
    def test_coupons(self):
        """測試優惠券管理"""
        self.log("🎫 測試優惠券創建...")
        
        # 計算日期
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
            },
            {
                "code": "INTERNATIONAL",
                "type": "percentage",
                "value": 20,
                "min_amount": 3000,
                "max_uses": 30,
                "description": "國際精選系列VIP折扣20%",
                "start_date": tomorrow,
                "end_date": next_month,
                "is_active": True
            }
        ]
        
        success_count = 0
        for coupon in coupons:
            try:
                response = self.session.post(
                    f"{self.api_url}/coupons",
                    json=coupon,
                    headers={"Content-Type": "application/json"}
                )
                
                if response.status_code == 201:
                    success_count += 1
                    self.log(f"   ✅ 優惠券創建成功: {coupon['code']}")
                else:
                    self.log(f"   ❌ 優惠券創建失敗: {coupon['code']} - {response.status_code}")
                    
            except Exception as e:
                self.log(f"   ❌ 優惠券創建異常: {coupon['code']} - {str(e)}", "ERROR")
        
        self.log(f"✅ 優惠券創建完成: {success_count}/{len(coupons)}")
        return success_count == len(coupons)
    
    def verify_frontend(self):
        """驗證前台顯示"""
        self.log("🌐 驗證前台顯示...")
        
        # 檢查首頁
        try:
            response = self.session.get(self.base_url)
            if response.status_code == 200:
                self.log("   ✅ 首頁訪問正常")
            else:
                self.log(f"   ❌ 首頁訪問失敗: {response.status_code}")
        except Exception as e:
            self.log(f"   ❌ 首頁訪問異常: {str(e)}", "ERROR")
        
        # 檢查API端點
        endpoints = [
            "/api/settings/public",
            "/api/footer",
            "/api/categories",
            "/api/products",
            "/api/announcements"
        ]
        
        for endpoint in endpoints:
            try:
                response = self.session.get(f"{self.base_url}{endpoint}")
                if response.status_code == 200:
                    self.log(f"   ✅ API端點正常: {endpoint}")
                else:
                    self.log(f"   ❌ API端點失敗: {endpoint} - {response.status_code}")
            except Exception as e:
                self.log(f"   ❌ API端點異常: {endpoint} - {str(e)}", "ERROR")
    
    def run_full_test(self):
        """執行完整測試"""
        self.log("🚀 開始海量國際後台功能全面測試")
        self.log(f"🌐 目標網站: {self.base_url}")
        self.log("=" * 60)
        
        # 測試步驟
        steps = [
            ("登入管理員", self.admin_login),
            ("系統設置測試", self.test_system_settings),
            ("頁腳設置測試", self.test_footer_settings),
            ("產品分類測試", self.test_categories),
            ("產品管理測試", self.test_products),
            ("首頁設置測試", self.test_homepage_settings),
            ("公告管理測試", self.test_announcements),
            ("優惠券管理測試", self.test_coupons),
            ("前台驗證測試", self.verify_frontend)
        ]
        
        success_count = 0
        total_steps = len(steps)
        
        for step_name, step_func in steps:
            self.log(f"\n📋 執行步驟: {step_name}")
            try:
                if step_func():
                    success_count += 1
                    self.log(f"✅ {step_name} - 成功")
                else:
                    self.log(f"❌ {step_name} - 失敗", "ERROR")
                
                # 步驟間隔
                time.sleep(1)
                
            except Exception as e:
                self.log(f"❌ {step_name} - 異常: {str(e)}", "ERROR")
        
        # 測試結果統計
        self.log("\n" + "=" * 60)
        self.log("🎯 測試結果統計")
        self.log(f"✅ 成功步驟: {success_count}/{total_steps}")
        self.log(f"📊 成功率: {(success_count/total_steps)*100:.1f}%")
        
        if success_count == total_steps:
            self.log("🎉 所有功能測試完成！海量國際網站已準備就緒")
            self.log("🌊 使用海洋主題logo和鯨魚favicon")
            self.log("🏢 公司資訊已更新為卉田國際旗下海量國際")
            self.log("🚀 現在可以訪問 https://hazosp2p.top 查看實際效果")
        else:
            self.log("⚠️ 部分功能測試失敗，請檢查錯誤日誌", "WARNING")
        
        return success_count == total_steps

def main():
    """主函數"""
    print("🌊 海量國際電子煙商城後台功能自動化測試")
    print("=" * 60)
    
    tester = HazoAdminTester()
    success = tester.run_full_test()
    
    if success:
        print("\n🎊 測試完成！網站已使用海洋主題配置")
        print("📱 建議手動驗證:")
        print("   • 訪問 https://hazosp2p.top 檢查首頁")
        print("   • 檢查Header logo和Favicon")
        print("   • 檢查商品分類和產品顯示")
        print("   • 檢查頁腳公司資訊")
    else:
        print("\n⚠️ 測試中有部分失敗，請查看日誌")
    
    return success

if __name__ == "__main__":
    main()