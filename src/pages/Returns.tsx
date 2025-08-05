import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, XCircle, Clock, Shield, MessageCircle, Package, RefreshCw, CheckSquare, Mail, Phone } from 'lucide-react';
import SEO from '@/components/SEO';
import { pageContentsAPI } from '@/lib/api';

interface PolicySection {
  title: string;
  description: string;
  items: string[];
}

interface ContactInfo {
  title: string;
  description: string;
  email: string;
  phone: string;
  hours: string;
}

interface PageContent {
  returnPolicy?: PolicySection;
  exchangePolicy?: PolicySection;
  warrantyPolicy?: PolicySection;
  contactInfo?: ContactInfo;
}

const Returns: React.FC = () => {
  const [pageContent, setPageContent] = useState<PageContent>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPageContent = async () => {
      try {
        setLoading(true);
        const content = await pageContentsAPI.getPageContent('returns');
        setPageContent(content.content || {});
      } catch (err: any) {
        console.error('獲取退換貨政策內容失敗:', err);
        setError('無法載入頁面內容，請稍後再試');
        // 使用預設內容作為後備
        setPageContent({
          returnPolicy: {
            title: '退貨政策',
            description: '為保障消費者權益，我們提供以下退貨服務：',
            items: [
              '商品收到後7天內，如有品質問題可申請退貨',
              '退貨商品需保持原包裝完整，未使用且無人為損壞',
              '電子煙主機需附上所有配件及包裝盒',
              '煙彈類產品一經拆封恕不接受退貨（品質問題除外）',
              '退貨運費由消費者負擔，品質問題則由本公司承擔'
            ]
          },
          exchangePolicy: {
            title: '換貨政策',
            description: '提供便利的換貨服務：',
            items: [
              '商品收到後7天內可申請換貨',
              '僅限相同產品不同規格的換貨',
              '換貨商品需保持原包裝完整',
              '換貨運費由消費者負擔'
            ]
          },
          warrantyPolicy: {
            title: '保固政策',
            description: '電子煙主機享有保固服務：',
            items: [
              '電子煙主機提供3個月保固',
              '保固期內非人為損壞可免費維修',
              '保固不包含配件及煙彈',
              '保固期間需出示購買憑證'
            ]
          },
          contactInfo: {
            title: '聯絡資訊',
            description: '如有任何問題，歡迎聯絡我們：',
            email: 'service@hazo.com.tw',
            phone: '02-1234-5678',
            hours: '週一至週五 9:00-18:00'
          }
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPageContent();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">載入中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <SEO
        title="退換貨政策 - HAZO 電子煙商城"
        description="HAZO 電子煙商城退換貨政策，7天內品質問題可退換貨，電子煙主機提供3個月保固服務。詳細退換貨流程說明。"
        keywords="退換貨政策,電子煙退貨,電子煙換貨,保固服務,退款流程,電子煙保固"
        url="/returns"
      />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">退換貨政策</h1>
            <p className="text-xl opacity-90">保障您的購物權益，安心購買</p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          
          {error && (
            <Card className="bg-yellow-50 border-yellow-200">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-yellow-800">
                  <MessageCircle className="h-5 w-5" />
                  <p>{error}</p>
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* 退貨政策 */}
          {pageContent.returnPolicy && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <RefreshCw className="h-6 w-6 text-blue-600" />
                  {pageContent.returnPolicy.title}
                </CardTitle>
                <CardDescription>{pageContent.returnPolicy.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {pageContent.returnPolicy.items.map((item, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <div className="font-medium">
                        {item.includes('7 天內') ? (
                          <>
                            商品收到後 <Badge variant="outline">7 天內</Badge>，如有品質問題可申請退貨
                          </>
                        ) : (
                          <p>{item}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* 換貨政策 */}
          {pageContent.exchangePolicy && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-6 w-6 text-green-600" />
                  {pageContent.exchangePolicy.title}
                </CardTitle>
                <CardDescription>{pageContent.exchangePolicy.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {pageContent.exchangePolicy.items.map((item, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <CheckSquare className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <div className="font-medium">
                        {item.includes('7天內') ? (
                          <>
                            商品收到後<Badge variant="outline" className="mx-1">7天內</Badge>可申請換貨
                          </>
                        ) : (
                          <p>{item}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* 保固政策 */}
          {pageContent.warrantyPolicy && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-6 w-6 text-purple-600" />
                  {pageContent.warrantyPolicy.title}
                </CardTitle>
                <CardDescription>{pageContent.warrantyPolicy.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {pageContent.warrantyPolicy.items.map((item, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <Clock className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
                      <div className="font-medium">
                        {item.includes('3個月') ? (
                          <>
                            電子煙主機提供<Badge variant="outline" className="mx-1">3個月保固</Badge>
                          </>
                        ) : (
                          <p>{item}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* 聯絡資訊 */}
          {pageContent.contactInfo && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-6 w-6 text-blue-600" />
                  {pageContent.contactInfo.title}
                </CardTitle>
                <CardDescription>{pageContent.contactInfo.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-semibold">電子郵件</p>
                      <p className="text-blue-600">{pageContent.contactInfo.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-semibold">客服電話</p>
                      <p className="text-green-600">{pageContent.contactInfo.phone}</p>
                    </div>
                  </div>
                </div>
                <Separator className="my-4" />
                <div className="text-center">
                  <p className="text-sm text-gray-600">
                    <Clock className="inline h-4 w-4 mr-1" />
                    服務時間：{pageContent.contactInfo.hours}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 重要提醒 */}
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-800">
                <XCircle className="h-6 w-6" />
                重要提醒
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-blue-800">
                <p>• 為確保您的權益，請在收到商品後立即檢查</p>
                <p>• 如有任何問題，請盡快與我們聯絡</p>
                <p>• 退換貨申請需在期限內提出，逾期恕無法受理</p>
                <p>• 所有退換貨商品將經過品質檢查程序</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Returns;