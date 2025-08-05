import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { X, ShoppingCart, Star, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Product } from '@/lib/store';
import { useCartStore } from '@/lib/store';
import { cartAPI, productsAPI } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { cn, formatPrice } from '@/lib/utils';

interface RecommendedProductsProps {
  isOpen: boolean;
  onClose: () => void;
  excludeProductId?: number;
  category?: string;
}

const RecommendedProducts: React.FC<RecommendedProductsProps> = ({
  isOpen,
  onClose,
  excludeProductId,
  category
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [addingToCart, setAddingToCart] = useState<number | null>(null);
  
  const { sessionId, setItems, setTotalAmount, setItemCount } = useCartStore();
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      loadRecommendedProducts();
    }
  }, [isOpen, category, excludeProductId]);

  const loadRecommendedProducts = async () => {
    try {
      setLoading(true);
      const response = await productsAPI.getProducts({
        category,
        limit: 6
      });
      
      // 過濾掉當前商品
      const filteredProducts = response.data.products.filter(
        (product: Product) => product.id !== excludeProductId
      );
      
      setProducts(filteredProducts.slice(0, 6));
    } catch (error) {
      console.error('載入推薦商品失敗:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (product: Product) => {
    if (product.stock === 0) {
      toast({
        title: "商品缺貨",
        description: "此商品目前缺貨，無法加入購物車",
        variant: "destructive",
      });
      return;
    }

    setAddingToCart(product.id);

    try {
      // 如果有變體，選擇第一個有庫存的變體
      let variantId = null;
      if (product.variants && product.variants.length > 0) {
        const availableVariant = product.variants.find(v => v.stock > 0);
        variantId = availableVariant?.id || null;
      }

      await cartAPI.addToCart({
        sessionId,
        productId: product.id,
        variantId,
        quantity: 1,
      });

      // 重新獲取購物車數據
      const cartResponse = await cartAPI.getCart(sessionId);
      setItems(cartResponse.data.items);
      setTotalAmount(cartResponse.data.totalAmount);
      setItemCount(cartResponse.data.itemCount);

      toast({
        title: "已加入購物車",
        description: `${product.name} 已成功加入購物車`,
      });
    } catch (error) {
      console.error('加入購物車失敗:', error);
      toast({
        title: "加入失敗",
        description: "無法加入購物車，請稍後再試",
        variant: "destructive",
      });
    } finally {
      setAddingToCart(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white rounded-t-3xl shadow-2xl transform transition-all duration-300 ease-out">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <Sparkles size={20} className="text-orange-500" />
            <h2 className="text-lg font-bold text-gray-900">為你推薦</h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0 hover:bg-gray-100 rounded-full"
          >
            <X size={16} />
          </Button>
        </div>

        {/* Content */}
        <div className="max-h-[70vh] overflow-y-auto p-4">
          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex gap-3 animate-pulse">
                  <div className="w-20 h-20 bg-gray-200 rounded-xl"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="flex gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors duration-200"
                >
                  {/* Product Image */}
                  <Link to={`/products/${product.id}`} onClick={onClose}>
                    <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-white shadow-sm">
                      <img
                        src={product.image_url || '/images/placeholder.jpg'}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                      {product.stock < 10 && product.stock > 0 && (
                        <div className="absolute -top-1 -right-1">
                          <Badge className="bg-orange-500 text-white text-xs px-1 py-0 rounded-full">
                            僅剩{product.stock}
                          </Badge>
                        </div>
                      )}
                    </div>
                  </Link>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <Link to={`/products/${product.id}`} onClick={onClose}>
                      <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 mb-1 hover:text-blue-600 transition-colors">
                        {product.name}
                      </h3>
                    </Link>
                    
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary" className="text-xs bg-blue-50 text-blue-700">
                        {product.brand}
                      </Badge>
                      <div className="flex items-center gap-1">
                        <Star size={12} className="fill-amber-400 text-amber-400" />
                        <span className="text-xs text-gray-600">4.8</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-lg font-bold text-blue-600">
                          {formatPrice(product.price)}
                        </p>
                      </div>
                      
                      <Button
                        size="sm"
                        onClick={() => addToCart(product)}
                        disabled={addingToCart === product.id || product.stock === 0}
                        className={cn(
                          "h-8 px-3 text-xs rounded-full",
                          product.stock === 0
                            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                            : "bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white"
                        )}
                      >
                        {addingToCart === product.id ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : product.stock === 0 ? (
                          '缺貨'
                        ) : (
                          <>
                            <ShoppingCart size={12} className="mr-1" />
                            加入
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50 rounded-b-3xl">
          <Button
            variant="outline"
            className="w-full"
            onClick={onClose}
          >
            關閉推薦
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RecommendedProducts; 