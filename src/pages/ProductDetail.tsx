import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShoppingCart, Heart, ArrowLeft, Star, Truck, Shield, RotateCcw, Home } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Product, ProductVariant } from '@/lib/store';
import { formatPrice, getCategoryName, getImageUrl } from '@/lib/utils';
import { useCartStore } from '@/lib/store';
import { cartAPI, productsAPI } from '@/lib/api';
import SEO, { createProductStructuredData, createBreadcrumbStructuredData } from '@/components/SEO';
import InlineRecommendedProducts from '@/components/InlineRecommendedProducts';
import ProductImageCarousel from '@/components/ProductImageCarousel';

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { sessionId, setItems, setTotalAmount, setItemCount } = useCartStore();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [imageError, setImageError] = useState(false);


  // 庫存狀態判斷函數
  const getStockStatus = (stock: number) => {
    if (stock === 0) {
      return {
        variant: 'destructive' as const,
        text: '缺貨',
        color: 'text-red-600'
      };
    } else if (stock <= 10) {
      return {
        variant: 'secondary' as const,
        text: `僅剩 ${stock} 件`,
        color: 'text-orange-600'
      };
    } else {
      return {
        variant: 'outline' as const,
        text: '有庫存',
        color: 'text-green-600'
      };
    }
  };

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        const response = await productsAPI.getProduct(id);
        setProduct(response.data);
        
        // 如果有變體，預設選擇第一個有庫存的變體
        if (response.data.variants && response.data.variants.length > 0) {
          const firstAvailableVariant = response.data.variants.find(v => v.stock > 0);
          setSelectedVariant(firstAvailableVariant || response.data.variants[0]);
        }
      } catch (error) {
        console.error('獲取產品詳情失敗:', error);
        toast({
          title: "載入失敗",
          description: "無法載入產品詳情",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [id, toast]);

  const addToCart = async () => {
    if (!product) return;

    const availableStock = selectedVariant ? selectedVariant.stock : product.stock;
    if (availableStock === 0) {
      toast({
        title: "商品缺貨",
        description: "此商品目前缺貨，無法加入購物車",
        variant: "destructive",
      });
      return;
    }

    if (quantity > availableStock) {
      toast({
        title: "庫存不足",
        description: `最多只能加入 ${availableStock} 個`,
        variant: "destructive",
      });
      return;
    }

    setIsAddingToCart(true);

    try {
      await cartAPI.addToCart({
        sessionId,
        productId: product.id,
        variantId: selectedVariant?.id,
        quantity,
      });

      // 重新獲取購物車數據
      const cartResponse = await cartAPI.getCart(sessionId);
      setItems(cartResponse.data.items);
      setTotalAmount(cartResponse.data.totalAmount);
      setItemCount(cartResponse.data.itemCount);

      toast({
        title: "已加入購物車",
        description: `${product.name} ${selectedVariant ? `(${selectedVariant.variant_value})` : ''} x${quantity} 已成功加入購物車`,
      });

    } catch (error) {
      console.error('加入購物車失敗:', error);
      toast({
        title: "加入失敗",
        description: "無法加入購物車，請稍後再試",
        variant: "destructive",
      });
    } finally {
      setIsAddingToCart(false);
    }
  };

  const calculatePrice = () => {
    if (!product) return 0;
    const basePrice = product.price;
    const modifier = selectedVariant?.price_modifier || 0;
    return basePrice + modifier;
  };

  const getAvailableStock = () => {
    if (!product) return 0;
    return selectedVariant ? selectedVariant.stock : product.stock;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="aspect-square bg-gray-200 rounded-2xl"></div>
            <div className="space-y-4">
                <div className="h-8 bg-gray-200 rounded"></div>
                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                <div className="h-20 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-600 mb-4">找不到此產品</p>
          <Button type="button" onClick={() => navigate('/products')}>
            返回商品列表
          </Button>
        </div>
      </div>
    );
  }

  const stockStatus = getStockStatus(getAvailableStock());

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      <SEO
        title={product.name}
        description={product.description || `${product.name} - ${product.brand} 品牌電子煙產品`}
        keywords={`電子煙, ${product.brand}, ${product.name}, ${getCategoryName(product.category)}`}
        structuredData={[
          createProductStructuredData(product),
          createBreadcrumbStructuredData([
            { name: '首頁', url: '/' },
            { name: '商品', url: '/products' },
            { name: product.name, url: `/products/${product.id}` }
          ])
        ]}
      />

      <div className="container mx-auto px-4 py-4 md:py-8">
        {/* 頂部導航 */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
              className="flex items-center gap-2 hover:bg-white/80"
        >
              <ArrowLeft size={18} />
              <span className="hidden md:inline">返回</span>
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              className="flex items-center gap-2 hover:bg-white/80 md:hidden"
            >
              <Home size={18} />
        </Button>
      </div>

          <div className="hidden md:flex items-center text-sm text-gray-600">
            <span onClick={() => navigate('/')} className="cursor-pointer hover:text-blue-600">首頁</span>
            <span className="mx-2">/</span>
            <span onClick={() => navigate('/products')} className="cursor-pointer hover:text-blue-600">商品</span>
            <span className="mx-2">/</span>
            <span className="text-gray-800">{product.name}</span>
          </div>
        </div>

        {/* 主要內容 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* 產品圖片區域 */}
        <div className="relative">
            <ProductImageCarousel
              images={product.images || []}
              productName={product.name}
            />
            
            {/* 庫存狀態標籤 */}
            <div className="absolute top-4 left-4 z-10">
              <Badge 
                variant={stockStatus.variant}
                className="text-xs font-medium shadow-lg"
              >
                {stockStatus.text}
              </Badge>
            </div>
          </div>

          {/* 產品信息區域 */}
        <div className="space-y-6">
            {/* 品牌和分類 */}
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100">
                {product.brand}
              </Badge>
              <Badge variant="outline" className="border-gray-300">
                {getCategoryName(product.category)}
              </Badge>
            </div>

            {/* 產品標題 */}
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">
              {product.name}
            </h1>
            
            {/* 評分 */}
            <div className="flex items-center gap-2">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    className="fill-amber-400 text-amber-400"
                  />
                ))}
              </div>
              <span className="text-sm text-gray-600">(4.8分 · 128評價)</span>
          </div>

            {/* 價格 */}
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-4">
              <p className="text-sm text-gray-600 mb-1">售價</p>
              <p className="text-3xl md:text-4xl font-bold text-blue-600">
                {formatPrice(calculatePrice())}
                <span className="text-lg font-normal text-gray-500 ml-2">TWD</span>
              </p>
          </div>

            {/* 變體選擇 - 圓角設計 */}
          {product.variants && product.variants.length > 0 && (
            <div className="space-y-3">
                <h3 className="font-semibold text-gray-900">選擇規格</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {product.variants.map((variant) => (
                    <button
                      key={variant.id} 
                      onClick={() => setSelectedVariant(variant)}
                      disabled={variant.stock === 0}
                      className={`
                        relative p-3 rounded-2xl border-2 transition-all duration-300 text-sm font-medium text-center
                        ${selectedVariant?.id === variant.id
                          ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-md'
                          : variant.stock === 0
                          ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-blue-300 hover:bg-blue-50'
                        }
                      `}
                    >
                      <div className="line-clamp-2">{variant.variant_value}</div>
                          {variant.stock === 0 && (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-100/80 rounded-2xl">
                          <span className="text-xs text-gray-500">缺貨</span>
                        </div>
                      )}
                      {variant.price_modifier !== 0 && (
                        <div className="text-xs text-blue-600 mt-1">
                                                     {variant.price_modifier > 0 ? '+' : ''}${formatPrice(Math.abs(variant.price_modifier))}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
            </div>
          )}

            {/* 數量選擇 */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900">數量</h3>
              <div className="flex items-center gap-3">
              <Button
                variant="outline"
                  size="sm"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
                  className="h-10 w-10 rounded-full"
              >
                -
                </Button>
                <span className="text-lg font-semibold text-gray-900 min-w-[3rem] text-center">
                  {quantity}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setQuantity(Math.min(getAvailableStock(), quantity + 1))}
                  disabled={quantity >= getAvailableStock()}
                  className="h-10 w-10 rounded-full"
                >
                  +
                </Button>
                <span className="text-sm text-gray-500 ml-2">
                  庫存：{getAvailableStock()} 件
                </span>
              </div>
            </div>

            {/* 操作按鈕 */}
            <div className="flex gap-3">
              <Button
                onClick={addToCart}
                disabled={isAddingToCart || getAvailableStock() === 0}
                className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold py-3 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-[1.02]"
              >
                <ShoppingCart size={18} className="mr-2" />
                {isAddingToCart ? '加入中...' : '加入購物車'}
              </Button>
              
              <Button
                variant="outline"
                className="px-4 py-3 rounded-xl border-gray-300 hover:bg-gray-50"
              >
                <Heart size={18} />
              </Button>
          </div>

            {/* 產品描述 */}
            {product.description && (
              <Card className="border-0 shadow-sm bg-white/50">
            <CardContent className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">產品描述</h3>
                  <p className="text-gray-700 leading-relaxed">{product.description}</p>
                </CardContent>
              </Card>
            )}

            {/* 服務保證 */}
            <div className="grid grid-cols-3 gap-4 mt-6">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-2">
                  <Truck size={20} className="text-blue-600" />
                </div>
                <p className="text-xs text-gray-600">快速配送</p>
                  </div>
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-2">
                  <Shield size={20} className="text-green-600" />
                </div>
                <p className="text-xs text-gray-600">品質保證</p>
                  </div>
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-orange-100 rounded-full mb-2">
                  <RotateCcw size={20} className="text-orange-600" />
                </div>
                <p className="text-xs text-gray-600">7天退換</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 內嵌式推薦商品 */}
      <InlineRecommendedProducts
        excludeProductId={product.id}
        category={product.category}
      />
    </div>
  );
};

export default ProductDetail; 