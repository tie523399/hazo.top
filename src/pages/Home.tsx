import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Zap, Shield, Truck, HeartHandshake, Waves, Sparkles, TrendingUp, Star } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import SEO, { createOrganizationStructuredData } from '@/components/SEO';
import { useSettingsStore } from '@/lib/store';
import { homepageAPI } from '@/lib/api';

interface Feature {
  icon: string;
  title: string;
  description: string;
  gradient: string;
  delay: string;
}

interface HomepageSettings {
  hero?: any;
  hero_main?: any;
  hero1?: any;
  hero2?: any;
  features?: any;
}

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { loadSettings: loadDisplaySettings } = useSettingsStore();
  const [showAgeVerification, setShowAgeVerification] = useState(false);
  const [heroImageUrl, setHeroImageUrl] = useState('/images/20250710_1007_Desert Skateboarding Adventure_simple_compose_01jzs1d0rkfrktap14za68myeg.gif');
  const [isLoading, setIsLoading] = useState(true);
  const [homepageSettings, setHomepageSettings] = useState<HomepageSettings>({});
  const [features, setFeatures] = useState<Feature[]>([]);

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
      setIsLoading(true);
      // 載入顯示設置
      await loadDisplaySettings();
      
      // 載入首頁設置
      const response = await homepageAPI.getAllSettings();
      if (response?.data) {
        const settingsMap: HomepageSettings = {};
        response.data.forEach((setting: any) => {
          settingsMap[setting.section as keyof HomepageSettings] = setting;
        });
        setHomepageSettings(settingsMap);
        
        // 設置主圖
        if (settingsMap.hero_main?.image_url) {
          setHeroImageUrl(settingsMap.hero_main.image_url);
        }
        
        // 設置特色功能
        if (settingsMap.features?.content) {
          try {
            const featuresData = JSON.parse(settingsMap.features.content);
            setFeatures(Array.isArray(featuresData) ? featuresData : []);
          } catch (error) {
            console.error('解析特色功能失敗:', error);
            setFeatures(getDefaultFeatures());
          }
        } else {
          setFeatures(getDefaultFeatures());
        }
      }
    } catch (error) {
      console.error('載入首頁設置失敗:', error);
      // 使用默認特色功能
      setFeatures(getDefaultFeatures());
    } finally {
      setIsLoading(false);
    }
  };

  // 獲取默認特色功能（作為後備）
  const getDefaultFeatures = (): Feature[] => [
    {
      icon: 'Zap',
      title: '極速配送',
      description: '24小時內快速配送，讓您儘快享受',
      gradient: 'from-amber-400 to-orange-500',
      delay: '0ms'
    },
    {
      icon: 'Shield',
      title: '品質保證',
      description: '正品保證，所有產品均通過品質檢測',
      gradient: 'from-emerald-400 to-teal-500',
      delay: '100ms'
    },
    {
      icon: 'Truck',
      title: '免費配送',
      description: '滿額免運費，全台配送服務',
      gradient: 'from-blue-400 to-cyan-500',
      delay: '200ms'
    },
    {
      icon: 'HeartHandshake',
      title: '售後服務',
      description: '專業客服團隊，提供完善售後服務',
      gradient: 'from-pink-400 to-rose-500',
      delay: '300ms'
    }
  ];

  const handleAgeConfirm = (isAdult: boolean) => {
    if (isAdult) {
      localStorage.setItem('ageVerified', 'true');
      setShowAgeVerification(false);
    } else {
      window.location.href = 'https://www.google.com';
    }
  };

  // 獲取圖標組件
  const getIconComponent = (iconName: string) => {
    const icons: Record<string, any> = {
      Zap, Shield, Truck, HeartHandshake, Waves, Sparkles, TrendingUp, Star
    };
    return icons[iconName] || Star;
  };

  // 使用動態的產品分類數據
  const productCategories = [
    homepageSettings.hero1 && {
      title: homepageSettings.hero1.title || 'SP2 系列',
      subtitle: homepageSettings.hero1.subtitle || '極致工藝，完美體驗',
      content: homepageSettings.hero1.content,
      image: homepageSettings.hero1.image_url || '/images/sp2_device_main_showcase.jpg',
      category: homepageSettings.hero1.button_link || 'host',
      gradient: 'from-slate-900/70 via-blue-900/60 to-cyan-900/70',
      accentColor: 'cyan',
      is_active: homepageSettings.hero1.is_active
    },
    homepageSettings.hero2 && {
      title: homepageSettings.hero2.title || 'Ilia 系列',
      subtitle: homepageSettings.hero2.subtitle || '時尚設計，品味生活',
      content: homepageSettings.hero2.content,
      image: homepageSettings.hero2.image_url || '/images/ilia_fabric_device_main.png',
      category: homepageSettings.hero2.button_link || 'cartridge',
      gradient: 'from-purple-900/70 via-indigo-900/60 to-blue-900/70',
      accentColor: 'indigo',
      is_active: homepageSettings.hero2.is_active
    }
  ].filter(Boolean).filter(cat => cat.is_active !== false);

  return (
    <>
      <SEO
        title="HAZO 電子煙商城 - 台灣優質電子煙專賣店"
        description="HAZO電子煙商城提供高品質電子煙產品，包含主機、煙彈、一次性電子煙等。正品保證、快速配送、專業售後服務。"
        keywords="電子煙,電子菸,VAPE,煙彈,一次性電子煙,電子煙主機,台灣電子煙,HAZO"
        url="/"
        structuredData={createOrganizationStructuredData()}
      />
      
      <div className="relative min-h-screen overflow-hidden">
        {/* Hero Section with Background */}
        <div 
          className="relative h-screen bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('${heroImageUrl}')`,
          }}
        >
          {/* Dark overlay for better text readability */}
          <div className="absolute inset-0 bg-black/40" />
          
          {/* Hero Content */}
          <div className="relative z-10 flex items-center justify-center h-full">
            <div className="text-center text-white px-4 max-w-4xl mx-auto">
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-blue-100 to-cyan-100 bg-clip-text text-transparent animate-fade-in">
                {homepageSettings.hero?.title || 'HAZO'}
              </h1>
              <p className="text-xl md:text-2xl lg:text-3xl mb-8 font-light opacity-90 animate-fade-in-delay-1">
                {homepageSettings.hero?.subtitle || '海洋品質 • 深度體驗'}
              </p>
              <p className="text-lg md:text-xl mb-10 opacity-80 max-w-3xl mx-auto leading-relaxed animate-fade-in-delay-2">
                {homepageSettings.hero?.content || '探索來自深海的純淨品質，體驗如海洋般深邃的電子煙科技。HAZO 為您帶來最專業的電子煙產品與服務。'}
              </p>
              <button
                onClick={() => navigate('/products')}
                className="group relative inline-flex items-center px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full overflow-hidden transition-all duration-300 hover:from-blue-700 hover:to-cyan-700 hover:scale-105 hover:shadow-2xl animate-fade-in-delay-3"
              >
                <span className="relative z-10">
                  {homepageSettings.hero?.button_text || '探索產品'}
                </span>
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-blue-600 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300" />
              </button>
            </div>
          </div>
          
          {/* Scroll indicator */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white animate-bounce">
            <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center">
              <div className="w-1 h-3 bg-white rounded-full mt-2 animate-pulse" />
            </div>
          </div>
        </div>

        {/* Features Section */}
        {features.length > 0 && homepageSettings.features?.is_active !== false && (
          <section className="py-20 bg-gradient-to-br from-slate-50 to-blue-50">
            <div className="container mx-auto px-4">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  {homepageSettings.features?.title || '我們的服務特色'}
                </h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                  {homepageSettings.features?.subtitle || '為您提供最優質的購物體驗'}
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {features.map((feature, index) => {
                  const IconComponent = getIconComponent(feature.icon);
                  return (
                    <div
                      key={index}
                      className="group p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-gray-100"
                      style={{ animationDelay: feature.delay }}
                    >
                      <div className={`w-16 h-16 rounded-xl bg-gradient-to-r ${feature.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                        <IconComponent className="h-8 w-8 text-white" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                      <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* Product Categories Section */}
        {productCategories.length > 0 && (
          <section className="py-20 bg-white">
            <div className="container mx-auto px-4">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">精選產品系列</h2>
                <p className="text-lg text-gray-600">探索我們的專業電子煙產品系列</p>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {productCategories.map((category, index) => (
                  <div
                    key={index}
                    className="group relative h-96 rounded-3xl overflow-hidden cursor-pointer transform transition-all duration-500 hover:scale-105 hover:shadow-2xl"
                    onClick={() => navigate(`/products?category=${category.category}`)}
                  >
                    <img
                      src={category.image}
                      alt={category.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className={`absolute inset-0 bg-gradient-to-br ${category.gradient} group-hover:opacity-80 transition-opacity duration-300`} />
                    
                    <div className="absolute inset-0 flex items-center justify-center p-8">
                      <div className="text-center text-white transform transition-all duration-500 group-hover:-translate-y-4">
                        <h3 className="text-3xl md:text-4xl font-bold mb-4 drop-shadow-lg">
                          {category.title}
                        </h3>
                        <p className="text-xl md:text-2xl font-light mb-6 opacity-90 drop-shadow">
                          {category.subtitle}
                        </p>
                        {category.content && (
                          <p className="text-lg opacity-80 max-w-md mx-auto leading-relaxed drop-shadow mb-6">
                            {category.content}
                          </p>
                        )}
                        <div className={`inline-flex items-center px-6 py-3 border-2 border-${category.accentColor}-300 text-white rounded-full transition-all duration-300 group-hover:bg-${category.accentColor}-500 group-hover:border-${category.accentColor}-500`}>
                          <span className="font-semibold">立即探索</span>
                          <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-blue-600 to-cyan-600">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              準備好開始您的HAZO體驗了嗎？
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              立即瀏覽我們的產品系列，享受專業的電子煙體驗
            </p>
            <button
              onClick={() => navigate('/products')}
              className="group inline-flex items-center px-8 py-4 text-lg font-semibold text-blue-600 bg-white rounded-full transition-all duration-300 hover:bg-blue-50 hover:scale-105 hover:shadow-xl"
            >
              <span>開始購物</span>
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </section>

        {/* Age Verification Modal */}
        <Dialog open={showAgeVerification} onOpenChange={() => {}}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-center text-2xl font-bold text-gray-900">
                年齡驗證
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-6 py-4">
              <div className="text-center">
                <img 
                  src="/images/age_verification_icon.png" 
                  alt="年齡驗證" 
                  className="w-20 h-20 mx-auto mb-4"
                />
                <p className="text-gray-700 text-lg leading-relaxed">
                  本網站販售的電子煙產品僅供<span className="font-bold text-red-600">18歲以上</span>成年人使用
                </p>
                <p className="text-gray-600 mt-2">
                  請確認您已滿18歲
                </p>
              </div>
              
              <div className="flex gap-4">
                <button
                  onClick={() => handleAgeConfirm(true)}
                  className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
                >
                  我已滿18歲
                </button>
                <button
                  onClick={() => handleAgeConfirm(false)}
                  className="flex-1 px-6 py-3 bg-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-400 transition-colors"
                >
                  未滿18歲
                </button>
              </div>
              
              <p className="text-xs text-gray-500 text-center">
                點擊「我已滿18歲」即表示您確認已滿18歲，並同意使用本網站
              </p>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
};

export default Home;