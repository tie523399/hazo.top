import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from "@/hooks/use-toast";
import { adminAPI } from "@/lib/api";

interface SystemSettingsProps {
  settings: any;
  settingsForm: any;
  setSettingsForm: (form: any) => void;
  onFetchData: () => void;
}

const SystemSettings: React.FC<SystemSettingsProps> = ({
  settings,
  settingsForm,
  setSettingsForm,
  onFetchData
}) => {
  const { toast } = useToast();

  // 保存系統設置
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      console.log('🚀 準備保存設置:', settingsForm);

      // 保存到後端
      await adminAPI.updateBatchSettings(settingsForm);
      console.log('✅ 後端保存成功');

      // 強制重新載入前端設置
      const { useSettingsStore } = await import('@/lib/store');
      const settingsStore = useSettingsStore.getState();
      await settingsStore.loadSettings();
      console.log('✅ 前端設置重新載入完成');

      toast({ title: "✅ 設置已儲存", description: "商品卡片顯示已更新" });
      onFetchData();
    } catch(err: any) {
      console.error('❌ 保存設置失敗:', err);
      toast({ title: '儲存失敗', description: err.message, variant: 'destructive' });
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>系統設置</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSaveSettings} className="space-y-6">
          {/* 商品顯示控制 */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
              商品卡片顯示控制
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">顯示商品評論</Label>
                  <p className="text-sm text-gray-500">控制商品卡片是否顯示星級評分</p>
                </div>
                <Switch
                  checked={settingsForm.show_product_reviews === 'true'}
                  onCheckedChange={(checked) =>
                    setTimeout(() => {
                      setSettingsForm({...settingsForm, show_product_reviews: checked.toString()})
                    }, 0)
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">顯示商品預覽</Label>
                  <p className="text-sm text-gray-500">控制商品卡片是否顯示描述文字</p>
                </div>
                <Switch
                  checked={settingsForm.show_product_preview === 'true'}
                  onCheckedChange={(checked) =>
                    setTimeout(() => {
                      setSettingsForm({...settingsForm, show_product_preview: checked.toString()})
                    }, 0)
                  }
                />
              </div>
            </div>
          </div>

          {/* 基本設置 */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">基本設置</h3>
            
            <div className="space-y-2">
              <Label>免運費門檻</Label>
              <Input 
                type="number" 
                value={settingsForm.free_shipping_threshold || ''} 
                onChange={e => setSettingsForm({
                  ...settingsForm, 
                  free_shipping_threshold: e.target.value
                })} 
                placeholder="輸入免運費最低金額"
              />
            </div>
            
            <div className="space-y-2">
              <Label>首頁橫幅圖片 URL</Label>
              <Input 
                value={settingsForm.hero_image_url || ''} 
                onChange={e => setSettingsForm({
                  ...settingsForm, 
                  hero_image_url: e.target.value
                })} 
                placeholder="/images/banner.jpg"
              />
            </div>
            
            <div className="space-y-2">
              <Label>網站標題</Label>
              <Input 
                value={settingsForm.site_title || ''} 
                onChange={e => setSettingsForm({
                  ...settingsForm, 
                  site_title: e.target.value
                })} 
                placeholder="HAZO"
              />
              <p className="text-sm text-gray-500">顯示在Header和Footer的網站名稱</p>
            </div>
            
            <div className="space-y-2">
              <Label>網站標誌圖片 URL</Label>
              <Input 
                value={settingsForm.site_logo_url || ''} 
                onChange={e => setSettingsForm({
                  ...settingsForm, 
                  site_logo_url: e.target.value
                })} 
                placeholder="/images/logo-simple.svg"
              />
              <p className="text-sm text-gray-500">顯示在Header左上角的標誌圖片</p>
            </div>
            
            <div className="space-y-2">
              <Label>網站圖標 (Favicon) URL</Label>
              <Input 
                value={settingsForm.site_favicon_url || ''} 
                onChange={e => setSettingsForm({
                  ...settingsForm, 
                  site_favicon_url: e.target.value
                })} 
                placeholder="/favicon.svg"
              />
              <p className="text-sm text-gray-500">瀏覽器標籤頁顯示的小圖標</p>
            </div>
          </div>

          {/* Telegram 通知設置 */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
              Telegram 通知設置
            </h3>
            
            <div className="space-y-2">
              <Label>Telegram Bot Token</Label>
              <Input 
                value={settingsForm.telegram_bot_token || ''} 
                onChange={e => setSettingsForm({
                  ...settingsForm, 
                  telegram_bot_token: e.target.value
                })} 
                placeholder="輸入 Bot Token"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Telegram Chat ID</Label>
              <Input 
                value={settingsForm.telegram_chat_id || ''} 
                onChange={e => setSettingsForm({
                  ...settingsForm, 
                  telegram_chat_id: e.target.value
                })} 
                placeholder="輸入 Chat ID"
              />
            </div>
          </div>

          <Button type="submit" className="w-full">
            儲存所有設置
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default SystemSettings;