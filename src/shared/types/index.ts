// ============================================================
// QualityOps — Shared TypeScript Interfaces
// Source of truth for all entities
// ============================================================

// --- Auth ---
export type RoleKey =
  | "company_admin"
  | "qa_manager"
  | "qc_auditor"
  | "am"
  | "store_manager"
  | "executive_viewer";

export interface RoleAssignment {
  id: string;
  userId?: string;
  roleKey: RoleKey;
  storeId?: string | null;
  // Hydrated from BE — store display data for store_manager / am scoped roles
  store?: { id: string; code: string; name: string } | null;
}

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
}

export interface AuthSession {
  user: AuthUser;
  activeRole: RoleKey;
  availableRoles: RoleKey[];
}

export type AuthResponse = AuthSession;

export interface LoginRequest {
  email: string;
  password?: string;
}

// --- Organization ---
export interface Brand {
  id: string;
  code: string;
  name: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  // Hydrated from BE
  _count?: { stores: number };
}

export type StoreModelType = "standard" | "cloud_kitchen";

export interface Store {
  id: string;
  code: string;
  name: string;
  modelType: StoreModelType;
  brandId: string;
  brand?: Pick<Brand, "id" | "name" | "code">;
  region?: string | null;
  province?: string | null;
  district?: string | null;
  ward?: string | null;
  address?: string | null;
  amId?: string | null;
  am?: Pick<User, "id" | "fullName" | "email"> | null;
  managerId?: string | null;
  manager?: Pick<User, "id" | "fullName" | "email"> | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  title?: string | null;
  phone?: string | null;
  isActive: boolean;
  roleAssignments: RoleAssignment[];
  createdAt: string;
  updatedAt: string;
}

// --- Criteria ---
export interface CriteriaGroup {
  id: string;
  code: string; // C, H, P, E
  name: string;
  weight: number; // 0.0 – 1.0
  color?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Criteria {
  id: string;
  code: string;
  groupId: string;
  group?: Pick<CriteriaGroup, "id" | "name" | "code">;
  content: string;
  deductionPerError: number;
  maxDeduction: number;
  flag: "none" | "critical" | "risk";
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// --- Checklist ---
export interface ChecklistForm {
  id: string;
  name: string;
  version: string;
  status: "draft" | "published" | "archived";
  sections?: ChecklistSection[];
  publishedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ChecklistSection {
  id: string;
  formId: string;
  groupId: string;
  group?: Pick<CriteriaGroup, "id" | "name" | "code" | "weight">;
  name: string;
  order: number;
  items?: ChecklistSectionItem[];
}

export interface ChecklistSectionItem {
  id: string;
  sectionId: string;
  criteriaId: string;
  criteria?: Criteria;
  order: number;
}

// --- Audit Planning ---
export interface AuditPlan {
  id: string;
  name: string;
  type: "adhoc";
  scope: "company";
  formId: string;
  form?: Pick<ChecklistForm, "id" | "name" | "version">;
  status: "open" | "closed";
  assignments?: AuditAssignment[];
  createdAt: string;
  updatedAt: string;
}

export interface AuditAssignment {
  id: string;
  planId: string;
  plan?: Pick<AuditPlan, "id" | "name">;
  storeId: string;
  store?: Pick<Store, "id" | "name" | "code" | "address">;
  auditorId: string;
  auditor?: Pick<User, "id" | "fullName">;
  scheduledDate: string;
  status: "pending" | "in_progress" | "completed";
  auditId?: string | null;
}

// --- Audit Execution ---
export type ScoreGrade = "excellent" | "good" | "pass" | "fail" | "alarm";

export interface Audit {
  id: string;
  formId: string;
  storeId: string;
  store?: Pick<Store, "id" | "name" | "code">;
  auditorId: string;
  finalScore: number;
  grade: ScoreGrade;
  isRiskTriggered: boolean;
  assignment?: AuditAssignment | null;
  groupScores?: GroupScore[];
  violations?: Violation[];
  actionPlan?: ActionPlan | null;
  submittedAt?: string | null;
  editedAt?: string | null;
  editNote?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface GroupScore {
  id: string;
  auditId: string;
  groupId: string;
  groupCode: string;
  weight: number;
  maxScore: number;
  reachedScore: number;
  percentage: number;
  triggeredCritical: boolean;
}

export interface Violation {
  id: string;
  auditId: string;
  criteriaId: string;
  criteria?: Pick<Criteria, "id" | "code" | "content" | "flag">;
  numErrors: number;
  repeatCount: number;
  isCriticalTriggered: boolean;
  isRiskTriggered: boolean;
  note?: string | null;
  evidences?: Evidence[];
}

export interface Evidence {
  id: string;
  url: string;
  fileName?: string | null;
  mimeType?: string | null;
  createdAt: string;
}

// --- Action Plan ---
export type ActionPlanStatus = "draft" | "submitted" | "rejected" | "closed";

export interface ActionPlan {
  id: string;
  auditId: string;
  storeId: string;
  store?: Pick<Store, "id" | "name" | "code">;
  audit?: Audit;
  status: ActionPlanStatus;
  remediation?: string | null;
  deadline?: string | null;
  evidences?: Evidence[];
  closedById?: string | null;
  closedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

// --- Notifications ---
export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: "info" | "warning" | "alarm";
  isRead: boolean;
  link?: string | null;
  createdAt: string;
}

// --- Pagination ---
export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type ListResponse<T> = {
  data: T[];
  meta: PaginationMeta;
};

export type ListParams = {
  page?: number;
  limit?: number;
};

// Checklist list item — summary only (no sections/items)
export type ChecklistSummary = {
  id: string;
  name: string;
  version: string;
  status: string;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  _count: {
    sections: number;
    auditPlans: number;
    audits: number;
  };
};

// AuditPlan list item — summary only (no assignments array)
export type AuditPlanSummary = {
  id: string;
  name: string;
  type: string;
  scope: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  form: {
    id: string;
    name: string;
    version: string;
    status: string;
  };
  _count: {
    assignments: number;
  };
};

// --- API Response Wrapper ---
export interface ApiResponse<T> {
  success: true;
  data: T;
  message?: string;
  meta?: PaginationMeta;
}

export interface ApiError {
  success: false;
  error: {
    code?: string;
    message: string;
    details?: unknown;
    statusCode: number;
  };
}

export type RepeatLabel = "first" | "second" | "third" | "auto_ccp" | "reset";

export interface RepeatInfo {
  criteriaId: string;
  numErrors: number;
  repeatCount: number;
  repeatLabel: RepeatLabel;
  isCriticalTriggered: boolean;
}

export interface SubmitAuditResponse {
  id: string;
  finalScore: number;
  grade: ScoreGrade;
  isRiskTriggered: boolean;
  repeatInfo: RepeatInfo[];
}

export interface AnalyticsOverview {
  totalAudits: number;
  avgScore: number;
  passRate: number;
  failCount: number;
  recentAudits?: Array<{
    id: string;
    storeId: string;
    store?: Pick<Store, "id" | "name" | "code">;
    finalScore: number;
    grade: ScoreGrade;
    submittedAt: string;
  }>;
}

// --- Scoring (client-side preview) ---
export interface AuditDraft {
  assignmentId: string;
  violations: ViolationDraft[];
}

export interface ViolationDraft {
  criteriaId: string;
  numErrors: number;
  note?: string;
  evidenceUrls?: string[];
}

export interface ScorePreview {
  groupCode: string;
  reachedScore: number;
  weight: number;
  triggeredCritical: boolean;
}
