import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingBag, Tag, ArrowLeft, Waves, Ship, Gift, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useCartStore } from '@/lib/store';
import { cartAPI, couponsAPI, settingsAPI } from '@/lib/api';
import { formatPrice, getImageUrl, getCategoryName } from '@/lib/utils';
import SEO from '@/components/SEO';

const Cart: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const {
    sessionId,
    items,
    totalAmount,
    itemCount,
    appliedCoupon,
    setItems,
    setTotalAmount,
    setItemCount,
    setAppliedCoupon,
    clearCoupon,
    clearCart
  } = useCartStore();

  const [loading, setLoading] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(1000);

  useEffect(() => {
    loadCart();
    loadSettings();
  }, [sessionId]);

  const loadSettings = async () => {
    try {
      const response = await settingsAPI.getPublicSettings();
      if (response.data.free_shipping_threshold) {
        setFreeShippingThreshold(parseInt(response.data.free_shipping_threshold));
      }
    } catch (error) {
      console.warn('載入系統設置失敗，使用默認設置:', error.message);
      // 使用默認值，不影響頁面功能
    }
  };

  const loadCart = async () => {
    if (!sessionId) return;

    try {
      setLoading(true);
      const response = await cartAPI.getCart(sessionId);
      console.log('購物車數據載入:', response.data);
      console.log('購物車商品:', response.data.items);
      response.data.items.forEach((item: any, index: number) => {
        console.log(`商品 ${index}:`, {
          id: item.id,
          name: item.name,
          idType: typeof item.id
        });
      });
      setItems(response.data.items);
      setTotalAmount(response.data.totalAmount);
      setItemCount(response.data.itemCount);
    } catch (error) {
      console.error('載入購物車失敗:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId: number, newQuantity: number) => {
    console.log('updateQuantity 被調用，itemId:', itemId, '類型:', typeof itemId, 'newQuantity:', newQuantity);

    if (newQuantity < 1) return;
    if (!itemId) {
      console.error('無效的商品ID:', itemId);
      toast({
        title: "錯誤",
        description: "無效的商品ID",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('正在更新商品數量，ID:', String(itemId), '新數量:', newQuantity);
      await cartAPI.updateCartItem(String(itemId), { quantity: newQuantity });
      await loadCart();

      toast({
        title: "數量已更新",
        description: "商品數量已成功更新",
      });
    } catch (error) {
      console.error('更新數量失敗:', error);
      toast({
        title: "更新失敗",
        description: "無法更新商品數量",
        variant: "destructive",
      });
    }
  };

  const removeItem = async (itemId: number) => {
    console.log('removeItem 被調用，itemId:', itemId, '類型:', typeof itemId);

    if (!itemId) {
      console.error('無效的商品ID:', itemId);
      toast({
        title: "錯誤",
        description: "無效的商品ID",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('正在移除商品，ID:', String(itemId));
      await cartAPI.removeCartItem(String(itemId));
      await loadCart();

      toast({
        title: "商品已移除",
        description: "商品已從購物車中移除",
      });
    } catch (error) {
      console.error('移除商品失敗:', error);
      toast({
        title: "移除失敗",
        description: "無法移除商品",
        variant: "destructive",
      });
    }
  };

  const applyCoupon = async () => {
    if (!couponCode.trim()) {
      toast({
        title: "請輸入優惠券代碼",
        description: "請先輸入有效的優惠券代碼",
        variant: "destructive",
      });
      return;
    }

    if (appliedCoupon) {
      toast({
        title: "已使用優惠券",
        description: "請先移除當前優惠券再使用新的",
        variant: "destructive",
      });
      return;
    }

    setCouponLoading(true);
    
    try {
      const response = await couponsAPI.validateCoupon({
        code: couponCode,
        amount: totalAmount,
      });
      
      if (response.data.valid) {
      setAppliedCoupon(response.data);
      setCouponCode('');
      toast({
          title: "優惠券已套用",
          description: `成功套用優惠券 ${couponCode}`,
      });
      }
    } catch (error: any) {
      console.error('套用優惠券失敗:', error);
      toast({
        title: "套用失敗",
        description: error.response?.data?.error || "優惠券無效或已過期",
        variant: "destructive",
      });
    } finally {
      setCouponLoading(false);
    }
  };

  const removeCoupon = () => {
    clearCoupon();
    toast({
      title: "優惠券已移除",
      description: "已移除套用的優惠券",
    });
  };

  const clearAllItems = async () => {
    if (!sessionId) return;

    try {
      await cartAPI.clearCart(sessionId);
      clearCart();
      toast({
        title: "購物車已清空",
        description: "所有商品已從購物車中移除",
      });
    } catch (error) {
      console.error('清空購物車失敗:', error);
      toast({
        title: "清空失敗",
        description: "無法清空購物車",
        variant: "destructive",
      });
    }
  };

  // 計算總金額
  const calculateTotals = () => {
    const subtotal = totalAmount;
    const shippingFee = subtotal >= freeShippingThreshold ? 0 : 60;
    const discount = appliedCoupon?.discountAmount || 0;
    const finalTotal = Math.max(0, subtotal + shippingFee - discount);
    
    return {
      subtotal,
      shippingFee,
      discount,
      finalTotal,
      freeShippingDiff: Math.max(0, freeShippingThreshold - subtotal)
    };
  };

  const totals = calculateTotals();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-6"></div>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex gap-4 p-4 bg-white rounded-lg">
                  <div className="w-20 h-20 bg-gray-200 rounded"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      <SEO
        title="購物車"
        description="查看您的購物車內容，調整商品數量並結帳"
        keywords="購物車, 結帳, 電子煙"
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
          
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">
            購物車 ({itemCount})
          </h1>
          
          {items.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllItems}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              清空
            </Button>
          )}
        </div>
        
          {items.length === 0 ? (
            // 空購物車狀態
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gray-100 rounded-full mb-6">
              <ShoppingBag size={48} className="text-gray-400" />
              </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">購物車是空的</h2>
            <p className="text-gray-600 mb-8">快去挑選您喜歡的商品吧！</p>
            <Button
                onClick={() => navigate('/products')}
              className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-8 py-3 rounded-xl"
              >
                開始購物
            </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* 商品列表 */}
            <div className="lg:col-span-2 space-y-4">
              {/* 免運提示 */}
              {totals.freeShippingDiff > 0 && (
                <Card className="border-0 bg-gradient-to-r from-green-50 to-emerald-50 shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 text-green-700">
                      <Ship size={16} />
                      <span className="text-sm">
                                                 再購買 <span className="font-bold">${formatPrice(totals.freeShippingDiff)}</span> 即可享免運費！
                      </span>
      </div>
                  </CardContent>
                </Card>
              )}

              {/* 商品項目 */}
          {items.map((item) => (
                <Card key={item.id} className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
                  <CardContent className="p-4 relative">
                    <div className="flex gap-4">
                      {/* 商品圖片 - 優化大小 */}
                      <Link to={`/products/${item.product_id}`}>
                        <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-xl overflow-hidden bg-gray-100 shadow-sm flex-shrink-0">
                    <img
                            src={item.image_url || '/images/whale-logo.png'}
                      alt={item.name}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                          {/* 分類標籤 */}
                          <div className="absolute top-1 left-1">
                            <Badge className="text-xs px-1 py-0 bg-blue-500 text-white">
                              {getCategoryName(item.category)}
                            </Badge>
                          </div>
                  </div>
                      </Link>

                      {/* 商品信息 */}
                  <div className="flex-1 min-w-0">
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-2">
                          <div className="flex-1">
                            <Link to={`/products/${item.product_id}`}>
                              <h3 className="font-semibold text-gray-900 hover:text-blue-600 transition-colors line-clamp-2 text-sm md:text-base">
                                {item.name}
                              </h3>
                            </Link>
                            
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="secondary" className="text-xs bg-blue-50 text-blue-700">
                                {item.brand}
                              </Badge>
                              {item.variant_value && (
                                <Badge variant="outline" className="text-xs">
                            {item.variant_type}: {item.variant_value}
                                </Badge>
                        )}
                            </div>

                            {/* 價格顯示（含特價效果） */}
                            <div className="mt-2">
                              {item.original_price && item.original_price > item.price ? (
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <p className="text-sm text-gray-400 line-through">
                                      ${formatPrice(item.original_price)}
                                    </p>
                                    <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                                      -{Math.round((1 - item.price / item.original_price) * 100)}%
                                    </span>
                                  </div>
                                  <p className="text-lg font-bold text-red-600">
                                    ${formatPrice(item.price)}
                                    <span className="text-sm font-normal text-gray-500 ml-1">/ 個</span>
                                  </p>
                                </div>
                              ) : (
                                <p className="text-lg font-bold text-blue-600">
                                  ${formatPrice(item.price)}
                                  <span className="text-sm font-normal text-gray-500 ml-1">/ 個</span>
                                </p>
                              )}
                            </div>
                          </div>
                      </div>
                      
                          {/* 數量控制和價格 */}
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                              className="h-8 w-8 p-0 rounded-full"
                        >
                              <Minus size={14} />
                            </Button>
                            <span className="w-10 text-center font-semibold text-sm">
                          {item.quantity}
                        </span>
                            <Button
                              variant="outline"
                              size="sm"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="h-8 w-8 p-0 rounded-full"
                        >
                              <Plus size={14} />
                            </Button>
                      </div>
                      
                          <div className="flex items-center gap-3">
                            {/* 總價顯示（含特價效果） */}
                            {item.original_price && item.original_price > item.price ? (
                              <div className="text-right">
                                <p className="text-sm text-gray-400 line-through">
                                  ${formatPrice(item.original_price * item.quantity)}
                                </p>
                                <p className="text-lg font-bold text-red-600">
                                  ${formatPrice(item.total_price)}
                                </p>
                              </div>
                            ) : (
                              <p className="text-lg font-bold text-gray-900">
                                ${formatPrice(item.total_price)}
                              </p>
                            )}
                            {/* 桌面版移除按鈕 */}
                            <div className="hidden md:block">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeItem(item.id)}
                                className="text-gray-400 hover:text-red-500 hover:bg-red-50"
                              >
                                <Trash2 size={16} />
                              </Button>
                            </div>
                        </div>
                        </div>
                      </div>
        </div>

                    {/* 移除按鈕 - 移動端置於右上角 */}
                    <div className="absolute top-2 right-2 md:hidden">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(item.id)}
                        className="h-8 w-8 p-0 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full"
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
                  </div>

            {/* 訂單摘要 */}
            <div className="lg:col-span-1">
              <div className="sticky top-4 space-y-4">
                {/* 優惠券 */}
                <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Tag size={18} className="text-orange-500" />
                      優惠券
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {appliedCoupon ? (
                      <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                        <div>
                          <p className="font-semibold text-green-800">
                            {appliedCoupon.coupon.code}
                          </p>
                          <p className="text-sm text-green-600">
                            已節省 ${formatPrice(appliedCoupon.discountAmount)}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                    onClick={removeCoupon}
                          className="text-red-500 hover:text-red-700"
                  >
                    移除
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex gap-2">
                          <Input
                            placeholder="輸入優惠券代碼"
                            value={couponCode}
                            onChange={(e) => setCouponCode(e.target.value)}
                            className="flex-1"
                          />
                          <Button
                            onClick={applyCoupon}
                            disabled={couponLoading}
                            size="sm"
                            className="bg-orange-500 hover:bg-orange-600 text-white"
                          >
                            {couponLoading ? '檢查中...' : '套用'}
                          </Button>
                </div>
                </div>
              )}
                  </CardContent>
                </Card>
              
                {/* 費用明細 */}
                <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">訂單摘要</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">商品小計</span>
                                                 <span className="font-semibold">${formatPrice(totals.subtotal)}</span>
                    </div>
                      
                      <div className="flex justify-between">
                        <span className="text-gray-600">運費</span>
                        <span className={`font-semibold ${totals.shippingFee === 0 ? 'text-green-600' : ''}`}>
                          {totals.shippingFee === 0 ? '免費' : `$${totals.shippingFee}`}
                        </span>
                    </div>

                      {totals.discount > 0 && (
                      <div className="flex justify-between text-green-600">
                          <span>優惠券折扣</span>
                                                     <span className="font-semibold">-${formatPrice(totals.discount)}</span>
                  </div>
                    )}
                    </div>

                    <Separator />

                    <div className="flex justify-between text-lg font-bold">
                      <span>總計</span>
                                             <span className="text-blue-600">${formatPrice(totals.finalTotal)}</span>
                  </div>

                    <Button
                    onClick={() => navigate('/checkout')}
                      className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white py-3 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-[1.02]"
                  >
                    前往結帳
                    </Button>

                    <Button
                      variant="outline"
                      onClick={() => navigate('/products')}
                      className="w-full"
                    >
                      繼續購物
                    </Button>
                  </CardContent>
                </Card>

                {/* 服務保證 */}
                <Card className="border-0 shadow-sm bg-white/50">
                  <CardContent className="p-4">
                    <div className="grid grid-cols-1 gap-3 text-center">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Ship size={16} className="text-blue-500" />
                        <span>7-11 取貨付款</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Gift size={16} className="text-green-500" />
                                                 <span>滿 ${formatPrice(freeShippingThreshold)} 免運費</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                </div>
              </div>
          </div>
          )}
        </div>
      </div>
  );
};

export default Cart;
