import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Pencil, Trash2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { adminAPI } from "@/lib/api";

interface Announcement {
  id: number;
  title: string;
  content: string;
  type: 'info' | 'warning' | 'promotion';
  is_active: boolean;
}

interface AnnouncementManagementProps {
  announcements: Announcement[];
  onFetchData: () => void;
}

const AnnouncementManagement: React.FC<AnnouncementManagementProps> = ({
  announcements,
  onFetchData
}) => {
  const { toast } = useToast();
  
  // 公告表單狀態
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [announcementForm, setAnnouncementForm] = useState<Partial<Announcement>>({
    type: 'info',
    is_active: true
  });

  // 公告CRUD操作
  const handleCreateOrUpdateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingAnnouncement) {
        await adminAPI.updateAnnouncement(editingAnnouncement.id, announcementForm);
      } else {
        await adminAPI.createAnnouncement(announcementForm);
      }
      toast({ title: `公告已${editingAnnouncement ? '更新' : '新增'}` });
      setEditingAnnouncement(null);
      setAnnouncementForm({ type: 'info', is_active: true });
      onFetchData();
    } catch (error: any) {
      toast({ title: '操作失敗', description: error.message, variant: 'destructive' });
    }
  };

  const handleDeleteAnnouncement = async (id: number) => {
    if (!window.confirm('確定要刪除此公告嗎？')) return;
    try {
      await adminAPI.deleteAnnouncement(id);
      toast({ title: '公告已刪除', variant: "destructive" });
      onFetchData();
    } catch (error: any) {
      toast({ title: '刪除失敗', description: error.message, variant: 'destructive' });
    }
  };

  // 公告類型顯示文字
  const getAnnouncementTypeText = (type: string) => {
    switch (type) {
      case 'info': return '資訊';
      case 'warning': return '警告';
      case 'promotion': return '促銷';
      default: return type;
    }
  };

  // 公告類型顏色
  const getAnnouncementTypeColor = (type: string) => {
    switch (type) {
      case 'info': return 'bg-blue-100 text-blue-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'promotion': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {/* 公告表單 */}
      <div className="md:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle>公告管理</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateOrUpdateAnnouncement} className="space-y-4">
              <div>
                <Label>公告標題</Label>
                <Input
                  placeholder="公告標題"
                  value={announcementForm.title || ''}
                  onChange={e => setAnnouncementForm({...announcementForm, title: e.target.value})}
                  required
                />
              </div>
              
              <div>
                <Label>公告內容</Label>
                <Textarea
                  placeholder="公告內容"
                  value={announcementForm.content || ''}
                  onChange={e => setAnnouncementForm({...announcementForm, content: e.target.value})}
                  rows={4}
                  required
                />
              </div>
              
              <div>
                <Label>公告類型</Label>
                <Select
                  value={announcementForm.type || ''}
                  onValueChange={(v: any) => setAnnouncementForm({...announcementForm, type: v})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="選擇類型" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="info">資訊</SelectItem>
                    <SelectItem value="warning">警告</SelectItem>
                    <SelectItem value="promotion">促銷</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="announcement-active"
                  checked={announcementForm.is_active !== false}
                  onCheckedChange={(checked) => 
                    setTimeout(() => setAnnouncementForm({...announcementForm, is_active: checked}), 0)
                  }
                />
                <Label htmlFor="announcement-active">啟用公告</Label>
              </div>
              
              <Button type="submit" className="w-full">
                {editingAnnouncement ? '更新公告' : '新增公告'}
              </Button>
              
              {editingAnnouncement && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setEditingAnnouncement(null);
                    setAnnouncementForm({ type: 'info', is_active: true });
                  }}
                >
                  取消編輯
                </Button>
              )}
            </form>
          </CardContent>
        </Card>
      </div>

      {/* 公告列表 */}
      <div className="md:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>公告列表</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>標題</TableHead>
                    <TableHead>內容預覽</TableHead>
                    <TableHead>類型</TableHead>
                    <TableHead>狀態</TableHead>
                    <TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(Array.isArray(announcements) ? announcements : []).map(announcement => (
                    <TableRow key={announcement.id}>
                      <TableCell className="font-medium">{announcement.title}</TableCell>
                      <TableCell className="max-w-xs truncate" title={announcement.content}>
                        {announcement.content}
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded text-xs ${getAnnouncementTypeColor(announcement.type)}`}>
                          {getAnnouncementTypeText(announcement.type)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={announcement.is_active ? "default" : "outline"}>
                          {announcement.is_active ? '啟用' : '停用'}
                        </Badge>
                      </TableCell>
                      <TableCell className="space-x-2">
                        <Button
                          size="sm"
                          onClick={() => {
                            setEditingAnnouncement(announcement);
                            setAnnouncementForm(announcement);
                          }}
                        >
                          <Pencil size={16} />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteAnnouncement(announcement.id)}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AnnouncementManagement;