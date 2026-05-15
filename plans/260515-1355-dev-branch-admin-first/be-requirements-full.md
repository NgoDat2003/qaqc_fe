# BE Requirements — Admin Setup Module (Greenfield Spec)
> Codex: Implement từ đầu. Xem như chưa có gì. Đây là spec đầy đủ.
> Stack: Next.js API Routes, Prisma ORM, PostgreSQL, Zod validation, bcrypt.

---

## Project Context

- **Framework:** Next.js 14+ App Router, TypeScript strict
- **ORM:** Prisma Client v5 → PostgreSQL
- **Auth:** JWT httpOnly cookie `qo_token` (set/clear bởi login/logout)
- **Base URL:** `/api/...`
- **Folder structure:** `src/app/api/[resource]/route.ts` và `src/app/api/[resource]/[id]/route.ts`

---

## Database Schema (Prisma)

```prisma
model Brand {
  id        String   @id @default(cuid())
  code      String   @unique         // uppercase, e.g. "MC", "CLOUD"
  name      String   @unique         // e.g. "Maycha"
  isActive  Boolean  @default(true)
  stores    Store[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  @@map("brands")
}

model Store {
  id        String  @id @default(cuid())
  code      String  @unique          // e.g. "MC-HCM-001"
  name      String                   // e.g. "Maycha Vincom Thảo Điền"
  modelType String  @default("standard") // "standard" | "cloud_kitchen"
  brandId   String
  brand     Brand   @relation(fields: [brandId], references: [id])
  province  String?                  // e.g. "TP. Hồ Chí Minh"
  ward      String?                  // e.g. "Phường Thảo Điền"
  address   String?                  // e.g. "459 Nguyễn Hữu Cảnh"
  amId      String?
  am        User?   @relation("StoreAM", fields: [amId], references: [id])
  managerId String?
  manager   User?   @relation("StoreManager", fields: [managerId], references: [id])
  isActive  Boolean @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  @@map("stores")
}

model User {
  id              String           @id @default(cuid())
  email           String           @unique
  fullName        String
  phone           String?
  password        String           // bcrypt hash
  isActive        Boolean          @default(true)
  roleAssignments RoleAssignment[]
  storesAsAM      Store[]          @relation("StoreAM")
  storesAsManager Store[]          @relation("StoreManager")
  createdAt       DateTime         @default(now())
  updatedAt       DateTime         @updatedAt
  @@map("users")
}

model RoleAssignment {
  id      String  @id @default(cuid())
  userId  String
  user    User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  roleKey String  // "company_admin"|"qa_manager"|"qc_auditor"|"am"|"store_manager"|"executive_viewer"
  storeId String? // scope for store_manager/am
  createdAt DateTime @default(now())
  @@unique([userId, roleKey])
  @@map("role_assignments")
}
```

> **Note:** DB có thêm các model khác (Audit, Checklist...) nhưng không liên quan đến module này. Bỏ qua.

---

## Shared Utilities (Codex tự implement)

### Response helper (`src/lib/api-response.ts`)
```ts
export const response = {
  success: <T>(data: T, message?: string, meta?: object) =>
    Response.json({ success: true, data, ...(message && { message }), ...(meta && { meta }) }),

  created: <T>(data: T, message?: string) =>
    Response.json({ success: true, data, ...(message && { message }) }, { status: 201 }),

  error: (error: string, status = 400) =>
    Response.json({ success: false, error }, { status }),
};
```

### Pagination helper (`src/lib/pagination.ts`)
```ts
export function getPaginationParams(searchParams: URLSearchParams) {
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20")));
  return { page, limit, skip: (page - 1) * limit, take: limit };
}

export function getPaginationMeta(params: { page: number; limit: number }, total: number) {
  return { page: params.page, limit: params.limit, total, totalPages: Math.ceil(total / params.limit) };
}
```

