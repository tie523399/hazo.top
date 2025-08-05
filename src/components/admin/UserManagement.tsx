import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlusCircle, Trash2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { adminAPI } from "@/lib/api";

interface AdminUser {
  id: number;
  username: string;
  created_at: string;
}

interface UserManagementProps {
  admins: AdminUser[];
  currentAdmin?: { id: number; username: string };
  onFetchData: () => void;
}

const UserManagement: React.FC<UserManagementProps> = ({
  admins,
  currentAdmin,
  onFetchData
}) => {
  const { toast } = useToast();
  
  // 表單狀態
  const [adminForm, setAdminForm] = useState({ username: '', password: '' });
  const [passwordChangeForm, setPasswordChangeForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // 新增管理員
  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminAPI.createAdmin(adminForm);
      toast({ title: "管理員已新增" });
      setAdminForm({ username: '', password: '' });
      onFetchData();
    } catch(err: any) {
      toast({ title: '新增失敗', description: err.message, variant: 'destructive' });
    }
  };

  // 刪除管理員
  const handleDeleteAdmin = async (id: number) => {
    if (!window.confirm('確定要刪除此管理員嗎？')) return;
    try {
      await adminAPI.deleteAdmin(id);
      toast({ title: '管理員已刪除', variant: "destructive" });
      onFetchData();
    } catch (error: any) {
      toast({ title: '刪除失敗', description: error.message, variant: 'destructive' });
    }
  };

  // 修改密碼
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordChangeForm.newPassword !== passwordChangeForm.confirmPassword) {
      toast({ title: '錯誤', description: '新密碼與確認密碼不相符', variant: 'destructive' });
      return;
    }
    if (passwordChangeForm.newPassword.length < 6) {
      toast({ title: '錯誤', description: '新密碼長度不能少於6位', variant: 'destructive' });
      return;
    }

    try {
      const res = await adminAPI.changePassword({
        currentPassword: passwordChangeForm.currentPassword,
        newPassword: passwordChangeForm.newPassword,
      });
      toast({ title: '成功', description: res.data.message });
      setPasswordChangeForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: any) {
      toast({
        title: '密碼更改失敗',
        description: err.response?.data?.message || err.message,
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* 新增管理員 */}
      <Card>
        <CardHeader>
          <CardTitle>新增管理員</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateAdmin} className="space-y-4">
            <div>
              <Label>用戶名</Label>
              <Input
                placeholder="新管理員用戶名"
                value={adminForm.username}
                onChange={e => setAdminForm({...adminForm, username: e.target.value})}
                required
              />
            </div>
            
            <div>
              <Label>密碼</Label>
              <Input
                type="password"
                placeholder="新管理員密碼"
                value={adminForm.password}
                onChange={e => setAdminForm({...adminForm, password: e.target.value})}
                required
              />
            </div>
            
            <Button type="submit" className="w-full">
              <PlusCircle className="mr-2 h-4 w-4" />
              新增管理員
            </Button>
          </form>
        </CardContent>
      </Card>
      
      {/* 修改我的密碼 */}
      <Card>
        <CardHeader>
          <CardTitle>修改我的密碼</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <Label>目前密碼</Label>
              <Input
                type="password"
                placeholder="輸入目前密碼"
                value={passwordChangeForm.currentPassword}
                onChange={e => setPasswordChangeForm({
                  ...passwordChangeForm, 
                  currentPassword: e.target.value
                })}
                required
              />
            </div>
            
            <div>
              <Label>新密碼</Label>
              <Input
                type="password"
                placeholder="輸入新密碼"
                value={passwordChangeForm.newPassword}
                onChange={e => setPasswordChangeForm({
                  ...passwordChangeForm, 
                  newPassword: e.target.value
                })}
                required
              />
            </div>
            
            <div>
              <Label>確認新密碼</Label>
              <Input
                type="password"
                placeholder="再次輸入新密碼"
                value={passwordChangeForm.confirmPassword}
                onChange={e => setPasswordChangeForm({
                  ...passwordChangeForm, 
                  confirmPassword: e.target.value
                })}
                required
              />
            </div>
            
            <Button type="submit" className="w-full">
              更新密碼
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* 管理員列表 */}
      <div className="md:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>管理員列表</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>用戶名</TableHead>
                  <TableHead>創建時間</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentAdmin && (Array.isArray(admins) ? admins : []).map(admin => (
                  <TableRow key={admin.id}>
                    <TableCell className="font-medium">{admin.username}</TableCell>
                    <TableCell>{new Date(admin.created_at).toLocaleString()}</TableCell>
                    <TableCell>
                      {admin.id !== currentAdmin.id && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteAdmin(admin.id)}
                        >
                          <Trash2 size={16} />
                        </Button>
                      )}
                      {admin.id === currentAdmin.id && (
                        <span className="text-sm text-muted-foreground">當前用戶</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserManagement;