import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Pencil, Trash2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { adminAPI } from "@/lib/api";

interface Coupon {
  id: number;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  min_amount: number;
  expires_at: string;
  is_active: boolean;
}

interface CouponManagementProps {
  coupons: Coupon[];
  onFetchData: () => void;
}

const CouponManagement: React.FC<CouponManagementProps> = ({
  coupons,
  onFetchData
}) => {
  const { toast } = useToast();
  
  // 優惠券表單狀態
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [couponForm, setCouponForm] = useState<Partial<Coupon>>({
    type: 'percentage',
    is_active: true
  });

  // 優惠券CRUD操作
  const handleCreateOrUpdateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCoupon) {
        await adminAPI.updateCoupon(editingCoupon.id, couponForm);
      } else {
        await adminAPI.createCoupon(couponForm);
      }
      toast({ title: `優惠券已${editingCoupon ? '更新' : '新增'}` });
      setEditingCoupon(null);
      setCouponForm({ type: 'percentage', is_active: true });
      onFetchData();
    } catch (error: any) {
      toast({ title: '操作失敗', description: error.message, variant: 'destructive' });
    }
  };

  const handleDeleteCoupon = async (id: number) => {
    if (!window.confirm('確定要刪除此優惠券嗎？')) return;
    try {
      await adminAPI.deleteCoupon(id);
      toast({ title: '優惠券已刪除', variant: "destructive" });
      onFetchData();
    } catch (error: any) {
      toast({ title: '刪除失敗', description: error.message, variant: 'destructive' });
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {/* 優惠券表單 */}
      <div className="md:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle>優惠券管理</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateOrUpdateCoupon} className="space-y-4">
              <div>
                <Label>優惠券代碼</Label>
                <Input
                  placeholder="優惠券代碼"
                  value={couponForm.code || ''}
                  onChange={e => setCouponForm({...couponForm, code: e.target.value})}
                  required
                />
              </div>
              
              <div>
                <Label>優惠類型</Label>
                <Select
                  value={couponForm.type || ''}
                  onValueChange={(v: any) => setCouponForm({...couponForm, type: v})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="選擇類型" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">百分比折扣</SelectItem>
                    <SelectItem value="fixed">固定金額</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>折扣值</Label>
                <Input
                  type="number"
                  placeholder={couponForm.type === 'percentage' ? '折扣百分比 (如：10)' : '折扣金額'}
                  value={couponForm.value || ''}
                  onChange={e => setCouponForm({...couponForm, value: Number(e.target.value)})}
                  required
                />
              </div>
              
              <div>
                <Label>最低消費金額</Label>
                <Input
                  type="number"
                  placeholder="最低消費金額"
                  value={couponForm.min_amount || ''}
                  onChange={e => setCouponForm({...couponForm, min_amount: Number(e.target.value)})}
                />
              </div>
              
              <div>
                <Label>到期日</Label>
                <Input
                  type="date"
                  placeholder="到期日"
                  value={couponForm.expires_at || ''}
                  onChange={e => setCouponForm({...couponForm, expires_at: e.target.value})}
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="coupon-active"
                  checked={couponForm.is_active !== false}
                  onCheckedChange={(checked) => 
                    setTimeout(() => setCouponForm({...couponForm, is_active: checked}), 0)
                  }
                />
                <Label htmlFor="coupon-active">啟用優惠券</Label>
              </div>
              
              <Button type="submit" className="w-full">
                {editingCoupon ? '更新優惠券' : '新增優惠券'}
              </Button>
              
              {editingCoupon && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setEditingCoupon(null);
                    setCouponForm({ type: 'percentage', is_active: true });
                  }}
                >
                  取消編輯
                </Button>
              )}
            </form>
          </CardContent>
        </Card>
      </div>

      {/* 優惠券列表 */}
      <div className="md:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>優惠券列表</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>代碼</TableHead>
                    <TableHead>類型</TableHead>
                    <TableHead>折扣值</TableHead>
                    <TableHead>最低消費</TableHead>
                    <TableHead>到期日</TableHead>
                    <TableHead>狀態</TableHead>
                    <TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(Array.isArray(coupons) ? coupons : []).map(coupon => (
                    <TableRow key={coupon.id}>
                      <TableCell>{coupon.code}</TableCell>
                      <TableCell>
                        {coupon.type === 'percentage' ? '百分比' : '固定金額'}
                      </TableCell>
                      <TableCell>
                        {coupon.type === 'percentage' ? `${coupon.value}%` : `$${coupon.value}`}
                      </TableCell>
                      <TableCell>${coupon.min_amount}</TableCell>
                      <TableCell>
                        {coupon.expires_at ? new Date(coupon.expires_at).toLocaleDateString() : '-'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={coupon.is_active ? "default" : "outline"}>
                          {coupon.is_active ? '啟用' : '停用'}
                        </Badge>
                      </TableCell>
                      <TableCell className="space-x-2">
                        <Button
                          size="sm"
                          onClick={() => {
                            setEditingCoupon(coupon);
                            setCouponForm(coupon);
                          }}
                        >
                          <Pencil size={16} />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteCoupon(coupon.id)}
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

export default CouponManagement;