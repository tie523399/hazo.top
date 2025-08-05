import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Pencil, Trash2, ChevronRight, Upload, Star, StarOff, GripVertical, Plus, X, ChevronUp, ChevronDown } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { adminAPI, uploadImage } from "@/lib/api";
import { Product } from '@/lib/store';

// 變體接口定義
interface Variant {
  id: number;
  product_id: number;
  variant_type: string;
  variant_value: string;
  stock: number;
  price_modifier: number;
}

interface Category {
  id: number;
  name: string;
  slug: string;
  is_active: boolean;
  display_order: number;
}

// 產品圖片接口定義
interface ProductImage {
  id: number;
  product_id: number;
  image_url: string;
  alt_text?: string;
  display_order: number;
  is_primary: boolean;
  created_at?: string;
}

interface ProductManagementProps {
  products: Product[];
  categories: Category[];
  variants: Variant[];
  selectedProductIdForVariant: number | null;
  onFetchData: () => void;
  onFetchVariants: (productId: number) => void;
  onSetActiveTab: (tab: string) => void;
}

// 產品圖片管理組件
const ProductImageManager: React.FC<{
  productId: number | null;
  onImageChange?: () => void;
}> = ({ productId, onImageChange }) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [images, setImages] = useState<ProductImage[]>([]);
  const [uploading, setUploading] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // 獲取產品圖片
  const fetchImages = async () => {
    if (!productId) return;
    try {
      const response = await adminAPI.getProductImages(productId);
      console.log('📷 獲取到的圖片數據:', response.data.images);
      setImages(response.data.images || []);
    } catch (error: any) {
      console.error('獲取產品圖片失敗:', error);
    }
  };

  useEffect(() => {
    if (productId) {
      fetchImages();
    } else {
      setImages([]);
    }
  }, [productId]);

  // 圖片上傳處理
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !productId) return;

    setUploading(true);
    try {
      const uploadResult = await uploadImage(file);
      console.log('🎯 圖片上傳結果:', {
        fileName: file.name,
        fileSize: file.size,
        uploadResult: uploadResult
      });
      
      await adminAPI.addProductImage(productId, {
        image_url: uploadResult.filePath,
        alt_text: `產品圖片`,
        display_order: images.length,
        is_primary: images.length === 0 // 第一張圖片設為主圖
      });
      
      await fetchImages();
      onImageChange?.();
      toast({ title: "圖片上傳成功" });
    } catch (error: any) {
      toast({ title: '上傳失敗', description: error.message, variant: 'destructive' });
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // 設置主圖
  const handleSetPrimary = async (imageId: number) => {
    if (!productId) return;
    try {
      await adminAPI.updateProductImage(productId, imageId, { is_primary: true });
      await fetchImages();
      onImageChange?.();
      toast({ title: "主圖設置成功" });
    } catch (error: any) {
      toast({ title: '設置失敗', description: error.message, variant: 'destructive' });
    }
  };

  // 刪除圖片
  const handleDeleteImage = async (imageId: number) => {
    if (!productId) return;
    if (!confirm('確定要刪除這張圖片嗎？')) return;
    
    try {
      await adminAPI.deleteProductImage(productId, imageId);
      await fetchImages();
      onImageChange?.();
      toast({ title: "圖片刪除成功" });
    } catch (error: any) {
      toast({ title: '刪除失敗', description: error.message, variant: 'destructive' });
    }
  };

  // 拖拽排序
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === dropIndex || !productId) return;

    const newImages = [...images];
    const draggedImage = newImages[draggedIndex];
    newImages.splice(draggedIndex, 1);
    newImages.splice(dropIndex, 0, draggedImage);

    // 更新顯示順序
    const imageOrders = newImages.map((img, index) => ({
      id: img.id,
      display_order: index
    }));

    try {
      await adminAPI.reorderProductImages(productId, imageOrders);
      await fetchImages();
      onImageChange?.();
      toast({ title: "圖片順序更新成功" });
    } catch (error: any) {
      toast({ title: '更新失敗', description: error.message, variant: 'destructive' });
    }
    
    setDraggedIndex(null);
  };

  // 手機端排序功能
  const handleMoveUp = async (index: number) => {
    if (index === 0 || !productId) return;
    
    const newImages = [...images];
    [newImages[index], newImages[index - 1]] = [newImages[index - 1], newImages[index]];
    
    const imageOrders = newImages.map((img, idx) => ({
      id: img.id,
      display_order: idx
    }));

    try {
      await adminAPI.reorderProductImages(productId, imageOrders);
      await fetchImages();
      onImageChange?.();
      toast({ title: "圖片順序更新成功" });
    } catch (error: any) {
      toast({ title: '更新失敗', description: error.message, variant: 'destructive' });
    }
  };

  const handleMoveDown = async (index: number) => {
    if (index === images.length - 1 || !productId) return;
    
    const newImages = [...images];
    [newImages[index], newImages[index + 1]] = [newImages[index + 1], newImages[index]];
    
    const imageOrders = newImages.map((img, idx) => ({
      id: img.id,
      display_order: idx
    }));

    try {
      await adminAPI.reorderProductImages(productId, imageOrders);
      await fetchImages();
      onImageChange?.();
      toast({ title: "圖片順序更新成功" });
    } catch (error: any) {
      toast({ title: '更新失敗', description: error.message, variant: 'destructive' });
    }
  };

  if (!productId) {
    return (
      <div className="text-center text-gray-500 py-8">
        請先選擇或新增產品後管理圖片
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-base font-medium">產品圖片管理 (最多4張)</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading || images.length >= 4}
          className="flex items-center gap-2"
        >
          <Upload size={16} />
          {uploading ? '上傳中...' : '上傳圖片'}
        </Button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />

      {images.length === 0 ? (
        <div className="text-center text-gray-500 py-8 border-2 border-dashed border-gray-200 rounded-lg">
          暫無圖片，點擊上方按鈕添加圖片
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {images.map((image, index) => (
            <div
              key={image.id}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, index)}
              className="relative group border-2 border-gray-200 rounded-lg overflow-hidden hover:border-blue-300 transition-colors cursor-move"
            >
              {/* 拖拽圖標 - 手機端永遠顯示 */}
              <div className="absolute top-2 left-2 z-10 opacity-60 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                <GripVertical size={16} className="text-white bg-black bg-opacity-70 rounded p-1" />
              </div>

              {/* 手機端排序按鈕 */}
              <div className="absolute top-2 right-12 z-10 flex flex-col gap-1 sm:hidden">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleMoveUp(index)}
                  disabled={index === 0}
                  className="h-6 w-6 p-0 bg-black bg-opacity-70 text-white hover:bg-opacity-90 disabled:opacity-30"
                  title="向上移動"
                >
                  <ChevronUp size={12} />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleMoveDown(index)}
                  disabled={index === images.length - 1}
                  className="h-6 w-6 p-0 bg-black bg-opacity-70 text-white hover:bg-opacity-90 disabled:opacity-30"
                  title="向下移動"
                >
                  <ChevronDown size={12} />
                </Button>
              </div>

              {/* 主圖標籤 */}
              {image.is_primary && (
                <div className="absolute top-2 right-2 z-10">
                  <Badge variant="secondary" className="bg-yellow-500 text-white text-xs">
                    <Star size={12} className="mr-1" />
                    主圖
                  </Badge>
                </div>
              )}

              {/* 圖片 */}
              <img
                src={`${image.image_url}?v=${image.id}`}
                alt={image.alt_text || `產品圖片 ${index + 1}`}
                className="w-full h-32 object-cover"
                onLoad={() => {
                  console.log('圖片載入成功:', {
                    id: image.id,
                    url: image.image_url,
                    fullSrc: `${image.image_url}?v=${image.id}`
                  });
                }}
                onError={(e) => {
                  console.error('❌ 圖片載入失敗 - 這就是為什麼顯示鯨魚圖:', {
                    id: image.id,
                    原始URL: image.image_url,
                    完整URL: `${image.image_url}?v=${image.id}`,
                    錯誤: '圖片文件不存在或無法訪問'
                  });
                  e.currentTarget.src = '/images/whale-logo.png';
                }}
              />

              {/* 操作按鈕 - 手機端永遠顯示 */}
              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 p-2 opacity-80 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                <div className="flex justify-between items-center">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSetPrimary(image.id)}
                    disabled={image.is_primary}
                    className="text-white hover:text-yellow-400 p-1 h-auto touch-manipulation"
                    title={image.is_primary ? "已是主圖" : "設為主圖"}
                  >
                    {image.is_primary ? <Star size={16} /> : <StarOff size={16} />}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteImage(image.id)}
                    className="text-white hover:text-red-400 p-1 h-auto touch-manipulation"
                    title="刪除圖片"
                  >
                    <X size={16} />
                  </Button>
                </div>
              </div>

              {/* 順序標籤 */}
              <div className="absolute bottom-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                {(() => {
                  console.log('順序調試:', { id: image.id, display_order: image.display_order, index: index });
                  return Number(image.display_order ?? index) + 1;
                })()}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="text-sm text-gray-500 space-y-1">
        <div className="block sm:hidden">
          <strong>📱 手機端操作：</strong>
          <br />• 點擊 ↑↓ 箭頭調整圖片順序
          <br />• 點擊 ⭐ 設置主圖，點擊 ✕ 刪除圖片
          <br />• 也支持長按拖拽排序
          <br />• 第一張圖會自動設為主圖
        </div>
        <div className="hidden sm:block">
          <strong>💻 電腦端操作：</strong>
          <br />• 拖拽調整圖片順序
          <br />• 滑鼠懸停顯示操作按鈕
          <br />• 點擊星星設置主圖 (第一張圖會自動設為主圖)
        </div>
        <div className="pt-2">
          <strong>📏 圖片規格：</strong>
          <br />• 建議尺寸: 800x800px 或以上
          <br />• 支持格式: JPG, PNG, WebP, GIF
          <br />• 最多支持 4 張圖片
        </div>
      </div>
    </div>
  );
};

