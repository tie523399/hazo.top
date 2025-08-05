import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, Users, Award, Target } from 'lucide-react';
import SEO from '@/components/SEO';

const About: React.FC = () => {
  return (
    <>
      <SEO 
        title="關於我們 - HAZO P2P" 
        description="了解HAZO P2P的企業使命、團隊和服務理念" 
      />
      
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
        <div className="container mx-auto px-4 py-12">
          {/* 頁面標題 */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              關於 HAZO P2P
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              致力於為客戶提供優質的產品和服務，打造值得信賴的電商平台
            </p>
          </div>

          {/* 公司介紹 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-blue-600" />
                  公司簡介
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">
                  HAZO P2P 成立於2024年，是一家專注於電子商務的創新企業。
                  我們致力於為客戶提供高品質的產品和卓越的購物體驗。
                  通過不斷的技術創新和服務優化，我們已成為行業內備受信賴的品牌。
                </p>
              </CardContent>
            </Card>

            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-green-600" />
                  企業使命
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">
                  讓每一位客戶都能享受到便捷、安全、優質的購物體驗。
                  我們相信技術的力量，致力於通過創新的解決方案，
                  為客戶創造更大的價值，推動電商行業的持續發展。
                </p>
              </CardContent>
            </Card>
          </div>

          {/* 核心價值 */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
              核心價值觀
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">品質至上</h3>
                <p className="text-gray-600">
                  嚴格把控產品品質，為客戶提供最優質的商品
                </p>
              </div>

              <div className="text-center">
                <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">客戶至上</h3>
                <p className="text-gray-600">
                  以客戶需求為中心，提供貼心的服務體驗
                </p>
              </div>

              <div className="text-center">
                <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Target className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">創新進取</h3>
                <p className="text-gray-600">
                  持續創新技術和服務模式，引領行業發展
                </p>
              </div>

              <div className="text-center">
                <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Building2 className="h-8 w-8 text-orange-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">誠信經營</h3>
                <p className="text-gray-600">
                  以誠待人，以信經營，建立長期合作關係
                </p>
              </div>
            </div>
          </div>

          {/* 服務特色 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-center">我們的服務特色</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <Badge variant="secondary" className="mb-3">
                    快速配送
                  </Badge>
                  <p className="text-gray-700">
                    全台灣快速配送，24小時內出貨，讓您快速收到心愛的商品
                  </p>
                </div>

                <div className="text-center">
                  <Badge variant="secondary" className="mb-3">
                    品質保證
                  </Badge>
                  <p className="text-gray-700">
                    所有商品均通過嚴格品質檢測，提供完善的售後保障服務
                  </p>
                </div>

                <div className="text-center">
                  <Badge variant="secondary" className="mb-3">
                    安全支付
                  </Badge>
                  <p className="text-gray-700">
                    多種安全支付方式，保護您的資金安全和個人隱私
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 聯繫資訊 */}
          <div className="mt-12 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              聯繫我們
            </h2>
            <p className="text-gray-600 mb-6">
              如有任何問題或建議，歡迎隨時與我們聯繫
            </p>
            <div className="inline-flex flex-wrap gap-4 justify-center">
              <Badge variant="outline" className="text-sm">
                Email: support@hazosp2p.top
              </Badge>
              <Badge variant="outline" className="text-sm">
                客服時間: 週一至週五 9:00-18:00
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default About;