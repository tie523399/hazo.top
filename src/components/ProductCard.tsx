import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, Heart, ShoppingCart, Sparkles } from 'lucide-react';
import { Product } from '@/lib/store';
import { cn, formatPrice } from '@/lib/utils';
import { useCartStore } from '@/lib/store';
import { cartAPI } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  
  const { sessionId, setItems, setTotalAmount, setItemCount } = useCartStore();
  const { toast } = useToast();

  // 加入購物車功能
  const addToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (product.stock === 0) {
      toast({
        title: "商品缺貨",
        description: "此商品目前缺貨，無法加入購物車",
        variant: "destructive",
      });
      return;
    }

    setIsAddingToCart(true);

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
      setIsAddingToCart(false);
    }
  };

  // 添加按鈕樣式
  const buttonStyles = `
    .custom-button-small {
      --color: #560bad;
      font-family: inherit;
      display: inline-block;
      width: 6em;
      height: 2.2em;
      line-height: 2.1em;
      margin: 0;
      position: relative;
      cursor: pointer;
      overflow: hidden;
      border: 2px solid var(--color);
      transition: color 0.5s;
      z-index: 1;
      font-size: 14px;
      border-radius: 6px;
      font-weight: 500;
      color: var(--color);
      background: transparent;
      text-decoration: none;
      text-align: center;
    }

    .custom-button-small:before {
      content: "";
      position: absolute;
      z-index: -1;
      background: var(--color);
      height: 150px;
      width: 200px;
      border-radius: 50%;
      top: 100%;
      left: 100%;
      transition: all 0.7s;
    }

    .custom-button-small:hover {
      color: #fff;
    }

    .custom-button-small:hover:before {
      top: -30px;
      left: -30px;
    }

    .custom-button-small:active:before {
      background: #3a0ca3;
      transition: background 0s;
    }

    .cart-button-mobile {
      @apply bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold py-2 px-4 rounded-full shadow-lg hover:from-blue-600 hover:to-cyan-600 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed;
    }
  `;

  const categoryConfig = {
    host: {
      gradient: 'from-blue-600 to-cyan-500',
      label: '主機',
      icon: '🎮'
    },
    cartridge: {
      gradient: 'from-teal-500 to-emerald-500',
      label: '煙彈',
      icon: '💨'
    },
    disposable: {
      gradient: 'from-purple-600 to-pink-500',
      label: '拋棄式',
      icon: '✨'
    }
  };

  const config = categoryConfig[product.category as keyof typeof categoryConfig] || categoryConfig.host;

  return (
    <div className="group relative">
      {/* 按鈕樣式 */}
      <style>{buttonStyles}</style>
      {/* Premium Card Container */}
      <div className="relative h-full overflow-hidden rounded-2xl bg-white shadow-lg transition-all duration-500 hover:shadow-2xl">
        {/* Gradient Border Effect */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-400 via-cyan-400 to-teal-400 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
        
        {/* Inner Container */}
        <div className="relative m-[2px] h-[calc(100%-4px)] overflow-hidden rounded-2xl bg-white">
          {/* Image Section */}
          <Link to={`/products/${product.id}`} className="block">
            <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
              {/* Loading Skeleton */}
              {!imageLoaded && (
                <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200" />
              )}
              
              {/* Product Image */}
              <img
                src={product.image_url || '/images/placeholder.jpg'}
                alt={product.name}
                className={cn(
                  "h-full w-full object-cover transition-all duration-700",
                  "scale-100 opacity-100",
                  "group-hover:scale-110"
                )}
                onLoad={() => setImageLoaded(true)}
                onError={(e) => {
                  e.currentTarget.src = '/images/placeholder.jpg';
                  setImageLoaded(true);
                }}
                loading="lazy"
              />
              
              {/* Overlay Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              
              {/* Category Badge */}
              <div className={cn(
                "absolute left-4 top-4 flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold text-white shadow-lg backdrop-blur-md",
                `bg-gradient-to-r ${config.gradient}`
              )}>
                <span>{config.icon}</span>
                <span>{config.label}</span>
              </div>
              
              {/* Action Buttons */}
              <div className="absolute right-4 top-4 flex flex-col gap-2">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    setIsLiked(!isLiked);
                  }}
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow-lg backdrop-blur-sm transition-all duration-300 hover:scale-110",
                    isLiked && "bg-red-50"
                  )}
                >
                  <Heart
                    size={18}
                    className={cn(
                      "transition-colors duration-300",
                      isLiked ? "fill-red-500 text-red-500" : "text-gray-600"
                    )}
                  />
                </button>
              </div>
              
              {/* Quick Add Button - 桌面版 */}
              <div className="absolute bottom-4 left-4 right-4 translate-y-full opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 hidden md:block">
                <button
                  onClick={addToCart}
                  disabled={isAddingToCart || product.stock === 0}
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-white/90 px-4 py-2 text-sm font-semibold text-gray-800 shadow-lg backdrop-blur-sm transition-all duration-300 hover:bg-white disabled:opacity-50"
                >
                  <ShoppingCart size={16} />
                  {isAddingToCart ? '加入中...' : '加入購物車'}
                </button>
              </div>
            </div>
          </Link>
          
          {/* Content Section */}
          <div className="p-4 md:p-5">
            {/* Brand & Rating */}
            <div className="mb-3 flex items-center justify-between">
              <span className="rounded-full bg-gradient-to-r from-blue-50 to-cyan-50 px-3 py-1 text-xs font-medium text-blue-700">
                {product.brand}
              </span>
              <div className="flex items-center gap-1 rounded-full bg-amber-50 px-2 py-1">
                <Star size={12} className="fill-amber-400 text-amber-400" />
                <span className="text-xs font-medium text-amber-700">4.8</span>
              </div>
            </div>
            
            {/* Product Name */}
            <Link to={`/products/${product.id}`}>
              <h3 className="mb-2 line-clamp-2 text-base md:text-lg font-bold text-gray-800 transition-colors duration-300 hover:text-blue-600">
                {product.name}
              </h3>
            </Link>
            

            
            {/* Price and Action Section */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex-1">
                <p className="text-xs text-gray-500">
                  {product.original_price && product.original_price > product.price ? '特價' : '售價'}
                </p>
                {/* 顯示原價（如果有特價） */}
                {product.original_price && product.original_price > product.price && (
                  <p className="text-sm text-gray-400 line-through">
                    {formatPrice(product.original_price)}
                  </p>
                )}
                <div className="flex items-center gap-2">
                  <p className="text-xl md:text-2xl font-bold text-blue-600">
                    {formatPrice(product.price)}
                  </p>
                  {/* 特價折扣百分比 */}
                  {product.original_price && product.original_price > product.price && (
                    <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                      -{Math.round((1 - product.price / product.original_price) * 100)}%
                    </span>
                  )}
                </div>
              </div>
              
              {/* 移動端購物車按鈕 */}
              <div className="block md:hidden">
                <button
                  onClick={addToCart}
                  disabled={isAddingToCart || product.stock === 0}
                  className="cart-button-mobile flex items-center gap-1 text-sm"
                >
                  <ShoppingCart size={14} />
                  {isAddingToCart ? '...' : '加入'}
                </button>
              </div>
              
              {/* 桌面版查看詳情按鈕 */}
              <div className="hidden md:block">
                <Link
                  to={`/products/${product.id}`}
                  className="custom-button-small"
                >
                  查看詳情
                </Link>
              </div>
            </div>
            
            {/* 移動端查看詳情按鈕 */}
            <div className="mt-3 block md:hidden">
              <Link
                to={`/products/${product.id}`}
                className="w-full text-center bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors duration-300 block"
              >
                查看詳情
              </Link>
            </div>
            
            {/* Special Badge */}
            {product.stock < 10 && product.stock > 0 && (
              <div className="absolute -right-2 top-1/2 flex items-center gap-1 rounded-full bg-gradient-to-r from-orange-500 to-red-500 px-3 py-1 text-xs font-semibold text-white shadow-lg">
                <Sparkles size={12} />
                僅剩 {product.stock} 件
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;