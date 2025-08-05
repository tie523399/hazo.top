import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { X, ShoppingCart, Star, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Product } from '@/lib/store';
import { useCartStore } from '@/lib/store';
import { cartAPI, productsAPI } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { cn, formatPrice } from '@/lib/utils';

interface RecommendedProductsProps {
  variant?: 'modal' | 'inline';
  isOpen?: boolean;
  onClose?: () => void;
  excludeProductId?: number;
  category?: string;
  title?: string;
  className?: string;
}

const RecommendedProducts: React.FC<RecommendedProductsProps> = ({
  variant = 'modal',
  isOpen = true,
  onClose,
  excludeProductId,
  category,
  title = '推薦商品',
  className = ''
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [addingToCart, setAddingToCart] = useState<number | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { sessionId, setItems, setTotalAmount, setItemCount } = useCartStore();
  const { toast } = useToast();

  // 只在彈窗模式且isOpen為true時載入，或內嵌模式時直接載入
  useEffect(() => {
    if ((variant === 'modal' && isOpen) || variant === 'inline') {
      loadRecommendedProducts();
    }
  }, [isOpen, category, excludeProductId, variant]);

  // 內嵌模式才需要檢查滾動按鈕
  useEffect(() => {
    if (variant === 'inline') {
      checkScrollButtons();
    }
  }, [products, variant]);

  const loadRecommendedProducts = async () => {
    try {
      setLoading(true);
      const response = await productsAPI.getProducts({
        category,
        limit: variant === 'modal' ? 6 : 8
      });
      
      // 過濾掉當前商品
      const filteredProducts = response.data.products.filter(
        (product: Product) => product.id !== excludeProductId
      );
      
      setProducts(filteredProducts.slice(0, variant === 'modal' ? 6 : 8));
    } catch (error) {
      console.error('載入推薦商品失敗:', error);
      toast({
        title: "載入失敗",
        description: "無法載入推薦商品",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (product: Product) => {
    if (!sessionId) {
      toast({
        title: "操作失敗",
        description: "會話已過期，請重新整理頁面",
        variant: "destructive"
      });
      return;
    }

    setAddingToCart(product.id);

    try {
      const response = await cartAPI.addToCart(sessionId, {
        product_id: product.id,
        quantity: 1
      });

      if (response.data) {
        setItems(response.data.items);
        setTotalAmount(response.data.totalAmount);
        setItemCount(response.data.itemCount);

        toast({
          title: "已加入購物車",
          description: `${product.name} 已成功加入購物車`
        });
      }
    } catch (error: any) {
      console.error('加入購物車失敗:', error);
      toast({
        title: "加入失敗",
        description: error.response?.data?.error || "加入購物車失敗",
        variant: "destructive"
      });
    } finally {
      setAddingToCart(null);
    }
  };

  // 內嵌模式的滾動功能
  const checkScrollButtons = () => {
    if (!scrollContainerRef.current) return;
    
    const container = scrollContainerRef.current;
    setCanScrollLeft(container.scrollLeft > 0);
    setCanScrollRight(
      container.scrollLeft < container.scrollWidth - container.clientWidth
    );
  };

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;
    
    const container = scrollContainerRef.current;
    const scrollAmount = 300;
    
    container.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });
    
    setTimeout(checkScrollButtons, 300);
  };

  // 產品卡片組件
  const ProductCard = ({ product }: { product: Product }) => (
    <div className={cn(
      "group bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300",
      variant === 'inline' && "flex-shrink-0 w-64"
    )}>
      <div className="relative">
        <Link to={`/products/${product.id}`}>
          <img
            src={product.image_url || '/images/placeholder.jpg'}
            alt={product.name}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </Link>
        {product.original_price && product.original_price > product.price && (
          <Badge className="absolute top-2 left-2 bg-red-500 text-white">
            特價
          </Badge>
        )}
      </div>
      
      <div className="p-4">
        <Link to={`/products/${product.id}`}>
          <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 mb-2">
            {product.name}
          </h3>
        </Link>
        
        <div className="flex items-center justify-between mb-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-gray-900">
                ${formatPrice(product.price)}
              </span>
              {product.original_price && product.original_price > product.price && (
                <span className="text-sm text-gray-500 line-through">
                  ${formatPrice(product.original_price)}
                </span>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-1 text-yellow-500">
            <Star size={14} fill="currentColor" />
            <span className="text-sm text-gray-600">4.8</span>
          </div>
        </div>
        
        <Button
          onClick={() => handleAddToCart(product)}
          disabled={addingToCart === product.id || product.stock <= 0}
          className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white"
          size="sm"
        >
          {addingToCart === product.id ? (
            <span className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              加入中...
            </span>
          ) : product.stock <= 0 ? (
            '暫時缺貨'
          ) : (
            <>
              <ShoppingCart size={16} className="mr-1" />
              加入購物車
            </>
          )}
        </Button>
      </div>
    </div>
  );

  // 彈窗模式
  if (variant === 'modal') {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b">
            <div className="flex items-center gap-2">
              <Sparkles className="text-yellow-500" size={24} />
              <h2 className="text-xl font-bold text-gray-900">{title}</h2>
            </div>
            {onClose && (
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X size={20} />
              </Button>
            )}
          </div>
          
          <div className="p-6">
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-gray-100 rounded-xl h-80 animate-pulse" />
                ))}
              </div>
            ) : products.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-gray-400 mb-2">📦</div>
                <p className="text-gray-500">暫無推薦商品</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // 內嵌模式
  return (
    <div className={cn("py-8", className)}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Sparkles className="text-yellow-500" size={24} />
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        </div>
        
        {products.length > 0 && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => scroll('left')}
              disabled={!canScrollLeft}
            >
              <ChevronLeft size={16} />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => scroll('right')}
              disabled={!canScrollRight}
            >
              <ChevronRight size={16} />
            </Button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex gap-4 overflow-hidden">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-gray-100 rounded-xl h-80 w-64 flex-shrink-0 animate-pulse" />
          ))}
        </div>
      ) : products.length > 0 ? (
        <div
          ref={scrollContainerRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide pb-2"
          onScroll={checkScrollButtons}
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="text-gray-400 mb-2 text-4xl">📦</div>
          <p className="text-gray-500">暫無推薦商品</p>
        </div>
      )}
    </div>
  );
};

export default RecommendedProducts;