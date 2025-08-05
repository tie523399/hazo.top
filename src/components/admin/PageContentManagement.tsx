import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Pencil, Trash2, Plus, Save } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { pageContentsAPI } from "@/lib/api";

// 類型定義
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

interface PageContentManagementProps {
  pageContents: PageContent[];
  onFetchData: () => void;
}

const PageContentManagement: React.FC<PageContentManagementProps> = ({
  pageContents,
  onFetchData
}) => {
  const { toast } = useToast();
  
  // 調試日誌
  console.log('🔍 PageContentManagement 渲染:', {
    pageContentsLength: pageContents?.length,
    pageContents: pageContents
  });
  
  // 表單狀態
  const [editingContent, setEditingContent] = useState<PageContent | null>(null);
  const [contentForm, setContentForm] = useState<Partial<PageContent>>({
    is_active: true
  });
  const [jsonContent, setJsonContent] = useState('');
  const [jsonMetadata, setJsonMetadata] = useState('');

  // 重置表單
  const resetForm = () => {
    setEditingContent(null);
    setContentForm({ is_active: true });
    setJsonContent('');
    setJsonMetadata('');
  };

  // 編輯頁面內容
  const handleEditContent = (content: PageContent) => {
    setEditingContent(content);
    setContentForm(content);
    setJsonContent(JSON.stringify(content.content || {}, null, 2));
    setJsonMetadata(JSON.stringify(content.metadata || {}, null, 2));
  };

  // 創建或更新頁面內容
  const handleCreateOrUpdateContent = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // 驗證並解析 JSON
      let parsedContent = null;
      let parsedMetadata = null;
      
      if (jsonContent.trim()) {
        try {
          parsedContent = JSON.parse(jsonContent);
        } catch (error) {
          toast({ 
            title: '內容格式錯誤', 
            description: 'JSON 內容格式不正確，請檢查語法', 
            variant: 'destructive' 
          });
          return;
        }
      }
      
      if (jsonMetadata.trim()) {
        try {
          parsedMetadata = JSON.parse(jsonMetadata);
        } catch (error) {
          toast({ 
            title: '元數據格式錯誤', 
            description: 'JSON 元數據格式不正確，請檢查語法', 
            variant: 'destructive' 
          });
          return;
        }
      }

      const formData = {
        ...contentForm,
        content: parsedContent,
        metadata: parsedMetadata
      };

      if (editingContent) {
        await pageContentsAPI.updatePageContent(editingContent.id, formData);
      } else {
        await pageContentsAPI.createPageContent(formData);
      }

      toast({ 
        title: `頁面內容已${editingContent ? '更新' : '新增'}`,
        description: '操作成功完成'
      });
      
      resetForm();
      onFetchData();
    } catch (error: any) {
      toast({ 
        title: '操作失敗', 
        description: error.message, 
        variant: 'destructive' 
      });
    }
  };

  // 刪除頁面內容
  const handleDeleteContent = async (id: number, pageName: string) => {
    if (!window.confirm(`確定要刪除「${pageName}」嗎？`)) return;
    
    try {
      await pageContentsAPI.deletePageContent(id);

      toast({ 
        title: '頁面內容已刪除', 
        description: `「${pageName}」已被刪除`,
        variant: "destructive" 
      });
      onFetchData();
    } catch (error: any) {
      toast({ 
        title: '刪除失敗', 
        description: error.message, 
        variant: 'destructive' 
      });
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
      {/* 表單 */}
      <div className="xl:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {editingContent ? <Pencil className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
              {editingContent ? '編輯頁面內容' : '新增頁面內容'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="text-sm font-semibold text-blue-900 mb-2">💡 使用說明</h3>
              <ul className="text-xs text-blue-800 space-y-1">
                <li>• <strong>頁面標識符</strong>：用於網址，例如 "about" 會創建 /page/about 頁面</li>
                <li>• <strong>頁面名稱</strong>：顯示在管理列表中的名稱</li>
                <li>• <strong>內容格式</strong>：可以是HTML或JSON格式</li>
                <li>• 創建後可在前台訪問：<code>/page/您的標識符</code></li>
              </ul>
            </div>
            <form onSubmit={handleCreateOrUpdateContent} className="space-y-4">
              <div>
                <Label>頁面標識符</Label>
                <Input
                  placeholder="如：shipping, returns"
                  value={contentForm.page_key || ''}
                  onChange={(e) => setContentForm({...contentForm, page_key: e.target.value})}
                  required
                />
              </div>
              
              <div>
                <Label>頁面名稱</Label>
                <Input
                  placeholder="如：配送說明, 退換貨政策"
                  value={contentForm.page_name || ''}
                  onChange={(e) => setContentForm({...contentForm, page_name: e.target.value})}
                  required
                />
              </div>
              
              <div>
                <Label>頁面標題</Label>
                <Input
                  placeholder="頁面顯示的主標題"
                  value={contentForm.title || ''}
                  onChange={(e) => setContentForm({...contentForm, title: e.target.value})}
                />
              </div>
              
              <div>
                <Label>頁面副標題</Label>
                <Input
                  placeholder="頁面顯示的副標題"
                  value={contentForm.subtitle || ''}
                  onChange={(e) => setContentForm({...contentForm, subtitle: e.target.value})}
                />
              </div>
              
              <div>
                <Label>內容 (JSON 或 HTML 格式)</Label>
                <Textarea
                  placeholder='HTML範例：<h1>標題</h1><p>內容</p>
或 JSON範例：{"title": "標題", "content": "內容", "items": ["項目1", "項目2"]}'
                  value={jsonContent}
                  onChange={(e) => setJsonContent(e.target.value)}
                  rows={10}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-gray-500 mt-1">
                  支援HTML標籤或JSON格式，JSON會自動格式化顯示
                </p>
              </div>
              
              <div>
                <Label>元數據 (JSON 格式, 可選)</Label>
                <Textarea
                  placeholder='{"seo": {"description": "..."}}'
                  value={jsonMetadata}
                  onChange={(e) => setJsonMetadata(e.target.value)}
                  rows={4}
                  className="font-mono text-sm"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  checked={contentForm.is_active || false}
                  onCheckedChange={(checked) => setContentForm({...contentForm, is_active: checked})}
                />
                <Label>啟用</Label>
              </div>
              
              <div className="flex gap-2">
                <Button type="submit" className="flex-1">
                  <Save className="h-4 w-4 mr-2" />
                  {editingContent ? '更新' : '新增'}
                </Button>
                {editingContent && (
                  <Button type="button" variant="outline" onClick={resetForm}>
                    取消
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* 頁面內容列表 */}
      <div className="xl:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>頁面內容列表</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>頁面名稱</TableHead>
                    <TableHead>標識符</TableHead>
                    <TableHead>狀態</TableHead>
                    <TableHead>更新時間</TableHead>
                    <TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pageContents.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                        暫無頁面內容，請新增頁面內容
                      </TableCell>
                    </TableRow>
                  ) : (
                    pageContents.map((content) => (
                      <TableRow key={content.id}>
                        <TableCell className="font-medium">
                          {content.page_name}
                        </TableCell>
                                              <TableCell>
                        <div className="space-y-1">
                          <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                            {content.page_key}
                          </code>
                          <div>
                            <a 
                              href={`/page/${content.page_key}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-blue-600 hover:text-blue-800 underline"
                            >
                              /page/{content.page_key} ↗
                            </a>
                          </div>
                        </div>
                      </TableCell>
                        <TableCell>
                          <Badge variant={content.is_active ? "default" : "secondary"}>
                            {content.is_active ? '啟用' : '停用'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {new Date(content.updated_at).toLocaleString('zh-TW')}
                        </TableCell>
                        <TableCell className="space-x-2">
                          <Button
                            size="sm"
                            onClick={() => handleEditContent(content)}
                          >
                            <Pencil size={16} />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteContent(content.id, content.page_name)}
                          >
                            <Trash2 size={16} />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PageContentManagement;