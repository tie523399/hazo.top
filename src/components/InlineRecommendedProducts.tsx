import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Product } from '@/lib/store';
import { useCartStore } from '@/lib/store';
import { cartAPI, productsAPI } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { formatPrice } from '@/lib/utils';

interface InlineRecommendedProductsProps {
  excludeProductId?: number;
  category?: string;
}

const InlineRecommendedProducts: React.FC<InlineRecommendedProductsProps> = ({
  excludeProductId,
  category
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [addingToCart, setAddingToCart] = useState<number | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { sessionId, setItems, setTotalAmount, setItemCount } = useCartStore();
  const { toast } = useToast();

  useEffect(() => {
    loadRecommendedProducts();
  }, [category, excludeProductId]);

  useEffect(() => {
    checkScrollButtons();
  }, [products]);

  const loadRecommendedProducts = async () => {
    try {
      setLoading(true);
      const response = await productsAPI.getProducts({
        category,
        limit: 8
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

  const checkScrollButtons = () => {
    const container = scrollContainerRef.current;
    if (container) {
      setCanScrollLeft(container.scrollLeft > 0);
      setCanScrollRight(
        container.scrollLeft < container.scrollWidth - container.clientWidth
      );
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    const container = scrollContainerRef.current;
    if (container) {
      const scrollAmount = 280; // 商品卡片寬度 + 間距
      const newScrollLeft = direction === 'left' 
        ? container.scrollLeft - scrollAmount
        : container.scrollLeft + scrollAmount;
      
      container.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      });
    }
  };

  const addToCart = async (product: Product) => {
    if (!sessionId) return;
    
    try {
      setAddingToCart(product.id);
      
      await cartAPI.addToCart({
        sessionId,
        productId: product.id,
        quantity: 1,
        ...(product.variants && product.variants.length > 0 && {
          variantId: product.variants[0].id
        })
      });

      // 重新載入購物車
      const cartResponse = await cartAPI.getCart(sessionId);
      setItems(cartResponse.data.items);
      setTotalAmount(cartResponse.data.totalAmount);
      setItemCount(cartResponse.data.itemCount);

      toast({
        title: "成功加入購物車",
        description: `${product.name} 已加入購物車`,
      });
    } catch (error: any) {
      console.error('加入購物車失敗:', error);
      toast({
        title: "加入購物車失敗",
        description: error.response?.data?.error || "請稍後再試",
        variant: "destructive"
      });
    } finally {
      setAddingToCart(null);
    }
  };

  if (loading) {
    return (
      <div className="bg-white border-t border-gray-100 px-4 py-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">推薦商品</h3>
        <div className="flex gap-4 overflow-hidden">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex-shrink-0 w-64 h-40 bg-gray-200 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <div className="bg-white border-t border-gray-100 px-4 py-6">
      {/* 標題和控制按鈕 */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">推薦商品</h3>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => scroll('left')}
            disabled={!canScrollLeft}
            className="h-8 w-8 rounded-full p-0"
          >
            <ChevronLeft size={16} />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => scroll('right')}
            disabled={!canScrollRight}
            className="h-8 w-8 rounded-full p-0"
          >
            <ChevronRight size={16} />
          </Button>
        </div>
      </div>

      {/* 水平滑動商品列表 */}
      <div
        ref={scrollContainerRef}
        className="flex gap-4 overflow-x-auto pb-2"
        onScroll={checkScrollButtons}
        style={{ 
          scrollbarWidth: 'none', 
          msOverflowStyle: 'none'
        }}
      >
        {products.map((product) => (
          <div
            key={product.id}
            className="flex-shrink-0 w-64 bg-gray-50 rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-300"
          >
            <Link to={`/products/${product.id}`} className="block">
              <div className="relative">
                <img
                  src={product.image_url || '/images/placeholder-product.png'}
                  alt={product.name}
                  className="w-full h-32 object-cover"
                />
                <div className="absolute top-2 left-2">
                  <Badge className="bg-blue-500 text-white text-xs">
                    推薦
                  </Badge>
                </div>
              </div>
            </Link>

            <div className="p-3">
              <Link to={`/products/${product.id}`}>
                <h4 className="font-medium text-gray-900 mb-1 hover:text-blue-600 transition-colors truncate">
                  {product.name}
                </h4>
              </Link>
              
              <p className="text-sm text-gray-600 mb-2 truncate">
                {product.brand}
              </p>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-bold text-blue-600">
                    ${formatPrice(product.price)}
                  </p>
                </div>
                
                <Button
                  size="sm"
                  onClick={() => addToCart(product)}
                  disabled={addingToCart === product.id}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-md text-xs"
                >
                  {addingToCart === product.id ? (
                    <div className="w-3 h-3 border-white border-t-transparent border-2 rounded-full animate-spin" />
                  ) : (
                    <ShoppingCart size={14} />
                  )}
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 隱藏滾動條的CSS */}
      <style>
        {`
          .overflow-x-auto::-webkit-scrollbar {
            display: none;
          }
        `}
      </style>
    </div>
  );
};

export default InlineRecommendedProducts; 