### Auth guard (`src/lib/rbac.ts`)
```ts
import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

const VALID_ROLES = ["company_admin","qa_manager","qc_auditor","am","store_manager","executive_viewer"];

export function requireRole(request: NextRequest, allowedRoles: string[]) {
  const token = request.cookies.get("qo_token")?.value;
  if (!token) return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string; roleKey: string };
    if (!allowedRoles.includes(decoded.roleKey)) {
      return Response.json({ success: false, error: "Forbidden" }, { status: 403 });
    }
    return null; // pass
  } catch {
    return Response.json({ success: false, error: "Invalid token" }, { status: 401 });
  }
}
```

---

## Architecture Decision — Client-side Filter/Sort/Search

> **Quyết định:** FE load toàn bộ data 1 lần, sort/search/filter hoàn toàn trên FE (client-side).
>
> **Lý do:** UAT hiện tại 300 records ≈ 300ms. Với dataset admin (brands ~10, stores ~300, users ~250), client-side filtering nhanh hơn và UX tốt hơn (không spinner mỗi lần filter/sort).
>
> **Giới hạn:** Phù hợp đến ~1000 records. Revisit nếu stores > 1000.

**Hệ quả cho BE list endpoints:**
- `GET /api/brands` → trả **tất cả** brands (không cần search/sort param)
- `GET /api/stores` → trả **tất cả** stores (không cần search/sort param; giữ `brandId` và `isActive` filter tùy chọn cho future use)
- `GET /api/users` → trả **tất cả** users (giữ `role` filter để dùng cho dropdown limited-scope)
- Response **không cần meta pagination** cho admin list pages — FE tự phân trang client-side
- Chỉ cần trả `{ success: true, data: T[] }` — không cần `meta`

**FE xử lý:**
```ts
// Load once
const { data: stores } = useStores(); // GET /api/stores — no pagination

// Client-side filter/sort/search in useMemo
const filtered = useMemo(() =>
  stores
    .filter(s => !brandFilter || s.brandId === brandFilter)
    .filter(s => !search || s.name.includes(search) || s.code.includes(search))
    .sort((a, b) => sortDir === "asc" ? a[sortKey] > b[sortKey] : a[sortKey] < b[sortKey]),
  [stores, brandFilter, search, sortKey, sortDir]
);

// Client-side pagination
const page = filtered.slice((currentPage-1)*20, currentPage*20);
```

---

## API Endpoints

---

### AUTH

#### `POST /api/auth/login`

```ts
// Body
{ email: string; password: string }

// Success 200
{
  success: true,
  data: {
    user: { id: string; email: string; fullName: string };
    activeRole: string;    // first role from assignments
    availableRoles: string[];
  }
}
// Sets cookie: qo_token (httpOnly, path="/", maxAge=86400)
```

**Logic:**
1. Find user by email, check `isActive`
2. `bcrypt.compare(password, user.password)`
3. Load `roleAssignments` → extract roleKeys
4. Sign JWT `{ userId, roleKey: firstRole }`, maxAge 24h
5. Set httpOnly cookie `qo_token`
6. Return session data

**Errors:**
- Email not found → 401 "Invalid credentials"
- Wrong password → 401 "Invalid credentials"
- Account inactive → 403 "Account is disabled"

---

#### `GET /api/auth/me`

**Auth:** any valid `qo_token`

```ts
// Success 200
{
  success: true,
  data: {
    user: { id: string; email: string; fullName: string };
    activeRole: string;
    availableRoles: string[];
  }
}
```

**Logic:** Decode JWT, find user, load roleAssignments.

---

#### `POST /api/auth/logout`

**Auth:** none required

```ts
// Success 200
{ success: true, data: null }
// Clears cookie: qo_token (maxAge=0)
```

---

### BRANDS

#### `GET /api/brands`

**Auth:** `company_admin`, `qa_manager`

> **Client-side filtering:** Trả toàn bộ brands. FE tự filter/sort.

**Query params:** Không cần. Trả all.

```ts
// Response — array, NO meta
{
  success: true,
  data: Array<{
    id: string;
    code: string;
    name: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    _count: { stores: number };  // số cửa hàng thuộc brand — dùng cho MetricCard
  }>
}
```

**Prisma query:**
```ts
prisma.brand.findMany({
  select: { id, code, name, isActive, createdAt, updatedAt, _count: { select: { stores: true } } },
  orderBy: { name: "asc" },
})
```

