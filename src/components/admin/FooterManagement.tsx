import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Upload, Plus, Trash2, Edit, Eye, EyeOff } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { footerAPI, uploadImage, getImages } from "@/lib/api";

interface FooterSetting {
  id?: number;
  section: string;
  title?: string;
  content?: string;
  link_url?: string;
  image_url?: string;
  icon_name?: string;
  display_order: number;
  is_active: boolean;
}

interface ImageFile {
  name: string;
  path: string;
}

interface FooterManagementProps {
  images: ImageFile[];
  setImages: (images: ImageFile[]) => void;
  uploading: boolean;
  setUploading: (uploading: boolean) => void;
}

const FooterManagement: React.FC<FooterManagementProps> = ({
  images,
  setImages,
  uploading,
  setUploading
}) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // 狀態管理
  const [footerSettings, setFooterSettings] = useState<FooterSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingSection, setEditingSection] = useState<string>('');
  const [formData, setFormData] = useState<Partial<FooterSetting>>({});
  const [isCreating, setIsCreating] = useState(false);

  // 可用的圖標列表
  const availableIcons = [
    'Shield', 'Clock', 'Phone', 'Mail', 'MapPin', 'Facebook', 
    'Twitter', 'Instagram', 'Youtube', 'Linkedin', 'Star',
    'Heart', 'Award', 'Truck', 'CreditCard', 'Lock'
  ];

  // 預設區段類型
  const sectionTypes = [
    { value: 'company_info', label: '公司資訊' },
    { value: 'feature_1', label: '特色功能1' },
    { value: 'feature_2', label: '特色功能2' },
    { value: 'social_facebook', label: 'Facebook' },
    { value: 'social_twitter', label: 'Twitter' },
    { value: 'social_instagram', label: 'Instagram' },
    { value: 'contact_phone', label: '聯絡電話' },
    { value: 'contact_email', label: '電子郵箱' },
    { value: 'contact_address', label: '聯絡地址' },
    { value: 'business_hours', label: '營業時間' },
    { value: 'copyright', label: '版權資訊' },
    { value: 'age_notice', label: '年齡提醒' }
  ];

  // 載入頁腳設置
  const fetchFooterSettings = async () => {
    try {
      setLoading(true);
      const response = await footerAPI.getAllSettingsAdmin();
      setFooterSettings(response.data || []);
    } catch (error: any) {
      toast({ title: '載入失敗', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFooterSettings();
  }, []);

  // 選擇編輯區段時更新表單
  useEffect(() => {
    if (editingSection && !isCreating) {
      const setting = footerSettings.find(s => s.section === editingSection);
      if (setting) {
        setFormData(setting);
      } else {
        setFormData({ section: editingSection, is_active: true, display_order: 0 });
      }
    }
  }, [editingSection, footerSettings, isCreating]);

  // 開始創建新設置
  const startCreating = () => {
    setIsCreating(true);
    setEditingSection('');
    setFormData({ 
      section: '',
      title: '',
      content: '',
      link_url: '',
      image_url: '',
      icon_name: '',
      display_order: footerSettings.length,
      is_active: true 
    });
  };

  // 取消編輯
  const cancelEdit = () => {
    setIsCreating(false);
    setEditingSection('');
    setFormData({});
  };

  // 圖片上傳處理
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploading(true);
    try {
      const data = await uploadImage(file);
      setFormData(prev => ({...prev, image_url: data.filePath}));
      toast({ title: "上傳成功", description: "圖片已設置" });
      const imgs = await getImages();
      setImages(imgs?.success && Array.isArray(imgs?.images) ? imgs.images : []);
    } catch (err: any) {
      toast({ title: '上傳失敗', description: err.message, variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  // 保存設置
  const handleSave = async () => {
    try {
      if (!formData.section) {
        toast({ title: '錯誤', description: '請選擇或輸入區段名稱', variant: 'destructive' });
        return;
      }

      if (isCreating) {
        await footerAPI.createSetting(formData);
        toast({ title: '創建成功', description: '頁腳設置已創建' });
      } else {
        await footerAPI.updateSection(formData.section, formData);
        toast({ title: '更新成功', description: '頁腳設置已更新' });
      }
      
      fetchFooterSettings();
      cancelEdit();
    } catch (error: any) {
      toast({ title: '操作失敗', description: error.message, variant: 'destructive' });
    }
  };

  // 刪除設置
  const handleDelete = async (section: string) => {
    if (!window.confirm(`確定要刪除 ${section} 設置嗎？`)) return;
    
    try {
      await footerAPI.deleteSetting(section);
      toast({ title: '刪除成功', description: '設置已刪除' });
      fetchFooterSettings();
    } catch (error: any) {
      toast({ title: '刪除失敗', description: error.message, variant: 'destructive' });
    }
  };

  // 切換啟用狀態
  const toggleActive = async (section: string, is_active: boolean) => {
    try {
      const setting = footerSettings.find(s => s.section === section);
      if (setting) {
        await footerAPI.updateSection(section, { ...setting, is_active });
        fetchFooterSettings();
      }
    } catch (error: any) {
      toast({ title: '更新失敗', description: error.message, variant: 'destructive' });
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* 隱藏的文件輸入 */}
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={handleImageUpload}
      />

      {/* 左側：編輯表單 */}
      <div className="lg:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle>頁腳內容管理</CardTitle>
            <CardDescription>管理頁腳的所有內容區塊</CardDescription>
          </CardHeader>
          <CardContent>
            {!editingSection && !isCreating ? (
              <div className="space-y-4">
                <p className="text-sm text-gray-600">選擇一個區段進行編輯，或創建新的區段</p>
                <Button onClick={startCreating} className="w-full">
                  <Plus className="mr-2 h-4 w-4" />
                  創建新區段
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">
                    {isCreating ? '創建新區段' : `編輯: ${editingSection}`}
                  </h3>
                  <Button variant="outline" size="sm" onClick={cancelEdit}>
                    取消
                  </Button>
                </div>

                <div>
                  <Label>區段名稱</Label>
                  {isCreating ? (
                    <div className="space-y-2">
                      <Select 
                        value={formData.section || ''} 
                        onValueChange={(value) => setFormData({...formData, section: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="選擇預設區段類型" />
                        </SelectTrigger>
                        <SelectContent>
                          {sectionTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input
                        value={formData.section || ''}
                        onChange={(e) => setFormData({...formData, section: e.target.value})}
                        placeholder="或輸入自定義區段名稱"
                      />
                    </div>
                  ) : (
                    <Input value={formData.section || ''} disabled />
                  )}
                </div>

                <div>
                  <Label>標題</Label>
                  <Input
                    value={formData.title || ''}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="區段標題"
                  />
                </div>

                <div>
                  <Label>內容</Label>
                  <Textarea
                    value={formData.content || ''}
                    onChange={(e) => setFormData({...formData, content: e.target.value})}
                    placeholder="文字內容或JSON數據"
                    rows={4}
                  />
                </div>

                <div>
                  <Label>連結URL</Label>
                  <Input
                    value={formData.link_url || ''}
                    onChange={(e) => setFormData({...formData, link_url: e.target.value})}
                    placeholder="https://..."
                  />
                </div>

                <div>
                  <Label>圖片URL</Label>
                  <div className="flex gap-2">
                    <Input
                      value={formData.image_url || ''}
                      onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                      placeholder="/images/your-image.jpg"
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      {uploading ? '上傳中...' : '選擇'}
                    </Button>
                  </div>
                  {formData.image_url && (
                    <img
                      src={formData.image_url}
                      alt="預覽"
                      className="mt-2 h-20 object-cover rounded border"
                    />
                  )}
                </div>

                <div>
                  <Label>圖標名稱</Label>
                  <Select 
                    value={formData.icon_name || ''} 
                    onValueChange={(value) => setFormData({...formData, icon_name: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="選擇圖標" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableIcons.map((icon) => (
                        <SelectItem key={icon} value={icon}>
                          {icon}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>排序順序</Label>
                  <Input
                    type="number"
                    value={formData.display_order || 0}
                    onChange={(e) => setFormData({
                      ...formData, 
                      display_order: parseInt(e.target.value) || 0
                    })}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={formData.is_active || false}
                    onCheckedChange={(checked) => setFormData({...formData, is_active: checked})}
                  />
                  <Label>啟用此區塊</Label>
                </div>

                <Button onClick={handleSave} className="w-full">
                  {isCreating ? '創建' : '保存'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 右側：設置列表 */}
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>頁腳設置概覽</CardTitle>
            <CardDescription>管理所有頁腳區段設置</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">載入中...</div>
            ) : (
              <div className="grid gap-4">
                {footerSettings
                  .sort((a, b) => a.display_order - b.display_order)
                  .map((setting) => (
                  <Card key={setting.section} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold">{setting.section}</h4>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => toggleActive(setting.section, !setting.is_active)}
                          >
                            {setting.is_active ? (
                              <Eye className="h-4 w-4 text-green-600" />
                            ) : (
                              <EyeOff className="h-4 w-4 text-gray-400" />
                            )}
                          </Button>
                        </div>
                        <p className="text-sm text-gray-600">{setting.title}</p>
                        {setting.content && (
                          <p className="text-xs text-gray-500 truncate max-w-[200px]">
                            {setting.content}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingSection(setting.section);
                            setIsCreating(false);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(setting.section)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    {setting.image_url && (
                      <img
                        src={setting.image_url}
                        alt={setting.title}
                        className="mt-2 h-16 object-cover rounded border"
                      />
                    )}
                  </Card>
                ))}
                
                {footerSettings.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    尚無頁腳設置，請創建第一個區段
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FooterManagement;