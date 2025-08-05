#!/usr/bin/env python3
"""
海量國際電子煙商城 - 深度功能測試與用戶體驗測試
全面測試後台管理功能和前台用戶體驗
"""

import requests
import json
import time
import random
from datetime import datetime, timedelta
from urllib.parse import urljoin, urlparse

class DeepTester:
    def __init__(self):
        self.base_url = "https://hazosp2p.top"
        self.api_url = f"{self.base_url}/api"
        self.session = requests.Session()
        self.admin_session = requests.Session()
        self.token = None
        
        # 測試統計
        self.total_tests = 0
        self.passed_tests = 0
        self.failed_tests = 0
        self.warnings = 0
        
        # 測試結果收集
        self.test_results = []
        
    def log(self, message, level="INFO", test_name=""):
        """增強的日誌功能"""
        timestamp = datetime.now().strftime("%H:%M:%S")
        icon = {"INFO": "ℹ️", "SUCCESS": "✅", "WARNING": "⚠️", "ERROR": "❌", "TEST": "🧪"}
        
        print(f"[{timestamp}] {icon.get(level, '📝')} {message}")
        
        if test_name:
            self.test_results.append({
                "test": test_name,
                "status": level,
                "message": message,
                "timestamp": timestamp
            })
    
    def run_test(self, test_name, test_func, *args, **kwargs):
        """統一的測試運行器"""
        self.total_tests += 1
        self.log(f"開始測試: {test_name}", "TEST", test_name)
        
        try:
            result = test_func(*args, **kwargs)
            if result:
                self.passed_tests += 1
                self.log(f"✅ {test_name} - 通過", "SUCCESS", test_name)
            else:
                self.failed_tests += 1
                self.log(f"❌ {test_name} - 失敗", "ERROR", test_name)
            return result
        except Exception as e:
            self.failed_tests += 1
            self.log(f"❌ {test_name} - 異常: {str(e)}", "ERROR", test_name)
            return False
    
    def admin_login(self):
        """管理員登入測試"""
        login_data = {"username": "admin", "password": "admin123"}
        
        response = self.admin_session.post(
            f"{self.api_url}/admin/login",
            json=login_data,
            timeout=15
        )
        
        if response.status_code == 200:
            result = response.json()
            self.token = result.get('token')
            self.admin_session.headers.update({
                'Authorization': f'Bearer {self.token}',
                'Content-Type': 'application/json'
            })
            return True
        return False
    
    def test_admin_dashboard(self):
        """測試管理儀表板功能"""
        try:
            # 測試儀表板數據獲取
            response = self.admin_session.get(f"{self.api_url}/admin/dashboard", timeout=10)
            if response.status_code != 200:
                return False
                
            dashboard_data = response.json()
            
            # 檢查必要的統計數據
            required_fields = ['totalProducts', 'totalOrders', 'totalUsers', 'totalRevenue']
            for field in required_fields:
                if field not in dashboard_data:
                    self.log(f"儀表板缺少字段: {field}", "WARNING")
                    self.warnings += 1
            
            self.log(f"儀表板數據完整性: {len([f for f in required_fields if f in dashboard_data])}/{len(required_fields)}")
            return True
        except:
            return False
    
    def test_category_management(self):
        """深度測試分類管理"""
        test_category = {
            "name": "測試分類_" + str(int(time.time())),
            "slug": f"test-category-{int(time.time())}",
            "description": "這是一個測試分類，用於驗證分類管理功能",
            "image_url": "/images/ocean-logo.gif",
            "is_active": True,
            "display_order": 999
        }
        
        # 1. 創建分類
        response = self.admin_session.post(f"{self.api_url}/categories", json=test_category, timeout=10)
        if response.status_code != 201:
            return False
        
        category_data = response.json()
        category_id = category_data.get('id')
        
        # 2. 讀取分類
        response = self.admin_session.get(f"{self.api_url}/categories/{category_id}", timeout=10)
        if response.status_code != 200:
            return False
        
        # 3. 更新分類
        update_data = {**test_category, "name": test_category["name"] + "_更新"}
        response = self.admin_session.put(f"{self.api_url}/categories/{category_id}", json=update_data, timeout=10)
        if response.status_code != 200:
            return False
        
        # 4. 檢查前台分類顯示
        response = self.session.get(f"{self.api_url}/categories", timeout=10)
        if response.status_code == 200:
            categories = response.json()
            found = any(cat.get('id') == category_id for cat in categories)
            if not found:
                self.log("前台分類同步可能有延遲", "WARNING")
                self.warnings += 1
        
        # 5. 刪除測試分類
        response = self.admin_session.delete(f"{self.api_url}/categories/{category_id}", timeout=10)
        return response.status_code == 200
    
    def test_product_management(self):
        """深度測試產品管理"""
        # 先獲取分類列表
        response = self.admin_session.get(f"{self.api_url}/categories", timeout=10)
        if response.status_code != 200:
            return False
        
        categories = response.json()
        if not categories:
            self.log("沒有可用分類，跳過產品測試", "WARNING")
            return True
        
        category_id = categories[0].get('id', 1)
        
        test_product = {
            "name": f"測試產品_{int(time.time())}",
            "category_id": category_id,
            "price": 1999,
            "description": "這是一個用於深度測試的產品，包含完整的產品資訊和規格說明。支持多種配置選項。",
            "image_url": "/images/ocean-logo.gif",
            "stock": 100,
            "is_featured": True,
            "is_active": True,
            "sku": f"TEST-{int(time.time())}",
            "weight": 0.5,
            "dimensions": "10x5x3cm"
        }
        
        # 1. 創建產品
        response = self.admin_session.post(f"{self.api_url}/products", json=test_product, timeout=10)
        if response.status_code != 201:
            self.log(f"產品創建失敗: {response.status_code}", "ERROR")
            return False
        
        product_data = response.json()
        product_id = product_data.get('id')
        
        # 2. 測試產品詳情獲取
        response = self.admin_session.get(f"{self.api_url}/products/{product_id}", timeout=10)
        if response.status_code != 200:
            return False
        
        # 3. 測試產品更新
        update_data = {**test_product, "price": 2499, "stock": 80}
        response = self.admin_session.put(f"{self.api_url}/products/{product_id}", json=update_data, timeout=10)
        if response.status_code != 200:
            return False
        
        # 4. 測試庫存更新
        stock_update = {"stock": 50, "operation": "set"}
        response = self.admin_session.put(f"{self.api_url}/products/{product_id}/stock", json=stock_update, timeout=10)
        
        # 5. 檢查前台產品顯示
        response = self.session.get(f"{self.api_url}/products", timeout=10)
        if response.status_code == 200:
            products = response.json()
            found = any(prod.get('id') == product_id for prod in products.get('products', []))
            if not found:
                self.log("前台產品同步可能有延遲", "WARNING")
                self.warnings += 1
        
        # 6. 清理測試產品
        response = self.admin_session.delete(f"{self.api_url}/products/{product_id}", timeout=10)
        return response.status_code == 200
    
    def test_coupon_system(self):
        """深度測試優惠券系統"""
        tomorrow = (datetime.now() + timedelta(days=1)).isoformat()
        next_month = (datetime.now() + timedelta(days=30)).isoformat()
        
        test_coupons = [
            {
                "code": f"TEST_{int(time.time())}",
                "type": "percentage",
                "value": 10,
                "min_amount": 500,
                "max_uses": 10,
                "description": "測試百分比優惠券",
                "start_date": tomorrow,
                "end_date": next_month,
                "is_active": True
            },
            {
                "code": f"FIXED_{int(time.time())}",
                "type": "fixed",
                "value": 100,
                "min_amount": 1000,
                "max_uses": 5,
                "description": "測試固定金額優惠券",
                "start_date": tomorrow,
                "end_date": next_month,
                "is_active": True
            }
        ]
        
        created_coupons = []
        
        for coupon in test_coupons:
            # 1. 創建優惠券
            response = self.admin_session.post(f"{self.api_url}/coupons", json=coupon, timeout=10)
            if response.status_code != 201:
                continue
            
            coupon_data = response.json()
            coupon_id = coupon_data.get('id')
            created_coupons.append(coupon_id)
            
            # 2. 測試優惠券驗證 (前台功能)
            validation_data = {
                "code": coupon["code"],
                "amount": coupon["min_amount"] + 100
            }
            response = self.session.post(f"{self.api_url}/coupons/validate", json=validation_data, timeout=10)
            
            # 3. 測試優惠券更新
            update_data = {**coupon, "max_uses": coupon["max_uses"] + 5}
            response = self.admin_session.put(f"{self.api_url}/coupons/{coupon_id}", json=update_data, timeout=10)
        
        # 清理測試優惠券
        for coupon_id in created_coupons:
            self.admin_session.delete(f"{self.api_url}/coupons/{coupon_id}", timeout=10)
        
        return len(created_coupons) > 0
    
    def test_announcement_system(self):
        """測試公告系統"""
        test_announcement = {
            "title": f"測試公告_{int(time.time())}",
            "content": "這是一個測試公告，用於驗證公告系統的功能完整性。支持富文本內容和多種顯示模式。",
            "type": "info",
            "is_active": True,
            "priority": 1
        }
        
        # 1. 創建公告
        response = self.admin_session.post(f"{self.api_url}/announcements", json=test_announcement, timeout=10)
        if response.status_code != 201:
            return False
        
        announcement_data = response.json()
        announcement_id = announcement_data.get('id')
        
        # 2. 檢查前台公告顯示
        response = self.session.get(f"{self.api_url}/announcements", timeout=10)
        if response.status_code == 200:
            announcements = response.json()
            found = any(ann.get('id') == announcement_id for ann in announcements)
            if not found:
                self.log("前台公告顯示可能有問題", "WARNING")
                self.warnings += 1
        
        # 3. 更新公告
        update_data = {**test_announcement, "type": "promotion"}
        response = self.admin_session.put(f"{self.api_url}/announcements/{announcement_id}", json=update_data, timeout=10)
        
        # 4. 清理測試公告
        response = self.admin_session.delete(f"{self.api_url}/announcements/{announcement_id}", timeout=10)
        return response.status_code == 200
    
    def test_homepage_management(self):
        """測試首頁管理功能"""
        # 獲取現有首頁設置
        response = self.admin_session.get(f"{self.api_url}/homepage", timeout=10)
        if response.status_code != 200:
            return False
        
        original_settings = response.json()
        
        # 測試更新首頁設置
        test_settings = [
            {
                "section": "hero",
                "title": "深度測試標題",
                "content": "這是用於深度測試的首頁橫幅內容，測試系統的更新和回滾功能。",
                "image_url": "/images/ocean-logo.gif",
                "display_order": 1,
                "is_active": True
            }
        ]
        
        success = True
        for setting in test_settings:
            response = self.admin_session.put(f"{self.api_url}/homepage/{setting['section']}", json=setting, timeout=10)
            if response.status_code != 200:
                success = False
        
        # 檢查前台首頁變更
        time.sleep(2)  # 等待緩存更新
        response = self.session.get(self.base_url, timeout=10)
        if response.status_code == 200:
            content = response.text
            if "深度測試標題" not in content:
                self.log("首頁內容更新可能有延遲", "WARNING")
                self.warnings += 1
        
        # 恢復原始設置
        for setting in original_settings:
            if setting.get('section') == 'hero':
                self.admin_session.put(f"{self.api_url}/homepage/{setting['section']}", json=setting, timeout=10)
        
        return success
    
    def test_frontend_user_experience(self):
        """深度測試前台用戶體驗"""
        tests_passed = 0
        total_frontend_tests = 0
        
        # 1. 首頁加載測試
        total_frontend_tests += 1
        start_time = time.time()
        response = self.session.get(self.base_url, timeout=15)
        load_time = time.time() - start_time
        
        if response.status_code == 200:
            tests_passed += 1
            self.log(f"首頁加載時間: {load_time:.2f}秒")
            if load_time > 3:
                self.log("首頁加載時間較長，可能影響用戶體驗", "WARNING")
                self.warnings += 1
        
        # 2. 產品頁面測試
        total_frontend_tests += 1
        response = self.session.get(f"{self.base_url}/products", timeout=15)
        if response.status_code == 200:
            tests_passed += 1
            content = response.text
            
            # 檢查關鍵元素
            if "海洋系列" in content or "鯨魚限定" in content:
                self.log("產品頁面包含測試分類")
            else:
                self.log("產品頁面可能缺少測試內容", "WARNING")
                self.warnings += 1
        
        # 3. 商品搜索功能測試
        total_frontend_tests += 1
        search_response = self.session.get(f"{self.api_url}/products?search=海量", timeout=10)
        if search_response.status_code == 200:
            tests_passed += 1
            search_results = search_response.json()
            self.log(f"搜索結果數量: {len(search_results.get('products', []))}")
        
        # 4. 分類篩選測試
        total_frontend_tests += 1
        categories_response = self.session.get(f"{self.api_url}/categories", timeout=10)
        if categories_response.status_code == 200:
            tests_passed += 1
            categories = categories_response.json()
            
            # 測試每個分類的產品獲取
            for category in categories[:3]:  # 只測試前3個分類
                cat_response = self.session.get(f"{self.api_url}/products?category={category.get('slug')}", timeout=10)
                if cat_response.status_code != 200:
                    self.log(f"分類 {category.get('name')} 產品獲取失敗", "WARNING")
                    self.warnings += 1
        
        # 5. 購物車功能測試
        total_frontend_tests += 1
        cart_test_data = {
            "product_id": 1,
            "quantity": 2,
            "variant_id": None
        }
        
        # 測試添加到購物車
        cart_response = self.session.post(f"{self.api_url}/cart/add", json=cart_test_data, timeout=10)
        if cart_response.status_code in [200, 201]:
            tests_passed += 1
            
            # 測試購物車內容獲取
            cart_get_response = self.session.get(f"{self.api_url}/cart", timeout=10)
            if cart_get_response.status_code == 200:
                cart_data = cart_get_response.json()
                self.log(f"購物車商品數量: {len(cart_data.get('items', []))}")
        
        # 6. 響應式設計測試 (模擬移動端)
        total_frontend_tests += 1
        mobile_headers = {
            'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15'
        }
        mobile_response = self.session.get(self.base_url, headers=mobile_headers, timeout=10)
        if mobile_response.status_code == 200:
            tests_passed += 1
            self.log("移動端訪問正常")
        
        return tests_passed == total_frontend_tests
    
    def test_performance_metrics(self):
        """性能指標測試"""
        endpoints = [
            ("/", "首頁"),
            ("/products", "商品頁"),
            ("/api/products", "產品API"),
            ("/api/categories", "分類API"),
            ("/api/announcements", "公告API")
        ]
        
        performance_results = []
        
        for endpoint, name in endpoints:
            start_time = time.time()
            try:
                response = self.session.get(f"{self.base_url}{endpoint}", timeout=10)
                load_time = time.time() - start_time
                
                performance_results.append({
                    "endpoint": name,
                    "load_time": load_time,
                    "status": response.status_code,
                    "size": len(response.content) if response.status_code == 200 else 0
                })
                
                if load_time > 2:
                    self.log(f"{name} 響應時間較慢: {load_time:.2f}秒", "WARNING")
                    self.warnings += 1
                else:
                    self.log(f"{name} 響應時間: {load_time:.2f}秒")
                    
            except Exception as e:
                performance_results.append({
                    "endpoint": name,
                    "load_time": 999,
                    "status": 0,
                    "error": str(e)
                })
        
        # 計算平均響應時間
        valid_times = [r["load_time"] for r in performance_results if r["load_time"] < 10]
        if valid_times:
            avg_time = sum(valid_times) / len(valid_times)
            self.log(f"平均響應時間: {avg_time:.2f}秒")
            
            if avg_time > 1.5:
                self.log("整體響應時間可以優化", "WARNING")
                self.warnings += 1
        
        return True
    
    def test_error_handling(self):
        """錯誤處理測試"""
        error_tests = [
            # 測試不存在的端點
            ("/api/nonexistent", 404),
            # 測試無效的產品ID
            ("/api/products/99999", 404),
            # 測試無效的分類ID
            ("/api/categories/99999", 404),
        ]
        
        error_handling_score = 0
        
        for endpoint, expected_status in error_tests:
            try:
                response = self.session.get(f"{self.base_url}{endpoint}", timeout=5)
                if response.status_code == expected_status:
                    error_handling_score += 1
                    self.log(f"錯誤處理正確: {endpoint} -> {response.status_code}")
                else:
                    self.log(f"錯誤處理異常: {endpoint} 期望 {expected_status}, 得到 {response.status_code}", "WARNING")
                    self.warnings += 1
            except:
                pass
        
        return error_handling_score > 0
    
    def test_data_consistency(self):
        """數據一致性測試"""
        # 檢查前台和後台數據一致性
        
        # 1. 產品數據一致性
        frontend_products = self.session.get(f"{self.api_url}/products", timeout=10)
        backend_products = self.admin_session.get(f"{self.api_url}/admin/products", timeout=10)
        
        consistency_score = 0
        
        if frontend_products.status_code == 200 and backend_products.status_code == 200:
            frontend_data = frontend_products.json()
            backend_data = backend_products.json()
            
            frontend_count = len(frontend_data.get('products', []))
            backend_count = len(backend_data.get('products', []))
            
            if frontend_count <= backend_count:  # 前台可能過濾掉非活躍產品
                consistency_score += 1
                self.log(f"產品數據一致性: 前台 {frontend_count}, 後台 {backend_count}")
            else:
                self.log(f"產品數據不一致: 前台 {frontend_count}, 後台 {backend_count}", "WARNING")
                self.warnings += 1
        
        # 2. 分類數據一致性
        frontend_categories = self.session.get(f"{self.api_url}/categories", timeout=10)
        backend_categories = self.admin_session.get(f"{self.api_url}/admin/categories", timeout=10)
        
        if frontend_categories.status_code == 200 and backend_categories.status_code == 200:
            frontend_cats = frontend_categories.json()
            backend_cats = backend_categories.json()
            
            if len(frontend_cats) <= len(backend_cats):
                consistency_score += 1
                self.log(f"分類數據一致性: 前台 {len(frontend_cats)}, 後台 {len(backend_cats)}")
            else:
                self.log(f"分類數據不一致", "WARNING")
                self.warnings += 1
        
        return consistency_score > 0
    
    def generate_report(self):
        """生成詳細測試報告"""
        print("\n" + "="*60)
        print("🌊 海量國際電子煙商城 - 深度測試報告")
        print("="*60)
        
        # 整體統計
        success_rate = (self.passed_tests / self.total_tests * 100) if self.total_tests > 0 else 0
        print(f"\n📊 測試統計:")
        print(f"   總測試數: {self.total_tests}")
        print(f"   通過測試: {self.passed_tests}")
        print(f"   失敗測試: {self.failed_tests}")
        print(f"   警告數量: {self.warnings}")
        print(f"   成功率: {success_rate:.1f}%")
        
        # 功能評估
        print(f"\n🎯 功能評估:")
        if success_rate >= 90:
            print("   ✅ 優秀 - 系統功能完備，用戶體驗良好")
        elif success_rate >= 80:
            print("   ✅ 良好 - 主要功能正常，有少量改進空間")
        elif success_rate >= 70:
            print("   ⚠️ 一般 - 基本功能可用，建議優化")
        else:
            print("   ❌ 需要改進 - 存在較多問題，需要修復")
        
        # 分類結果
        categories = {
            "後台管理": 0,
            "前台用戶體驗": 0,
            "性能表現": 0,
            "數據一致性": 0
        }
        
        for result in self.test_results:
            if "管理" in result["test"] or "後台" in result["test"]:
                categories["後台管理"] += 1 if result["status"] == "SUCCESS" else 0
            elif "前台" in result["test"] or "用戶" in result["test"]:
                categories["前台用戶體驗"] += 1 if result["status"] == "SUCCESS" else 0
            elif "性能" in result["test"]:
                categories["性能表現"] += 1 if result["status"] == "SUCCESS" else 0
            elif "一致性" in result["test"]:
                categories["數據一致性"] += 1 if result["status"] == "SUCCESS" else 0
        
        print(f"\n📋 功能分類評估:")
        for category, score in categories.items():
            print(f"   {category}: {'✅' if score > 0 else '⚠️'}")
        
        # 建議
        print(f"\n💡 優化建議:")
        if self.warnings > 0:
            print(f"   • 處理 {self.warnings} 個警告項目")
        if success_rate < 100:
            print(f"   • 修復失敗的測試項目")
        print(f"   • 定期進行深度測試")
        print(f"   • 監控性能指標")
        
        print(f"\n🚀 測試完成時間: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print("="*60)
    
    def run_deep_test(self):
        """執行深度測試"""
        print("🌊 海量國際電子煙商城 - 深度功能與用戶體驗測試")
        print("="*60)
        print("🎯 測試範圍: 後台管理 + 前台體驗 + 性能 + 數據一致性")
        print("⏰ 預計時間: 5-10分鐘")
        print("-"*60)
        
        # 第一階段：基礎連接測試
        self.log("🔗 第一階段：基礎連接測試", "INFO")
        
        if not self.run_test("網站基礎連接", lambda: self.session.get(self.base_url, timeout=10).status_code == 200):
            self.log("基礎連接失敗，終止測試", "ERROR")
            return False
        
        if not self.run_test("管理員登入", self.admin_login):
            self.log("管理員登入失敗，跳過後台測試", "WARNING")
            self.warnings += 1
        
        # 第二階段：後台管理功能深度測試
        self.log("\n🔧 第二階段：後台管理功能深度測試", "INFO")
        
        backend_tests = [
            ("管理儀表板", self.test_admin_dashboard),
            ("分類管理功能", self.test_category_management),
            ("產品管理功能", self.test_product_management),
            ("優惠券系統", self.test_coupon_system),
            ("公告系統", self.test_announcement_system),
            ("首頁管理", self.test_homepage_management)
        ]
        
        for test_name, test_func in backend_tests:
            self.run_test(test_name, test_func)
            time.sleep(0.5)  # 避免請求過於頻繁
        
        # 第三階段：前台用戶體驗測試
        self.log("\n👥 第三階段：前台用戶體驗測試", "INFO")
        
        self.run_test("前台用戶體驗", self.test_frontend_user_experience)
        
        # 第四階段：性能與穩定性測試
        self.log("\n⚡ 第四階段：性能與穩定性測試", "INFO")
        
        self.run_test("性能指標測試", self.test_performance_metrics)
        self.run_test("錯誤處理測試", self.test_error_handling)
        self.run_test("數據一致性測試", self.test_data_consistency)
        
        # 生成測試報告
        self.generate_report()
        
        return True

def main():
    """主函數"""
    tester = DeepTester()
    
    try:
        start_time = time.time()
        success = tester.run_deep_test()
        end_time = time.time()
        
        print(f"\n⏱️ 總測試時間: {end_time - start_time:.1f} 秒")
        
        if success:
            print("\n🎊 深度測試完成！")
            print("📱 建議手動驗證以下功能:")
            print("   • 管理後台的下拉選單界面")
            print("   • 商品搜索和篩選功能")
            print("   • 購物車和結帳流程")
            print("   • 移動端響應式設計")
            print("   • 圖片加載和顯示效果")
        else:
            print("\n⚠️ 測試中發現問題，請查看詳細日誌")
        
        print(f"\n🌐 測試網站: {tester.base_url}")
        print(f"🔧 管理後台: {tester.base_url}/admin")
        print("👤 登入: admin / admin123")
        
    except KeyboardInterrupt:
        print("\n\n⏹️ 測試被用戶中斷")
    except Exception as e:
        print(f"\n❌ 測試過程中發生異常: {str(e)}")

if __name__ == "__main__":
    main()