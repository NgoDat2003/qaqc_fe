import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, afterEach } from "vitest";
import { RoleGuard } from "./role-guard";
import type { RoleKey } from "@/shared/types";

// ---------------------------------------------------------------------------
// Mock auth store — pattern giống app-sidebar.test.tsx
// ---------------------------------------------------------------------------

const mockAuthState = {
  activeRole: null as RoleKey | null,
  user: null,
  availableRoles: [] as RoleKey[],
  isAuthenticated: false,
};

vi.mock("@/stores/auth.store", () => ({
  useAuthStore: (selector?: (s: typeof mockAuthState) => unknown) =>
    selector ? selector(mockAuthState) : mockAuthState,
}));

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("RoleGuard — render children khi role match", () => {
  afterEach(() => {
    mockAuthState.activeRole = null;
  });

  it("activeRole='qa_manager', roles=['qa_manager'] → render children", () => {
    mockAuthState.activeRole = "qa_manager";
    render(
      <RoleGuard roles={["qa_manager"]}>
        <span>Protected Content</span>
      </RoleGuard>
    );
    expect(screen.getByText("Protected Content")).toBeInTheDocument();
  });

  it("activeRole='qc_auditor', roles=['qa_manager', 'qc_auditor'] → render children", () => {
    mockAuthState.activeRole = "qc_auditor";
    render(
      <RoleGuard roles={["qa_manager", "qc_auditor"]}>
        <span>Protected Content</span>
      </RoleGuard>
    );
    expect(screen.getByText("Protected Content")).toBeInTheDocument();
  });

  it("activeRole='company_admin', roles=['company_admin', 'qa_manager'] → render children", () => {
    mockAuthState.activeRole = "company_admin";
    render(
      <RoleGuard roles={["company_admin", "qa_manager"]}>
        <span>Admin Content</span>
      </RoleGuard>
    );
    expect(screen.getByText("Admin Content")).toBeInTheDocument();
  });
});

describe("RoleGuard — KHÔNG render children khi role không match", () => {
  afterEach(() => {
    mockAuthState.activeRole = null;
  });

  it("activeRole='qc_auditor', roles=['qa_manager'] → KHÔNG render children", () => {
    mockAuthState.activeRole = "qc_auditor";
    render(
      <RoleGuard roles={["qa_manager"]}>
        <span>Protected Content</span>
      </RoleGuard>
    );
    expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
  });

  it("activeRole='qc_auditor', roles=['qa_manager'] → render fallback", () => {
    mockAuthState.activeRole = "qc_auditor";
    render(
      <RoleGuard roles={["qa_manager"]} fallback={<span>Access Denied</span>}>
        <span>Protected Content</span>
      </RoleGuard>
    );
    expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
    expect(screen.getByText("Access Denied")).toBeInTheDocument();
  });

  it("activeRole=null, roles=['qa_manager'] → KHÔNG render children", () => {
    mockAuthState.activeRole = null;
    render(
      <RoleGuard roles={["qa_manager"]}>
        <span>Protected Content</span>
      </RoleGuard>
    );
    expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
  });

  it("activeRole='store_manager', roles=['qa_manager', 'company_admin'] → render fallback", () => {
    mockAuthState.activeRole = "store_manager";
    render(
      <RoleGuard
        roles={["qa_manager", "company_admin"]}
        fallback={<span>No Access</span>}
      >
        <span>Protected Content</span>
      </RoleGuard>
    );
    expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
    expect(screen.getByText("No Access")).toBeInTheDocument();
  });
});

describe("RoleGuard — fallback behavior", () => {
  afterEach(() => {
    mockAuthState.activeRole = null;
  });

  it("fallback không truyền, role không match → render null (không crash)", () => {
    mockAuthState.activeRole = "qc_auditor";
    const { container } = render(
      <RoleGuard roles={["qa_manager"]}>
        <span>Protected Content</span>
      </RoleGuard>
    );
    // Container chỉ chứa fragment rỗng — không crash
    expect(container).toBeInTheDocument();
    expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
  });

  it("activeRole=null, fallback không truyền → render null (không crash)", () => {
    mockAuthState.activeRole = null;
    const { container } = render(
      <RoleGuard roles={["qa_manager"]}>
        <span>Protected Content</span>
      </RoleGuard>
    );
    expect(container).toBeInTheDocument();
    expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
  });

  it("roles=[] (array rỗng) → KHÔNG render children (không có role nào match)", () => {
    mockAuthState.activeRole = "qa_manager";
    render(
      <RoleGuard roles={[]}>
        <span>Protected Content</span>
      </RoleGuard>
    );
    expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
  });
});
