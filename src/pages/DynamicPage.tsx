import React, { useEffect, useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { pageContentsAPI } from '@/lib/api';
import SEO from '@/components/SEO';

interface PageContent {
  id: number;
  page_key: string;
  page_name: string;
  title: string;
  subtitle: string;
  content: any;
  metadata: any;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const DynamicPage: React.FC = () => {
  const { pageKey } = useParams<{ pageKey: string }>();
  const [pageContent, setPageContent] = useState<PageContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPageContent = async () => {
      if (!pageKey) {
        setError('頁面不存在');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const content = await pageContentsAPI.getPageContent(pageKey);
        console.log('📄 載入頁面內容:', content);
        setPageContent(content);
        setError(null);
      } catch (err: any) {
        console.error('載入頁面內容失敗:', err);
        setError(err.message || '頁面載入失敗');
      } finally {
        setLoading(false);
      }
    };

    loadPageContent();
  }, [pageKey]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
        <div className="container mx-auto px-4 py-12">
          <div className="flex items-center justify-center min-h-96">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p className="text-gray-600">載入頁面中...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !pageContent) {
    return <Navigate to="/404" replace />;
  }

  // 渲染頁面內容
  const renderContent = () => {
    if (!pageContent.content) {
      return (
        <div className="text-gray-600 text-center py-8">
          暫無內容
        </div>
      );
    }

    // 如果內容是字符串，直接顯示
    if (typeof pageContent.content === 'string') {
      return (
        <div className="prose prose-lg max-w-none">
          <div dangerouslySetInnerHTML={{ __html: pageContent.content }} />
        </div>
      );
    }

    // 如果內容是對象，嘗試渲染結構化內容
    if (typeof pageContent.content === 'object') {
      return (
        <div className="space-y-6">
          {Object.entries(pageContent.content).map(([key, value]) => (
            <div key={key} className="mb-4">
              <h3 className="text-lg font-semibold mb-2 capitalize">
                {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
              </h3>
              <div className="text-gray-700">
                {typeof value === 'string' ? (
                  <p>{value}</p>
                ) : Array.isArray(value) ? (
                  <ul className="list-disc list-inside space-y-1">
                    {value.map((item, index) => (
                      <li key={index}>{String(item)}</li>
                    ))}
                  </ul>
                ) : (
                  <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
                    {JSON.stringify(value, null, 2)}
                  </pre>
                )}
              </div>
            </div>
          ))}
        </div>
      );
    }

    return (
      <div className="text-gray-600">
        <pre className="whitespace-pre-wrap">{JSON.stringify(pageContent.content, null, 2)}</pre>
      </div>
    );
  };

  return (
    <>
      <SEO 
        title={pageContent.title || pageContent.page_name}
        description={pageContent.subtitle || `${pageContent.page_name} - HAZO P2P`}
      />
      
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
        <div className="container mx-auto px-4 py-12">
          {/* 頁面標題 */}
          <div className="text-center mb-8">
            {pageContent.title && (
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                {pageContent.title}
              </h1>
            )}
            {pageContent.subtitle && (
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                {pageContent.subtitle}
              </p>
            )}
          </div>

          {/* 頁面內容 */}
          <Card className="max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle>{pageContent.page_name}</CardTitle>
            </CardHeader>
            <CardContent>
              {renderContent()}
            </CardContent>
          </Card>

          {/* 頁面元數據 */}
          {pageContent.metadata && Object.keys(pageContent.metadata).length > 0 && (
            <div className="mt-8 text-center">
              <div className="text-sm text-gray-500">
                最後更新: {new Date(pageContent.updated_at).toLocaleString('zh-TW')}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default DynamicPage;