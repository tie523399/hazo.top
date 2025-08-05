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
  Boxes
} from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { adminAPI, categoriesAPI, homepageAPI, getDashboardStats, getImages } from "@/lib/api";
import { useAdminStore, Product } from '@/lib/store';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// 導入拆分的組件
import AdminDashboard from '@/components/admin/AdminDashboard';
import ProductManagement from '@/components/admin/ProductManagement';
import CategoryManagement from '@/components/admin/CategoryManagement';
import CouponManagement from '@/components/admin/CouponManagement';
import AnnouncementManagement from '@/components/admin/AnnouncementManagement';
import HomepageManagement from '@/components/admin/HomepageManagement';
import SystemSettings from '@/components/admin/SystemSettings';
import UserManagement from '@/components/admin/UserManagement';

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

  // --- Data Fetching & Auth ---
  const fetchAllData = useCallback(async () => {
    setLoading(true);
    try {
      const [stats, imgs, prods, coups, ancs, adms, sets, cats, homes] = await Promise.all([
        getDashboardStats(), 
        getImages(), 
        adminAPI.getProducts({ limit: 1000 }),
        adminAPI.getCoupons(), 
        adminAPI.getAnnouncements(), 
        adminAPI.getAdmins(), 
        adminAPI.getSettings(),
        categoriesAPI.getAllCategories(), 
        homepageAPI.getAllSettings()
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
    } catch (err: any) {
      console.error('載入資料失敗:', err);
      if (err.response?.status === 401) { 
        logout(); 
        navigate('/admin'); 
      }
    } finally { 
      setLoading(false); 
    }
  }, [logout, navigate]);
  
  // --- Effects ---
  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      adminAPI.verify().then(() => setAuthenticated(true)).catch(() => logout());
    } else { 
      setLoading(false); 
    }
  }, [setAuthenticated, logout]);

  useEffect(() => { 
    if (isAuthenticated) fetchAllData(); 
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
        <TabsList className="grid w-full grid-cols-9">
          <TabsTrigger value="dashboard">
            <Package className="mr-2 h-4 w-4"/>儀表板
          </TabsTrigger>
          <TabsTrigger value="homepage">
            <Home className="mr-2 h-4 w-4"/>首頁
          </TabsTrigger>
          <TabsTrigger value="products">
            <Boxes className="mr-2 h-4 w-4"/>產品
          </TabsTrigger>
          <TabsTrigger value="categories">
            <ChevronRight className="mr-2 h-4 w-4"/>分類
          </TabsTrigger>
          <TabsTrigger value="variants">
            <Wrench className="mr-2 h-4 w-4"/>變體
          </TabsTrigger>
          <TabsTrigger value="coupons">
            <Ticket className="mr-2 h-4 w-4"/>優惠券
          </TabsTrigger>
          <TabsTrigger value="announcements">
            <Siren className="mr-2 h-4 w-4"/>公告
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings className="mr-2 h-4 w-4"/>設置
          </TabsTrigger>
          <TabsTrigger value="admins">
            <KeyRound className="mr-2 h-4 w-4"/>管理員
          </TabsTrigger>
        </TabsList>
        
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