---

#### `POST /api/brands`

**Auth:** `company_admin`

```ts
// Body (Zod validated)
{
  code: string;   // min 2, max 10, toUpperCase()
  name: string;   // min 2, max 100
}

// Success 201
{ success: true, data: Brand }
```

**Validation:**
- Duplicate code → 400 "Brand code already exists"
- Duplicate name → 400 "Brand name already exists"

---

#### `PATCH /api/brands/[id]`

**Auth:** `company_admin`

```ts
// Body (all optional)
{
  name?: string;
  isActive?: boolean;
  // code không cho sửa sau khi tạo
}

// Success 200
{ success: true, data: Brand }
```

**Validation:** name unique check nếu thay đổi.

---

### STORES

#### `GET /api/stores`

**Auth:** `company_admin`, `qa_manager`

> **Client-side filtering:** Trả toàn bộ stores. FE tự search/sort/filter theo brand, modelType, isActive.

**Query params:** Không cần. Trả all.

```ts
// Response — array, NO meta
{
  success: true,
  data: Array<{
    id: string;
    code: string;
    name: string;
    modelType: string;       // "standard" | "cloud_kitchen"
    province: string | null;
    ward: string | null;
    address: string | null;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    brand:   { id: string; code: string; name: string };
    am:      { id: string; fullName: string; email: string } | null;
    manager: { id: string; fullName: string; email: string } | null;
  }>
}
```

**Prisma query:**
```ts
prisma.store.findMany({
  select: {
    id, code, name, modelType, province, ward, address, isActive, createdAt, updatedAt,
    brand:   { select: { id, code, name } },
    am:      { select: { id, fullName, email } },
    manager: { select: { id, fullName, email } },
  },
  orderBy: { code: "asc" },
})
```

---

#### `GET /api/stores/[id]`

**Auth:** `company_admin`, `qa_manager`

```ts
// Response — full detail (same fields as list item)
{ success: true, data: StoreDetail }
```

---

#### `POST /api/stores`

**Auth:** `company_admin`

```ts
// Body (Zod validated)
{
  code: string;       // min 2, toUpperCase(), unique
  name: string;       // min 2
  modelType: "standard" | "cloud_kitchen";
  brandId: string;    // required, must exist
  province?: string;
  ward?: string;
  address?: string;
  amId?: string;      // must have role "am"
  managerId?: string; // must have role "store_manager"
}

// Success 201
{ success: true, data: StoreDetail }
```

**Business rules:**
- `standard` + brand code `"CLOUD"` → 400 "Standard stores cannot use the CLOUD brand"
- `cloud_kitchen` + non-CLOUD brand → 400 "Cloud Kitchen must use the CLOUD brand"
- `amId` provided → verify user has `am` role
- `managerId` provided → verify user has `store_manager` role
- Duplicate code → 400 "Store code already exists"

---

#### `PATCH /api/stores/[id]`

**Auth:** `company_admin`

```ts
// Body (all optional)
{
  name?: string;
  modelType?: "standard" | "cloud_kitchen";
  brandId?: string;
  province?: string | null;
  ward?: string | null;
  address?: string | null;
  amId?: string | null;       // null = remove AM
  managerId?: string | null;  // null = remove manager
  isActive?: boolean;
}

// Success 200
{ success: true, data: StoreDetail }
```

**Business rules:**
- Apply brand isolation nếu `modelType` hoặc `brandId` thay đổi
- Validate `amId` và `managerId` role nếu thay đổi

---

#### `PATCH /api/stores/[id]/assign-am`

**Auth:** `company_admin`

```ts
// Body
{ amId: string }

// Success 200
{ success: true, data: StoreDetail }
```

**Validation:** `amId` user phải có role `am`.

---

### USERS

#### `GET /api/users`

**Auth:** `company_admin`, `qa_manager`

> **Client-side filtering:** Trả toàn bộ users. FE tự filter/sort.
> Exception: `?role=` vẫn giữ — dùng để load dropdown nhỏ (e.g. `?role=store_manager` cho StoreDrawer) không cần full load.

