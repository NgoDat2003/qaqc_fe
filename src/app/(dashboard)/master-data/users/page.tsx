"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { Plus, Lock, Unlock, Users, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserDrawer } from "@/features/master-data/components/user-drawer";
import type { UserFormValues } from "@/features/master-data/components/user-drawer";
import {
  useUsers,
  useCreateUser,
  useUpdateUser,
  useToggleUserActive,
} from "@/features/master-data/hooks/use-users";
import {
  PageHeader,
  StatusBadge,
  MetricCard,
  DataTable,
  SearchInput,
  RowActions,
  PaginationControls,
} from "@/shared/components";
import type { AppStatus, ColumnDef, RowAction } from "@/shared/components";
import type { User } from "@/shared/types";

// ---------------------------------------------------------------------------

const ROLE_LABEL: Record<string, string> = {
  company_admin: "Company Admin",
  qa_manager: "QA Manager",
  qc_auditor: "QC Auditor",
  am: "Area Manager",
  store_manager: "Store Manager",
  executive_viewer: "Executive Viewer",
};

function RoleTag({ roleKey }: { roleKey: string }) {
  return (
    <Badge variant="outline" className="text-xs font-medium border-gray-200 text-gray-600">
      {ROLE_LABEL[roleKey] ?? roleKey}
    </Badge>
  );
}

function ScopeTag({ storeId, storeName }: { storeId?: string | null; storeName?: string | null }) {
  const label = storeId
    ? `Cửa hàng: ${storeName ?? storeId}`
    : "Toàn hệ thống";
  return (
    <Badge className="text-xs font-medium bg-info-bg text-info border-info/20">
      {label}
    </Badge>
  );
}

function userToFormValues(user: User): Partial<UserFormValues> {
  return {
    fullName: user.fullName,
    email: user.email,
    title: user.title ?? "",
    phone: user.phone ?? "",
    status: user.isActive ? "active" : "inactive",
    permissions: user.roleAssignments.map((ra) => ({
      role: ra.roleKey,
      scope: ra.storeId ? "store" : "global",
      targetId: ra.storeId ?? "",
    })),
  };
}

// ---------------------------------------------------------------------------

export default function UsersPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [page, setPage] = useState(1);

  const { data, isLoading } = useUsers({ page, limit: 20 });
  const rows = data?.data ?? [];
  const meta = data?.meta;

  useEffect(() => { setPage(1); }, [search, statusFilter]);
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const toggleActive = useToggleUserActive();

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return rows.filter((u) => {
      if (
        q &&
        !u.fullName.toLowerCase().includes(q) &&
        !u.email.toLowerCase().includes(q) &&
        !(u.title ?? "").toLowerCase().includes(q)
      )
        return false;
      if (statusFilter === "active" && !u.isActive) return false;
      if (statusFilter === "locked" && u.isActive) return false;
      return true;
    });
  }, [search, statusFilter, rows]);


  const handleCreate = () => {
    setEditingUser(null);
    setIsDrawerOpen(true);
  };

  const handleEdit = useCallback((user: User) => {
    setEditingUser(user);
    setIsDrawerOpen(true);
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
        { id: editingUser.id, fullName: data.fullName, title: data.title, phone: data.phone, isActive: data.status === "active", roleAssignments },
        { onSuccess: () => setIsDrawerOpen(false) }
      );
    } else {
      createUser.mutate(
        { fullName: data.fullName, email: data.email, title: data.title, phone: data.phone, isActive: data.status === "active", roleAssignments },
        { onSuccess: () => setIsDrawerOpen(false) }
      );
    }
  };

  const columns = useMemo((): ColumnDef<User>[] => [
    {
      header: "Người dùng",
      cell: (u) => (
        <div>
          <div className="font-semibold text-gray-900">{u.fullName}</div>
          <div className="text-xs text-gray-400 mt-0.5">{u.email}</div>
        </div>
      ),
    },
    {
      header: "Chức danh",
      cell: (u) => <span className="text-sm text-gray-600">{u.title ?? "—"}</span>,
      className: "w-40",
      hideOnMobile: true,
    },
    {
      header: "Role",
      cell: (u) => (
        <div className="flex flex-wrap gap-1">
          {u.roleAssignments.map((ra, i) => (
            <RoleTag key={i} roleKey={ra.roleKey} />
          ))}
        </div>
      ),
      className: "min-w-[160px]",
    },
    {
      header: "Scope",
      cell: (u) => (
        <div className="flex flex-wrap gap-1">
          {u.roleAssignments.map((ra, i) => (
            <ScopeTag key={i} storeId={ra.storeId} />
          ))}
        </div>
      ),
      className: "min-w-[160px]",
      hideOnMobile: true,
    },
    {
      header: "Trạng thái",
      cell: (u) => <StatusBadge status={(u.isActive ? "active" : "locked") as AppStatus} />,
      className: "w-36",
    },
    {
      header: "",
      cell: (u) => {
        const actions: RowAction[] = [
          { label: "Sửa thông tin", icon: Edit2, onClick: () => handleEdit(u) },
          {
            label: u.isActive ? "Khóa tài khoản" : "Mở lại tài khoản",
            icon: u.isActive ? Lock : Unlock,
            onClick: () => toggleActive.mutate({ id: u.id, isActive: !u.isActive }),
            variant: u.isActive ? "destructive" : undefined,
          },
        ];
        return <RowActions actions={actions} />;
      },
      className: "w-12",
    },
  ], [handleEdit, toggleActive]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <PageHeader
        title="Quản lý người dùng"
        subtitle="Quản lý tài khoản, vai trò và phạm vi truy cập của người dùng trong hệ thống."
      >
        <Button onClick={handleCreate} className="gap-1.5 shrink-0">
          <Plus className="h-4 w-4" />
          Tạo người dùng
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-sm">
        <MetricCard label="Tổng người dùng" value={meta?.total ?? rows.length} icon={Users} />
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="p-5 border-b border-gray-50 flex flex-col sm:flex-row sm:items-center gap-3">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Tìm theo tên, email, chức danh..."
            className="flex-1 max-w-sm"
          />
          <Select
            value={statusFilter}
            onValueChange={(v: string | null) => setStatusFilter(v ?? "all")}
          >
            <SelectTrigger className="w-44 h-9 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              <SelectItem value="active">Hoạt động</SelectItem>
              <SelectItem value="locked">Khóa</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <DataTable<User>
          columns={columns}
          data={filtered}
          isLoading={isLoading}
          emptyTitle="Không tìm thấy người dùng"
          emptyDescription="Thử thay đổi từ khóa tìm kiếm."
          footerContent={
            meta && meta.totalPages > 1 ? (
              <PaginationControls page={meta.page} totalPages={meta.totalPages} total={meta.total} onPageChange={setPage} />
            ) : (
              <span className="text-xs text-gray-400">
                Hiển thị {filtered.length} / {meta?.total ?? rows.length} người dùng
              </span>
            )
          }
          containerClassName="rounded-none border-0 shadow-none"
          className="rounded-none border-0 shadow-none hover:shadow-none"
        />
      </div>

      <UserDrawer
        open={isDrawerOpen}
        initialData={editingUser ? userToFormValues(editingUser) : undefined}
        onOpenChange={setIsDrawerOpen}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
