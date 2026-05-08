"use client";

import { useState, useMemo, useCallback } from "react";
import { Plus, Edit2, Mail, Shield, UserCheck, Download, Users, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserDrawer } from "@/features/master-data/components/user-drawer";
import { MetricCard, SearchInput, DataTable, RowActions } from "@/shared/components";
import type { ColumnDef, RowAction } from "@/shared/components";

const USERS_MOCK = [
  { id: "1", name: "System Admin", email: "admin@example.com", title: "Quản trị viên", role: "ADMIN", status: "active" },
  { id: "2", name: "Người dùng A", email: "user.a@example.com", title: "Store Manager", role: "SM", status: "active" },
  { id: "3", name: "Người dùng B", email: "user.b@example.com", title: "Area Manager", role: "AM", status: "active" },
  { id: "4", name: "Người dùng C", email: "user.c@example.com", title: "QA Lead", role: "QA", status: "active" },
  { id: "5", name: "Người dùng D", email: "user.d@example.com", title: "QC Staff", role: "QC", status: "active" },
];

type MockUser = typeof USERS_MOCK[number];

const ROLE_MAP: Record<string, string> = {
  ADMIN: "company_admin",
  SM: "store_manager",
  AM: "am",
  QA: "qa_manager",
  QC: "qc_auditor",
};

type UserDraft = {
  fullName: string;
  email: string;
  title: string;
  status: string;
  permissions: { role: string; scope: string; targetId?: string }[];
};

export default function UsersPage() {
  const [isUserDrawerOpen, setIsUserDrawerOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserDraft | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const handleInvite = () => {
    setEditingUser(null);
    setIsUserDrawerOpen(true);
  };

  const handleEdit = useCallback((user: MockUser) => {
    setEditingUser({
      fullName: user.name,
      email: user.email,
      title: user.title,
      status: user.status,
      permissions: [{ role: ROLE_MAP[user.role] ?? "qc_auditor", scope: "global", targetId: "" }],
    });
    setIsUserDrawerOpen(true);
  }, []);

  const handleSubmit = () => {
    // TODO: wire to createUser/updateUser mutation
    setIsUserDrawerOpen(false);
  };

  const totalCount = USERS_MOCK.length;
  const activeCount = USERS_MOCK.filter((u) => u.status === "active").length;
  const adminCount = USERS_MOCK.filter((u) => u.role === "ADMIN").length;

  const filtered = useMemo(() => {
    if (!searchTerm) return USERS_MOCK;
    const q = searchTerm.toLowerCase();
    return USERS_MOCK.filter(
      (u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
    );
  }, [searchTerm]);

  const columns = useMemo((): ColumnDef<MockUser>[] => [
    {
      header: "Người dùng",
      cell: (u) => (
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center font-bold text-primary text-sm shrink-0">
            {u.name.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="font-semibold text-foreground">{u.name}</div>
            <div className="text-xs text-muted-foreground">{u.email}</div>
          </div>
        </div>
      ),
    },
    {
      header: "Chức danh",
      cell: (u) => <span className="text-sm italic text-muted-foreground">{u.title}</span>,
      className: "w-36",
      hideOnMobile: true,
    },
    {
      header: "Vai trò",
      cell: (u) => (
        <Badge className={`font-bold text-[10px] uppercase tracking-tighter ${
          u.role === "ADMIN" ? "bg-purple-100 text-purple-700 hover:bg-purple-100" : "bg-gray-100 text-gray-700 hover:bg-gray-100"
        }`}>
          {u.role}
        </Badge>
      ),
      className: "w-28",
    },
    {
      header: "Phạm vi",
      cell: () => (
        <span className="text-xs font-bold text-success bg-success-bg px-2.5 py-1 rounded-md">
          Toàn hệ thống
        </span>
      ),
      className: "w-36",
      hideOnMobile: true,
    },
    {
      header: "",
      cell: (u) => {
        const actions: RowAction[] = [
          { label: "Sửa thông tin", icon: Edit2, onClick: () => handleEdit(u) },
          { label: "Đổi vai trò", icon: Shield, onClick: () => {} },
          { label: "Vô hiệu hóa", icon: Trash2, onClick: () => {}, variant: "destructive" },
        ];
        return <RowActions actions={actions} />;
      },
      className: "w-12",
    },
  ], [handleEdit]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
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
        <MetricCard label="Tổng user" value={totalCount} icon={Users} />
        <MetricCard label="Đang hoạt động" value={activeCount} icon={UserCheck} variant="success" />
        <MetricCard label="Chờ xác nhận" value={0} icon={Mail} variant="warning" />
        <MetricCard label="Vai trò Admin" value={adminCount} icon={Shield} variant="info" />
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <SearchInput
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Tìm kiếm theo tên hoặc email..."
            className="w-full max-w-md"
          />
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-gray-400 uppercase tracking-widest pl-4">Vai trò:</span>
            <Badge variant="outline" className="rounded-full px-3 py-1 bg-primary/5 border-primary/20 text-primary cursor-pointer">Tất cả</Badge>
            <Badge variant="outline" className="rounded-full px-3 py-1 border-gray-100 text-gray-500 cursor-pointer hover:bg-gray-50">Admin</Badge>
            <Badge variant="outline" className="rounded-full px-3 py-1 border-gray-100 text-gray-500 cursor-pointer hover:bg-gray-50">QA/QC</Badge>
          </div>
        </div>

        <DataTable<MockUser>
          columns={columns}
          data={filtered}
          emptyTitle="Không tìm thấy người dùng"
          emptyDescription="Thử thay đổi từ khóa tìm kiếm."
        />
      </div>

      <UserDrawer
        open={isUserDrawerOpen}
        onOpenChange={setIsUserDrawerOpen}
        onSubmit={handleSubmit}
        initialData={editingUser ?? undefined}
      />
    </div>
  );
}
