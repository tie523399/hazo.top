import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Package,
  Loader2,
  LogOut,
  Settings,
  Ticket,
  Eye,
  EyeOff,
  Siren,        
  Wrench,
  KeyRound,
  ChevronRight,
  Home,
  Boxes,
  ChevronDown,
  FileText,
  ShoppingBag,
  Tag,
  Globe,
  Users,
  Megaphone
} from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { adminAPI, categoriesAPI, homepageAPI, pageContentsAPI, getDashboardStats, getImages } from "@/lib/api";
import { useAdminStore, Product } from '@/lib/store';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';

// 導入拆分的組件
import AdminDashboard from '@/components/admin/AdminDashboard';
import ProductManagement from '@/components/admin/ProductManagement';
import CategoryManagement from '@/components/admin/CategoryManagement';
import CouponManagement from '@/components/admin/CouponManagement';
import AnnouncementManagement from '@/components/admin/AnnouncementManagement';
import HomepageManagement from '@/components/admin/HomepageManagement';
import FooterManagement from '@/components/admin/FooterManagement';
import SystemSettings from '@/components/admin/SystemSettings';
import UserManagement from '@/components/admin/UserManagement';
import PageContentManagement from '@/components/admin/PageContentManagement';

// --- Type Definitions ---
interface DashboardStats { 
  totalProducts: number; 
  totalCoupons: number; 
  totalAnnouncements: number; 
  activeProducts: number; 
}

interface CategoryStat { 
  category: string; 
  count: number; 
}

interface BrandStat { 
  brand: string; 
  count: number; 
}

interface DashboardData { 
  stats: DashboardStats; 
  categoryStats: CategoryStat[]; 
  brandStats: BrandStat[]; 
}

interface ImageFile { 
  name: string; 
  path: string; 
}

interface Variant { 
  id: number; 
  product_id: number; 
  variant_type: string; 
  variant_value: string; 
  stock: number; 
  price_modifier: number; 
}

interface Coupon { 
  id: number; 
  code: string; 
  type: 'percentage' | 'fixed'; 
  value: number; 
  min_amount: number; 
  expires_at: string; 
  is_active: boolean; 
}

interface Announcement { 
  id: number; 
  title: string; 
  content: string; 
  type: 'info' | 'warning' | 'promotion'; 
  is_active: boolean; 
}

interface AdminUser { 
  id: number; 
  username: string; 
  created_at: string; 
}

interface Category { 
  id: number; 
  name: string; 
  slug: string; 
  description?: string; 
  display_order: number; 
  is_active: boolean; 
  created_at: string; 
  updated_at: string; 
}

interface HomepageSetting { 
  id?: number; 
  section: string; 
  image_url?: string; 
  title?: string; 
  subtitle?: string; 
  content?: string; 
  button_text?: string; 
  button_link?: string; 
  display_order: number; 
  is_active: boolean; 
}

const AdminPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAuthenticated, admin, setAuthenticated, logout } = useAdminStore();
  
  // --- State ---
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // 共享數據狀態
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [images, setImages] = useState<ImageFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [selectedProductIdForVariant, setSelectedProductIdForVariant] = useState<number | null>(null);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [settings, setSettings] = useState<any>({});
  const [settingsForm, setSettingsForm] = useState<any>({});
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [homepageSettings, setHomepageSettings] = useState<HomepageSetting[]>([]);
  const [pageContents, setPageContents] = useState<any[]>([]);

  // --- Data Fetching & Auth ---
  const fetchAllData = useCallback(async () => {
    // 再次確認認證狀態
    const token = localStorage.getItem('admin_token');
    if (!token || !isAuthenticated) {
      console.log('⚠️ 未認證，停止載入數據');
      setLoading(false);
      return;
    }
    
    // 防止重複請求
    if (loading) {
      console.log('⏳ 數據正在載入中，跳過重複請求');
      return;
    }
    
    setLoading(true);
    console.log('📊 開始載入管理面板數據...');
    try {
      const [stats, imgs, prods, coups, ancs, adms, sets, cats, homes, pageContentList] = await Promise.all([
        getDashboardStats(), 
        getImages(), 
        adminAPI.getProducts({ limit: 1000 }),
        adminAPI.getCoupons(), 
        adminAPI.getAnnouncements(), 
        adminAPI.getAdmins(), 
        adminAPI.getSettings(),
        categoriesAPI.getAllCategories(), 
        homepageAPI.getAllSettings(),
        pageContentsAPI.getAllPageContents()
      ]);
      
      setDashboardData(stats || {});
      setImages(imgs?.success && Array.isArray(imgs?.images) ? imgs.images : []);
      setProducts(Array.isArray(prods?.data?.products) ? prods.data.products : Array.isArray(prods?.data) ? prods.data : []);
      setCoupons(Array.isArray(coups?.data) ? coups.data : []);
      setAnnouncements(Array.isArray(ancs?.data) ? ancs.data : []);
      setAdmins(Array.isArray(adms?.data) ? adms.data : []);
      setSettings(sets?.data || {});
      setSettingsForm(sets?.data && typeof sets.data === 'object' 
        ? Object.entries(sets.data).reduce((acc, [key, val]:[string, any]) => 
            ({ ...acc, [key]: val?.value !== undefined ? val.value : '' }), {})
        : {}
      );
      setCategories(Array.isArray(cats?.data) ? cats.data : []);
      setHomepageSettings(Array.isArray(homes?.data) ? homes.data : []);
      console.log('🔍 PageContentList 原始數據:', pageContentList);
      const finalPageContents = Array.isArray(pageContentList?.data) ? pageContentList.data : Array.isArray(pageContentList) ? pageContentList : [];
      console.log('🔍 PageContents 最終數據:', finalPageContents);
      setPageContents(finalPageContents);
    } catch (err: any) {
      console.error('載入資料失敗:', err);
      if (err.response?.status === 401) { 
        console.log('⚠️ 管理面板載入時收到401，登出用戶');
        logout(); 
        // 不再強制重新導航，避免循環
      } else {
        // 其他錯誤的處理
        console.error('非認證錯誤:', err.message);
      }
    } finally { 
      setLoading(false); 
    }
  }, [logout, navigate, isAuthenticated, loading]);
  
  // --- Effects ---
  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    console.log('🔍 檢查管理員token:', token ? '存在' : '不存在');
    
    if (token) {
      console.log('🔐 驗證管理員token...');
      adminAPI.verify()
        .then(() => {
          console.log('✅ 管理員token驗證成功');
          setAuthenticated(true);
        })
        .catch((error) => {
          console.log('❌ 管理員token驗證失敗:', error);
          logout();
        });
    } else { 
      console.log('ℹ️ 無管理員token，顯示登錄頁面');
      setLoading(false); 
    }
  }, [setAuthenticated, logout]);

  useEffect(() => { 
    if (isAuthenticated) {
      console.log('🚀 管理員已認證，開始載入數據...');
      fetchAllData();
    }
  }, [isAuthenticated, fetchAllData]);
  
  // --- Handlers ---
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); 
    setLoading(true);
    try {
      const res = await adminAPI.login({ username, password });
      localStorage.setItem('admin_token', res.data.token);
      setAuthenticated(true); 
      navigate('/admin');
    } catch (error: any) {
      console.error('登入錯誤:', error);
      setLoginError(error.response?.data?.error || error.message || '用戶名或密碼錯誤');
    } finally { 
      setLoading(false); 
    }
  };
  
  const handleLogout = () => { 
    logout(); 
    localStorage.removeItem('admin_token'); 
    navigate('/'); 
  };
  
  // 變體獲取函數（傳遞給子組件）
  const handleFetchVariants = async (productId: number) => {
    setSelectedProductIdForVariant(productId);
    try {
      const res = await adminAPI.getProductVariants(productId);
      setVariants(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      toast({ title: '載入變體失敗', variant: 'destructive' });
    }
  };
  // --- Render ---
  if (loading && !isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin" />
      </div>
  );
  }
  
  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle className="text-2xl">管理員登入</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">用戶名</Label>
                    <Input 
                  id="username" 
                  value={username} 
                  onChange={(e) => setUsername(e.target.value)} 
                  required 
                />
              </div>
              <div className="space-y-2 relative">
                <Label htmlFor="password">密碼</Label>
                <Input 
                  id="password" 
                  type={showPassword ? 'text' : 'password'} 
                  required 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                />
                <Button 
                  variant="ghost" 
                  size="icon" 
                  type="button" 
                  className="absolute top-6 right-1 h-7 w-7" 
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "隱藏密碼" : "顯示密碼"}
                  title={showPassword ? "隱藏密碼" : "顯示密碼"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              {loginError && <p className="text-sm text-red-500">{loginError}</p>}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                登入
              </Button>
          </form>
          </CardContent>
        </Card>
    </div>
  );
  }

  return (
    <div className="container mx-auto p-4 md:p-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">管理後台</h1>
        <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">歡迎, {admin?.username}</span>
          <Button type="button" variant="outline" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />登出
          </Button>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        {/* 下拉選單導航欄 */}
        <div className="flex flex-wrap gap-2 sm:gap-4 p-3 sm:p-4 bg-white border rounded-lg shadow-sm mb-6">
          {/* 儀表板 */}
          <Button
            variant={activeTab === 'dashboard' ? 'default' : 'outline'}
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
            size="sm"
          >
            <Package className="h-4 w-4" />
            儀表板
          </Button>

          {/* 內容管理 */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant={['homepage', 'footer', 'page-contents', 'announcements'].includes(activeTab) ? 'default' : 'outline'}
                className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
                size="sm"
              >
                <FileText className="h-4 w-4" />
                內容管理
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setActiveTab('homepage')}>
                <Home className="mr-2 h-4 w-4" />
                首頁管理
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setActiveTab('footer')}>
                <Globe className="mr-2 h-4 w-4" />
                頁腳管理
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setActiveTab('page-contents')}>
                <FileText className="mr-2 h-4 w-4" />
                頁面內容
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setActiveTab('announcements')}>
                <Megaphone className="mr-2 h-4 w-4" />
                公告管理
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* 商品管理 */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant={['products', 'categories', 'variants'].includes(activeTab) ? 'default' : 'outline'}
                className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
                size="sm"
              >
                <ShoppingBag className="h-4 w-4" />
                商品管理
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setActiveTab('products')}>
                <Boxes className="mr-2 h-4 w-4" />
                商品管理
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setActiveTab('categories')}>
                <Tag className="mr-2 h-4 w-4" />
                分類管理
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setActiveTab('variants')}>
                <Wrench className="mr-2 h-4 w-4" />
                變體管理
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* 營銷工具 */}
          <Button
            variant={activeTab === 'coupons' ? 'default' : 'outline'}
            onClick={() => setActiveTab('coupons')}
            className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
            size="sm"
          >
            <Ticket className="h-4 w-4" />
            優惠券
          </Button>

          {/* 系統管理 */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant={['settings', 'admins'].includes(activeTab) ? 'default' : 'outline'}
                className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
                size="sm"
              >
                <Settings className="h-4 w-4" />
                系統管理
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setActiveTab('settings')}>
                <Settings className="mr-2 h-4 w-4" />
                系統設置
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setActiveTab('admins')}>
                <Users className="mr-2 h-4 w-4" />
                管理員
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* 當前頁面標題 */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {activeTab === 'dashboard' && '📊 管理儀表板'}
            {activeTab === 'homepage' && '🏠 首頁內容管理'}
            {activeTab === 'footer' && '🦶 頁腳內容管理'}
            {activeTab === 'products' && '📦 商品管理'}
            {activeTab === 'categories' && '🏷️ 分類管理'}
            {activeTab === 'variants' && '🔧 變體管理'}
            {activeTab === 'coupons' && '🎫 優惠券管理'}
            {activeTab === 'announcements' && '📢 公告管理'}
            {activeTab === 'settings' && '⚙️ 系統設置'}
            {activeTab === 'page-contents' && '📄 頁面內容管理'}
            {activeTab === 'admins' && '👥 管理員管理'}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {activeTab === 'dashboard' && '查看網站整體運營數據和統計信息'}
            {activeTab === 'homepage' && '管理首頁的輪播圖、推薦商品和各區塊內容'}
            {activeTab === 'footer' && '設置網站頁腳的公司信息、功能特色和聯絡方式'}
            {activeTab === 'products' && '新增、編輯和管理商品資訊、圖片和規格'}
            {activeTab === 'categories' && '管理商品分類的層級結構和顯示設置'}
            {activeTab === 'variants' && '設置商品的不同規格選項和價格差異'}
            {activeTab === 'coupons' && '創建和管理優惠券、折扣碼和促銷活動'}
            {activeTab === 'announcements' && '發布網站公告和重要通知信息'}
            {activeTab === 'settings' && '配置系統參數、支付設置和網站基本信息'}
            {activeTab === 'page-contents' && '管理靜態頁面內容，如關於我們、服務條款等'}
            {activeTab === 'admins' && '管理後台用戶權限和帳號設置'}
          </p>
        </div>
        
        <TabsContent value="dashboard" className="mt-6">
          <AdminDashboard
            dashboardData={dashboardData}
            images={images}
            setImages={setImages}
            uploading={uploading}
            setUploading={setUploading}
          />
        </TabsContent>
        
        <TabsContent value="homepage" className="mt-6">
          <HomepageManagement
            homepageSettings={homepageSettings}
            images={images}
            setImages={setImages}
            uploading={uploading}
            setUploading={setUploading}
            onFetchData={fetchAllData}
          />
        </TabsContent>

        <TabsContent value="footer" className="mt-6">
          <FooterManagement
            images={images}
            setImages={setImages}
            uploading={uploading}
            setUploading={setUploading}
          />
        </TabsContent>
        
        <TabsContent value="products" className="mt-6">
          <ProductManagement
            products={products}
            categories={categories}
            variants={variants}
            selectedProductIdForVariant={selectedProductIdForVariant}
            onFetchData={fetchAllData}
            onFetchVariants={handleFetchVariants}
            onSetActiveTab={setActiveTab}
          />
        </TabsContent>
        
        <TabsContent value="categories" className="mt-6">
          <CategoryManagement
            categories={categories}
            onFetchData={fetchAllData}
          />
        </TabsContent>
        
        <TabsContent value="variants" className="mt-6">
          <ProductManagement
            products={products}
            categories={categories}
            variants={variants}
            selectedProductIdForVariant={selectedProductIdForVariant}
            onFetchData={fetchAllData}
            onFetchVariants={handleFetchVariants}
            onSetActiveTab={setActiveTab}
          />
        </TabsContent>
        
        <TabsContent value="coupons" className="mt-6">
          <CouponManagement
            coupons={coupons}
            onFetchData={fetchAllData}
          />
        </TabsContent>
        
        <TabsContent value="announcements" className="mt-6">
          <AnnouncementManagement
            announcements={announcements}
            onFetchData={fetchAllData}
          />
        </TabsContent>
        
        <TabsContent value="settings" className="mt-6">
          <SystemSettings
            settings={settings}
            settingsForm={settingsForm}
            setSettingsForm={setSettingsForm}
            onFetchData={fetchAllData}
          />
        </TabsContent>
        
        <TabsContent value="page-contents" className="mt-6">
          <PageContentManagement
            pageContents={pageContents}
            onFetchData={fetchAllData}
          />
        </TabsContent>
        
        <TabsContent value="admins" className="mt-6">
          <UserManagement
            admins={admins}
            currentAdmin={admin}
            onFetchData={fetchAllData}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPage; 