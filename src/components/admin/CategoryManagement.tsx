import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Pencil, Trash2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { categoriesAPI } from "@/lib/api";

interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  display_order: number;
  is_active: boolean;
  image_url?: string;
  created_at: string;
  updated_at: string;
}

interface CategoryManagementProps {
  categories: Category[];
  onFetchData: () => void;
}

const CategoryManagement: React.FC<CategoryManagementProps> = ({
  categories,
  onFetchData
}) => {
  const { toast } = useToast();
  
  // 分類表單狀態
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryForm, setCategoryForm] = useState<Partial<Category>>({
    is_active: true,
    display_order: 0
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  // 處理圖片選擇
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      
      // 創建預覽
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // 重置表單
  const resetForm = () => {
    setEditingCategory(null);
    setCategoryForm({ is_active: true, display_order: 0 });
    setSelectedImage(null);
    setImagePreview('');
  };

  // 分類CRUD操作
  const handleCreateOrUpdateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formData = {
        ...categoryForm,
        ...(selectedImage && { image: selectedImage })
      };

      if (editingCategory) {
        await categoriesAPI.updateCategory(editingCategory.id, formData);
      } else {
        await categoriesAPI.createCategory(formData as any);
      }
      toast({ title: `分類已${editingCategory ? '更新' : '新增'}` });
      resetForm();
      onFetchData();
    } catch (error: any) {
      toast({ title: '操作失敗', description: error.message, variant: 'destructive' });
    }
  };

  const handleDeleteCategory = async (id: number) => {
    if (!window.confirm('確定要刪除此分類嗎？')) return;
    try {
      await categoriesAPI.deleteCategory(id);
      toast({ title: '分類已刪除', variant: "destructive" });
      onFetchData();
    } catch (error: any) {
      toast({ title: '刪除失敗', description: error.message, variant: 'destructive' });
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {/* 分類表單 */}
      <div className="md:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle>分類管理</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateOrUpdateCategory} className="space-y-4">
              <div>
                <Label>分類名稱</Label>
                <Input
                  value={categoryForm.name || ''}
                  onChange={(e) => setCategoryForm({...categoryForm, name: e.target.value})}
                  placeholder="如：主機"
                  required
                />
              </div>
              
              <div>
                <Label>標識符（slug）</Label>
                <Input
                  value={categoryForm.slug || ''}
                  onChange={(e) => setCategoryForm({...categoryForm, slug: e.target.value})}
                  placeholder="如：electronics"
                  required
                />
              </div>
              
              <div>
                <Label>描述</Label>
                <Input
                  value={categoryForm.description || ''}
                  onChange={(e) => setCategoryForm({...categoryForm, description: e.target.value})}
                  placeholder="分類描述（選填）"
                />
              </div>
              
              <div>
                <Label>排序順序</Label>
                <Input
                  type="number"
                  value={categoryForm.display_order || 0}
                  onChange={(e) => setCategoryForm({
                    ...categoryForm, 
                    display_order: parseInt(e.target.value) || 0
                  })}
                />
              </div>
              
              <div>
                <Label>分類圖片</Label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="cursor-pointer"
                />
                
                {/* 圖片預覽 */}
                {(imagePreview || (editingCategory?.image_url && !selectedImage)) && (
                  <div className="mt-2">
                    <img
                      src={imagePreview || editingCategory?.image_url}
                      alt="分類圖片預覽"
                      className="w-20 h-20 object-cover rounded-md border"
                    />
                    {!imagePreview && editingCategory?.image_url && (
                      <p className="text-sm text-gray-500 mt-1">當前圖片</p>
                    )}
                    {imagePreview && (
                      <p className="text-sm text-green-600 mt-1">新選擇的圖片</p>
                    )}
                  </div>
                )}
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  checked={categoryForm.is_active !== false}
                  onCheckedChange={(checked) => setCategoryForm({
                    ...categoryForm, 
                    is_active: checked
                  })}
                />
                <Label>啟用分類</Label>
              </div>
              
              <Button type="submit" className="w-full">
                {editingCategory ? '更新分類' : '新增分類'}
              </Button>
              
              {editingCategory && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={resetForm}
                >
                  取消編輯
                </Button>
              )}
            </form>
          </CardContent>
        </Card>
      </div>

      {/* 分類列表 */}
      <div className="md:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>分類列表</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>圖片</TableHead>
                    <TableHead>名稱</TableHead>
                    <TableHead>標識符</TableHead>
                    <TableHead>描述</TableHead>
                    <TableHead>排序</TableHead>
                    <TableHead>狀態</TableHead>
                    <TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(Array.isArray(categories) ? categories : []).map(category => (
                    <TableRow key={category.id}>
                      <TableCell>
                        {category.image_url ? (
                          <img
                            src={category.image_url}
                            alt={category.name}
                            className="w-12 h-12 object-cover rounded-md border"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gray-100 rounded-md border flex items-center justify-center">
                            <span className="text-gray-400 text-xs">無圖</span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>{category.name}</TableCell>
                      <TableCell>{category.slug}</TableCell>
                      <TableCell>{category.description || '-'}</TableCell>
                      <TableCell>{category.display_order}</TableCell>
                      <TableCell>
                        <Badge variant={category.is_active ? "default" : "outline"}>
                          {category.is_active ? '啟用' : '停用'}
                        </Badge>
                      </TableCell>
                      <TableCell className="space-x-2">
                        <Button
                          size="sm"
                          onClick={() => {
                            setEditingCategory(category);
                            setCategoryForm(category);
                            setImagePreview('');
                            setSelectedImage(null);
                          }}
                        >
                          <Pencil size={16} />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteCategory(category.id)}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CategoryManagement;