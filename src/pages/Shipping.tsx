import React, { useState, useEffect } from 'react';
import { ShoppingCart, CreditCard, Truck, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import SEO from '@/components/SEO';
import { Card, CardContent } from '@/components/ui/card';
import { pageContentsAPI } from '@/lib/api';

interface ShippingStep {
  step: number;
  title: string;
  description: string;
  icon: string;
}

interface PageContent {
  steps?: ShippingStep[];
  notes?: string[];
}

const Shipping: React.FC = () => {
  const [pageContent, setPageContent] = useState<PageContent>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPageContent = async () => {
      try {
        setLoading(true);
        const content = await pageContentsAPI.getPageContent('shipping');
        setPageContent(content.content || {});
      } catch (err: any) {
        console.error('獲取配送說明內容失敗:', err);
        setError('無法載入頁面內容，請稍後再試');
        // 使用預設內容作為後備
        setPageContent({
          steps: [
            {
              step: 1,
              title: '選擇商品',
              description: '瀏覽我們精選的電子煙產品，加入購物車',
              icon: 'ShoppingCart'
            },
            {
              step: 2,
              title: '結帳付款',
              description: '選擇便利商店取貨，填寫資料並完成付款',
              icon: 'CreditCard'
            },
            {
              step: 3,
              title: '取貨享受',
              description: '3-5個工作天後，前往指定便利商店取貨',
              icon: 'Truck'
            }
          ],
          notes: [
            '支援7-11、全家便利商店取貨',
            '單筆訂單滿1000元免運費',
            '取貨期限為7天，逾期將退回'
          ]
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPageContent();
  }, []);

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'ShoppingCart':
        return ShoppingCart;
      case 'CreditCard':
        return CreditCard;
      case 'Truck':
        return Truck;
      default:
        return ShoppingCart;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">載入中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <SEO
        title="配送說明 - HAZO 電子煙商城"
        description="了解 HAZO 電子煙商城的配送流程，簡單三步驟完成購物。支援7-11、全家便利商店取貨，3-5個工作天快速配送。"
        keywords="配送說明,電子煙配送,便利商店取貨,7-11取貨,全家取貨,電子煙購物流程"
        url="/shipping"
      />
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">配送說明</h1>
            <p className="text-lg text-gray-600">
              簡單三步驟，輕鬆完成購物流程
            </p>
          </div>

          {error && (
            <Card className="bg-yellow-50 border-yellow-200 mb-8">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-yellow-800">
                  <AlertCircle className="h-5 w-5" />
                  <p>{error}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Steps */}
          <div className="space-y-12">
            {pageContent.steps?.map((step, index) => {
              const IconComponent = getIcon(step.icon);
              return (
                <div key={step.step} className="flex items-center space-x-8">
                  {/* Step Number */}
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold">
                      {step.step}
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="flex-grow">
                    <div className="bg-white rounded-lg shadow-md p-6">
                      <div className="flex items-center mb-4">
                        <IconComponent className="h-8 w-8 text-blue-600 mr-3" />
                        <h3 className="text-xl font-semibold text-gray-900">{step.title}</h3>
                      </div>
                      <p className="text-gray-600">{step.description}</p>
                    </div>
                  </div>
                  
                  {/* Connector */}
                  {index < (pageContent.steps?.length || 0) - 1 && (
                    <div className="absolute left-8 mt-20 w-0.5 h-8 bg-gray-300"></div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Important Notes */}
          {pageContent.notes && pageContent.notes.length > 0 && (
            <div className="mt-16">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <div className="flex items-center mb-4">
                  <AlertCircle className="h-6 w-6 text-blue-600 mr-2" />
                  <h3 className="text-lg font-semibold text-blue-900">重要提醒</h3>
                </div>
                <ul className="space-y-2">
                  {pageContent.notes.map((note, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-blue-800">{note}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Additional Info */}
          <div className="mt-12 grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center mb-4">
                <Clock className="h-6 w-6 text-purple-600 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">配送時間</h3>
              </div>
              <ul className="space-y-2 text-gray-600">
                <li>• 一般商品：3-5個工作天</li>
                <li>• 現貨商品：1-3個工作天</li>
                <li>• 預購商品：依商品頁說明</li>
                <li>• 假日及國定假日暫停配送</li>
              </ul>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center mb-4">
                <Truck className="h-6 w-6 text-green-600 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">取貨方式</h3>
              </div>
              <ul className="space-y-2 text-gray-600">
                <li>• 7-11便利商店取貨</li>
                <li>• 全家便利商店取貨</li>
                <li>• 萊爾富便利商店取貨</li>
                <li>• OK便利商店取貨</li>
              </ul>
            </div>
          </div>

          {/* Contact */}
          <div className="mt-12 text-center">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-2">需要協助？</h3>
              <p className="mb-4">如有任何配送相關問題，歡迎隨時聯絡我們</p>
              <div className="flex justify-center space-x-6">
                <div>
                  <p className="font-semibold">客服電話</p>
                  <p>02-1234-5678</p>
                </div>
                <div>
                  <p className="font-semibold">服務時間</p>
                  <p>週一至週五 9:00-18:00</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Shipping;