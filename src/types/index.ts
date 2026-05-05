// =============================================================================
// QualityOps — Core TypeScript Types
// Generic F&B Quality Audit Platform
// =============================================================================

// ---------------------------------------------------------------------------
// Auth & User
// ---------------------------------------------------------------------------

export type RoleKey =
  | "company_admin"
  | "qa_manager"
  | "qc_auditor"
  | "am"
  | "store_manager"
  | "executive_viewer";

export interface RoleAssignment {
  id: string;
  roleKey: RoleKey;
  scope?: string; // storeId or areaId depending on role
}

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  isActive: boolean;
  roleAssignments: RoleAssignment[];
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: AuthUser;
  activeRole: RoleKey;
  availableRoles: RoleKey[];
}

// ---------------------------------------------------------------------------
// API Response wrapper
// ---------------------------------------------------------------------------

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ApiError {
  message: string;
  statusCode: number;
  errors?: Record<string, string[]>;
}

// ---------------------------------------------------------------------------
// Brand
// ---------------------------------------------------------------------------

export type StoreModelType = "standard" | "cloud_kitchen";

export interface Brand {
  id: string;
  code: string;
  name: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export interface Store {
  id: string;
  code: string;            // BR-001, BR-002...
  name: string;
  brandId: string;
  brand?: Brand;
  modelType: StoreModelType;
  region?: string;
  province?: string;
  district?: string;
  ward?: string;
  address?: string;
  amId?: string;           // Area Manager User ID (direct assignment)
  am?: Pick<User, "id" | "fullName" | "email">;
  managerId?: string;      // Store Manager User ID
  manager?: Pick<User, "id" | "fullName" | "email">;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// User
// ---------------------------------------------------------------------------

export interface User {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  isActive: boolean;
  roleAssignments: RoleAssignment[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserPayload {
  email: string;
  fullName: string;
  phone?: string;
  password: string;
  roleKey: RoleKey;
  storeId?: string;  // required for SM
  areaStoreIds?: string[]; // for AM scope
}

// ---------------------------------------------------------------------------
// Criteria Group
// ---------------------------------------------------------------------------

export interface CriteriaGroup {
  id: string;
  code: string;       // e.g. "A", "B", "C", "D" — generic, not CHEP
  name: string;       // e.g. "Cleanliness", "Hospitality"
  weight: number;     // 0.0–1.0, all groups must sum to 1.0
  color?: string;     // UI display color token
  criteriaCount?: number;
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// Criteria
// ---------------------------------------------------------------------------

export type CriteriaFlag = "none" | "critical" | "risk";

export interface Criteria {
  id: string;
  code: string;
  groupId: string;
  group?: CriteriaGroup;
  content: string;
  deductionPerError: number;
  maxDeduction: number;
  flag: CriteriaFlag;       // "none" | "critical" (group→0) | "risk" (audit→0)
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// Checklist
// ---------------------------------------------------------------------------

export type ChecklistStatus = "draft" | "published" | "archived";

export interface ChecklistSection {
  id: string;
  formId: string;
  name: string;
  groupId: string;
  group?: CriteriaGroup;
  order: number;
  items: ChecklistSectionItem[];
}

export interface ChecklistSectionItem {
  id: string;
  sectionId: string;
  criteriaId: string;
  criteria?: Criteria;
  order: number;
}

export interface ChecklistForm {
  id: string;
  name: string;
  version: string;
  status: ChecklistStatus;
  sections: ChecklistSection[];
  totalCriteria?: number;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

// ---------------------------------------------------------------------------
// Audit Plan
// ---------------------------------------------------------------------------

export type AuditPlanStatus = "open" | "closed";

export interface AuditPlan {
  id: string;
  name: string;
  type: "adhoc";           // only adhoc — no periodic
  scope: "company";        // only company-wide
  formId: string;
  form?: Pick<ChecklistForm, "id" | "name" | "version">;
  status: AuditPlanStatus;
  assignments: AuditAssignment[];
  createdAt: string;
  updatedAt: string;
}

export type AssignmentStatus = "pending" | "in_progress" | "completed";

export interface AuditAssignment {
  id: string;
  planId: string;
  storeId: string;
  store?: Pick<Store, "id" | "code" | "name" | "address">;
  auditorId: string;
  auditor?: Pick<User, "id" | "fullName" | "email">;
  scheduledDate: string;
  status: AssignmentStatus;
  auditId?: string;
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Audit
// ---------------------------------------------------------------------------

export type AuditGrade =
  | "excellent"   // ≥ 95
  | "good"        // 85–94.9
  | "pass"        // 70–84.9
  | "fail"        // > 0 – 69.9
  | "alarm";      // = 0 (risk triggered)

export interface GroupScore {
  groupId: string;
  groupCode: string;
  groupName: string;
  weight: number;
  maxScore: number;
  reachedScore: number;
  percentage: number;
  triggeredCritical: boolean;
}

export interface AuditResult {
  id: string;
  assignmentId?: string;
  formId: string;
  form?: Pick<ChecklistForm, "id" | "name" | "version">;
  storeId: string;
  store?: Pick<Store, "id" | "code" | "name" | "address">;
  auditorId: string;
  auditor?: Pick<User, "id" | "fullName">;
  finalScore: number;
  grade: AuditGrade;
  groupScores: GroupScore[];
  isRiskTriggered: boolean;
  violations: Violation[];
  submittedAt?: string;
  editedAt?: string;
  editNote?: string;
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Violation
// ---------------------------------------------------------------------------

export interface Violation {
  id: string;
  auditId: string;
  criteriaId: string;
  criteria?: Criteria;
  numErrors: number;
  repeatCount: number;     // 1, 2, 3 — 4th becomes critical
  isCriticalTriggered: boolean;
  isRiskTriggered: boolean;
  note?: string;
  evidences: Evidence[];
}

export interface Evidence {
  id: string;
  url: string;
  violationId?: string;
  actionPlanId?: string;
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Action Plan
// ---------------------------------------------------------------------------

export type ActionPlanStatus = "draft" | "submitted" | "in_progress" | "closed";

export interface ActionPlan {
  id: string;
  auditId: string;
  audit?: Pick<AuditResult, "id" | "finalScore" | "grade" | "store">;
  storeId: string;
  store?: Pick<Store, "id" | "code" | "name">;
  status: ActionPlanStatus;
  remediation?: string;    // SM fills this in
  deadline?: string;
  evidences: Evidence[];   // SM uploads proof of fix
  closedById?: string;     // QAM who closed
  closedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// Notification
// ---------------------------------------------------------------------------

export type NotificationType = "info" | "warning" | "alarm";

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  link?: string;
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Analytics / Dashboard
// ---------------------------------------------------------------------------

export interface OverviewStats {
  openAuditPlans: number;
  pendingActionPlans: number;
  overdueActionPlans: number;
  completionRate: number;        // 0–100
  averageScore: number;          // 0–100
  recentAudits: Pick<AuditResult, "id" | "store" | "finalScore" | "grade" | "submittedAt">[];
}

// ---------------------------------------------------------------------------
// Form payloads
// ---------------------------------------------------------------------------

export interface CreateBrandPayload {
  code: string;
  name: string;
}

export interface CreateStorePayload {
  code: string;
  name: string;
  brandId: string;
  modelType: StoreModelType;
  region?: string;
  province?: string;
  address?: string;
  amId?: string;
  managerId?: string;
}

export interface CreateCriteriaGroupPayload {
  code: string;
  name: string;
  weight: number;
  color?: string;
}

export interface CreateCriteriaPayload {
  code: string;
  groupId: string;
  content: string;
  deductionPerError: number;
  maxDeduction: number;
  flag: CriteriaFlag;
}

export interface CreateAuditPlanPayload {
  name: string;
  formId: string;
  assignments: {
    storeId: string;
    auditorId: string;
    scheduledDate: string;
  }[];
}

export interface SubmitAuditPayload {
  assignmentId: string;
  violations: {
    criteriaId: string;
    numErrors: number;
    repeatCount: number;
    isCriticalTriggered: boolean;
    note?: string;
    evidenceIds: string[];
  }[];
}

export interface CreateActionPlanPayload {
  auditId: string;
  remediation: string;
  deadline: string;
}

export interface CloseActionPlanPayload {
  evidenceIds: string[];
  note?: string;
}
