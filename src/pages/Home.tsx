import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Zap, Shield, Truck, HeartHandshake, Waves, Sparkles, TrendingUp, Star } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import SEO, { createOrganizationStructuredData } from '@/components/SEO';
import { useSettingsStore } from '@/lib/store';
import { settingsAPI, homepageAPI } from '@/lib/api';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { loadSettings: loadDisplaySettings } = useSettingsStore();
  const [showAgeVerification, setShowAgeVerification] = useState(false);
  const [heroImageUrl, setHeroImageUrl] = useState('/images/20250710_1007_Desert Skateboarding Adventure_simple_compose_01jzs1d0rkfrktap14za68myeg.gif');
  const [isLoading, setIsLoading] = useState(true);
  const [homepageSettings, setHomepageSettings] = useState<any>({});

  useEffect(() => {
    // 檢查是否已經驗證過年齡
    const ageVerified = localStorage.getItem('ageVerified');
    if (!ageVerified) {
      setShowAgeVerification(true);
    }
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      // 載入首頁設置
      const homepageResponse = await homepageAPI.getSettings();
      setHomepageSettings(homepageResponse.data);
      
      // 如果有 hero 設置，使用它的圖片
      if (homepageResponse.data.hero?.image_url) {
        setHeroImageUrl(homepageResponse.data.hero.image_url);
      }
      
      // 載入系統設置（保留向後兼容）
      const response = await settingsAPI.getPublicSettings();
      if (!homepageResponse.data.hero?.image_url && response.data.hero_image_url) {
        setHeroImageUrl(response.data.hero_image_url);
      }
      
      // 載入商品顯示設置
      await loadDisplaySettings();
    } catch (error) {
      console.warn('載入設置失敗，使用默認設置:', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAgeConfirm = (isAdult: boolean) => {
    if (isAdult) {
      localStorage.setItem('ageVerified', 'true');
      setShowAgeVerification(false);
    } else {
      // 如果未滿18歲，重定向到其他頁面或顯示警告
      alert('很抱歉，本網站僅供18歲以上人士使用');
      window.location.href = 'https://www.google.com';
    }
  };

  const features = [
    {
      icon: Zap,
      title: '極速配送',
      description: '24小時內快速配送，讓您儘快享受',
      gradient: 'from-amber-400 to-orange-500',
      delay: '0ms'
    },
    {
      icon: Shield,
      title: '品質保證',
      description: '正品保證，所有產品均通過品質檢測',
      gradient: 'from-emerald-400 to-teal-500',
      delay: '100ms'
    },
    {
      icon: Truck,
      title: '免費配送',
      description: '滿額免運費，全台配送服務',
      gradient: 'from-blue-400 to-cyan-500',
      delay: '200ms'
    },
    {
      icon: HeartHandshake,
      title: '售後服務',
      description: '專業客服團隊，提供完善售後服務',
      gradient: 'from-pink-400 to-rose-500',
      delay: '300ms'
    }
  ];

  // 使用動態的產品分類數據
  const productCategories = [
    homepageSettings.hero1 && {
      title: homepageSettings.hero1.title || 'SP2 系列',
      subtitle: homepageSettings.hero1.subtitle || '極致工藝，完美體驗',
      content: homepageSettings.hero1.content,
      image: homepageSettings.hero1.image_url || '/images/sp2_device_main_showcase.jpg',
      category: 'host',
      gradient: 'from-slate-900/70 via-blue-900/60 to-cyan-900/70',
      accentColor: 'cyan',
      is_active: homepageSettings.hero1.is_active
    },
    homepageSettings.hero2 && {
      title: homepageSettings.hero2.title || 'Ilia 系列',
      subtitle: homepageSettings.hero2.subtitle || '時尚設計，品味生活',
      content: homepageSettings.hero2.content,
      image: homepageSettings.hero2.image_url || '/images/ilia_fabric_device_main.png',
      category: 'cartridge',
      gradient: 'from-purple-900/70 via-indigo-900/60 to-blue-900/70',
      accentColor: 'indigo',
      is_active: homepageSettings.hero2.is_active
    }
  ].filter(Boolean).filter(cat => cat.is_active !== false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 overflow-hidden">
      <SEO
        title="HAZO - 專業電子煙線上購物平台"
        description="HAZO 是台灣專業的電子煙線上商城，提供各大品牌電子煙主機、煙彈、拋棄式電子煙。正品保證，快速配送，優質售後服務。"
        keywords="電子煙,電子煙主機,煙彈,拋棄式電子煙,IQOS,JUUL,Vaporesso,SP2,Ilia,HTA,Lana,台灣電子煙,電子煙商城"
        url="/"
        structuredData={createOrganizationStructuredData()}
      />

      {/* Enhanced Hero Section */}
      <section className="relative min-h-[90vh] flex items-center py-20 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-20 -left-20 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute top-40 -right-20 w-96 h-96 bg-cyan-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-20 left-20 w-96 h-96 bg-teal-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Text Content */}
            <div className="text-center lg:text-left space-y-8 animate-fadeIn">
              {/* Premium Logo */}
              <div className="flex items-center justify-center lg:justify-start space-x-4">
                <div className="relative">
                  <Waves className="w-12 h-12 text-cyan-500 animate-pulse" />
                  <div className="absolute inset-0 w-12 h-12 bg-cyan-400 blur-xl opacity-50 animate-pulse"></div>
                </div>
                <h1 className="text-6xl lg:text-8xl font-black">
                  <span className="bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-500 bg-clip-text text-transparent">
                    {homepageSettings.hero?.title || 'HAZO'}
                  </span>
                </h1>
                <Sparkles className="w-8 h-8 text-amber-500 animate-spin-slow" />
              </div>

              {/* Tagline */}
              <div className="space-y-4">
                <p className="text-2xl lg:text-3xl font-light text-slate-700">
                  {homepageSettings.hero?.subtitle || '海洋品質 • 深度體驗'}
                </p>
                <p className="text-lg text-slate-600 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                  {homepageSettings.hero?.content || '探索來自深海的純淨品質，體驗如海洋般深邃的電子煙科技。HAZO 為您帶來最專業的電子煙產品與服務。'}
                </p>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                {homepageSettings.hero?.button_text && (
                  <button
                    onClick={() => navigate(homepageSettings.hero?.button_link || '/products')}
                    className="ocean-cta-primary group"
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      {homepageSettings.hero?.button_text || '探索產品'}
                      <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
                    </span>
                  </button>
                )}
                
                <button
                  onClick={() => navigate('/products?category=host')}
                  className="ocean-cta-secondary group"
                >
                  <span className="flex items-center justify-center gap-2">
                    主機系列
                    <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
                  </span>
                </button>
              </div>

              {/* Trust Indicators */}
              <div className="flex items-center gap-6 justify-center lg:justify-start pt-4">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-amber-500 fill-current" />
                  <span className="text-sm text-slate-600">4.9/5 顧客評分</span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-emerald-500" />
                  <span className="text-sm text-slate-600">10,000+ 滿意客戶</span>
                </div>
              </div>
            </div>

            {/* Hero Image */}
            <div className="relative animate-fadeIn animation-delay-300">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-cyan-600/20 rounded-3xl blur-3xl transform scale-95 group-hover:scale-100 transition-transform duration-500"></div>
                <div className="relative rounded-3xl overflow-hidden shadow-2xl transform transition-all duration-500 group-hover:scale-[1.02]">
                  <img
                    src={heroImageUrl}
                    alt="HAZO Premium Vape"
                    className="w-full h-[500px] lg:h-[600px] object-cover"
                    loading={isLoading ? "eager" : "lazy"}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 via-transparent to-transparent opacity-60"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Product Categories Section */}
      <section className="py-20 relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 animate-fadeIn">
            <h2 className="text-4xl lg:text-5xl font-bold text-slate-800 mb-4">
              精選系列
            </h2>
            <p className="text-xl text-slate-600">探索我們的旗艦產品</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {productCategories.map((category, index) => (
              <div
                key={index}
                className="group relative h-96 rounded-3xl overflow-hidden shadow-xl animate-fadeIn"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <img
                  src={category.image}
                  alt={category.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className={`absolute inset-0 bg-gradient-to-br ${category.gradient} transition-opacity duration-300 group-hover:opacity-80`}></div>
                
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-8">
                  <h3 className="text-3xl lg:text-4xl font-bold mb-4 transform transition-all duration-300 group-hover:scale-110">
                    {category.title}
                  </h3>
                  <p className="text-lg mb-2 opacity-90 transform transition-all duration-300 group-hover:translate-y-1">
                    {category.subtitle}
                  </p>
                  {category.content && (
                    <p className="text-sm text-center mb-8 opacity-80 max-w-md transform transition-all duration-300 group-hover:translate-y-1">
                      {category.content}
                    </p>
                  )}
                  <button
                    onClick={() => navigate(`/products?category=${category.category}`)}
                    className="ocean-button-primary bg-white/20 hover:bg-white/30 border border-white/30"
                  >
                    了解更多
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-b from-slate-50 to-white relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 animate-fadeIn">
            <h2 className="text-4xl lg:text-5xl font-bold text-slate-800 mb-6">
              為什麼選擇 HAZO？
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              我們致力於提供如海洋般純淨的品質體驗，每一個細節都經過精心設計
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 animate-fadeIn"
                style={{ animationDelay: feature.delay }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-transparent to-slate-50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                <div className="relative">
                  <div className={`w-16 h-16 mx-auto mb-6 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center transform transition-all duration-300 group-hover:scale-110 group-hover:rotate-3`}>
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-3 text-center">
                    {feature.title}
                  </h3>
                  <p className="text-slate-600 text-center leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-cyan-600 to-teal-600"></div>
        <div className="absolute inset-0 bg-[url('/images/pattern.svg')] opacity-10"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center text-white">
            <Waves className="w-16 h-16 mx-auto mb-8 animate-bounce" />
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              準備開始您的 HAZO 體驗？
            </h2>
            <p className="text-xl lg:text-2xl mb-10 opacity-90">
              立即探索我們的產品系列，發現屬於您的完美選擇
            </p>
            <button
              onClick={() => navigate('/products')}
              className="ocean-cta-primary ocean-button-lg bg-white text-blue-600 hover:bg-white/90 hover:shadow-white/20 group"
            >
              <span className="flex items-center gap-3">
                立即購買
                <ArrowRight className="w-6 h-6 transition-transform duration-300 group-hover:translate-x-2" />
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* Age Verification Modal */}
      <Dialog open={showAgeVerification} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md bg-white/95 backdrop-blur-xl border-2 border-blue-100 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-center">
              <div className="flex items-center justify-center gap-3 mb-6">
                <Waves className="w-10 h-10 text-blue-600" />
                <span className="text-3xl font-bold text-slate-800">年齡驗證</span>
              </div>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-6 rounded-xl shadow-lg">
              <p className="font-bold text-lg mb-2 flex items-center gap-2">
                <span className="text-2xl">⚠️</span> 重要提醒
              </p>
              <p className="text-sm leading-relaxed">
                本網站銷售的電子煙產品含有尼古丁
              </p>
            </div>
            
            <p className="text-xl text-slate-700 text-center font-medium">
              請確認您是否已滿 18 歲？
            </p>
            
            <div className="flex gap-4 justify-center pt-4">
              <button
                onClick={() => handleAgeConfirm(true)}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-xl"
              >
                是，我已滿18歲
              </button>
              <button
                onClick={() => handleAgeConfirm(false)}
                className="px-8 py-3 bg-slate-100 text-slate-700 font-semibold rounded-xl transition-all duration-300 hover:bg-slate-200 hover:scale-105"
              >
                否，我未滿18歲
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Custom CSS for animations */}
      <style>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        
        .animate-blob {
          animation: blob 7s infinite;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        
        .animate-spin-slow {
          animation: spin 3s linear infinite;
        }
        
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.8s ease-out forwards;
          opacity: 0;
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animation-delay-300 {
          animation-delay: 300ms;
        }
      `}</style>
    </div>
  );
};

export default Home;