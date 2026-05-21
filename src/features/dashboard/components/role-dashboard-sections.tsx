import type { DashboardData } from '../types';
import { chartBars, numberOf, tableRanking } from '../utils';
import { DashboardPanel, MiniBarList, RankingList, SectionTitle } from './dashboard-shared';

type RoleDashboardSectionsProps = {
  summary: DashboardData['summary'];
  charts: DashboardData['charts'];
  tables: DashboardData['tables'];
  isAdmin: boolean;
  isQc: boolean;
  isAm: boolean;
  isSm: boolean;
};

export function RoleDashboardSections({
  summary,
  charts,
  tables,
  isAdmin,
  isQc,
  isAm,
  isSm,
}: RoleDashboardSectionsProps) {
  return (
    <>
      {isAdmin && (
        <div className="space-y-6">
          <SectionTitle>Tổng quan quản trị hệ thống</SectionTitle>
          <div className="grid gap-4 xl:grid-cols-3">
            <DashboardPanel
              title="User / RBAC"
              description="Phân bổ user theo role và trạng thái"
            >
              <MiniBarList items={chartBars(charts.usersByRole, "info")} />
            </DashboardPanel>
            <DashboardPanel
              title="Store master data"
              description="Brand, tỉnh/thành và cửa hàng thiếu thông tin"
            >
              <MiniBarList items={chartBars(charts.storesByBrand, "primary")} />
            </DashboardPanel>
            <DashboardPanel
              title="Checklist lifecycle"
              description="Draft, published, archived"
            >
              <MiniBarList
                items={chartBars(charts.checklistsByStatus, "success")}
              />
            </DashboardPanel>
          </div>
          <div className="grid gap-4 xl:grid-cols-2">
            <DashboardPanel
              title="Audit plan"
              description="Kế hoạch và tiến độ store"
            >
              <RankingList items={tableRanking(tables.auditPlanProgress)} />
            </DashboardPanel>
            <DashboardPanel
              title="Action Plan"
              description={`${numberOf(summary, "actionPlansOverdue")} AP quá hạn`}
            >
              <MiniBarList
                items={chartBars(charts.actionPlansByStatus, "warning")}
              />
            </DashboardPanel>
          </div>
          <DashboardPanel
            title="Store thiếu dữ liệu"
            description="Thiếu AM/SM hoặc thông tin vận hành quan trọng"
          >
            <RankingList items={tableRanking(tables.storesMissingData)} />
          </DashboardPanel>
        </div>
      )}

      {isQc && (
        <div className="space-y-6">
          <SectionTitle>Công việc QC</SectionTitle>
          <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
            <DashboardPanel
              title="Trạng thái bài chấm"
              description="Dữ liệu theo assignment của QC hiện tại"
            >
              <MiniBarList
                items={chartBars(charts.assignmentStatus, "primary")}
              />
            </DashboardPanel>
            <DashboardPanel
              title="Theo kế hoạch"
              description="Bài audit được giao theo từng kỳ"
            >
              <RankingList items={tableRanking(tables.auditPlanProgress)} />
            </DashboardPanel>
          </div>
          <DashboardPanel
            title="Danh sách store được giao"
            description="BE đã scope theo QC đang đăng nhập"
          >
            <RankingList items={tableRanking(tables.assignedStores)} />
          </DashboardPanel>
        </div>
      )}

      {(isAm || isSm) && (
        <div className="space-y-6">
          <SectionTitle>
            {isAm ? "Dashboard phạm vi AM" : "Dashboard cửa hàng SM"}
          </SectionTitle>
          <div className="grid gap-4 xl:grid-cols-[1fr_1fr]">
            <DashboardPanel
              title="Xếp hạng cửa hàng"
              description="Điểm cao và thấp trong phạm vi dữ liệu"
            >
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="mb-3 text-sm font-medium text-muted-foreground">
                    Điểm cao
                  </p>
                  <RankingList
                    items={tableRanking(tables.topStores, " điểm")}
                  />
                </div>
                <div>
                  <p className="mb-3 text-sm font-medium text-muted-foreground">
                    Cần chú ý
                  </p>
                  <RankingList
                    items={tableRanking(tables.bottomStores, " điểm")}
                  />
                </div>
              </div>
            </DashboardPanel>
            <DashboardPanel
              title="Rủi ro & Action Plan"
              description={`${numberOf(summary, "riskAuditCount")} audit có Risk, ${numberOf(summary, "actionPlanOverdue")} AP quá hạn`}
            >
              <MiniBarList
                items={[
                  ...chartBars(charts.errorsByGroup, "danger"),
                  ...chartBars(charts.actionPlanStatus, "warning"),
                ].slice(0, 6)}
              />
            </DashboardPanel>
          </div>
          <div className="grid gap-4 xl:grid-cols-2">
            <DashboardPanel
              title="Xu hướng điểm"
              description="Điểm theo tháng/tuần từ BE"
            >
              <MiniBarList items={chartBars(charts.scoreTrend, "info")} />
            </DashboardPanel>
            <DashboardPanel
              title="Top tiêu chí lỗi"
              description="Lỗi cần ưu tiên xử lý"
            >
              <RankingList items={tableRanking(tables.topCriteria)} />
            </DashboardPanel>
          </div>
        </div>
      )}
    </>
  );
}