const ProductManagement: React.FC<ProductManagementProps> = ({
  products,
  categories,
  variants,
  selectedProductIdForVariant,
  onFetchData,
  onFetchVariants,
  onSetActiveTab
}) => {
  const { toast } = useToast();
  
  // 產品表單狀態
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState<Partial<Product>>({});
  
  // 變體表單狀態
  const [editingVariant, setEditingVariant] = useState<Variant | null>(null);
  const [variantForm, setVariantForm] = useState<Partial<Variant>>({});

  // 產品CRUD操作
  const handleCreateOrUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await adminAPI.updateProduct(editingProduct.id, productForm);
      } else {
        await adminAPI.createProduct(productForm);
      }
      toast({ title: `產品已${editingProduct ? '更新' : '新增'}` });
      setEditingProduct(null);
      setProductForm({});
      onFetchData();
    } catch (error: any) {
      toast({ title: '操作失敗', description: error.message, variant: 'destructive' });
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (!window.confirm('確定要刪除此產品嗎？')) return;
    try {
      await adminAPI.deleteProduct(id);
      toast({ title: '產品已刪除', variant: "destructive" });
      onFetchData();
    } catch (error: any) {
      toast({ title: '刪除失敗', description: error.message, variant: 'destructive' });
    }
  };

  // 變體CRUD操作
  const handleCreateOrUpdateVariant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductIdForVariant) return;
    
    try {
      if (editingVariant) {
        await adminAPI.updateProductVariant(editingVariant.id, variantForm);
      } else {
        await adminAPI.createProductVariant(selectedProductIdForVariant, variantForm);
      }
      toast({ title: `變體已${editingVariant ? '更新' : '新增'}` });
      setEditingVariant(null);
      setVariantForm({});
      onFetchVariants(selectedProductIdForVariant);
    } catch (error: any) {
      toast({ title: '操作失敗', description: error.message, variant: 'destructive' });
    }
  };

  const handleDeleteVariant = async (id: number) => {
    if (!window.confirm('確定要刪除此變體嗎？')) return;
    try {
      await adminAPI.deleteProductVariant(id);
      toast({ title: '變體已刪除', variant: "destructive" });
      if (selectedProductIdForVariant) {
        onFetchVariants(selectedProductIdForVariant);
      }
    } catch (error: any) {
      toast({ title: '刪除失敗', description: error.message, variant: 'destructive' });
    }
  };

  // 渲染產品管理界面
  const renderProductManagement = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {/* 產品表單 */}
      <div className="md:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle>產品管理</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateOrUpdateProduct} className="space-y-4">
              <div>
                <Label>產品名稱</Label>
                <Input
                  placeholder="產品名稱"
                  value={productForm.name || ''}
                  onChange={e => setProductForm({...productForm, name: e.target.value})}
                  required
                />
              </div>
              
              <div>
                <Label>品牌</Label>
                <Input
                  placeholder="品牌"
                  value={productForm.brand || ''}
                  onChange={e => setProductForm({...productForm, brand: e.target.value})}
                  required
                />
              </div>
              
              <div>
                <Label>分類</Label>
                <Select
                  value={productForm.category || ''}
                  onValueChange={(v: any) => setProductForm({...productForm, category: v})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="選擇分類" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories
                      .filter(cat => cat.is_active)
                      .sort((a, b) => a.display_order - b.display_order)
                      .map(cat => (
                        <SelectItem key={cat.id} value={cat.slug}>
                          {cat.name}
                        </SelectItem>
                      ))
                    }
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>原價（選填）</Label>
                <Input
                  type="number"
                  placeholder="原價"
                  value={productForm.original_price || ''}
                  onChange={e => setProductForm({
                    ...productForm, 
                    original_price: e.target.value ? Number(e.target.value) : undefined
                  })}
                />
              </div>
              
              <div>
                <Label>售價</Label>
                <Input
                  type="number"
                  placeholder="售價"
                  value={productForm.price || ''}
                  onChange={e => setProductForm({...productForm, price: Number(e.target.value)})}
                  required
                />
              </div>
              
              <div>
                <Label>庫存</Label>
                <Input
                  type="number"
                  placeholder="庫存"
                  value={productForm.stock || ''}
                  onChange={e => setProductForm({...productForm, stock: Number(e.target.value)})}
                  required
                />
              </div>
              
              {/* 產品圖片管理 - 只在編輯模式時顯示 */}
              {editingProduct && (
                <div>
                  <Label className="text-base font-medium">產品圖片管理</Label>
                  <ProductImageManager
                    productId={editingProduct.id}
                    onImageChange={onFetchData}
                  />
                </div>
              )}
              
              {/* 新增商品時的提示 */}
              {!editingProduct && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2 text-blue-700">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <span className="font-medium">圖片管理說明</span>
                  </div>
                  <p className="mt-2 text-sm text-blue-600">
                    請先創建商品，然後點擊編輯按鈕來管理商品圖片。這樣可以確保圖片正確關聯到商品。
                  </p>
                </div>
              )}
              
              <div>
                <Label>產品描述</Label>
                <Textarea
                  placeholder="產品描述"
                  value={productForm.description || ''}
                  onChange={e => setProductForm({...productForm, description: e.target.value})}
                />
              </div>
              
              <Button type="submit" className="w-full">
                {editingProduct ? '更新產品' : '新增產品'}
              </Button>
              
              {!editingProduct && (
                <p className="text-sm text-gray-500 text-center mt-2">
                  💡 創建商品後，可點擊編輯按鈕上傳商品圖片
                </p>
              )}
              
              {editingProduct && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setEditingProduct(null);
                    setProductForm({});
                  }}
                >
                  取消編輯
                </Button>
              )}
            </form>
          </CardContent>
        </Card>
      </div>

      {/* 產品列表 */}
      <div className="md:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>產品列表</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>名稱</TableHead>
                    <TableHead>分類</TableHead>
                    <TableHead>價格</TableHead>
                    <TableHead>庫存</TableHead>
                    <TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(Array.isArray(products) ? products : []).map(product => (
                    <TableRow key={product.id}>
                      <TableCell>{product.name}</TableCell>
                      <TableCell>
                        {categories.find(cat => cat.slug === product.category)?.name || product.category}
                      </TableCell>
                      <TableCell>${product.price}</TableCell>
                      <TableCell>{product.stock}</TableCell>
                      <TableCell className="space-x-2">
                        <Button
                          size="sm"
                          onClick={() => {
                            setEditingProduct(product);
                            setProductForm(product);
                          }}
                        >
                          <Pencil size={16} />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteProduct(product.id)}
                        >
                          <Trash2 size={16} />
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => {
                            onFetchVariants(product.id);
                            onSetActiveTab('variants');
                          }}
                        >
                          <ChevronRight size={16} />
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

  // 渲染變體管理界面
  const renderVariantManagement = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {/* 變體表單 */}
      <div className="md:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle>變體管理</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateOrUpdateVariant} className="space-y-4">
              <div>
                <Label>選擇產品</Label>
                <Select onValueChange={(v) => onFetchVariants(Number(v))}>
                  <SelectTrigger>
                    <SelectValue placeholder="先選擇一個產品" />
                  </SelectTrigger>
                  <SelectContent>
                    {(Array.isArray(products) ? products : []).map(p => (
                      <SelectItem key={p.id} value={String(p.id)}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {selectedProductIdForVariant && (
                <>
                  <div>
                    <Label>變體類型</Label>
                    <Input
                      placeholder="類型 (如：口味、顏色)"
                      value={variantForm.variant_type || ''}
                      onChange={e => setVariantForm({...variantForm, variant_type: e.target.value})}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label>變體值</Label>
                    <Input
                      placeholder="值 (如：薄荷、紅色)"
                      value={variantForm.variant_value || ''}
                      onChange={e => setVariantForm({...variantForm, variant_value: e.target.value})}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label>庫存</Label>
                    <Input
                      type="number"
                      placeholder="庫存數量"
                      value={variantForm.stock || ''}
                      onChange={e => setVariantForm({...variantForm, stock: Number(e.target.value)})}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label>價格調整</Label>
                    <Input
                      type="number"
                      placeholder="價格調整 (可為負數)"
                      value={variantForm.price_modifier || ''}
                      onChange={e => setVariantForm({...variantForm, price_modifier: Number(e.target.value)})}
                    />
                  </div>
                  
                  <Button type="submit" className="w-full">
                    {editingVariant ? '更新變體' : '新增變體'}
                  </Button>
                  
                  {editingVariant && (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        setEditingVariant(null);
                        setVariantForm({});
                      }}
                    >
                      取消編輯
                    </Button>
                  )}
                </>
              )}
            </form>
          </CardContent>
        </Card>
      </div>

      {/* 變體列表 */}
      <div className="md:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>變體列表</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>類型</TableHead>
                    <TableHead>值</TableHead>
                    <TableHead>庫存</TableHead>
                    <TableHead>價格調整</TableHead>
                    <TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(Array.isArray(variants) ? variants : []).map(variant => (
                    <TableRow key={variant.id}>
                      <TableCell>{variant.variant_type}</TableCell>
                      <TableCell>{variant.variant_value}</TableCell>
                      <TableCell>{variant.stock}</TableCell>
                      <TableCell>{variant.price_modifier}</TableCell>
                      <TableCell className="space-x-2">
                        <Button
                          size="sm"
                          onClick={() => {
                            setEditingVariant(variant);
                            setVariantForm(variant);
                          }}
                        >
                          <Pencil size={16} />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteVariant(variant.id)}
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

  return (
    <div className="space-y-6">
      {renderProductManagement()}
      <hr className="my-8" />
      {renderVariantManagement()}
    </div>
  );
};

export default ProductManagement;