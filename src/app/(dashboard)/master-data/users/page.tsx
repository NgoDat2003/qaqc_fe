"use client";

import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import { Edit2, Lock, Plus, ShieldCheck, Unlock, UserCheck, Users, UserX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserDrawer } from "@/features/master-data/components/user-drawer";
import type { UserFormValues } from "@/features/master-data/components/user-drawer";
import {
  useCreateUser,
  useToggleUserActive,
  useUpdateUser,
  useUsers,
} from "@/features/master-data/hooks/use-users";
import {
  MetricCard,
  PageHeader,
  RowActions,
  SortableTable,
  StatusBadge,
} from "@/shared/components";
import type { AppStatus, RowAction, SortableColumnDef } from "@/shared/components";
import type { User } from "@/shared/types";
import { useHasRole } from "@/lib/roles";

const ROLE_LABEL: Record<string, string> = {
  company_admin: "Quản trị",
  qa_manager: "QA Manager",
  qc_auditor: "QAQC",
  am: "Area Manager",
  store_manager: "Quản lý CH",
  executive_viewer: "Xem báo cáo",
};

function RoleTag({ roleKey, storeName }: { roleKey: string; storeName?: string | null }) {
  return (
    <div className="flex flex-col gap-0.5">
      <Badge variant="outline" className="w-fit border-border text-xs font-medium text-foreground">
        {ROLE_LABEL[roleKey] ?? roleKey}
      </Badge>
      {storeName && <span className="pl-0.5 text-[11px] text-muted-foreground">{storeName}</span>}
    </div>
  );
}

function UserAvatar({ name }: { name: string }) {
  const initials = name.split(" ").filter(Boolean).slice(-2).map((word) => word[0].toUpperCase()).join("");
  return (
    <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary-light text-xs font-semibold text-primary">
      {initials}
    </div>
  );
}

