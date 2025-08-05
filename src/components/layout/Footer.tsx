import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Waves, Clock, Shield } from 'lucide-react';
import { categoriesAPI } from '@/lib/api';

const Footer: React.FC = () => {
  const [categories, setCategories] = useState<any[]>([]);

  // 獲取分類數據
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoriesAPI.getCategories();
        setCategories(response.data.filter((cat: any) => cat.is_active)
          .sort((a: any, b: any) => a.display_order - b.display_order));
      } catch (error) {
        console.error('獲取分類失敗:', error);
      }
    };
    fetchCategories();
  }, []);

  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
          .ocean-footer {
            background: var(--ocean-gradient-secondary);
            color: var(--ocean-pearl-white);
            position: relative;
            overflow: hidden;
          }
          
          .ocean-footer::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: var(--ocean-gradient-primary);
          }
          
          .footer-wave-pattern {
            position: absolute;
            top: -50px;
            left: 0;
            right: 0;
            height: 100px;
            background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 120'%3E%3Cpath d='M0,60 C300,120 900,0 1200,60 L1200,0 L0,0 Z' fill='%23F5F6F5'/%3E%3C/svg%3E") repeat-x;
            background-size: 1200px 100px;
          }
          
          .hazo-footer-logo {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            font-size: 1.5rem;
            font-weight: 800;
            letter-spacing: -0.05em;
            color: var(--ocean-pearl-white);
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 1rem;
          }
          
          .footer-wave-icon {
            color: var(--ocean-sea-green);
            animation: gentle-wave 3s ease-in-out infinite;
          }
          
          .footer-section-title {
            font-weight: 600;
            color: var(--ocean-pearl-white);
            font-size: 1.1rem;
            margin-bottom: 1rem;
            position: relative;
            padding-bottom: 0.5rem;
          }
          
          .footer-section-title::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 0;
            width: 40px;
            height: 2px;
            background: var(--ocean-sea-green);
          }
          
          .footer-link {
            color: rgba(245, 246, 245, 0.8);
            transition: all 0.3s ease;
            display: inline-block;
            position: relative;
          }
          
          .footer-link:hover {
            color: var(--ocean-sea-green);
            transform: translateX(4px);
          }
          
          .footer-contact-item {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            color: rgba(245, 246, 245, 0.9);
            margin-bottom: 0.75rem;
            transition: all 0.3s ease;
          }
          
          .footer-contact-item:hover {
            color: var(--ocean-sea-green);
          }
          
          .footer-contact-icon {
            color: var(--ocean-sea-green);
            flex-shrink: 0;
          }
          
          .footer-social-links {
            display: flex;
            gap: 1rem;
            margin-top: 1rem;
          }
          
          .footer-social-link {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 40px;
            height: 40px;
            background: rgba(245, 246, 245, 0.1);
            border-radius: 50%;
            color: rgba(245, 246, 245, 0.8);
            transition: all 0.3s ease;
          }
          
          .footer-social-link:hover {
            background: var(--ocean-sea-green);
            color: var(--ocean-pearl-white);
            transform: translateY(-2px);
          }
          
          .footer-bottom {
            background: rgba(30, 58, 138, 0.3);
            border-top: 1px solid rgba(75, 156, 211, 0.2);
            backdrop-filter: blur(10px);
          }
          
          .footer-features {
            display: flex;
            gap: 2rem;
            flex-wrap: wrap;
            margin-bottom: 1rem;
          }
          
          .footer-feature {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            color: rgba(245, 246, 245, 0.9);
            font-size: 0.875rem;
          }
          
          .footer-feature-icon {
            color: var(--ocean-sea-green);
            flex-shrink: 0;
          }
          
          @media (max-width: 768px) {
            .footer-features {
              gap: 1rem;
            }
            
            .footer-feature {
              font-size: 0.8rem;
            }
          }
        `
      }} />
      
      <footer className="ocean-footer">
        <div className="footer-wave-pattern"></div>
        
        <div className="container mx-auto px-4 py-12 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="space-y-4">
              <div className="hazo-footer-logo">
                <Waves className="footer-wave-icon" size={20} />
                <span>HAZO</span>
              </div>
              <p className="text-sm leading-relaxed opacity-90">
                HAZO 致力於提供最優質的電子煙產品與服務，讓每一位顧客都能享受到最純淨、最舒適的使用體驗。
              </p>
              
              <div className="footer-features">
                <div className="footer-feature">
                  <Shield className="footer-feature-icon" size={16} />
                  <span>正品保證</span>
                </div>
                <div className="footer-feature">
                  <Clock className="footer-feature-icon" size={16} />
                  <span>快速配送</span>
                </div>
              </div>

              <div className="footer-social-links">
                <a href="#" className="footer-social-link" aria-label="Facebook">
                  <Facebook size={18} />
                </a>
                <a href="#" className="footer-social-link" aria-label="Twitter">
                  <Twitter size={18} />
                </a>
                <a href="#" className="footer-social-link" aria-label="Instagram">
                  <Instagram size={18} />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div className="space-y-4">
              <h3 className="footer-section-title">快速連結</h3>
              <ul className="space-y-1">
                <li>
                  <Link to="/" className="footer-link text-sm">
                    首頁
                  </Link>
                </li>
                <li>
                  <Link to="/products" className="footer-link text-sm">
                    所有商品
                  </Link>
                </li>
                {/* 動態分類連結 */}
                {categories.slice(0, 4).map((category) => (
                  <li key={category.slug}>
                    <Link 
                      to={`/products?category=${category.slug}`} 
                      className="footer-link text-sm"
                    >
                      {category.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Customer Service */}
            <div className="space-y-4">
              <h3 className="footer-section-title">客戶服務</h3>
              <ul className="space-y-1">
                <li>
                  <Link to="/shipping" className="footer-link text-sm">
                    配送說明
                  </Link>
                </li>
                <li>
                  <Link to="/returns" className="footer-link text-sm">
                    退換貨政策
                  </Link>
                </li>
                <li>
                  <a href="#" className="footer-link text-sm">
                    常見問題
                  </a>
                </li>
                <li>
                  <a href="#" className="footer-link text-sm">
                    聯絡客服
                  </a>
                </li>
                <li>
                  <a href="#" className="footer-link text-sm">
                    產品保固
                  </a>
                </li>
              </ul>
            </div>

            {/* Contact Info */}
            <div className="space-y-4">
              <h3 className="footer-section-title">聯絡我們</h3>
              <div className="space-y-3">
                <div className="footer-contact-item">
                  <Phone className="footer-contact-icon" size={16} />
                  <span className="text-sm">02-1234-5678</span>
                </div>
                <div className="footer-contact-item">
                  <Mail className="footer-contact-icon" size={16} />
                  <span className="text-sm">service@hazo.com.tw</span>
                </div>
                <div className="footer-contact-item">
                  <MapPin className="footer-contact-icon" size={16} />
                  <span className="text-sm">台北市信義區松高路</span>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-black/20 rounded-lg">
                <div className="text-sm font-medium mb-1">營業時間</div>
                <div className="text-xs opacity-90">
                  週一至週五：09:00-18:00<br />
                  週六週日：10:00-17:00
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="footer-bottom mt-12 pt-6 border-t border-white/20">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <div className="text-sm opacity-80 text-center md:text-left">
                © 2024 HAZO. 版權所有。
              </div>
              <div className="flex space-x-6 text-sm">
                <a href="#" className="footer-link">隱私政策</a>
                <a href="#" className="footer-link">服務條款</a>
                <a href="#" className="footer-link">Cookie 政策</a>
              </div>
            </div>
            
            <div className="mt-4 text-center">
              <p className="text-xs opacity-70">
                本網站僅供18歲以上成年人使用。電子煙含有尼古丁，使用前請詳閱產品說明。
              </p>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;