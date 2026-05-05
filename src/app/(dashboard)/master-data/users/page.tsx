"use client";

import { useState, useMemo } from "react";
import { Plus, Search, RotateCcw, Lock, Unlock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { UserDrawer } from "@/components/master-data/user-drawer";
import { PageHeader } from "@/shared/components/page-header";

// ---------------------------------------------------------------------------
// Mock data (mirrors UAT user list from /api/v1/users)
// ---------------------------------------------------------------------------

const ROLE_LABEL: Record<string, string> = {
  "company_admin": "Company Admin",
  "qa_manager": "QA Manager",
  "qc_auditor": "QC Auditor",
  "am": "Area Manager",
  "store_manager": "Store Manager",
  "executive_viewer": "Executive Viewer",
};

const SCOPE_LABEL: Record<string, string> = {
  company: "Toàn hệ thống",
  brand: "Thương hiệu",
  area: "Khu vực",
  store: "Cửa hàng",
};

const USERS_MOCK = [
  {
    id: "u1",
    fullName: "Maycha Admin UAT",
    email: "admin@maycha.vn",
    jobTitle: "Company Admin",
    phone: null,
    status: "active",
    mustChangePassword: false,
    roleAssignments: [
      { roleKey: "company_admin", scopeType: "company", scopeIds: [] },
    ],
  },
  {
    id: "u2",
    fullName: "Nguyen van F - AM",
    email: "f@maycha.com.vn",
    jobTitle: "Area Manager",
    phone: null,
    status: "active",
    mustChangePassword: false,
    roleAssignments: [
      { roleKey: "am", scopeType: "area", scopeIds: ["north-hcm"] },
    ],
  },
  {
    id: "u3",
    fullName: "Tran Thi V",
    email: "v@gmail.com",
    jobTitle: "Area Manager",
    phone: null,
    status: "active",
    mustChangePassword: false,
    roleAssignments: [
      { roleKey: "am", scopeType: "area", scopeIds: ["south-hcm"] },
    ],
  },
  {
    id: "u4",
    fullName: "Nguyên Vãn A",
    email: "sm@maycha.com.vn",
    jobTitle: "Quản lý cửa hàng",
    phone: null,
    status: "active",
    mustChangePassword: false,
    roleAssignments: [
      { roleKey: "store_manager", scopeType: "store", scopeIds: ["mc-118"] },
    ],
  },
  {
    id: "u5",
    fullName: "Lê Thị QC",
    email: "qc@maycha.com.vn",
    jobTitle: "QC Auditor",
    phone: "0901 234 000",
    status: "active",
    mustChangePassword: true,
    roleAssignments: [
      { roleKey: "qc_auditor", scopeType: "company", scopeIds: [] },
    ],
  },
  {
    id: "u6",
    fullName: "Nguyễn Thị QAM",
    email: "qa.manager@maycha.vn",
    jobTitle: "QA Manager",
    phone: "0908 888 999",
    status: "active",
    mustChangePassword: false,
    roleAssignments: [
      { roleKey: "qa_manager", scopeType: "company", scopeIds: [] },
    ],
  },
  {
    id: "u7",
    fullName: "Trần Văn Khóa",
    email: "locked@maycha.vn",
    jobTitle: "Nhân viên",
    phone: null,
    status: "locked",
    mustChangePassword: false,
    roleAssignments: [
      { roleKey: "qc_auditor", scopeType: "company", scopeIds: [] },
    ],
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function StatusBadge({ status }: { status: string }) {
  if (status === "active") {
    return (
      <Badge className="bg-success-bg text-success border-success/20 font-medium">
        Hoạt động
      </Badge>
    );
  }
  if (status === "locked") {
    return (
      <Badge className="bg-danger-bg text-danger border-danger/20 font-medium">
        Khóa
      </Badge>
    );
  }
  return (
    <Badge className="bg-warning-bg text-warning border-warning/20 font-medium">
      Tạm ngưng
    </Badge>
  );
}

function PasswordBadge({ mustChange }: { mustChange: boolean }) {
  if (mustChange) {
    return (
      <Badge className="bg-warning-bg text-warning border-warning/20 font-medium">
        Bắt buộc đổi
      </Badge>
    );
  }
  return (
    <Badge className="bg-success-bg text-success border-success/20 font-medium">
      Ổn định
    </Badge>
  );
}

function RoleTag({ roleKey }: { roleKey: string }) {
  return (
    <Badge variant="outline" className="text-xs font-medium border-gray-200 text-gray-600">
      {ROLE_LABEL[roleKey] ?? roleKey}
    </Badge>
  );
}

function ScopeTag({ scopeType, scopeIds }: { scopeType: string; scopeIds: string[] }) {
  const label =
    scopeType === "company"
      ? "Toàn hệ thống"
      : `${SCOPE_LABEL[scopeType] ?? scopeType}: ${scopeIds.join(", ")}`;
  return (
    <Badge className="text-xs font-medium bg-info-bg text-info border-info/20">
      {label}
    </Badge>
  );
}

function MetricCard({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: number;
  tone?: "default" | "success" | "warning" | "error";
}) {
  const dotColors: Record<string, string> = {
    default: "bg-gray-300",
    success: "bg-emerald-400",
    warning: "bg-amber-400",
    error: "bg-red-400",
  };
  return (
    <Card className="border border-gray-100 shadow-none hover:shadow-sm transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-xs text-gray-500 mb-1">{label}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
          </div>
          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${dotColors[tone]}`} />
        </div>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export default function UsersPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<(typeof USERS_MOCK)[0] | null>(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return USERS_MOCK.filter((u) => {
      if (q && !u.fullName.toLowerCase().includes(q) && !u.email.toLowerCase().includes(q) && !u.jobTitle.toLowerCase().includes(q)) return false;
      if (statusFilter !== "all" && u.status !== statusFilter) return false;
      return true;
    });
  }, [search, statusFilter]);

  const activeCount = USERS_MOCK.filter((u) => u.status === "active").length;
  const lockedCount = USERS_MOCK.filter((u) => u.status === "locked").length;
  const mustChangeCount = USERS_MOCK.filter((u) => u.mustChangePassword).length;

  const handleCreate = () => {
    setEditingUser(null);
    setIsDrawerOpen(true);
  };

  const handleEdit = (user: (typeof USERS_MOCK)[0]) => {
    setEditingUser(user);
    setIsDrawerOpen(true);
  };

  const handleSubmit = (data: unknown) => {
    console.log("User submit:", data);
    setIsDrawerOpen(false);
  };

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

      {/* Metric cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard label="Tổng người dùng" value={USERS_MOCK.length} />
        <MetricCard label="Đang hoạt động" value={activeCount} tone="success" />
        <MetricCard label="Tài khoản bị khóa" value={lockedCount} tone="error" />
        <MetricCard label="Cần đổi mật khẩu" value={mustChangeCount} tone="warning" />
      </div>

      {/* Table section */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="p-5 border-b border-gray-50 flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Tìm theo tên, email, chức danh..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 text-sm"
            />
          </div>
          <Select value={statusFilter} onValueChange={(v: string | null) => setStatusFilter(v ?? "all")}>
            <SelectTrigger className="w-44 h-9 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              <SelectItem value="active">Hoạt động</SelectItem>
              <SelectItem value="locked">Khóa</SelectItem>
              <SelectItem value="suspended">Tạm ngưng</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/60">
                <TableHead className="font-semibold text-gray-700 min-w-[200px]">Người dùng</TableHead>
                <TableHead className="font-semibold text-gray-700 min-w-[140px]">Chức danh</TableHead>
                <TableHead className="font-semibold text-gray-700 min-w-[160px]">Role</TableHead>
                <TableHead className="font-semibold text-gray-700 min-w-[180px]">Scope</TableHead>
                <TableHead className="font-semibold text-gray-700 w-36">Trạng thái</TableHead>
                <TableHead className="font-semibold text-gray-700 w-36">Mật khẩu</TableHead>
                <TableHead className="font-semibold text-gray-700 min-w-[200px]">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((user) => (
                <TableRow key={user.id} className="hover:bg-gray-50/50">
                  <TableCell>
                    <div className="font-semibold text-gray-900">{user.fullName}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{user.email}</div>
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">{user.jobTitle}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {user.roleAssignments.map((ra, i) => (
                        <RoleTag key={i} roleKey={ra.roleKey} />
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {user.roleAssignments.map((ra, i) => (
                        <ScopeTag key={i} scopeType={ra.scopeType} scopeIds={ra.scopeIds} />
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={user.status} />
                  </TableCell>
                  <TableCell>
                    <PasswordBadge mustChange={user.mustChangePassword} />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() => handleEdit(user)}
                      >
                        Sửa
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className={`h-7 text-xs ${user.status === "active" ? "text-red-500 border-red-200 hover:bg-red-50" : "text-emerald-600 border-emerald-200 hover:bg-emerald-50"}`}
                      >
                        {user.status === "active" ? (
                          <><Lock className="h-3 w-3 mr-1" />Khóa</>
                        ) : (
                          <><Unlock className="h-3 w-3 mr-1" />Mở lại</>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs text-blue-600 border-blue-200 hover:bg-blue-50"
                      >
                        <RotateCcw className="h-3 w-3 mr-1" />
                        Reset MK
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-gray-400 py-12">
                    Không tìm thấy người dùng phù hợp
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="px-5 py-3 border-t border-gray-50 text-xs text-gray-400 text-right">
          Hiển thị {filtered.length} / {USERS_MOCK.length} người dùng
        </div>
      </div>

      <UserDrawer
        open={isDrawerOpen}
        initialData={
          editingUser
            ? {
                fullName: editingUser.fullName,
                email: editingUser.email,
                title: editingUser.jobTitle,
                status: editingUser.status,
              }
            : undefined
        }
        onOpenChange={setIsDrawerOpen}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
