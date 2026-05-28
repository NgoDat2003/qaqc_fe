import { test, expect } from "@playwright/test";
import { loginAs, logout } from "./helpers/auth";
import type { E2ERole } from "./helpers/test-data";

const dashboardExpectations: Record<E2ERole, RegExp[]> = {
  admin: [/Dashboard|Quản trị|Tổng user/i],
  qam: [/Dashboard QA\/QC|Tiến độ audit plan|Phân tích lỗi/i],
  qc: [/Công việc QC|Danh sách store được giao|Việc được giao/i],
  sm: [/Dashboard cửa hàng SM|Action Plan|Lịch sử audit/i],
  am: [/Dashboard khu vực AM|Xếp hạng cửa hàng|Action Plan theo store/i],
};

for (const [role, patterns] of Object.entries(dashboardExpectations) as Array<[E2ERole, RegExp[]]>) {
  test(`${role} dashboard loads scoped view`, async ({ page }) => {
    await loginAs(page, role);
    await page.goto("/dashboard");

    for (const pattern of patterns) {
      await expect(page.getByText(pattern).first()).toBeVisible({ timeout: 20000 });
    }

    await logout(page);
  });
}
