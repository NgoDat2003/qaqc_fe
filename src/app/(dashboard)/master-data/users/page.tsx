"use client";

import { useState, useMemo, useCallback } from "react";
import { toast } from "sonner";
import { Plus, Lock, Unlock, Users, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { UserDrawer } from "@/features/master-data/components/user-drawer";
import type { UserFormValues } from "@/features/master-data/components/user-drawer";
import {
  useUsers, useCreateUser, useUpdateUser, useToggleUserActive,
} from "@/features/master-data/hooks/use-users";
import {
  PageHeader, StatusBadge, MetricCard, SortableTable, SearchInput, RowActions,
} from "@/shared/components";
import type { AppStatus, SortableColumnDef, RowAction } from "@/shared/components";
import type { User } from "@/shared/types";
import { useHasRole } from "@/lib/roles";

const ROLE_LABEL: Record<string, string> = {
  company_admin:    "Quản trị",
  qa_manager:       "QA Manager",
  qc_auditor:       "QAQC",
  am:               "Area Manager",
  store_manager:    "Quản lý CH",
  executive_viewer: "Xem báo cáo",
};

// Role badge with store name (hydrated from BE)
function RoleTag({ roleKey, storeName }: { roleKey: string; storeName?: string | null }) {
  return (
    <div className="flex flex-col gap-0.5">
      <Badge variant="outline" className="text-xs font-medium border-border text-foreground w-fit">
        {ROLE_LABEL[roleKey] ?? roleKey}
      </Badge>
      {storeName && <span className="text-[11px] text-muted-foreground pl-0.5">{storeName}</span>}
    </div>
  );
}

// Initials avatar
function UserAvatar({ name }: { name: string }) {
  const initials = name.split(" ").filter(Boolean).slice(-2).map((w) => w[0].toUpperCase()).join("");
  return (
    <div className="flex items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-xs"
      style={{ width: 32, height: 32, minWidth: 32 }}>
      {initials}
    </div>
  );
}

export default function UsersPage() {
  const isAdmin = useHasRole(["company_admin"]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const { data: rows = [], isLoading } = useUsers();
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const toggleActive = useToggleUserActive();

  // Client-side multi-field filter — SortableTable handles sort + pagination
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return rows.filter((u) => {
      const matchQ = !q || u.fullName.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
      const matchStatus = statusFilter === "all" || (statusFilter === "active" ? u.isActive : !u.isActive);
      return matchQ && matchStatus;
    });
  }, [rows, search, statusFilter]);

  const activeCount = useMemo(() => rows.filter((u) => u.isActive).length, [rows]);

  const handleCreate = () => { setEditingUser(null); setIsDrawerOpen(true); };
  const handleEdit = useCallback((user: User) => { setEditingUser(user); setIsDrawerOpen(true); }, []);

  const handleSubmit = (data: UserFormValues) => {
    const roleAssignments = data.permissions.map((p) => ({
      roleKey: p.role,
      storeId: p.scope === "store" ? (p.targetId || null) : null,
    }));
    if (editingUser) {
      // PATCH /api/users/[id] — only accepts fullName, phone
      updateUser.mutate(
        { id: editingUser.id, fullName: data.fullName, phone: data.phone || null },
        {
          onSuccess: () => setIsDrawerOpen(false),
          onError: (e) => toast.error(e instanceof Error ? e.message : "Có lỗi xảy ra"),
        }
      );
    } else {
      // POST /api/users — requires password + roleAssignments
      if (!data.password) { toast.error("Mật khẩu là bắt buộc"); return; }
      createUser.mutate(
        {
          fullName: data.fullName,
          email: data.email,
          password: data.password,
          phone: data.phone || undefined,
          roleAssignments,
        },
        {
          onSuccess: () => setIsDrawerOpen(false),
          onError: (e) => toast.error(e instanceof Error ? e.message : "Có lỗi xảy ra"),
        }
      );
    }
  };

  const columns = useMemo((): SortableColumnDef<User>[] => [
    {
      header: "Người dùng",
      sortKey: "fullName",
      cell: (u) => (
        <div className="flex items-center gap-3">
          <UserAvatar name={u.fullName} />
          <div>
            <div className="font-semibold text-foreground">{u.fullName}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{u.email}</div>
          </div>
        </div>
      ),
    },
    {
      header: "Điện thoại",
      sortKey: "phone",
      cell: (u) => <span className="text-sm text-muted-foreground">{u.phone ?? "—"}</span>,
      className: "w-36",
      hideOnMobile: true,
    },
    {
      header: "Bộ phận / Vai trò",
      cell: (u) => (
        <div className="flex flex-wrap gap-1.5">
          {u.roleAssignments.map((ra, i) => (
            <RoleTag key={i} roleKey={ra.roleKey} storeName={ra.store?.name} />
          ))}
        </div>
      ),
      className: "min-w-[180px]",
    },
    {
      header: "Trạng thái",
      sortKey: "isActive",
      filterKey: "isActive",
      filterOptions: [
        { value: "true", label: "Đang hoạt động" },
        { value: "false", label: "Đã khóa" },
      ],
      cell: (u) => <StatusBadge status={(u.isActive ? "active" : "locked") as AppStatus} />,
      className: "w-32",
    },
    {
      header: "",
      cell: (u) => {
        if (!isAdmin) return null;
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
      <PageHeader title="Quản lý người dùng" subtitle="Quản lý tài khoản, vai trò và phạm vi truy cập của người dùng.">
        {isAdmin && (
          <Button onClick={handleCreate} className="gap-1.5 shrink-0 bg-primary hover:bg-primary/90 font-bold">
            <Plus className="h-4 w-4" />
            Tạo người dùng
          </Button>
        )}
      </PageHeader>

      <div className="grid grid-cols-2 gap-3 max-w-xs">
        <MetricCard label="Tổng người dùng" value={rows.length} icon={Users} />
        <MetricCard label="Đang hoạt động" value={activeCount} icon={Users} />
      </div>

      <div className="bg-white p-5 rounded-2xl shadow-md border space-y-4">
        {/* Filter bar */}
        <div className="flex gap-2">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Tìm theo tên hoặc email..."
            className="max-w-sm"
          />
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-muted-foreground whitespace-nowrap">Trạng thái:</span>
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v ?? "all")}>
              <SelectTrigger className="w-40 h-10 text-sm rounded-lg border-gray-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="active">Đang hoạt động</SelectItem>
                <SelectItem value="locked">Đã khóa</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <SortableTable
          columns={columns}
          data={filtered}
          isLoading={isLoading}
          emptyTitle="Không tìm thấy người dùng"
          emptyDescription="Thử thay đổi từ khóa hoặc bộ lọc."
        />
      </div>

      <UserDrawer
        open={isDrawerOpen}
        initialData={editingUser ? {
          fullName: editingUser.fullName,
          email: editingUser.email,
          phone: editingUser.phone ?? "",
          permissions: editingUser.roleAssignments.map((ra) => ({
            role: ra.roleKey,
            scope: ra.storeId ? "store" : "global",
            targetId: ra.storeId ?? "",
          })),
        } : undefined}
        onOpenChange={setIsDrawerOpen}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
