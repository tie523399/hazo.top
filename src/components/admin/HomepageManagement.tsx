import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Upload } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { homepageAPI, uploadImage, getImages } from "@/lib/api";

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

interface ImageFile {
  name: string;
  path: string;
}

interface HomepageManagementProps {
  homepageSettings: HomepageSetting[];
  images: ImageFile[];
  setImages: (images: ImageFile[]) => void;
  uploading: boolean;
  setUploading: (uploading: boolean) => void;
  onFetchData: () => void;
}

const HomepageManagement: React.FC<HomepageManagementProps> = ({
  homepageSettings,
  images,
  setImages,
  uploading,
  setUploading,
  onFetchData
}) => {
  const { toast } = useToast();
  const homepageFileInputRef = useRef<HTMLInputElement>(null);
  
  // 首頁設置表單狀態
  const [editingHomepage, setEditingHomepage] = useState<string>('hero');
  const [homepageForm, setHomepageForm] = useState<Partial<HomepageSetting>>({});

  // 當選擇的編輯區塊改變時更新表單
  useEffect(() => {
    const setting = homepageSettings.find(s => s.section === editingHomepage);
    if (setting) {
      setHomepageForm(setting);
    } else {
      setHomepageForm({ section: editingHomepage, is_active: true, display_order: 0 });
    }
  }, [editingHomepage, homepageSettings]);

  // 首頁圖片上傳處理
  const handleHomepageImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploading(true);
    try {
      const data = await uploadImage(file);
      // 自動設置圖片路徑到首頁表單中
      setHomepageForm(prev => ({...prev, image_url: data.filePath}));
      toast({ title: "上傳成功", description: "圖片已設置到首頁" });
      const imgs = await getImages();
      setImages(imgs?.success && Array.isArray(imgs?.images) ? imgs.images : []);
    } catch (err: any) {
      toast({ title: '上傳失敗', description: err.message, variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  // 更新首頁設置
  const handleHomepageUpdate = async () => {
    try {
      await homepageAPI.updateSection(editingHomepage, homepageForm);
      toast({ title: '首頁設置已更新' });
      onFetchData();
    } catch (error: any) {
      toast({ title: '更新失敗', description: error.message, variant: 'destructive' });
    }
  };

  // 重置區塊
  const handleResetSection = async (section: string) => {
    if (!window.confirm(`確定要重置 ${section} 區塊為默認設置嗎？`)) return;
    try {
      await homepageAPI.resetSection(section);
      toast({ title: '已重置為默認設置' });
      onFetchData();
    } catch (error: any) {
      toast({ title: '重置失敗', description: error.message, variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>首頁內容管理</CardTitle>
          <CardDescription>自定義首頁的圖片、標題和文字內容</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* 區塊選擇 */}
            <div>
              <Label>選擇編輯區塊</Label>
              <Select value={editingHomepage} onValueChange={setEditingHomepage}>
                <SelectTrigger>
                  <SelectValue placeholder="選擇要編輯的區塊" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hero">Hero 主區塊（含按鈕）</SelectItem>
                  <SelectItem value="hero1">Hero1 副區塊（無按鈕）</SelectItem>
                  <SelectItem value="hero2">Hero2 副區塊（無按鈕）</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* 編輯表單 */}
            <div className="grid gap-4">
              <div>
                <Label>圖片 URL</Label>
                <div className="flex gap-2">
                  <Input 
                    value={homepageForm.image_url || ''} 
                    onChange={(e) => setHomepageForm({...homepageForm, image_url: e.target.value})} 
                    placeholder="/images/your-image.jpg" 
                  />
                  <Button type="button" variant="outline" onClick={() => homepageFileInputRef.current?.click()}>
                    <Upload className="mr-2 h-4 w-4" />選擇圖片
                  </Button>
                </div>
                {homepageForm.image_url && (
                  <img 
                    src={homepageForm.image_url} 
                    alt="預覽" 
                    className="mt-2 h-32 object-cover rounded border" 
                  />
                )}
              </div>
              
              <div>
                <Label>標題</Label>
                <Input 
                  value={homepageForm.title || ''} 
                  onChange={(e) => setHomepageForm({...homepageForm, title: e.target.value})} 
                  placeholder="輸入標題" 
                />
              </div>
              
              <div>
                <Label>副標題</Label>
                <Input 
                  value={homepageForm.subtitle || ''} 
                  onChange={(e) => setHomepageForm({...homepageForm, subtitle: e.target.value})} 
                  placeholder="輸入副標題" 
                />
              </div>
              
              <div>
                <Label>內容</Label>
                <Textarea 
                  value={homepageForm.content || ''} 
                  onChange={(e) => setHomepageForm({...homepageForm, content: e.target.value})} 
                  placeholder="輸入內容文字" 
                  rows={4}
                />
              </div>
              
              {/* 主區塊專用按鈕設置 */}
              {editingHomepage === 'hero' && (
                <>
                  <div>
                    <Label>按鈕文字</Label>
                    <Input 
                      value={homepageForm.button_text || ''} 
                      onChange={(e) => setHomepageForm({...homepageForm, button_text: e.target.value})} 
                      placeholder="探索產品" 
                    />
                  </div>
                  
                  <div>
                    <Label>按鈕連結</Label>
                    <Input 
                      value={homepageForm.button_link || ''} 
                      onChange={(e) => setHomepageForm({...homepageForm, button_link: e.target.value})} 
                      placeholder="/products" 
                    />
                  </div>
                </>
              )}
              
              <div className="flex items-center space-x-2">
                <Switch 
                  checked={homepageForm.is_active !== false} 
                  onCheckedChange={(checked) => setHomepageForm({...homepageForm, is_active: checked})} 
                />
                <Label>啟用此區塊</Label>
              </div>
            </div>
            
            {/* 操作按鈕 */}
            <div className="flex gap-2">
              <Button type="button" onClick={handleHomepageUpdate}>保存設置</Button>
              <Button type="button" variant="outline" onClick={() => handleResetSection(editingHomepage)}>
                重置為默認
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* 隱藏的文件輸入元素用於首頁圖片上傳 */}
      <input 
        type="file" 
        ref={homepageFileInputRef} 
        onChange={handleHomepageImageUpload} 
        accept="image/*" 
        className="hidden" 
        disabled={uploading}
      />
    </div>
  );
};

export default HomepageManagement;