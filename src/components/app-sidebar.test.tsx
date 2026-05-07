import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { AppSidebar } from "./app-sidebar";
import type { RoleKey } from "./app-sidebar";

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

const mockAuthState = {
  activeRole: "company_admin" as RoleKey,
  user: { id: "u1", fullName: "Test User", email: "test@example.com" },
  availableRoles: [] as RoleKey[],
  isAuthenticated: true,
  logout: vi.fn(),
};

vi.mock("@/stores/auth.store", () => ({
  useAuthStore: (selector?: (s: typeof mockAuthState) => unknown) =>
    selector ? selector(mockAuthState) : mockAuthState,
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => "/dashboard",
}));

vi.mock("@/lib/api-client", () => ({
  apiClient: { post: vi.fn() },
}));

// Lightweight sidebar wrappers — avoid complex Radix context
vi.mock("@/components/ui/sidebar", () => ({
  Sidebar: ({ children }: { children: React.ReactNode }) => <nav>{children}</nav>,
  SidebarContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SidebarFooter: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SidebarGroup: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SidebarGroupContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SidebarGroupLabel: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SidebarHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SidebarMenu: ({ children }: { children: React.ReactNode }) => <ul>{children}</ul>,
  SidebarMenuButton: ({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) => (
    <button onClick={onClick}>{children}</button>
  ),
  SidebarMenuItem: ({ children }: { children: React.ReactNode }) => <li>{children}</li>,
  SidebarSeparator: () => <hr />,
}));

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("AppSidebar — role-based menu", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("QA Manager thấy đúng menu operations", () => {
    mockAuthState.activeRole = "qa_manager";
    render(<AppSidebar />);

    expect(screen.getByText("Criteria Groups")).toBeInTheDocument();
    expect(screen.getByText("Criteria Library")).toBeInTheDocument();
    expect(screen.getByText("Checklists")).toBeInTheDocument();
    expect(screen.getByText("Audit Plans")).toBeInTheDocument();
    expect(screen.getByText("Action Plans")).toBeInTheDocument();

    // Không thấy menu của CA
    expect(screen.queryByText("Brands & Stores")).not.toBeInTheDocument();
    expect(screen.queryByText("Import Data")).not.toBeInTheDocument();
  });

  it("QC Auditor chỉ thấy My Audits, không thấy menu QAM", () => {
    mockAuthState.activeRole = "qc_auditor";
    render(<AppSidebar />);

    expect(screen.getByText("My Audits")).toBeInTheDocument();

    // Không thấy menu QAM
    expect(screen.queryByText("Criteria Groups")).not.toBeInTheDocument();
    expect(screen.queryByText("Checklists")).not.toBeInTheDocument();
    expect(screen.queryByText("Audit Plans")).not.toBeInTheDocument();
    expect(screen.queryByText("Brands & Stores")).not.toBeInTheDocument();
  });

  it("Company Admin thấy đúng menu master data", () => {
    mockAuthState.activeRole = "company_admin";
    render(<AppSidebar />);

    expect(screen.getByText("Brands & Stores")).toBeInTheDocument();
    expect(screen.getByText("Users")).toBeInTheDocument();
    expect(screen.getByText("Import Data")).toBeInTheDocument();

    // Không thấy menu QAM
    expect(screen.queryByText("Criteria Groups")).not.toBeInTheDocument();
    expect(screen.queryByText("My Audits")).not.toBeInTheDocument();
  });
});
