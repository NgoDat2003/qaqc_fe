"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { Plus, Edit2, Download, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserDrawer } from "@/features/master-data/components/user-drawer";
import type { UserFormValues } from "@/features/master-data/components/user-drawer";
import {
  useUsers,
  useCreateUser,
  useUpdateUser,
} from "@/features/master-data/hooks/use-users";
import { MetricCard, SearchInput, DataTable, RowActions, PaginationControls } from "@/shared/components";
import type { ColumnDef, RowAction } from "@/shared/components";
import type { User } from "@/shared/types";

const ROLE_LABEL: Record<string, string> = {
  company_admin: "CA",
  qa_manager: "QAM",
  qc_auditor: "QC",
  am: "AM",
  store_manager: "SM",
  executive_viewer: "EV",
};

export default function UsersPage() {
  const [isUserDrawerOpen, setIsUserDrawerOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useUsers({ page, limit: 20 });
  const users = data?.data ?? [];
  const meta = data?.meta;

  useEffect(() => { setPage(1); }, [searchTerm]);
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();

  const handleInvite = () => {
    setEditingUser(null);
    setIsUserDrawerOpen(true);
  };

  const handleEdit = useCallback((user: User) => {
    setEditingUser(user);
    setIsUserDrawerOpen(true);
  }, []);

  const handleSubmit = (data: UserFormValues) => {
    const roleAssignments = data.permissions.map((p, i) => ({
      id: editingUser?.roleAssignments[i]?.id ?? "",
      userId: editingUser?.id ?? "",
      roleKey: p.role as User["roleAssignments"][number]["roleKey"],
      storeId: p.scope === "store" ? (p.targetId ?? null) : null,
    }));

    if (editingUser) {
      updateUser.mutate(
        {
          id: editingUser.id,
          fullName: data.fullName,
          title: data.title,
          phone: data.phone,
          isActive: data.status === "active",
          roleAssignments,
        },
        { onSuccess: () => setIsUserDrawerOpen(false) }
      );
    } else {
      createUser.mutate(
        {
          fullName: data.fullName,
          email: data.email,
          title: data.title,
          phone: data.phone,
          isActive: data.status === "active",
          roleAssignments,
        },
        { onSuccess: () => setIsUserDrawerOpen(false) }
      );
    }
  };

  const totalCount = meta?.total ?? users.length;

  const filtered = useMemo(() => {
    if (!searchTerm) return users;
    const q = searchTerm.toLowerCase();
    return users.filter(
      (u) =>
        u.fullName.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
    );
  }, [searchTerm, users]);

  const columns = useMemo((): ColumnDef<User>[] => [
    {
      header: "Người dùng",
      cell: (u) => (
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center font-bold text-primary text-sm shrink-0">
            {u.fullName.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="font-semibold text-foreground">{u.fullName}</div>
            <div className="text-xs text-muted-foreground">{u.email}</div>
          </div>
        </div>
      ),
    },
    {
      header: "Chức danh",
      cell: (u) => (
        <span className="text-sm italic text-muted-foreground">{u.title ?? "—"}</span>
      ),
      className: "w-36",
      hideOnMobile: true,
    },
    {
      header: "Vai trò",
      cell: (u) => {
        const firstRole = u.roleAssignments[0]?.roleKey;
        if (!firstRole) return <span className="text-xs text-gray-400">—</span>;
        return (
          <Badge
            className={`font-bold text-[10px] uppercase tracking-tighter ${firstRole === "company_admin"
              ? "bg-purple-100 text-purple-700 hover:bg-purple-100"
              : "bg-gray-100 text-gray-700 hover:bg-gray-100"
              }`}
          >
            {ROLE_LABEL[firstRole] ?? firstRole}
          </Badge>
        );
      },
      className: "w-28",
    },
    {
      header: "Phạm vi",
      cell: (u) => {
        const hasStore = u.roleAssignments.some((ra) => ra.storeId);
        return (
          <span
            className={`text-xs font-bold px-2.5 py-1 rounded-md ${hasStore
              ? "text-amber-600 bg-amber-50"
              : "text-success bg-success-bg"
              }`}
          >
            {hasStore ? "Theo cửa hàng" : "Toàn hệ thống"}
          </span>
        );
      },
      className: "w-36",
      hideOnMobile: true,
    },
    {
      header: "",
      cell: (u) => {
        const actions: RowAction[] = [
          { label: "Sửa thông tin", icon: Edit2, onClick: () => handleEdit(u) },
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
          <p className="text-sm text-gray-500 font-medium">
            Thiết lập tài khoản, phân vai trò và phạm vi truy cập của người dùng trong hệ thống.
          </p>
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-sm">
        <MetricCard label="Tổng user" value={totalCount} icon={Users} />
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border space-y-4">
        <SearchInput
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Tìm kiếm theo tên hoặc email..."
          className="w-full max-w-md"
        />

        <DataTable<User>
          columns={columns}
          data={filtered}
          isLoading={isLoading}
          emptyTitle="Không tìm thấy người dùng"
          emptyDescription="Thử thay đổi từ khóa tìm kiếm."
          footerContent={
            meta && meta.totalPages > 1 ? (
              <PaginationControls page={meta.page} totalPages={meta.totalPages} total={meta.total} onPageChange={setPage} />
            ) : undefined
          }
        />
      </div>

      <UserDrawer
        open={isUserDrawerOpen}
        onOpenChange={setIsUserDrawerOpen}
        onSubmit={handleSubmit}
        initialData={
          editingUser
            ? {
              fullName: editingUser.fullName,
              email: editingUser.email,
              title: editingUser.title ?? "",
              phone: editingUser.phone ?? "",
              status: editingUser.isActive ? "active" : "inactive",
              permissions: editingUser.roleAssignments.map((ra) => ({
                role: ra.roleKey,
                scope: ra.storeId ? "store" : "global",
                targetId: ra.storeId ?? "",
              })),
            }
            : undefined
        }
      />
    </div>
  );
}
