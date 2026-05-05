"use client";

import { useState } from "react";
import { Plus, Search, Edit2, Mail, Shield, UserCheck, MoreVertical, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserDrawer } from "@/components/master-data/user-drawer";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const USERS_MOCK = [
  { id: "1", name: "Admin Maycha", email: "admin@maycha.vn", title: "Quản trị viên", role: "ADMIN", status: "active" },
  { id: "2", name: "Nguyễn Văn A", email: "van.a@maycha.vn", title: "Store Manager", role: "SM", status: "active" },
  { id: "3", name: "Trần Thị B", email: "thi.b@maycha.vn", title: "Area Manager", role: "AM", status: "active" },
  { id: "4", name: "Lê Văn C", email: "van.c@maycha.vn", title: "QA Lead", role: "QA", status: "active" },
  { id: "5", name: "Phạm Thị D", email: "thi.d@maycha.vn", title: "QC Staff", role: "QC", status: "active" },
];

export default function UsersPage() {
  const [isUserDrawerOpen, setIsUserDrawerOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);

  const handleInvite = () => {
    setEditingUser(null);
    setIsUserDrawerOpen(true);
  };

  const handleEdit = (user: any) => {
    setEditingUser({
        fullName: user.name,
        email: user.email,
        title: user.title,
        status: user.status
    });
    setIsUserDrawerOpen(true);
  };

  const handleSubmit = (data: any) => {
    console.log("User Submit:", data);
    setIsUserDrawerOpen(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header & Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Quản lý người dùng</h1>
          <p className="text-sm text-gray-500 font-medium">Thiết lập tài khoản, phân vai trò và phạm vi truy cập của người dùng trong hệ thống.</p>
        </div>
        <div className="flex items-center gap-2">
            <Button variant="outline" className="gap-2">
                <Download className="h-4 w-4" /> Export CSV
            </Button>
            <Button onClick={handleInvite} className="bg-primary hover:bg-primary/90 gap-2 font-bold shadow-sm">
                <Plus className="h-4 w-4" /> Mời người dùng
            </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         <StatSmallCard title="Tổng user" value="7" icon={<UsersIcon className="h-5 w-5 text-blue-500" />} />
         <StatSmallCard title="Đang hoạt động" value="7" icon={<UserCheck className="h-5 w-5 text-emerald-500" />} />
         <StatSmallCard title="Chờ xác nhận" value="0" icon={<Mail className="h-5 w-5 text-amber-500" />} />
         <StatSmallCard title="Vai trò Admin" value="1" icon={<Shield className="h-5 w-5 text-purple-500" />} />
      </div>

      {/* Main Content */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border space-y-6">
         <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="relative w-full max-w-md">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <Input placeholder="Tìm kiếm theo tên hoặc email..." className="pl-10 h-11 bg-gray-50/50 focus:bg-white transition-all" />
            </div>
            <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-gray-400 uppercase tracking-widest pl-4">Vai trò:</span>
                <Badge variant="outline" className="rounded-full px-3 py-1 bg-primary/5 border-primary/20 text-primary cursor-pointer">Tất cả</Badge>
                <Badge variant="outline" className="rounded-full px-3 py-1 border-gray-100 text-gray-500 cursor-pointer hover:bg-gray-50">Admin</Badge>
                <Badge variant="outline" className="rounded-full px-3 py-1 border-gray-100 text-gray-500 cursor-pointer hover:bg-gray-50">QA/QC</Badge>
            </div>
         </div>

         <div className="rounded-xl border overflow-hidden">
            <Table>
                <TableHeader className="bg-gray-50/50">
                    <TableRow>
                        <TableHead className="py-4 px-6 font-bold text-gray-900 border-b">Người dùng</TableHead>
                        <TableHead className="py-4 font-bold text-gray-900 border-b">Chức danh</TableHead>
                        <TableHead className="py-4 font-bold text-gray-900 border-b">Vai trò</TableHead>
                        <TableHead className="py-4 font-bold text-gray-900 border-b">Phạm vi truy cập</TableHead>
                        <TableHead className="py-4 font-bold text-gray-900 border-b text-right">Thao tác</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {USERS_MOCK.map((user) => (
                        <TableRow key={user.id} className="hover:bg-primary/5 transition-colors group">
                            <TableCell className="py-4 px-6">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center font-bold text-primary group-hover:scale-110 transition-transform">
                                        {user.name.substring(0, 2).toUpperCase()}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-bold text-gray-900 group-hover:text-primary transition-colors">{user.name}</span>
                                        <span className="text-xs text-gray-400">{user.email}</span>
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell className="py-4 font-medium text-gray-700 capitalize italic">{user.title}</TableCell>
                            <TableCell className="py-4">
                                <Badge className={`font-bold text-[10px] uppercase tracking-tighter ${user.role === 'ADMIN' ? 'bg-purple-100 text-purple-700 hover:bg-purple-100' : 'bg-gray-100 text-gray-700 hover:bg-gray-100'}`}>
                                    {user.role}
                                </Badge>
                            </TableCell>
                            <TableCell className="py-4">
                                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md">Toàn hệ thống</span>
                            </TableCell>
                            <TableCell className="py-4 text-right">
                                <DropdownMenu>
                                    <DropdownMenuTrigger render={
                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                            <MoreVertical className="h-4 w-4" />
                                        </Button>
                                    } />
                                    <DropdownMenuContent align="end" className="w-[180px]">
                                        <DropdownMenuItem onClick={() => handleEdit(user)} className="gap-2 font-bold">
                                            <Edit2 className="h-4 w-4" /> Sửa thông tin
                                        </DropdownMenuItem>
                                        <DropdownMenuItem className="gap-2 font-bold text-primary">
                                            <Shield className="h-4 w-4" /> Đổi vai trò
                                        </DropdownMenuItem>
                                        <DropdownMenuItem className="gap-2 font-bold text-red-600 focus:text-red-600">
                                            <Trash2Icon className="h-4 w-4" /> Vô hiệu hóa
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
         </div>
      </div>

      <UserDrawer 
        open={isUserDrawerOpen} 
        onOpenChange={setIsUserDrawerOpen}
        onSubmit={handleSubmit}
        initialData={editingUser}
      />
    </div>
  );
}

function StatSmallCard({ title, value, icon }: any) {
    return (
        <Card className="border-none bg-white shadow-sm overflow-hidden group">
            <CardContent className="p-4 flex items-center justify-between">
                <div className="space-y-1">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{title}</p>
                    <h3 className="text-2xl font-black text-gray-900 group-hover:text-primary transition-colors">{value}</h3>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl group-hover:scale-110 transition-transform duration-300">
                    {icon}
                </div>
            </CardContent>
        </Card>
    )
}

function UsersIcon({ className }: any) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
    )
}

function Trash2Icon({ className }: any) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/>
        </svg>
    )
}
