import { http, HttpResponse } from "msw";
import { TEST_API_BASE_URL } from "../api-base";

const BASE = TEST_API_BASE_URL;

export const authHandlers = [
  http.post(`${BASE}/auth/login`, async ({ request }) => {
    const body = await request.json() as { email?: string; password?: string };

    if (!body.email) {
      return HttpResponse.json({ success: false, error: "Email and password are required" }, { status: 400 });
    }

    if (body.email === "wrong@maycha.com") {
      return HttpResponse.json({ success: false, error: "Invalid credentials" }, { status: 401 });
    }

    return HttpResponse.json({
      success: true,
      data: {
        user: { id: "u1", email: body.email, fullName: "Test User" },
        activeRole: "qa_manager",
        availableRoles: ["qa_manager"],
      },
    });
  }),
];