**Query params:**
| Param | Type | Mô tả |
|-------|------|-------|
| `role` | string | Optional. Filter for dropdown use (e.g. `?role=store_manager&limit=200`) |

```ts
// Response — array, NO meta (trừ khi dùng role filter cho dropdown)
{
  success: true,
  data: Array<{
    id: string;
    email: string;
    fullName: string;
    phone: string | null;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    roleAssignments: Array<{ id: string; roleKey: string; storeId: string | null }>;
  }>
}
```

**WHERE:**
```ts
const where: any = {};
const role = searchParams.get("role");
if (role?.trim()) {
  where.roleAssignments = { some: { roleKey: role.trim() } };
}
// prisma.user.findMany({ where, select: {...}, orderBy: { fullName: "asc" } })
```

---

#### `POST /api/users`

**Auth:** `company_admin`

```ts
// Body
{
  email: string;      // unique, valid email
  fullName: string;   // min 2
  password: string;   // min 6, hashed bcrypt(10)
  phone?: string;
  roleAssignments: Array<{
    roleKey: string;   // valid roleKey
    storeId?: string;  // required nếu roleKey = "store_manager"
  }>;  // min 1
}

// Success 201
{ success: true, data: UserWithRoles }
```

**Validation:**
- Duplicate email → 400 "Email already in use"
- Empty roleAssignments → 400 "At least one role is required"
- Invalid roleKey → 400 "Invalid role"

---

#### `PATCH /api/users/[id]`

**Auth:** `company_admin`

```ts
// Body (all optional)
{
  fullName?: string;
  phone?: string | null;
}
// Email không cho sửa. Password sửa qua endpoint riêng (chưa cần).

// Success 200
{ success: true, data: UserWithRoles }
```

---

#### `PATCH /api/users/[id]/toggle-active`

**Auth:** `company_admin`

```ts
// Body
{ isActive: boolean }

// Success 200
{ success: true, data: UserWithRoles }
```

---

## Tổng hợp endpoints

| # | Method | Path | Auth |
|---|--------|------|------|
| 1 | POST | `/api/auth/login` | — |
| 2 | GET | `/api/auth/me` | any token |
| 3 | POST | `/api/auth/logout` | — |
| 4 | GET | `/api/brands` | CA, QAM |
| 5 | POST | `/api/brands` | CA |
| 6 | PATCH | `/api/brands/[id]` | CA |
| 7 | GET | `/api/stores` | CA, QAM |
| 8 | GET | `/api/stores/[id]` | CA, QAM |
| 9 | POST | `/api/stores` | CA |
| 10 | PATCH | `/api/stores/[id]` | CA |
| 11 | PATCH | `/api/stores/[id]/assign-am` | CA |
| 12 | GET | `/api/users` | CA, QAM |
| 13 | POST | `/api/users` | CA |
| 14 | PATCH | `/api/users/[id]` | CA |
| 15 | PATCH | `/api/users/[id]/toggle-active` | CA |

**15 endpoints total.** Không có DELETE. Không có upload. Không có stats endpoint riêng (FE tự tính từ `meta.total` với filter queries).

---

## Verification

Sau khi implement, verify:

```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"123456"}'
# → { success: true, data: { user, activeRole, availableRoles } }
# → Cookie qo_token set

# Brands list
curl http://localhost:3000/api/brands --cookie "qo_token=..."
# → { success: true, data: [...], meta: { page:1, limit:20, total:N, totalPages:N } }

# Stores search
curl "http://localhost:3000/api/stores?search=may&isActive=true" --cookie "qo_token=..."
# → Stores with name/code containing "may"

# Users by role
curl "http://localhost:3000/api/users?role=store_manager&limit=100" --cookie "qo_token=..."
# → Only users with store_manager role
```

---

## DO NOT implement

- Upload file/image (không cần)
- Brand logo, User avatar (không có trong schema)
- Store email/password (không có trong schema)
- Địa bàn / Province management endpoint (dùng free text)
- Notifications, Audit, Checklist endpoints (module khác)
