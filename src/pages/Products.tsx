import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Filter, Grid, List, ArrowRight, Waves, Search, Home, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { Checkbox } from '@/components/ui/checkbox';
import ProductCard from '@/components/ProductCard';
import SEO, { createBreadcrumbStructuredData } from '@/components/SEO';
import { useProductStore } from '@/lib/store';
import { productsAPI, categoriesAPI } from '@/lib/api';
import { getCategoryName, debounce } from '@/lib/utils';

const Products: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const {
    products,
    categories,
    brands,
    loading,
    totalPages,
    setProducts,
    setCategories,
    setBrands,
    setTotalPages,
    setLoading,
  } = useProductStore();

  const searchParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const selectedCategory = useMemo(() => searchParams.get('category') || '', [searchParams]);
  const selectedBrand = useMemo(() => searchParams.get('brand') || '', [searchParams]);
  const searchQuery = useMemo(() => searchParams.get('search') || '', [searchParams]);
  const currentPage = useMemo(() => parseInt(searchParams.get('page') || '1', 10), [searchParams]);

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('created_at');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000]);
  const [searchInput, setSearchInput] = useState(searchQuery);

  const updateUrlParams = useCallback((newParams: Record<string, string | null>, resetPage = true) => {
    const currentParams = new URLSearchParams(location.search);
    Object.entries(newParams).forEach(([key, value]) => {
      if (value) {
        currentParams.set(key, value);
      } else {
        currentParams.delete(key);
      }
    });
    // 只有在篩選條件改變時才重置頁面，分頁操作不重置
    // 檢查是否有篩選條件的變更（不包括 page 參數）
    const hasFilterChanges = Object.keys(newParams).some(key =>
      key !== 'page' && (key === 'category' || key === 'brand' || key === 'search')
    );

    if (resetPage && hasFilterChanges) {
      currentParams.set('page', '1');
    }
    navigate(`/products?${currentParams.toString()}`, { replace: true });
  }, [navigate]); // 移除 location.search 依賴，避免無限循環

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        console.log('🔍 開始載入產品...', { category: selectedCategory, brand: selectedBrand, search: searchQuery, page: currentPage });
        const response = await productsAPI.getProducts({
          category: selectedCategory || undefined,
          brand: selectedBrand || undefined,
          search: searchQuery || undefined,
          page: currentPage,
          limit: 12,
        });
        console.log('✅ 產品載入成功:', response.data);
        
        // 檢查響應數據格式
        if (typeof response.data === 'string' || !response.data.products || !response.data.pagination) {
          console.error('API 返回的數據格式不正確:', response.data);
          throw new Error('API 返回的數據格式不正確');
        }
        
        setProducts(response.data.products);
        setTotalPages(response.data.pagination.pages);
      } catch (error: any) {
        console.error('❌ 載入產品失敗:', error);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, [selectedCategory, selectedBrand, searchQuery, currentPage, setProducts, setTotalPages, setLoading]);

  useEffect(() => {
    const loadFilters = async () => {
      try {
        // 載入分類
        const [categoriesResponse, brandsResponse] = await Promise.all([
          categoriesAPI.getCategories(),
          productsAPI.getBrands(selectedCategory || undefined),
        ]);
        
        setCategories(categoriesResponse.data || []);
        setBrands(brandsResponse.data || []);
      } catch (error) {
        console.error('載入篩選器失敗:', error);
      }
    };
    loadFilters();
  }, [selectedCategory, setCategories, setBrands]);

  // 搜索防抖處理
  const debouncedSearch = useCallback(
    debounce((value: string) => {
      updateUrlParams({ search: value || null });
    }, 500),
    [updateUrlParams]
  );

  useEffect(() => {
    debouncedSearch(searchInput);
  }, [searchInput, debouncedSearch]);

  const handleCategoryChange = (category: string) => {
    updateUrlParams({ category: category === 'all' ? null : category });
  };

  const handleBrandChange = (brand: string) => {
    updateUrlParams({ brand: brand === 'all' ? null : brand });
  };

  const handlePageChange = (page: number) => {
    updateUrlParams({ page: page.toString() }, false); // 分頁不重置到第一頁
  };

  const clearFilters = () => {
    setSearchInput('');
    updateUrlParams({ category: null, brand: null, search: null });
  };

  if (loading && products.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="bg-gray-200 rounded-2xl h-80"></div>
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
        title={selectedCategory ? `${getCategoryName(selectedCategory)} - 商品列表` : '商品列表'}
        description={`瀏覽我們的${selectedCategory ? getCategoryName(selectedCategory) : '所有'}優質產品`}
        keywords={`HAZO國際, ${selectedCategory ? getCategoryName(selectedCategory) : '商品'}, ${selectedBrand || '品牌'}`}
        structuredData={[
          createBreadcrumbStructuredData([
            { name: '首頁', url: '/' },
            { name: '商品', url: '/products' },
            ...(selectedCategory ? [{ name: getCategoryName(selectedCategory), url: `/products?category=${selectedCategory}` }] : [])
          ])
        ]}
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
          
          <div className="hidden md:flex items-center text-sm text-gray-600">
            <span onClick={() => navigate('/')} className="cursor-pointer hover:text-blue-600">首頁</span>
            <span className="mx-2">/</span>
            <span className="text-gray-800">商品</span>
            {selectedCategory && (
              <>
                <span className="mx-2">/</span>
                <span className="text-gray-800">{getCategoryName(selectedCategory)}</span>
              </>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="h-8 w-8 p-0"
            >
              <Grid size={16} />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="h-8 w-8 p-0 hidden md:flex"
            >
              <List size={16} />
            </Button>
          </div>
        </div>

        {/* 搜索和篩選 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {/* 搜索框 */}
          <div className="md:col-span-2">
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="搜索商品..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-10 bg-white/80 backdrop-blur-sm border-gray-200 focus:border-blue-400"
              />
            </div>
          </div>

          {/* 分類篩選 */}
          <Select value={selectedCategory || 'all'} onValueChange={handleCategoryChange}>
            <SelectTrigger className="bg-white/80 backdrop-blur-sm border-gray-200">
              <SelectValue placeholder="選擇分類" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部分類</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.slug} value={category.slug}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* 品牌篩選 */}
          <Select value={selectedBrand || 'all'} onValueChange={handleBrandChange}>
            <SelectTrigger className="bg-white/80 backdrop-blur-sm border-gray-200">
              <SelectValue placeholder="選擇品牌" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部品牌</SelectItem>
              {brands.map((brand) => (
                <SelectItem key={brand.brand} value={brand.brand}>
                  {brand.brand}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* 活動篩選標籤 */}
        {(selectedCategory || selectedBrand || searchQuery) && (
          <div className="flex flex-wrap items-center gap-2 mb-6">
            <span className="text-sm text-gray-600">已選擇：</span>
            {selectedCategory && (
              <div className="flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
                {getCategoryName(selectedCategory)}
                <button
                  onClick={() => handleCategoryChange('')}
                  className="ml-1 hover:text-blue-600"
                >
                  ×
                </button>
              </div>
            )}
            {selectedBrand && (
              <div className="flex items-center gap-1 bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm">
                {selectedBrand}
                <button
                  onClick={() => handleBrandChange('')}
                  className="ml-1 hover:text-green-600"
                >
                  ×
                </button>
              </div>
            )}
            {searchQuery && (
              <div className="flex items-center gap-1 bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-sm">
                "{searchQuery}"
                <button
                  onClick={() => {
                    setSearchInput('');
                    updateUrlParams({ search: null });
                  }}
                  className="ml-1 hover:text-orange-600"
                >
                  ×
                </button>
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-gray-500 hover:text-gray-700 text-sm"
            >
              清除全部
            </Button>
          </div>
        )}

        {/* 產品結果 */}
        <div className="mb-6">
          <p className="text-gray-600">
            共找到 <span className="font-semibold text-gray-900">{products.length}</span> 個產品
          </p>
        </div>

        {/* 產品網格 */}
        {products.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gray-100 rounded-full mb-6">
              <Search size={48} className="text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">未找到相關產品</h2>
            <p className="text-gray-600 mb-8">嘗試調整搜索條件或瀏覽其他分類</p>
            <Button
              onClick={clearFilters}
              className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white"
            >
              清除篩選條件
            </Button>
          </div>
        ) : (
          <>
            <div className={`grid gap-4 md:gap-6 ${
              viewMode === 'grid' 
                ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4' 
                : 'grid-cols-1 md:grid-cols-2'
            }`}>
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {/* 分頁 */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-12">
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage <= 1}
                  size="sm"
                >
                  上一頁
                </Button>
                
                <div className="flex gap-1">
                  {[...Array(totalPages)].map((_, i) => {
                    const page = i + 1;
                    if (
                      page === 1 || 
                      page === totalPages || 
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    ) {
                      return (
                        <Button
                          key={page}
                          variant={page === currentPage ? 'default' : 'outline'}
                          onClick={() => handlePageChange(page)}
                          size="sm"
                          className="w-8 h-8 p-0"
                        >
                          {page}
                        </Button>
                      );
                    } else if (page === currentPage - 2 || page === currentPage + 2) {
                      return <span key={page} className="px-2">...</span>;
                    }
                    return null;
                  })}
                </div>
                
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= totalPages}
                  size="sm"
                >
                  下一頁
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Products;
