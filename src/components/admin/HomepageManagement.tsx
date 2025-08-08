import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Upload, Plus, Trash2, Edit } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { homepageAPI, uploadImage, getImages, categoriesAPI } from "@/lib/api";

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

interface Feature {
  icon: string;
  title: string;
  description: string;
  gradient: string;
  delay: string;
}

interface HomepageManagementProps {
  homepageSettings: HomepageSetting[];
  images: ImageFile[];
  uploading: boolean;
  setUploading: (uploading: boolean) => void;
  onFetchData: () => void;
  onRefreshImages: () => Promise<void>;
}

const HomepageManagement: React.FC<HomepageManagementProps> = ({
  homepageSettings,
  images,
  uploading,
  setUploading,
  onFetchData,
  onRefreshImages
}) => {
  const { toast } = useToast();
  const homepageFileInputRef = useRef<HTMLInputElement>(null);
  
  // 首頁設置表單狀態
  const [editingHomepage, setEditingHomepage] = useState<string>('hero');
  const [homepageForm, setHomepageForm] = useState<Partial<HomepageSetting>>({});
  const [featuresData, setFeaturesData] = useState<Feature[]>([]);

  // 當選擇的編輯區塊改變時更新表單
  useEffect(() => {
    const setting = homepageSettings.find(s => s.section === editingHomepage);
    if (setting) {
      setHomepageForm(setting);
      
      // 如果是特色功能區塊，解析 JSON 內容
      if (setting.section === 'features' && setting.content) {
        try {
          const features = JSON.parse(setting.content);
          setFeaturesData(Array.isArray(features) ? features : []);
        } catch (error) {
          console.error('解析特色功能 JSON 失敗:', error);
          setFeaturesData([]);
        }
      } else {
        setFeaturesData([]);
      }
    } else {
      setHomepageForm({ section: editingHomepage, is_active: true, display_order: 0 });
      setFeaturesData([]);
    }
  }, [editingHomepage, homepageSettings]);

  // 首頁圖片上傳處理
  const handleHomepageImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploading(true);
    try {
      const data = await uploadImage(file);
      setHomepageForm(prev => ({...prev, image_url: data.filePath}));
      toast({ title: "上傳成功", description: "圖片已設置到首頁" });
      
      // 使用統一的圖片刷新函數
      await onRefreshImages();
      console.log('📷 使用統一函數刷新圖片列表');
    } catch (err: any) {
      console.error('首頁圖片上傳失敗:', err);
      toast({ title: '上傳失敗', description: err.message, variant: 'destructive' });
    } finally {
      setUploading(false);
      // 清除文件輸入，避免重複上傳
      if (homepageFileInputRef.current) {
        homepageFileInputRef.current.value = '';
      }
    }
  };

  // 更新首頁設置
  const handleHomepageUpdate = async () => {
    try {
      let updateData = { ...homepageForm };
      
      // 如果是特色功能區塊，將 featuresData 轉換為 JSON
      if (editingHomepage === 'features') {
        updateData.content = JSON.stringify(featuresData);
      }
      
      await homepageAPI.updateSection(editingHomepage, updateData);
      toast({ title: '首頁設置已更新' });
      onFetchData();
    } catch (error: any) {
      toast({ title: '更新失敗', description: error.message, variant: 'destructive' });
    }
  };

  // 添加新特色功能
  const addFeature = () => {
    const newFeature: Feature = {
      icon: 'Star',
      title: '新特色',
      description: '描述新特色功能',
      gradient: 'from-blue-400 to-purple-500',
      delay: '0ms'
    };
    setFeaturesData([...featuresData, newFeature]);
  };

  // 刪除特色功能
  const removeFeature = (index: number) => {
    setFeaturesData(featuresData.filter((_, i) => i !== index));
  };

  // 更新特色功能
  const updateFeature = (index: number, field: keyof Feature, value: string) => {
    const updated = [...featuresData];
    updated[index] = { ...updated[index], [field]: value };
    setFeaturesData(updated);
  };

  // 獲取區塊中文名稱
  const getSectionName = (section: string) => {
    const names: Record<string, string> = {
      'hero': '主輪播圖',
      'hero_main': '首頁主圖',
      'hero1': '產品系列1',
      'hero2': '產品系列2',
      'features': '特色功能'
    };
    return names[section] || section;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* 隱藏的文件輸入 */}
      <input
        type="file"
        ref={homepageFileInputRef}
        className="hidden"
        accept="image/*"
        onChange={handleHomepageImageUpload}
      />

      {/* 左側：編輯表單 */}
      <div className="lg:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle>首頁內容管理</CardTitle>
            <CardDescription>管理首頁的所有內容區塊</CardDescription>
          </CardHeader>
          <CardContent>
            {/* 區塊選擇器 */}
            <div className="mb-6">
              <Label>選擇編輯區塊</Label>
              <Select value={editingHomepage} onValueChange={setEditingHomepage}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hero_main">🖼️ 首頁主圖</SelectItem>
                  <SelectItem value="hero">🎯 主輪播圖</SelectItem>
                  <SelectItem value="hero1">📱 產品系列1</SelectItem>
                  <SelectItem value="hero2">📱 產品系列2</SelectItem>
                  <SelectItem value="features">⭐ 特色功能</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* 通用編輯表單 */}
            {editingHomepage !== 'features' && (
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
                      <Upload className="mr-2 h-4 w-4" />選擇
                    </Button>
                  </div>
                  {homepageForm.image_url && (
                    <img 
                      src={homepageForm.image_url} 
                      alt="預覽" 
                      className="mt-2 h-32 object-cover rounded border w-full" 
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
                
                {editingHomepage !== 'hero_main' && (
                  <>
                    <div>
                      <Label>按鈕文字</Label>
                      <Input 
                        value={homepageForm.button_text || ''} 
                        onChange={(e) => setHomepageForm({...homepageForm, button_text: e.target.value})} 
                        placeholder="如：探索產品" 
                      />
                    </div>
                    
                    <div>
                      <Label>按鈕連結</Label>
                      <Input 
                        value={homepageForm.button_link || ''} 
                        onChange={(e) => setHomepageForm({...homepageForm, button_link: e.target.value})} 
                        placeholder="如：/products" 
                      />
                    </div>
                  </>
                )}
                
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={homepageForm.is_active || false}
                    onCheckedChange={(checked) => setHomepageForm({...homepageForm, is_active: checked})}
                  />
                  <Label>啟用此區塊</Label>
                </div>
              </div>
            )}

            {/* 特色功能編輯器 */}
            {editingHomepage === 'features' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-lg font-semibold">特色功能列表</Label>
                  <Button size="sm" onClick={addFeature}>
                    <Plus className="h-4 w-4 mr-1" />
                    添加特色
                  </Button>
                </div>
                
                {featuresData.map((feature, index) => (
                  <Card key={index} className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <Label className="font-medium">特色功能 {index + 1}</Label>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => removeFeature(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="grid gap-3">
                      <div>
                        <Label>圖標名稱</Label>
                        <Input
                          value={feature.icon}
                          onChange={(e) => updateFeature(index, 'icon', e.target.value)}
                          placeholder="如：Zap, Shield, Truck"
                        />
                      </div>
                      
                      <div>
                        <Label>標題</Label>
                        <Input
                          value={feature.title}
                          onChange={(e) => updateFeature(index, 'title', e.target.value)}
                          placeholder="功能標題"
                        />
                      </div>
                      
                      <div>
                        <Label>描述</Label>
                        <Textarea
                          value={feature.description}
                          onChange={(e) => updateFeature(index, 'description', e.target.value)}
                          placeholder="功能描述"
                          rows={2}
                        />
                      </div>
                      
                      <div>
                        <Label>漸變樣式</Label>
                        <Input
                          value={feature.gradient}
                          onChange={(e) => updateFeature(index, 'gradient', e.target.value)}
                          placeholder="如：from-blue-400 to-purple-500"
                        />
                      </div>
                    </div>
                  </Card>
                ))}
                
                <div className="flex items-center space-x-2 mt-4">
                  <Switch
                    checked={homepageForm.is_active || false}
                    onCheckedChange={(checked) => setHomepageForm({...homepageForm, is_active: checked})}
                  />
                  <Label>啟用特色功能區塊</Label>
                </div>
              </div>
            )}
            
            <div className="flex gap-2 mt-6">
              <Button onClick={handleHomepageUpdate} className="flex-1">
                保存設置
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 右側：預覽和現有設置 */}
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>首頁內容概覽</CardTitle>
            <CardDescription>當前首頁所有區塊的設置狀態</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {homepageSettings
                .sort((a, b) => a.display_order - b.display_order)
                .map((setting) => (
                <Card key={setting.section} className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold">{getSectionName(setting.section)}</h4>
                      <p className="text-sm text-gray-600">{setting.title}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`h-2 w-2 rounded-full ${
                        setting.is_active ? 'bg-green-500' : 'bg-gray-400'
                      }`} />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingHomepage(setting.section)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  {setting.image_url && (
                    <img
                      src={setting.image_url}
                      alt={setting.title}
                      className="mt-2 h-20 object-cover rounded border w-full"
                    />
                  )}
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HomepageManagement;