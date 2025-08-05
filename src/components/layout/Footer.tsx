import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Waves, Clock, Shield } from 'lucide-react';

const Footer: React.FC = () => {
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
            color: var(--ocean-pearl-white);
            font-weight: 600;
            font-size: 1.125rem;
            margin-bottom: 1rem;
            position: relative;
          }
          
          .footer-section-title::after {
            content: '';
            position: absolute;
            bottom: -4px;
            left: 0;
            width: 30px;
            height: 2px;
            background: var(--ocean-sea-green);
          }
          
          .footer-link {
            color: rgba(245, 246, 245, 0.8);
            transition: all 0.3s ease;
            display: block;
            padding: 0.25rem 0;
          }
          
          .footer-link:hover {
            color: var(--ocean-sea-green);
            transform: translateX(4px);
          }
          
          .footer-social-icon {
            background: rgba(255, 255, 255, 0.1);
            color: var(--ocean-pearl-white);
            border-radius: 50%;
            width: 40px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s ease;
          }
          
          .footer-social-icon:hover {
            background: var(--ocean-sea-green);
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(46, 196, 182, 0.3);
          }
          
          .footer-contact-item {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 0.75rem;
            color: rgba(245, 246, 245, 0.9);
          }
          
          .footer-contact-icon {
            background: var(--ocean-sea-green);
            color: white;
            border-radius: 50%;
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
          }
          
          .footer-bottom {
            background: rgba(30, 58, 138, 0.3);
            border-top: 1px solid rgba(255, 255, 255, 0.1);
          }
          
          .age-verification-notice {
            background: linear-gradient(135deg, var(--ocean-coral-orange), var(--ocean-sand-gold));
            border: 1px solid rgba(255, 111, 97, 0.3);
            border-radius: 12px;
            padding: 1rem;
            margin-top: 1.5rem;
            position: relative;
            overflow: hidden;
          }
          
          .age-verification-notice::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Cpath d='M0,0 L100,100 M100,0 L0,100' stroke='rgba(255,255,255,0.1)' stroke-width='0.5'/%3E%3C/svg%3E") repeat;
            background-size: 20px 20px;
            opacity: 0.3;
          }
          
          .age-verification-text {
            color: white;
            font-weight: 500;
            text-align: center;
            position: relative;
            z-index: 1;
          }
        `
      }} />
      
      <footer className="ocean-footer">
        <div className="footer-wave-pattern"></div>
        
        <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
              <div className="hazo-footer-logo">
                <Waves className="footer-wave-icon" size={24} />
                <span>HAZO</span>
              </div>
              <p className="text-sm text-gray-200 leading-relaxed">
                HAZO 專業的電子煙線上商城，提供各種品牌的高品質電子煙產品。
              我們致力於為顧客提供最好的購物體驗和優質的客戶服務。
            </p>
              <div className="flex space-x-3 pt-4">
                <a href="#" className="footer-social-icon">
                  <Facebook size={18} />
                </a>
                <a href="#" className="footer-social-icon">
                  <Twitter size={18} />
                </a>
                <a href="#" className="footer-social-icon">
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
              <li>
                  <Link to="/products?category=host" className="footer-link text-sm">
                  電子煙主機
                </Link>
              </li>
              <li>
                  <Link to="/products?category=cartridge" className="footer-link text-sm">
                    煙彈系列
                </Link>
              </li>
              <li>
                  <Link to="/products?category=disposable" className="footer-link text-sm">
                  拋棄式電子煙
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div className="space-y-4">
              <h3 className="footer-section-title">客戶服務</h3>
              <ul className="space-y-1">
              <li>
                  <Link to="/help" className="footer-link text-sm">
                  幫助中心
                </Link>
              </li>
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
                  <Link to="/privacy" className="footer-link text-sm">
                  隱私政策
                </Link>
              </li>
              <li>
                  <Link to="/terms" className="footer-link text-sm">
                  服務條款
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
              <h3 className="footer-section-title">聯絡資訊</h3>
            <div className="space-y-3">
                <div className="footer-contact-item">
                  <div className="footer-contact-icon">
                    <span className="text-xs font-bold">LINE</span>
                  </div>
                  <span className="text-sm">@hazo-vape</span>
                </div>
                <div className="footer-contact-item">
                  <div className="footer-contact-icon">
                    <Mail size={14} />
                  </div>
                  <span className="text-sm">support@hazo.com</span>
                </div>
                <div className="footer-contact-item">
                  <div className="footer-contact-icon">
                    <Clock size={14} />
                  </div>
                  <div className="text-sm">
                    <div>服務時間</div>
                    <div className="text-xs text-gray-300">週一至週日 (全年無休)</div>
                  </div>
              </div>
              </div>
              </div>
            </div>
            
          {/* Age Verification Notice */}
          <div className="age-verification-notice">
            <div className="flex items-center justify-center gap-3">
              <Shield className="text-white" size={24} />
              <p className="age-verification-text text-sm">
                ⚠️ 重要提醒：本網站銷售的電子煙產品含有尼古丁，未滿18歲禁止購買和使用。請負責任地使用電子煙產品。
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="footer-bottom">
          <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-sm text-gray-300">
                © 2025 HAZO. 版權所有.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
                <Link to="/privacy" className="footer-link text-sm">
                隱私政策
              </Link>
                <Link to="/terms" className="footer-link text-sm">
                服務條款
              </Link>
                <Link to="/sitemap" className="footer-link text-sm">
                網站地圖
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
    </>
  );
};

export default Footer;
