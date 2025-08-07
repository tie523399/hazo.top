import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Download, 
  Upload, 
  RefreshCw, 
  Shield, 
  Database, 
  Clock,
  HardDrive,
  CheckCircle,
  AlertTriangle,
  Trash2
} from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { adminAPI } from '@/lib/api';

interface Backup {
  fileName: string;
  path: string;
  size: string;
  created: string;
  age: string;
}

interface DatabaseStats {
  products: number;
  categories: number;
  coupons: number;
  announcements: number;
  admins: number;
  settings: number;
  homepage_settings: number;
  page_contents: number;
  fileSize: string;
  lastModified: string;
}

const BackupManagement: React.FC = () => {
  const { toast } = useToast();
  const [backups, setBackups] = useState<Backup[]>([]);
  const [stats, setStats] = useState<DatabaseStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [isIntegrityValid, setIsIntegrityValid] = useState<boolean | null>(null);

  // 載入備份列表
  const loadBackups = async () => {
    try {
      const response = await adminAPI.getBackupList();
      setBackups(response.data.backups || []);
    } catch (error: any) {
      console.error('載入備份列表失敗:', error);
      toast({
        title: "載入失敗",
        description: "無法載入備份列表",
        variant: "destructive"
      });
    }
  };

  // 載入數據庫統計
  const loadStats = async () => {
    try {
      const response = await adminAPI.getDatabaseStats();
      setStats(response.data.stats);
    } catch (error: any) {
      console.error('載入統計失敗:', error);
      toast({
        title: "載入失敗",
        description: "無法載入數據庫統計",
        variant: "destructive"
      });
    }
  };

  // 檢查數據庫完整性
  const checkIntegrity = async () => {
    setLoading(true);
    try {
      const response = await adminAPI.checkDatabaseIntegrity();
      setIsIntegrityValid(response.data.isValid);
      toast({
        title: response.data.isValid ? "檢查通過" : "檢查失敗",
        description: response.data.message,
        variant: response.data.isValid ? "default" : "destructive"
      });
    } catch (error: any) {
      console.error('完整性檢查失敗:', error);
      toast({
        title: "檢查失敗",
        description: "數據庫完整性檢查失敗",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // 創建備份
  const createBackup = async () => {
    setLoading(true);
    try {
      const response = await adminAPI.createBackup();
      toast({
        title: "備份成功",
        description: `備份文件已創建: ${response.data.backupPath}`,
      });
      await loadBackups(); // 重新載入備份列表
    } catch (error: any) {
      console.error('創建備份失敗:', error);
      toast({
        title: "備份失敗",
        description: error.response?.data?.error || "創建備份失敗",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // 恢復備份
  const restoreBackup = async (backupFileName: string) => {
    if (!confirm(`確定要恢復備份 "${backupFileName}" 嗎？\n\n這將覆蓋當前的所有數據，操作不可逆！`)) {
      return;
    }

    setLoading(true);
    try {
      const response = await adminAPI.restoreBackup({
        fileName: backupFileName
      });
      
      toast({
        title: "恢復成功",
        description: response.data.message,
      });

      // 顯示重啟警告
      if (response.data.warning) {
        toast({
          title: "重要提醒",
          description: response.data.warning,
          variant: "destructive"
        });
      }
    } catch (error: any) {
      console.error('恢復備份失敗:', error);
      toast({
        title: "恢復失敗",
        description: error.response?.data?.error || "恢復備份失敗",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // 刷新所有數據
  const refreshAll = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadBackups(),
        loadStats(),
        checkIntegrity()
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshAll();
  }, []);

  return (
    <div className="space-y-6">
      {/* 標題和操作 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">數據備份管理</h2>
          <p className="text-gray-600">確保您的數據安全，防止意外丟失</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={refreshAll}
            disabled={loading}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            刷新
          </Button>
          <Button
            onClick={createBackup}
            disabled={loading}
            size="sm"
          >
            <Download className="h-4 w-4 mr-2" />
            立即備份
          </Button>
        </div>
      </div>

      {/* 數據庫狀態 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* 完整性檢查 */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">數據庫完整性</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              {isIntegrityValid === true && (
                <Badge variant="default" className="bg-green-500">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  正常
                </Badge>
              )}
              {isIntegrityValid === false && (
                <Badge variant="destructive">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  異常
                </Badge>
              )}
              {isIntegrityValid === null && (
                <Badge variant="secondary">未檢查</Badge>
              )}
              <Button
                onClick={checkIntegrity}
                disabled={loading}
                variant="outline"
                size="sm"
              >
                檢查
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 數據庫大小 */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">數據庫大小</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.fileSize || '載入中...'}
            </div>
            <p className="text-xs text-muted-foreground">
              最後修改: {stats?.lastModified ? new Date(stats.lastModified).toLocaleString('zh-TW') : '未知'}
            </p>
          </CardContent>
        </Card>

        {/* 備份數量 */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">備份數量</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{backups.length}</div>
            <p className="text-xs text-muted-foreground">
              最新備份: {backups.length > 0 ? backups[0].age : '無'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 數據統計 */}
      {stats && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              數據統計
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.products}</div>
                <div className="text-sm text-gray-600">商品</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{stats.categories}</div>
                <div className="text-sm text-gray-600">分類</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{stats.coupons}</div>
                <div className="text-sm text-gray-600">優惠券</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{stats.announcements}</div>
                <div className="text-sm text-gray-600">公告</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{stats.admins}</div>
                <div className="text-sm text-gray-600">管理員</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-indigo-600">{stats.settings}</div>
                <div className="text-sm text-gray-600">設置</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-teal-600">{stats.homepage_settings}</div>
                <div className="text-sm text-gray-600">首頁設置</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-cyan-600">{stats.page_contents}</div>
                <div className="text-sm text-gray-600">頁面內容</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 備份列表 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            備份歷史
          </CardTitle>
        </CardHeader>
        <CardContent>
          {backups.length === 0 ? (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                暫無備份文件。建議立即創建第一個備份以保護您的數據。
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-3">
              {backups.map((backup, index) => (
                <div
                  key={backup.fileName}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex-1">
                    <div className="font-medium">{backup.fileName}</div>
                    <div className="text-sm text-gray-600">
                      大小: {backup.size} • 創建時間: {new Date(backup.created).toLocaleString('zh-TW')} • {backup.age}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {index === 0 && (
                      <Badge variant="secondary">最新</Badge>
                    )}
                    <Button
                      onClick={() => restoreBackup(backup.fileName)}
                      disabled={loading}
                      variant="outline"
                      size="sm"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      恢復
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 重要提醒 */}
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          <strong>重要提醒:</strong>
          <ul className="mt-2 list-disc list-inside space-y-1 text-sm">
            <li>系統會每6小時自動創建備份</li>
            <li>備份文件保存在持久化存儲中，不會因服務器重啟而丟失</li>
            <li>建議在重要操作前手動創建備份</li>
            <li>恢復備份會覆蓋所有當前數據，請謹慎操作</li>
            <li>系統會自動保留最近10個備份文件</li>
          </ul>
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default BackupManagement;