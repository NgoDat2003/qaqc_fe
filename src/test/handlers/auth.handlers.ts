import { http, HttpResponse } from "msw";
import type { AuthResponse } from "@/shared/types";

const BASE = "http://localhost:3000/api";

export const MOCK_USER: AuthResponse = {
  user: { id: "user-1", email: "qam@maycha.com", fullName: "QA Manager" },
  activeRole: "qa_manager",
  availableRoles: ["qa_manager"],
};

export const MOCK_QC_USER: AuthResponse = {
  user: { id: "user-2", email: "qc@maycha.com", fullName: "QC Auditor" },
  activeRole: "qc_auditor",
  availableRoles: ["qc_auditor"],
};

export const MOCK_SM_USER: AuthResponse = {
  user: { id: "user-3", email: "sm@maycha.com", fullName: "Store Manager" },
  activeRole: "store_manager",
  availableRoles: ["store_manager"],
};

export const authHandlers = [
  http.post(`${BASE}/auth/login`, async ({ request }) => {
    const body = await request.json() as { email: string; password?: string };
    if (body.email === "wrong@maycha.com") {
      return HttpResponse.json({ success: false, error: "Invalid credentials" }, { status: 401 });
    }
    return HttpResponse.json({ success: true, data: MOCK_USER });
  }),

  http.get(`${BASE}/auth/me`, () =>
    HttpResponse.json({ success: true, data: MOCK_USER })
  ),

  http.post(`${BASE}/auth/logout`, () =>
    HttpResponse.json({ success: true, data: null })
  ),
];
