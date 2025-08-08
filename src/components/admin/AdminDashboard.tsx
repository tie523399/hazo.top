import React, { useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Copy, Loader2, Package, Boxes, Gift, MessageSquare, Upload, Trash2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { uploadImage, getImages, deleteImage } from "@/lib/api";

// 類型定義
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

interface AdminDashboardProps {
  dashboardData: DashboardData | null;
  images: ImageFile[];
  uploading: boolean;
  setUploading: (uploading: boolean) => void;
  onRefreshImages: () => Promise<void>;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({
  dashboardData,
  images,
  uploading,
  setUploading,
  onRefreshImages
}) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 圖片上傳處理
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const data = await uploadImage(file);
      toast({ title: "上傳成功", description: data.filePath });
      
      // 使用統一的圖片刷新函數
      await onRefreshImages();
      console.log('📷 使用統一函數刷新圖片列表');
    } catch (err: any) {
      console.error('圖片上傳失敗:', err);
      toast({ title: '上傳失敗', description: err.message, variant: 'destructive' });
    } finally {
      setUploading(false);
      // 清除文件輸入，避免重複上傳
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // 複製路徑處理
  const handleCopyPath = (path: string) => {
    navigator.clipboard.writeText(path);
    toast({ title: "路徑已複製" });
  };

  // 刪除圖片處理
  const handleDeleteImage = async (filename: string) => {
    if (!confirm(`確定要刪除圖片 "${filename}" 嗎？`)) return;
    try {
      await deleteImage(filename);
      toast({ title: "刪除成功", description: `圖片 ${filename} 已刪除` });
      
      // 使用統一的圖片刷新函數
      await onRefreshImages();
      console.log('📷 使用統一函數刷新圖片列表');
    } catch (err: any) {
      console.error('圖片刪除失敗:', err);
      toast({ title: '刪除失敗', description: err.message, variant: 'destructive' });
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-8">
        {/* 數據總覽卡片 */}
        <Card>
          <CardHeader>
            <CardTitle>數據總覽</CardTitle>
          </CardHeader>
          <CardContent>
            {dashboardData?.stats && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                {[
                  {
                    icon: Package,
                    label: '總產品數',
                    value: dashboardData.stats.totalProducts,
                    color: 'text-primary'
                  },
                  {
                    icon: Boxes,
                    label: '上架中產品',
                    value: dashboardData.stats.activeProducts,
                    color: 'text-green-500'
                  },
                  {
                    icon: Gift,
                    label: '優惠券',
                    value: dashboardData.stats.totalCoupons,
                    color: 'text-blue-500'
                  },
                  {
                    icon: MessageSquare,
                    label: '公告',
                    value: dashboardData.stats.totalAnnouncements,
                    color: 'text-yellow-500'
                  },
                ].map(item => (
                  <div key={item.label} className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                    <item.icon className={`mx-auto h-8 w-8 ${item.color}`} />
                    <p className="mt-2 text-2xl font-bold">{item.value}</p>
                    <p className="text-sm text-muted-foreground">{item.label}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 分類和品牌統計 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>各分類產品數</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {Array.isArray(dashboardData?.categoryStats) && 
                  dashboardData.categoryStats.map(cat => (
                    <li key={cat.category} className="flex justify-between items-center">
                      <span className="capitalize">{cat.category}</span>
                      <Badge variant="secondary">{cat.count}</Badge>
                    </li>
                  ))
                }
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>各品牌產品數</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {Array.isArray(dashboardData?.brandStats) && 
                  dashboardData.brandStats.map(brand => (
                    <li key={brand.brand} className="flex justify-between items-center">
                      <span>{brand.brand}</span>
                      <Badge variant="secondary">{brand.count}</Badge>
                    </li>
                  ))
                }
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 圖片管理側邊欄 */}
      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>圖片管理</CardTitle>
            <CardDescription>上傳新圖片至 /public/images/</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                className="hidden"
                disabled={uploading}
              />
              <Button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                {uploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    上傳中...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    選擇圖片
                  </>
                )}
              </Button>
            </div>

            <h3 className="font-medium my-4">現有圖片列表</h3>
            <ScrollArea className="h-96 w-full rounded-md border">
              <div className="p-4">
                {(Array.isArray(images) ? images : []).map((img, index) => (
                  <div key={`${img.name}-${index}`} className="flex items-center gap-3 p-2 rounded-md border hover:bg-muted mb-2">
                    {/* 操作按鈕 */}
                    <div className="flex gap-1 flex-shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopyPath(img.path)}
                        title="複製路徑"
                        className="h-8 w-8 p-0"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteImage(img.name)}
                        className="text-destructive hover:text-destructive h-8 w-8 p-0"
                        title="刪除圖片"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>

                    {/* 圖片預覽 */}
                    <div className="flex-shrink-0">
                      <img
                        src={img.path}
                        alt={img.name}
                        className="w-12 h-12 object-cover rounded-md border"
                        onError={(e) => {
                          e.currentTarget.src = '/images/whale-logo.png';
                        }}
                      />
                    </div>

                    {/* 圖片信息 */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-mono truncate" title={img.name}>
                        {img.name}
                      </p>
                      <p className="text-xs text-muted-foreground truncate" title={img.path}>
                        {img.path}
                      </p>
                      {img.size && (
                        <p className="text-xs text-muted-foreground">
                          {(img.size / 1024).toFixed(1)} KB
                          {img.created && ` • ${new Date(img.created).toLocaleDateString()}`}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
                {images.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    暫無圖片
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;