export default function UsersPage() {
  const isAdmin = useHasRole(["company_admin"]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const { data: rows = [], isLoading } = useUsers();
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const toggleActive = useToggleUserActive();

  const userStats = useMemo(() => {
    const total = rows.length;
    const active = rows.filter((user) => user.isActive).length;
    const locked = total - active;
    const assignedUsers = rows.filter((user) => user.roleAssignments.length > 0).length;
    const roleAssignments = rows.reduce((sum, user) => sum + user.roleAssignments.length, 0);
    const activeRate = total > 0 ? Math.round((active / total) * 100) : 0;

    return { total, active, locked, assignedUsers, roleAssignments, activeRate };
  }, [rows]);

  const handleCreate = () => {
    setEditingUser(null);
    setIsDrawerOpen(true);
  };

  const handleEdit = useCallback((user: User) => {
    setEditingUser(user);
    setIsDrawerOpen(true);
  }, []);

  const handleSubmit = (data: UserFormValues) => {
    const roleAssignments = data.permissions.map((permission) => ({
      roleKey: permission.role,
      storeId: permission.scope === "store" ? (permission.targetId || null) : null,
    }));

    if (editingUser) {
      updateUser.mutate(
        { id: editingUser.id, fullName: data.fullName, phone: data.phone || null },
        {
          onSuccess: () => setIsDrawerOpen(false),
          onError: (error) => toast.error(error instanceof Error ? error.message : "Có lỗi xảy ra"),
        }
      );
      return;
    }

    if (!data.password) {
      toast.error("Mật khẩu là bắt buộc");
      return;
    }

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
        onError: (error) => toast.error(error instanceof Error ? error.message : "Có lỗi xảy ra"),
      }
    );
  };

  const columns = useMemo((): SortableColumnDef<User>[] => [
    {
      header: "Người dùng",
      getSearchValue: (user) => `${user.fullName} ${user.email}`,
      cell: (user) => (
        <div className="flex items-center gap-3">
          <UserAvatar name={user.fullName} />
          <div>
            <div className="font-semibold text-foreground">{user.fullName}</div>
            <div className="mt-0.5 text-xs text-muted-foreground">{user.email}</div>
          </div>
        </div>
      ),
    },
    {
      header: "Điện thoại",
      getSearchValue: (user) => user.phone ?? "",
      cell: (user) => <span className="text-sm text-muted-foreground">{user.phone ?? "—"}</span>,
      className: "w-36",
      hideOnMobile: true,
    },
    {
      header: "Bộ phận / Vai trò",
      getFilterValue: (user) => user.roleAssignments.map((role) => role.roleKey),
      filterOptions: Object.entries(ROLE_LABEL).map(([value, label]) => ({ value, label })),
      cell: (user) => (
        <div className="flex flex-wrap gap-1.5">
          {user.roleAssignments.map((assignment, index) => (
            <RoleTag key={index} roleKey={assignment.roleKey} storeName={assignment.store?.name} />
          ))}
        </div>
      ),
      className: "min-w-[180px]",
    },
    {
      header: "Trạng thái",
      filterKey: "isActive",
      filterOptions: [
        { value: "true", label: "Đang hoạt động" },
        { value: "false", label: "Đã khóa" },
      ],
      cell: (user) => <StatusBadge status={(user.isActive ? "active" : "locked") as AppStatus} />,
      className: "w-32",
    },
    {
      header: "",
      cell: (user) => {
        if (!isAdmin) return null;
        const actions: RowAction[] = [
          { label: "Sửa thông tin", icon: Edit2, onClick: () => handleEdit(user) },
          {
            label: user.isActive ? "Khóa tài khoản" : "Mở lại tài khoản",
            icon: user.isActive ? Lock : Unlock,
            onClick: () => toggleActive.mutate({ id: user.id, isActive: !user.isActive }),
            variant: user.isActive ? "destructive" : undefined,
          },
        ];
        return <RowActions actions={actions} />;
      },
      className: "w-12",
    },
  ], [handleEdit, isAdmin, toggleActive]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <PageHeader title="Quản lý người dùng" subtitle="Quản lý tài khoản, vai trò và phạm vi truy cập của người dùng.">
        {isAdmin && (
          <Button onClick={handleCreate} className="gap-1.5 bg-primary font-bold hover:bg-primary/90">
            <Plus className="h-4 w-4" />
            Tạo người dùng
          </Button>
        )}
      </PageHeader>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Tổng tài khoản" value={userStats.total} icon={Users} description="Theo dữ liệu hiện có" />
        <MetricCard label="Đang hoạt động" value={userStats.active} icon={UserCheck} variant="success" description={`${userStats.activeRate}% tổng tài khoản`} />
        <MetricCard label="Đã khóa" value={userStats.locked} icon={UserX} variant={userStats.locked > 0 ? "warning" : "default"} description="Không thể đăng nhập" />
        <MetricCard label="Đã phân quyền" value={userStats.assignedUsers} icon={ShieldCheck} variant="info" description={`${userStats.roleAssignments} lượt phân quyền`} />
      </div>

      <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
        <SortableTable
          columns={columns}
          data={rows}
          isLoading={isLoading}
          mobileCard={{
            leading: (user) => <UserAvatar name={user.fullName} />,
            title: (user) => user.fullName,
            subtitle: (user) => (
              <span className="block truncate">
                {user.email}{user.phone ? ` · ${user.phone}` : ""}
              </span>
            ),
            badges: (user) => [
              <StatusBadge key="status" status={(user.isActive ? "active" : "locked") as AppStatus} />,
              ...user.roleAssignments.map((assignment, index) => (
                <RoleTag key={`${assignment.roleKey}-${index}`} roleKey={assignment.roleKey} storeName={assignment.store?.name} />
              )),
            ],
            actions: (user) => {
              if (!isAdmin) return null;
              const actions: RowAction[] = [
                { label: "Sửa thông tin", icon: Edit2, onClick: () => handleEdit(user) },
                {
                  label: user.isActive ? "Khóa tài khoản" : "Mở lại tài khoản",
                  icon: user.isActive ? Lock : Unlock,
                  onClick: () => toggleActive.mutate({ id: user.id, isActive: !user.isActive }),
                  variant: user.isActive ? "destructive" : undefined,
                },
              ];
              return <RowActions actions={actions} />;
            },
          }}
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
          permissions: editingUser.roleAssignments.map((assignment) => ({
            role: assignment.roleKey,
            scope: assignment.storeId ? "store" : "global",
            targetId: assignment.storeId ?? "",
          })),
        } : undefined}
        onOpenChange={setIsDrawerOpen}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
