import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Menu, X, ChevronDown, Waves } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCartStore } from '@/lib/store';
import { categoriesAPI } from '@/lib/api';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const Header: React.FC = () => {
  const navigate = useNavigate();
  const { itemCount } = useCartStore();
  const [logoClickCount, setLogoClickCount] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const clickTimer = React.useRef<NodeJS.Timeout | null>(null);

  // Logo 點擊邏輯已移至 handleLogoClick 函數中

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    
    const newCount = logoClickCount + 1;
    setLogoClickCount(newCount);
    
    console.log('Logo點擊次數:', newCount); // 調試用
    
    if (newCount >= 5) {
      console.log('跳轉到管理頁面'); // 調試用
      navigate('/admin');
      setLogoClickCount(0);
    } else {
      console.log('跳轉到商品頁面'); // 調試用
      navigate('/products');
    }
    
    // 清除之前的計時器
    if (clickTimer.current) {
      clearTimeout(clickTimer.current);
    }
    
    // 2秒後重置計數器
    clickTimer.current = setTimeout(() => {
      setLogoClickCount(0);
      console.log('重置點擊計數器'); // 調試用
    }, 2000);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const navigationItems = [
    { label: '首頁', path: '/home' },
    { label: '配送說明', path: '/shipping' },
    { label: '退換貨政策', path: '/returns' },
  ];

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
          /* HAZO 海洋主題Logo */
          .hazo-logo {
            position: relative;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            font-size: 2rem;
            font-weight: 800;
            letter-spacing: -0.05em;
            cursor: pointer;
            user-select: none;
            background: var(--ocean-gradient-primary);
            -webkit-background-clip: text;
            background-clip: text;
            -webkit-text-fill-color: transparent;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            gap: 8px;
          }
          
          .hazo-logo:hover {
            transform: scale(1.05);
            filter: brightness(1.1);
          }
          
          .hazo-logo::before {
            content: '';
            position: absolute;
            top: -2px;
            left: -2px;
            right: -2px;
            bottom: -2px;
            background: var(--ocean-gradient-primary);
            border-radius: 8px;
            opacity: 0;
            z-index: -1;
            transition: opacity 0.3s ease;
          }
          
          .hazo-logo:hover::before {
            opacity: 0.1;
          }
          
          .hazo-wave-icon {
            color: var(--ocean-sea-blue);
            animation: gentle-wave 2s ease-in-out infinite;
          }
          
          @keyframes gentle-wave {
            0%, 100% { transform: rotate(0deg); }
            50% { transform: rotate(5deg); }
          }
          
          @media (max-width: 768px) {
            .hazo-logo {
              font-size: 1.5rem;
            }
          }
          
          /* 海洋主題導航 */
          .ocean-header {
            background: rgba(245, 246, 245, 0.95);
            backdrop-filter: blur(10px);
            border-bottom: 1px solid rgba(75, 156, 211, 0.2);
            box-shadow: 0 2px 10px rgba(30, 58, 138, 0.1);
          }
          
          .ocean-nav-link {
            color: var(--ocean-deep-blue);
            font-weight: 500;
            transition: all 0.3s ease;
            position: relative;
          }
          
          .ocean-nav-link::after {
            content: '';
            position: absolute;
            bottom: -4px;
            left: 0;
            width: 0;
            height: 2px;
            background: var(--ocean-gradient-primary);
            transition: width 0.3s ease;
          }
          
          .ocean-nav-link:hover {
            color: var(--ocean-sea-blue);
          }
          
          .ocean-nav-link:hover::after {
            width: 100%;
          }
          
          /* 購物車按鈕 */
          .ocean-cart-button {
            position: relative;
            background: var(--ocean-gradient-primary);
            color: white;
            border-radius: 50%;
            width: 44px;
            height: 44px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s ease;
            border: none;
            cursor: pointer;
          }
          
          .ocean-cart-button:hover {
            transform: scale(1.1);
            box-shadow: 0 4px 12px rgba(75, 156, 211, 0.4);
          }
          
          /* 下拉選單 */
          .ocean-dropdown {
            background: var(--ocean-pearl-white);
            border: 1px solid rgba(75, 156, 211, 0.2);
            border-radius: 12px;
            box-shadow: 0 10px 30px rgba(30, 58, 138, 0.15);
            backdrop-filter: blur(10px);
          }
          
          .ocean-dropdown-item {
            color: var(--ocean-deep-blue);
            transition: all 0.3s ease;
            border-radius: 8px;
            margin: 4px;
            }
          
          .ocean-dropdown-item:hover {
            background: var(--ocean-gradient-primary);
            color: white;
            transform: translateX(4px);
          }
          
          /* 手機選單 */
          .mobile-menu-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(30, 58, 138, 0.3);
            backdrop-filter: blur(4px);
            z-index: 40;
          }
          
          .mobile-menu {
            position: fixed;
            top: 0;
            right: 0;
            height: 100vh;
            width: 320px;
            background: var(--ocean-pearl-white);
            z-index: 50;
            transform: translateX(100%);
            transition: transform 0.3s ease-in-out;
            display: flex;
            flex-direction: column;
            border-left: 1px solid rgba(75, 156, 211, 0.2);
            box-shadow: -10px 0 30px rgba(30, 58, 138, 0.1);
          }
          
          .mobile-menu.open {
            transform: translateX(0);
          }
          
          .mobile-menu-header {
            background: var(--ocean-gradient-secondary);
            color: white;
            padding: 1rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          
          .mobile-menu-item {
            color: var(--ocean-deep-blue);
            padding: 1rem;
            border-bottom: 1px solid rgba(75, 156, 211, 0.1);
            transition: all 0.3s ease;
          }
          
          .mobile-menu-item:hover {
            background: rgba(75, 156, 211, 0.1);
            color: var(--ocean-sea-blue);
            padding-left: 1.5rem;
          }
        `
      }} />
      
      <header className="ocean-header sticky top-0 z-50 w-full">
        <div className="container flex h-16 items-center justify-between px-4">
          {/* Logo */}
          <div className="flex items-center">
            <div className="hazo-logo" onClick={handleLogoClick}>
              <Waves className="hazo-wave-icon" size={24} />
              <span>HAZO</span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/home" className="ocean-nav-link text-sm">
              首頁
            </Link>
            <div className="relative group">
              <Link to="/products" className="ocean-nav-link text-sm flex items-center">
                商品 <ChevronDown className="ml-1 h-4 w-4" />
              </Link>
              <div className="absolute left-0 mt-2 w-48 ocean-dropdown py-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 invisible group-hover:visible">
                {categories.map((cat) => (
                  <Link
                    key={cat.slug}
                    to={`/products?category=${cat.slug}`}
                    className="ocean-dropdown-item block px-4 py-2 text-sm"
                  >
                    {cat.name}
                  </Link>
                ))}                
              </div>
            </div>
            {navigationItems.slice(1).map((item) => (
              <Link 
                key={item.path}
                to={item.path} 
                className="ocean-nav-link text-sm"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right side actions */}
          <div className="flex items-center space-x-4">
            <Link to="/cart">
              <button 
                className="ocean-cart-button"
                type="button"
                aria-label={`購物車，共 ${itemCount} 件商品`}
                title={`購物車，共 ${itemCount} 件商品`}
              >
                <ShoppingCart size={20} />
                {itemCount > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-gradient-to-r from-orange-500 to-red-500 border-0"
                  >
                    {itemCount}
                  </Badge>
                )}
              </button>
            </Link>

            {/* Mobile menu button */}
            <Button 
              type="button"
              variant="ghost" 
              size="icon" 
              className="md:hidden ocean-nav-link"
              onClick={toggleMobileMenu}
              aria-label="開啟導航選單"
              title="開啟導航選單"
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">選單</span>
            </Button>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="mobile-menu-overlay" onClick={closeMobileMenu} />
      )}

        {/* Mobile Menu */}
      <div className={`mobile-menu ${isMobileMenuOpen ? 'open' : ''}`}>
          <div className="mobile-menu-header">
            <div 
              className="hazo-logo text-white cursor-pointer"
              onClick={(e) => {
                const newCount = logoClickCount + 1;
                setLogoClickCount(newCount);
                
                console.log('移動端Logo點擊次數:', newCount); // 調試用
                
                if (newCount >= 5) {
                  console.log('移動端跳轉到管理頁面'); // 調試用
                  navigate('/admin');
                  setLogoClickCount(0);
                  closeMobileMenu();
                } else {
                  console.log('移動端跳轉到商品頁面並關閉選單'); // 調試用
                  navigate('/products');
                  closeMobileMenu();
                }
                
                // 清除之前的計時器
                if (clickTimer.current) {
                  clearTimeout(clickTimer.current);
                }
                
                // 2秒後重置計數器
                clickTimer.current = setTimeout(() => {
                  setLogoClickCount(0);
                  console.log('移動端重置點擊計數器'); // 調試用
                }, 2000);
              }}
            >
              <Waves size={20} />
              <span className="text-lg">HAZO</span>
            </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={closeMobileMenu}
            className="text-white hover:bg-white/20"
            aria-label="關閉導航選單"
            title="關閉導航選單"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        
          <div className="flex-1 overflow-y-auto">
            {navigationItems.map((item) => (
            <Link
                key={item.path}
                to={item.path}
                className="mobile-menu-item block"
              onClick={closeMobileMenu}
            >
                {item.label}
            </Link>
            ))}
            
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="products" className="border-b border-gray-200">
                <AccordionTrigger className="mobile-menu-item hover:no-underline">
                  商品分類
                </AccordionTrigger>
                <AccordionContent className="pb-0">
                  {categories.map((cat) => (
                    <Link
                      key={cat.slug}
                      to={`/products?category=${cat.slug}`}
                      className="mobile-menu-item block pl-8 text-sm"
                      onClick={closeMobileMenu}
                    >
                      {cat.name}
                    </Link>
                  ))}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
      </div>
      </header>
    </>
  );
};

export default Header;
